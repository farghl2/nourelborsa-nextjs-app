/**
 * Stock Analysis Module - Main Entry Point (Facade)
 * 
 * This module orchestrates the complete stock analysis workflow:
 * 1. Resolve symbol from user query
 * 2. Fetch historical OHLCV data
 * 3. Calculate technical indicators
 * 4. Generate AI-powered analysis report
 * 
 * @module stock-analysis
 */

import { resolveSymbol } from './services/symbol-resolver';
import { fetchOHLCVData } from './services/data-fetcher';
import { calculateAllIndicators } from './services/calculator';
import { generateAIReport } from './services/ai-reporter';
import { AnalysisResult, AnalysisError, Timeframe } from './types';

// Re-export types for external use
export * from './types';
export { EGX30_STOCKS } from './constants';

/**
 * Analyze a stock and generate a comprehensive report
 * 
 * This is the main entry point for the stock analysis module.
 * It coordinates all services to produce a complete analysis.
 * 
 * @param query - User's search query (e.g., "Fawry", "CIB", "فوري")
 * @param timeframe - Analysis timeframe
 *   - '15m': Intraday analysis (مضارب) - 1 month of 15-minute data
 *   - '1h': Short-term analysis - 2 months of hourly data
 *   - '1d': Daily analysis (مستثمر) - 2 years of daily data
 * 
 * @returns Complete analysis result including indicators and AI report
 * 
 * @example
 * // Basic usage
 * const result = await analyzeStock('fawry', '1d');
 * console.log(result.indicators.rsi);
 * console.log(result.aiReport.recommendation);
 * 
 * @example
 * // Handle errors
 * try {
 *   const result = await analyzeStock('unknown', '1d');
 * } catch (error) {
 *   console.error(error.message);  // "Symbol not found: unknown"
 * }
 */
export async function analyzeStock(
  query: string,
  timeframe: Timeframe
): Promise<AnalysisResult> {
  const startTime = Date.now();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[Stock Analysis] Starting analysis for: "${query}" (${timeframe})`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    // Step 1: Resolve the symbol from user query
    console.log('[Step 1/4] Resolving symbol...');
    const stock = await resolveSymbol(query);
    console.log(`[Step 1/4] ✓ Resolved to: ${stock.symbol} (${stock.nameAr})\n`);
    
    // Step 2: Fetch OHLCV data
    console.log('[Step 2/4] Fetching historical data...');
    const ohlcvData = await fetchOHLCVData(stock.symbol, timeframe);
    console.log(`[Step 2/4] ✓ Fetched ${ohlcvData.length} candles\n`);
    
    // Step 3: Calculate technical indicators
    console.log('[Step 3/4] Calculating technical indicators...');
    const indicators = calculateAllIndicators(ohlcvData);
    console.log('[Step 3/4] ✓ Indicators calculated\n');
    
    // Step 4: Generate AI report
    console.log('[Step 4/4] Generating AI analysis...');
    const aiReport = await generateAIReport(stock.symbol, stock.nameAr, indicators);
    console.log(`[Step 4/4] ✓ AI report generated (Recommendation: ${aiReport.recommendation})\n`);
    
    const duration = Date.now() - startTime;
    console.log(`${'='.repeat(60)}`);
    console.log(`[Stock Analysis] Completed in ${duration}ms`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Return complete result
    return {
      success: true,
      symbol: stock.symbol,
      name: stock.name,
      nameAr: stock.nameAr,
      timeframe,
      timestamp: new Date().toISOString(),
      indicators,
      aiReport,
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n[Stock Analysis] ERROR after ${duration}ms:`, error);
    throw error;
  }
}

/**
 * Safe version of analyzeStock that returns error objects instead of throwing
 * Useful for API routes that need to handle errors gracefully
 * 
 * @param query - User's search query
 * @param timeframe - Analysis timeframe
 * @returns Either AnalysisResult or AnalysisError
 */
export async function analyzeStockSafe(
  query: string,
  timeframe: Timeframe
): Promise<AnalysisResult | AnalysisError> {
  try {
    return await analyzeStock(query, timeframe);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Determine error code based on message
    let code: AnalysisError['code'] = 'UNKNOWN_ERROR';
    if (message.includes('not found') || message.includes('Symbol')) {
      code = 'SYMBOL_NOT_FOUND';
    } else if (message.includes('fetch') || message.includes('data')) {
      code = 'DATA_FETCH_ERROR';
    } else if (message.includes('indicator') || message.includes('calculation')) {
      code = 'CALCULATION_ERROR';
    } else if (message.includes('AI') || message.includes('Gemini')) {
      code = 'AI_ERROR';
    }
    
    return {
      success: false,
      error: message,
      code,
    };
  }
}

/**
 * Validate if a timeframe string is valid
 * @param timeframe - String to validate
 * @returns true if valid timeframe
 */
export function isValidTimeframe(timeframe: string): timeframe is Timeframe {
  return ['15m', '1h', '1d'].includes(timeframe);
}
