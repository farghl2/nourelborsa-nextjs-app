/**
 * Stock Analysis Types
 * Defines all TypeScript interfaces for the stock analysis module
 */

// ============================================
// Stock & Configuration Types
// ============================================

/**
 * Egyptian stock metadata for local search
 */
export interface EgyptianStock {
  symbol: string;      // Yahoo Finance symbol (e.g., "COMI.CA")
  name: string;        // English name
  nameAr: string;      // Arabic name
  keywords: string[];  // Search keywords for fuzzy matching
}

/**
 * Supported analysis timeframes
 * - 15m: Intraday (مضارب)
 * - 1h: Short term
 * - 1d: Daily (مستثمر)
 */
export type Timeframe = '15m' | '1h' | '1d';

/**
 * Configuration for Yahoo Finance API based on timeframe
 */
export interface TimeframeConfig {
  interval: '15m' | '1h' | '1d';
  period1: Date;  // Start date
  period2: Date;  // End date (now)
}

// ============================================
// OHLCV Data Types
// ============================================

/**
 * Single candlestick data point
 * OHLCV = Open, High, Low, Close, Volume
 */
export interface OHLCVData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ============================================
// Technical Indicator Types
// ============================================

/**
 * Pivot Points - Support and Resistance levels
 * Calculated using standard pivot point formula
 * 
 * Formula (from last completed candle):
 * PP = (High + Low + Close) / 3
 * R1 = (2 * PP) - Low
 * S1 = (2 * PP) - High
 * R2 = PP + (High - Low)
 * S2 = PP - (High - Low)
 */
export interface PivotPoints {
  pp: number;   // Pivot Point
  r1: number;   // Resistance 1
  r2: number;   // Resistance 2
  s1: number;   // Support 1
  s2: number;   // Support 2
}

/**
 * Moving Averages for multiple periods
 * Both SMA (Simple) and EMA (Exponential)
 */
export interface MovingAverages {
  sma10: number | null;
  sma20: number | null;
  sma50: number | null;
  sma100: number | null;
  sma200: number | null;
  ema10: number | null;
  ema20: number | null;
  ema50: number | null;
  ema100: number | null;
  ema200: number | null;
}

/**
 * MACD Indicator values
 * Fast: 12, Slow: 26, Signal: 9
 */
export interface MACDResult {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

/**
 * Stochastic Oscillator values
 * K period: 14, D period: 3
 */
export interface StochasticResult {
  k: number | null;
  d: number | null;
}

/**
 * Complete technical indicators result
 */
export interface TechnicalIndicators {
  currentPrice: number;
  previousClose: number;
  priceChange: number;
  priceChangePercent: number;
  
  // Momentum indicators
  rsi: number | null;           // RSI (14)
  mfi: number | null;           // Money Flow Index (14)
  cci: number | null;           // Commodity Channel Index (20)
  stochastic: StochasticResult;
  
  // Trend indicators
  macd: MACDResult;
  atr: number | null;           // Average True Range (14)
  
  // Moving averages
  movingAverages: MovingAverages;
  
  // Support/Resistance
  pivotPoints: PivotPoints;
}

// ============================================
// Analysis Result Types
// ============================================

/**
 * AI-generated analysis report
 */
export interface AIReport {
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  analysis: string;      // Full Arabic analysis text
  trendAnalysis: string;
  momentumAnalysis: string;
  supportResistance: string;
  riskAssessment: string;
}

/**
 * Complete stock analysis result
 */
export interface AnalysisResult {
  success: boolean;
  symbol: string;
  name: string;
  nameAr: string;
  timeframe: Timeframe;
  timestamp: string;
  indicators: TechnicalIndicators;
  aiReport: AIReport;
}

/**
 * Error response structure
 */
export interface AnalysisError {
  success: false;
  error: string;
  code: 'SYMBOL_NOT_FOUND' | 'DATA_FETCH_ERROR' | 'CALCULATION_ERROR' | 'AI_ERROR' | 'UNKNOWN_ERROR';
}

/**
 * API Request body
 */
export interface AnalyzeRequest {
  query: string;
  timeframe: Timeframe;
}
