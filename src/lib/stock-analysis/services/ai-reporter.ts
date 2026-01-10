/**
 * AI Reporter Service
 * Generates Arabic financial analysis using Google Gemini AI
 * 
 * This service:
 * 1. Constructs a structured prompt with all technical indicators
 * 2. Sends it to Gemini Pro for analysis
 * 3. Parses the response into a structured report
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TechnicalIndicators, AIReport } from '../types';

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate an Arabic analysis report using Gemini AI
 * 
 * @param symbol - Stock symbol (e.g., "FWRY.CA")
 * @param stockName - Arabic stock name
 * @param indicators - Calculated technical indicators
 * @returns Structured AI analysis report
 * 
 * @example
 * const report = await generateAIReport('FWRY.CA', 'فوري', indicators);
 * console.log(report.recommendation);  // 'BUY' | 'SELL' | 'HOLD'
 * console.log(report.analysis);  // Full Arabic analysis
 */
export async function generateAIReport(
  symbol: string,
  stockName: string,
  indicators: TechnicalIndicators
): Promise<AIReport> {
  // Check for API key
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[AI Reporter] GEMINI_API_KEY not set, returning default report');
    return getDefaultReport(indicators);
  }
  
  try {
    console.log(`[AI Reporter] Generating analysis for ${symbol}`);
    
    // Build the prompt with indicator data
    const prompt = buildAnalysisPrompt(symbol, stockName, indicators);
    
    // Call Gemini (using gemini-1.5-flash - gemini-pro is deprecated)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('[AI Reporter] Received response from Gemini');
    
    // Parse the response
    return parseAIResponse(text, indicators);
    
  } catch (error) {
    console.error('[AI Reporter] Error generating report:', error);
    return getDefaultReport(indicators);
  }
}

/**
 * Build a structured prompt for Gemini
 * Includes all relevant indicators in a clear format
 */
function buildAnalysisPrompt(
  symbol: string,
  stockName: string,
  indicators: TechnicalIndicators
): string {
  const { movingAverages, pivotPoints, macd, stochastic } = indicators;
  
  // Determine trend based on moving averages
  const priceVsSMA200 = movingAverages.sma200 
    ? (indicators.currentPrice > movingAverages.sma200 ? 'فوق' : 'تحت')
    : 'غير متاح';
  
  const priceVsSMA50 = movingAverages.sma50
    ? (indicators.currentPrice > movingAverages.sma50 ? 'فوق' : 'تحت')
    : 'غير متاح';
  
  return `
أنت محلل مالي فني محترف متخصص في البورصة المصرية.
قم بتحليل سهم "${stockName}" (${symbol}) بناءً على المؤشرات الفنية التالية:

📊 **معلومات السعر:**
- السعر الحالي: ${indicators.currentPrice} جنيه
- الإغلاق السابق: ${indicators.previousClose} جنيه
- التغير: ${indicators.priceChange} (${indicators.priceChangePercent}%)

📈 **مؤشرات الزخم:**
- RSI (14): ${formatValue(indicators.rsi)} ${getRSIInterpretation(indicators.rsi)}
- MFI (14): ${formatValue(indicators.mfi)} ${getMFIInterpretation(indicators.mfi)}
- Stochastic K: ${formatValue(stochastic.k)}, D: ${formatValue(stochastic.d)}
- CCI (20): ${formatValue(indicators.cci)}

📉 **مؤشرات الاتجاه:**
- MACD: ${formatValue(macd.macd)}
- Signal: ${formatValue(macd.signal)}
- Histogram: ${formatValue(macd.histogram)} ${macd.histogram && macd.histogram > 0 ? '(إيجابي)' : '(سلبي)'}
- ATR (14): ${formatValue(indicators.atr)}

📊 **المتوسطات المتحركة:**
- SMA 10: ${formatValue(movingAverages.sma10)}
- SMA 20: ${formatValue(movingAverages.sma20)}
- SMA 50: ${formatValue(movingAverages.sma50)}
- SMA 100: ${formatValue(movingAverages.sma100)}
- SMA 200: ${formatValue(movingAverages.sma200)}
- السعر ${priceVsSMA50} متوسط 50 يوم
- السعر ${priceVsSMA200} متوسط 200 يوم

🎯 **مستويات الدعم والمقاومة (Pivot Points):**
- Pivot Point: ${pivotPoints.pp}
- مقاومة 1 (R1): ${pivotPoints.r1}
- مقاومة 2 (R2): ${pivotPoints.r2}
- دعم 1 (S1): ${pivotPoints.s1}
- دعم 2 (S2): ${pivotPoints.s2}

---

**المطلوب:**
قدم تحليلاً شاملاً  يتضمن:

1. **تحليل الاتجاه**: هل السهم في اتجاه صاعد أم هابط أم عرضي؟ (بناءً على المتوسطات)

2. **تحليل الزخم**: هل الزخم قوي أم ضعيف؟ هل هناك إشارات ذروة شراء أو بيع؟

3. **مستويات الدعم والمقاومة**: أين مستويات الدخول والخروج المناسبة؟

4. **التوصية النهائية**: 
   - اختر واحدة: شراء (BUY) / بيع (SELL) / انتظار (HOLD)
   - مستوى الثقة: عالي / متوسط / منخفض
   - تقييم المخاطر

**ملاحظة مهمة:** كن واقعياً ومحافظاً في توصياتك. لا تنصح بالشراء إلا إذا كانت المؤشرات واضحة.

ابدأ ردك بـ:
[RECOMMENDATION: BUY/SELL/HOLD]
[CONFIDENCE: HIGH/MEDIUM/LOW]

ثم اكتب التحليل بشكل مفصل.
`;
}

