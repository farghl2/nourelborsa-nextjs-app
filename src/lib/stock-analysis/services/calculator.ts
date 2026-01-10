/**
 * Technical Indicators Calculator
 * Calculates all technical indicators using the 'technicalindicators' library
 * 
 * This module replicates pandas-ta functionality in TypeScript:
 * - RSI (Relative Strength Index)
 * - MFI (Money Flow Index)
 * - MACD (Moving Average Convergence Divergence)
 * - Stochastic Oscillator
 * - ATR (Average True Range)
 * - CCI (Commodity Channel Index)
 * - SMA & EMA (Simple & Exponential Moving Averages)
 * - Pivot Points (Support & Resistance levels)
 */

import {
  RSI,
  MFI,
  MACD,
  Stochastic,
  ATR,
  CCI,
  SMA,
  EMA,
} from 'technicalindicators';
import { INDICATOR_PERIODS } from '../constants';
import {
  OHLCVData,
  TechnicalIndicators,
  PivotPoints,
  MovingAverages,
  MACDResult,
  StochasticResult,
} from '../types';

/**
 * Extract arrays from OHLCV data for indicator calculations
 * The technicalindicators library requires separate arrays for each value
 */
function extractArrays(data: OHLCVData[]) {
  return {
    open: data.map((d) => d.open),
    high: data.map((d) => d.high),
    low: data.map((d) => d.low),
    close: data.map((d) => d.close),
    volume: data.map((d) => d.volume),
  };
}

/**
 * Get the last valid value from an indicator array
 * Indicators return arrays where early values may be NaN/undefined
 */
function getLastValue(arr: number[] | undefined): number | null {
  if (!arr || arr.length === 0) return null;
  const lastValue = arr[arr.length - 1];
  return isNaN(lastValue) ? null : lastValue;
}

/**
 * Calculate RSI (Relative Strength Index)
 * 
 * RSI measures the speed and magnitude of price movements
 * - Period: 14 (standard)
 * - Range: 0-100
 * - Overbought: > 70
 * - Oversold: < 30
 * 
 * Formula (matching pandas-ta):
 * RS = Average Gain / Average Loss (over period)
 * RSI = 100 - (100 / (1 + RS))
 */
function calculateRSI(closes: number[]): number | null {
  const result = RSI.calculate({
    values: closes,
    period: INDICATOR_PERIODS.RSI,
  });
  return getLastValue(result);
}

/**
 * Calculate MFI (Money Flow Index)
 * 
 * MFI is a volume-weighted RSI that incorporates volume data
 * - Period: 14 (standard)
 * - Range: 0-100
 * - Overbought: > 80
 * - Oversold: < 20
 * 
 * Formula:
 * Typical Price = (High + Low + Close) / 3
 * Raw Money Flow = Typical Price × Volume
 * MFI = 100 - (100 / (1 + Money Ratio))
 */
