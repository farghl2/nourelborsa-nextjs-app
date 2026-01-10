/**
 * Symbol Resolver Service
 * Resolves user queries to valid Yahoo Finance symbols
 * 
 * Strategy:
 * 1. First search locally using Fuse.js for fuzzy matching (handles typos)
 * 2. If not found locally, search Yahoo Finance globally (filter for .CA suffix)
 * 3. Throw error if symbol cannot be resolved
 */

import Fuse, { IFuseOptions } from 'fuse.js';
import yahooFinance from 'yahoo-finance2';
import { EGX30_STOCKS } from '../constants';
import { EgyptianStock } from '../types';

/**
 * Fuse.js configuration for fuzzy search
 * Lower threshold = stricter matching
 */
const fuseOptions: IFuseOptions<EgyptianStock> = {
  keys: [
    { name: 'symbol', weight: 0.4 },
    { name: 'name', weight: 0.3 },
    { name: 'nameAr', weight: 0.2 },
    { name: 'keywords', weight: 0.1 },
  ],
  threshold: 0.4,     // Allow some fuzziness (0 = exact, 1 = match anything)
  includeScore: true,
  minMatchCharLength: 2,
};

// Initialize Fuse instance with local stock data
const fuse = new Fuse(EGX30_STOCKS, fuseOptions);

/**
 * Search for a stock in the local database
 * @param query - User's search query
 * @returns Best matching stock or null
 */
function searchLocal(query: string): EgyptianStock | null {
  const results = fuse.search(query);
  
  if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.5) {
    console.log(`[Symbol Resolver] Local match found: ${results[0].item.symbol} (score: ${results[0].score})`);
    return results[0].item;
  }
  
  return null;
}

/**
 * Yahoo Finance search result quote type
 */
interface YahooQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
}

/**
 * Search Yahoo Finance for Egyptian stocks
 * Filters results to only include Cairo Exchange (.CA) symbols
 * @param query - User's search query
 * @returns Stock info or null
 */
async function searchYahooFinance(query: string): Promise<EgyptianStock | null> {
  try {
    console.log(`[Symbol Resolver] Searching Yahoo Finance for: ${query}`);
    
    const results = await yahooFinance.search(query, {
      quotesCount: 10,
      newsCount: 0,
    });
    
    // Cast to expected type
    const searchResults = results as { quotes?: YahooQuote[] };
    
    if (!searchResults.quotes || searchResults.quotes.length === 0) {
      return null;
    }
    
    // Filter for Cairo Exchange stocks (symbols ending in .CA)
    let bestMatch = searchResults.quotes.find(
      (quote: YahooQuote) => quote.symbol?.endsWith('.CA')
    );

    // If no .CA match found, allow fallback to the first valid result
    // This fixes the issue where valid stocks not in constants (or non-Egyptian) were ignored
    if (!bestMatch && searchResults.quotes.length > 0) {
      console.log(`[Symbol Resolver] No strict .CA match found. Falling back to best match: ${searchResults.quotes[0].symbol}`);
      bestMatch = searchResults.quotes[0];
    }
    
    if (bestMatch && bestMatch.symbol) {
      console.log(`[Symbol Resolver] Yahoo Finance match found: ${bestMatch.symbol}`);
      
      return {
        symbol: bestMatch.symbol,
        name: bestMatch.shortname || bestMatch.longname || bestMatch.symbol,
        nameAr: bestMatch.shortname || bestMatch.symbol, // Fallback, no Arabic from Yahoo
        keywords: [],
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Symbol Resolver] Yahoo Finance search error:', error);
    return null;
  }
}

/**
 * Resolve a user query to a valid stock symbol
 * 
 * @param query - User's search query (e.g., "Fawry", "CIB", "فوري")
 * @returns Resolved Egyptian stock information
 * @throws Error if symbol cannot be resolved
 * 
 * @example
 * const stock = await resolveSymbol("fawry");
 * // Returns: { symbol: 'FWRY.CA', name: 'Fawry', nameAr: 'فوري', ... }
 * 
 * @example
 * const stock = await resolveSymbol("Fary"); // Typo handled by fuzzy search
 * // Returns: { symbol: 'FWRY.CA', ... }
 */
export async function resolveSymbol(query: string): Promise<EgyptianStock> {
  const trimmedQuery = query.trim();
  
  if (!trimmedQuery) {
    throw new Error('Search query cannot be empty');
  }
  
  console.log(`[Symbol Resolver] Resolving query: "${trimmedQuery}"`);
  
  // Step 1: Search locally first (faster & handles typos)
  const localResult = searchLocal(trimmedQuery);
  if (localResult) {
    return localResult;
  }
  
  // Step 2: If not found locally, search Yahoo Finance
  const yahooResult = await searchYahooFinance(trimmedQuery);
  if (yahooResult) {
    return yahooResult;
  }
  
  // Step 3: If still not found, throw error
  throw new Error(
    `Symbol not found: "${trimmedQuery}". ` +
    `Please check the stock name or use the Yahoo Finance symbol directly (e.g., "FWRY.CA").`
  );
}

/**
 * Check if a symbol is valid and exists
 * @param symbol - Yahoo Finance symbol
 * @returns true if valid
 */
export async function validateSymbol(symbol: string): Promise<boolean> {
  try {
    const quote = await yahooFinance.quote(symbol);
    return !!quote;
  } catch {
    return false;
  }
}