/**
 * Parse Gemini's response into structured format
 */
function parseAIResponse(text: string, indicators: TechnicalIndicators): AIReport {
  // Extract recommendation
  const recommendationMatch = text.match(/\[RECOMMENDATION:\s*(BUY|SELL|HOLD)\]/i);
  const recommendation = (recommendationMatch?.[1]?.toUpperCase() || 'HOLD') as 'BUY' | 'SELL' | 'HOLD';
  
  // Extract confidence
  const confidenceMatch = text.match(/\[CONFIDENCE:\s*(HIGH|MEDIUM|LOW)\]/i);
  const confidence = (confidenceMatch?.[1]?.toUpperCase() || 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW';
  
  // Clean the text (remove the tags)
  const cleanText = text
    .replace(/\[RECOMMENDATION:.*?\]/gi, '')
    .replace(/\[CONFIDENCE:.*?\]/gi, '')
    .trim();
  
  // Try to extract sections (these are best-effort extractions)
  const trendAnalysis = extractSection(cleanText, 'تحليل الاتجاه');
  const momentumAnalysis = extractSection(cleanText, 'تحليل الزخم');
  const supportResistance = extractSection(cleanText, 'مستويات الدعم والمقاومة');
  const riskAssessment = extractSection(cleanText, 'تقييم المخاطر') || extractSection(cleanText, 'المخاطر');
  
  return {
    recommendation,
    confidence,
    analysis: cleanText,
    trendAnalysis: trendAnalysis || 'تحليل الاتجاه غير متاح',
    momentumAnalysis: momentumAnalysis || 'تحليل الزخم غير متاح',
    supportResistance: supportResistance || `PP: ${indicators.pivotPoints.pp}, S1: ${indicators.pivotPoints.s1}, R1: ${indicators.pivotPoints.r1}`,
    riskAssessment: riskAssessment || 'يُنصح بإدارة المخاطر واستخدام وقف الخسارة',
  };
}

/**
 * Extract a section from the analysis text
 */
function extractSection(text: string, sectionName: string): string | null {
  const regex = new RegExp(`\\*\\*${sectionName}[^*]*\\*\\*[:\\s]*([^*]+?)(?=\\*\\*|$)`, 'i');
  const match = text.match(regex);
  return match?.[1]?.trim() || null;
}

/**
 * Generate a default report when AI is unavailable
 */
function getDefaultReport(indicators: TechnicalIndicators): AIReport {
  const { rsi, macd, movingAverages, pivotPoints } = indicators;
  
  // Simple rule-based recommendation
  let recommendation: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  
  const bullishSignals = [
    rsi !== null && rsi < 30,  // Oversold
    macd.histogram !== null && macd.histogram > 0,  // Bullish MACD
    movingAverages.sma50 !== null && indicators.currentPrice > movingAverages.sma50,
  ].filter(Boolean).length;
  
  const bearishSignals = [
    rsi !== null && rsi > 70,  // Overbought
    macd.histogram !== null && macd.histogram < 0,  // Bearish MACD
    movingAverages.sma50 !== null && indicators.currentPrice < movingAverages.sma50,
  ].filter(Boolean).length;
  
  if (bullishSignals >= 2) {
    recommendation = 'BUY';
    confidence = bullishSignals === 3 ? 'HIGH' : 'MEDIUM';
  } else if (bearishSignals >= 2) {
    recommendation = 'SELL';
    confidence = bearishSignals === 3 ? 'HIGH' : 'MEDIUM';
  }
  
  return {
    recommendation,
    confidence,
    analysis: `
تحليل تلقائي (AI غير متاح):

📊 السعر الحالي: ${indicators.currentPrice} جنيه
📈 RSI: ${formatValue(rsi)} ${getRSIInterpretation(rsi)}
📉 MACD Histogram: ${formatValue(macd.histogram)}

مستويات مهمة:
- دعم 1: ${pivotPoints.s1}
- مقاومة 1: ${pivotPoints.r1}

التوصية: ${recommendation === 'BUY' ? 'شراء' : recommendation === 'SELL' ? 'بيع' : 'انتظار'}
    `.trim(),
    trendAnalysis: movingAverages.sma200 
      ? `السعر ${indicators.currentPrice > movingAverages.sma200 ? 'فوق' : 'تحت'} متوسط 200 يوم` 
      : 'غير متاح',
    momentumAnalysis: `RSI: ${formatValue(rsi)}`,
    supportResistance: `PP: ${pivotPoints.pp}, S1: ${pivotPoints.s1}, R1: ${pivotPoints.r1}`,
    riskAssessment: 'يُنصح باستخدام وقف الخسارة',
  };
}

/**
 * Format a numeric value for display
 */
function formatValue(value: number | null): string {
  if (value === null) return 'N/A';
  return value.toFixed(2);
}

/**
 * Get RSI interpretation in Arabic
 */
function getRSIInterpretation(rsi: number | null): string {
  if (rsi === null) return '';
  if (rsi > 70) return '(ذروة شراء ⚠️)';
  if (rsi < 30) return '(ذروة بيع 🔔)';
  if (rsi > 50) return '(إيجابي)';
  return '(سلبي)';
}

/**
 * Get MFI interpretation in Arabic
 */
function getMFIInterpretation(mfi: number | null): string {
  if (mfi === null) return '';
  if (mfi > 80) return '(تدفق مالي مرتفع جداً ⚠️)';
  if (mfi < 20) return '(تدفق مالي منخفض جداً 🔔)';
  if (mfi > 50) return '(تدفق مالي إيجابي)';
  return '(تدفق مالي سلبي)';
}