function calculateMFI(
  high: number[],
  low: number[],
  close: number[],
  volume: number[]
): number | null {
  const result = MFI.calculate({
    high,
    low,
    close,
    volume,
    period: INDICATOR_PERIODS.MFI,
  });
  return getLastValue(result);
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * 
 * MACD shows the relationship between two EMAs
 * - Fast Period: 12
 * - Slow Period: 26
 * - Signal Period: 9
 * 
 * Formula:
 * MACD Line = EMA(12) - EMA(26)
 * Signal Line = EMA(9) of MACD Line
 * Histogram = MACD Line - Signal Line
 */
function calculateMACD(closes: number[]): MACDResult {
  const result = MACD.calculate({
    values: closes,
    fastPeriod: INDICATOR_PERIODS.MACD_FAST,
    slowPeriod: INDICATOR_PERIODS.MACD_SLOW,
    signalPeriod: INDICATOR_PERIODS.MACD_SIGNAL,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  
  if (!result || result.length === 0) {
    return { macd: null, signal: null, histogram: null };
  }
  
  const last = result[result.length - 1];
  return {
    macd: last.MACD ?? null,
    signal: last.signal ?? null,
    histogram: last.histogram ?? null,
  };
}

/**
 * Calculate Stochastic Oscillator
 * 
 * Stochastic compares closing price to price range
 * - K Period: 14
 * - D Period: 3 (signal line)
 * - Range: 0-100
 * - Overbought: > 80
 * - Oversold: < 20
 * 
 * Formula:
 * %K = ((Close - Lowest Low) / (Highest High - Lowest Low)) × 100
 * %D = SMA(3) of %K
 */
function calculateStochastic(
  high: number[],
  low: number[],
  close: number[]
): StochasticResult {
  const result = Stochastic.calculate({
    high,
    low,
    close,
    period: INDICATOR_PERIODS.STOCHASTIC_K,
    signalPeriod: INDICATOR_PERIODS.STOCHASTIC_D,
  });
  
  if (!result || result.length === 0) {
    return { k: null, d: null };
  }
  
  const last = result[result.length - 1];
  return {
    k: last.k ?? null,
    d: last.d ?? null,
  };
}

/**
 * Calculate ATR (Average True Range)
 * 
 * ATR measures volatility by decomposing the entire range of a price
 * - Period: 14 (standard)
 * 
 * True Range = max(
 *   High - Low,
 *   |High - Previous Close|,
 *   |Low - Previous Close|
 * )
 * ATR = SMA(14) of True Range
 */
function calculateATR(
  high: number[],
  low: number[],
  close: number[]
): number | null {
  const result = ATR.calculate({
    high,
    low,
    close,
    period: INDICATOR_PERIODS.ATR,
  });
  return getLastValue(result);
}

/**
 * Calculate CCI (Commodity Channel Index)
 * 
 * CCI measures deviation from the mean price
 * - Period: 20 (standard)
 * - Overbought: > +100
 * - Oversold: < -100
 * 
 * Formula:
 * Typical Price = (High + Low + Close) / 3
 * CCI = (Typical Price - SMA(TP)) / (0.015 × Mean Deviation)
 */
function calculateCCI(
  high: number[],
  low: number[],
  close: number[]
): number | null {
  const result = CCI.calculate({
    high,
    low,
    close,
    period: INDICATOR_PERIODS.CCI,
  });
  return getLastValue(result);
}

/**
 * Calculate Moving Averages (SMA and EMA)
 * 
 * SMA = Simple Moving Average (equal weight to all values)
 * EMA = Exponential Moving Average (more weight to recent values)
 * 
 * Periods: [10, 20, 50, 100, 200]
 */
function calculateMovingAverages(closes: number[]): MovingAverages {
  const periods = INDICATOR_PERIODS.MA_PERIODS;
  
  // Calculate SMAs
  const sma10 = getLastValue(SMA.calculate({ values: closes, period: periods[0] }));
  const sma20 = getLastValue(SMA.calculate({ values: closes, period: periods[1] }));
  const sma50 = getLastValue(SMA.calculate({ values: closes, period: periods[2] }));
  const sma100 = getLastValue(SMA.calculate({ values: closes, period: periods[3] }));
  const sma200 = getLastValue(SMA.calculate({ values: closes, period: periods[4] }));
  
  // Calculate EMAs
  const ema10 = getLastValue(EMA.calculate({ values: closes, period: periods[0] }));
  const ema20 = getLastValue(EMA.calculate({ values: closes, period: periods[1] }));
  const ema50 = getLastValue(EMA.calculate({ values: closes, period: periods[2] }));
  const ema100 = getLastValue(EMA.calculate({ values: closes, period: periods[3] }));
  const ema200 = getLastValue(EMA.calculate({ values: closes, period: periods[4] }));
  
  return {
    sma10,
    sma20,
    sma50,
    sma100,
    sma200,
    ema10,
    ema20,
    ema50,
    ema100,
    ema200,
  };
}

/**
 * Calculate Pivot Points (Support & Resistance)
 * 
 * Standard Pivot Points formula using the LAST COMPLETED CANDLE
 * 
 * PP = (High + Low + Close) / 3
 * R1 = (2 × PP) - Low
 * S1 = (2 × PP) - High
 * R2 = PP + (High - Low)
 * S2 = PP - (High - Low)
 */
function calculatePivotPoints(data: OHLCVData[]): PivotPoints {
  // Use the second-to-last candle (last completed) if possible
  // The last candle might be incomplete during market hours
  const candleIndex = data.length >= 2 ? data.length - 2 : data.length - 1;
  const candle = data[candleIndex];
  
  const { high, low, close } = candle;
  
  // Calculate Pivot Point
  const pp = (high + low + close) / 3;
  
  // Calculate Resistance levels
  const r1 = (2 * pp) - low;
  const r2 = pp + (high - low);
  
  // Calculate Support levels
  const s1 = (2 * pp) - high;
  const s2 = pp - (high - low);
  
  // Round to 2 decimal places for readability
  return {
    pp: Math.round(pp * 100) / 100,
    r1: Math.round(r1 * 100) / 100,
    r2: Math.round(r2 * 100) / 100,
    s1: Math.round(s1 * 100) / 100,
    s2: Math.round(s2 * 100) / 100,
  };
}

/**
 * Calculate ALL technical indicators for the given OHLCV data
 * 
 * @param data - Array of OHLCV candles (oldest first)
 * @returns Complete technical indicators object
 * 
 * @example
 * const indicators = calculateAllIndicators(ohlcvData);
 * console.log(indicators.rsi);  // e.g., 65.5
 * console.log(indicators.macd.histogram);  // e.g., 0.25
 */
export function calculateAllIndicators(data: OHLCVData[]): TechnicalIndicators {
  if (data.length < 2) {
    throw new Error('Insufficient data for indicator calculation. Need at least 2 candles.');
  }
  
  // Extract arrays for indicator calculations
  const { high, low, close, volume } = extractArrays(data);
  
  // Get current and previous price
  const currentPrice = close[close.length - 1];
  const previousClose = close[close.length - 2];
  const priceChange = currentPrice - previousClose;
  const priceChangePercent = (priceChange / previousClose) * 100;
  
  console.log(`[Calculator] Computing indicators for ${data.length} candles`);
  console.log(`[Calculator] Current price: ${currentPrice}, Previous: ${previousClose}`);
  
  // Calculate all indicators
  const indicators: TechnicalIndicators = {
    currentPrice: Math.round(currentPrice * 100) / 100,
    previousClose: Math.round(previousClose * 100) / 100,
    priceChange: Math.round(priceChange * 100) / 100,
    priceChangePercent: Math.round(priceChangePercent * 100) / 100,
    
    // Momentum indicators
    rsi: calculateRSI(close),
    mfi: calculateMFI(high, low, close, volume),
    cci: calculateCCI(high, low, close),
    stochastic: calculateStochastic(high, low, close),
    
    // Trend indicators
    macd: calculateMACD(close),
    atr: calculateATR(high, low, close),
    
    // Moving averages
    movingAverages: calculateMovingAverages(close),
    
    // Support/Resistance
    pivotPoints: calculatePivotPoints(data),
  };
  
  // Log indicator summary
  console.log(`[Calculator] RSI: ${indicators.rsi?.toFixed(2)}`);
  console.log(`[Calculator] MACD Histogram: ${indicators.macd.histogram?.toFixed(4)}`);
  console.log(`[Calculator] Pivot Point: ${indicators.pivotPoints.pp}`);
  
  return indicators;
}

/**
 * Format indicator value for display
 * Handles null values and rounds appropriately
 */
export function formatIndicator(value: number | null, decimals: number = 2): string {
  if (value === null) return 'N/A';
  return value.toFixed(decimals);
}
