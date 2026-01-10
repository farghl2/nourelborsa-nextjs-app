/**
 * Data Fetcher Service
 * Fetches OHLCV (Open, High, Low, Close, Volume) data from Yahoo Finance
 * 
 * Uses dynamic timeframe configuration to fetch appropriate data:
 * - 15m: Intraday data for day traders (مضارب)
 * - 1h: Short-term data
 * - 1d: Daily data for investors (مستثمر) - includes enough for SMA 200
 */

import YahooFinance from 'yahoo-finance2';
import { getTimeframeConfig } from '../constants';
import { OHLCVData, Timeframe } from '../types';

// Initialize Yahoo Finance instance (required for v3)
const yahooFinance = new YahooFinance();

/**
 * Yahoo Finance historical candle type
 */
interface YahooCandle {
  date: Date;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  adjClose?: number | null;
}

/**
 * Yahoo Finance quote type
 */
interface YahooQuote {
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  marketCap?: number;
  shortName?: string;
  longName?: string;
}

/**
 * Fetch historical OHLCV data from Yahoo Finance
 * 
 * @param symbol - Yahoo Finance symbol (e.g., "FWRY.CA")
 * @param timeframe - Analysis timeframe ('15m' | '1h' | '1d')
 * @returns Array of OHLCV data points
 * @throws Error if data cannot be fetched
 * 
 * @example
 * const data = await fetchOHLCVData('FWRY.CA', '1d');
 * // Returns ~500 daily candles (2 years of data)
 */
export async function fetchOHLCVData(
  symbol: string,
  timeframe: Timeframe
): Promise<OHLCVData[]> {
  const config = getTimeframeConfig(timeframe);
  
  console.log(`[Data Fetcher] Fetching ${symbol} with interval ${config.interval}`);
  console.log(`[Data Fetcher] Period: ${config.period1.toISOString()} to ${config.period2.toISOString()}`);
  
  try {
    let ohlcvData: OHLCVData[];
    
    // For intraday intervals (15m, 1h), use chart() API
    // For daily/weekly/monthly, use historical() API
    if (config.interval === '15m' || config.interval === '1h') {
      // Use chart() for intraday data
      const result = await yahooFinance.chart(symbol, {
        period1: config.period1,
        period2: config.period2,
        interval: config.interval,
      });
      
      const quotes = result.quotes;
      
      if (!quotes || quotes.length === 0) {
        throw new Error(`No data returned for symbol: ${symbol}`);
      }
      
      console.log(`[Data Fetcher] Received ${quotes.length} candles for ${symbol} (chart API)`);
      
      // Transform chart data to our OHLCV format
      ohlcvData = quotes
        .filter((candle) => 
          candle.open !== undefined &&
          candle.open !== null &&
          candle.high !== undefined &&
          candle.high !== null &&
          candle.low !== undefined &&
          candle.low !== null &&
          candle.close !== undefined &&
          candle.close !== null &&
          candle.volume !== undefined &&
          candle.volume !== null
        )
        .map((candle) => ({
          date: new Date(candle.date),
          open: candle.open!,
          high: candle.high!,
          low: candle.low!,
          close: candle.close!,
          volume: candle.volume!,
        }));
    } else {
      // Use historical() for daily and longer intervals
      const result = await yahooFinance.historical(symbol, {
        period1: config.period1,
        period2: config.period2,
        interval: config.interval as '1d' | '1wk' | '1mo',
      });
      
      // Cast to expected type
      const candles = result as YahooCandle[];
      
      if (!candles || candles.length === 0) {
        throw new Error(`No data returned for symbol: ${symbol}`);
      }
      
      console.log(`[Data Fetcher] Received ${candles.length} candles for ${symbol} (historical API)`);
      
      // Transform Yahoo Finance data to our OHLCV format
      // Yahoo Finance returns data in chronological order (oldest first)
      ohlcvData = candles
        .filter((candle: YahooCandle) => 
          // Filter out invalid candles (sometimes Yahoo returns nulls)
          candle.open !== null &&
          candle.high !== null &&
          candle.low !== null &&
          candle.close !== null &&
          candle.volume !== null
        )
        .map((candle: YahooCandle) => ({
          date: candle.date,
          open: candle.open!,
          high: candle.high!,
          low: candle.low!,
          close: candle.close!,
          volume: candle.volume!,
        }));
    }
    
    if (ohlcvData.length === 0) {
      throw new Error(`All candles were invalid for symbol: ${symbol}`);
    }
    
    // Log some stats
    const latestCandle = ohlcvData[ohlcvData.length - 1];
    console.log(`[Data Fetcher] Latest candle: ${latestCandle.date.toISOString()}`);
    console.log(`[Data Fetcher] Latest price: ${latestCandle.close}`);
    
    return ohlcvData;
    
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific Yahoo Finance errors
      if (error.message.includes('No data found')) {
        throw new Error(
          `No historical data available for ${symbol}. ` +
          `The stock may be delisted or the symbol is incorrect.`
        );
      }
      throw new Error(`Failed to fetch data for ${symbol}: ${error.message}`);
    }
    throw new Error(`Failed to fetch data for ${symbol}: Unknown error`);
  }
}

/**
 * Get the latest quote for a symbol
 * Useful for real-time price information
 * 
 * @param symbol - Yahoo Finance symbol
 * @returns Latest quote data
 */
export async function getLatestQuote(symbol: string) {
  try {
    const result = await yahooFinance.quote(symbol);
    const quote = result as YahooQuote;
    
    return {
      price: quote.regularMarketPrice ?? 0,
      previousClose: quote.regularMarketPreviousClose ?? 0,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      volume: quote.regularMarketVolume ?? 0,
      marketCap: quote.marketCap ?? 0,
      name: quote.shortName ?? quote.longName ?? symbol,
    };
  } catch (error) {
    console.error(`[Data Fetcher] Failed to get quote for ${symbol}:`, error);
    return null;
  }
}
