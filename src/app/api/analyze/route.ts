/**
 * Stock Analysis API Route
 * POST /api/analyze
 * 
 * Analyzes Egyptian stocks and returns technical indicators with AI-powered recommendations
 * 
 * Request Body:
 * {
 *   "query": "Fawry",      // Stock name, symbol, or Arabic name
 *   "timeframe": "1d"      // '15m' | '1h' | '1d'
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "symbol": "FWRY.CA",
 *   "name": "Fawry",
 *   "nameAr": "فوري",
 *   "timeframe": "1d",
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "indicators": { ... },
 *   "aiReport": { ... }
 * }
 */

import { NextResponse } from 'next/server';
import { analyzeStockSafe, isValidTimeframe, AnalyzeRequest } from '@/lib/stock-analysis';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }
    
    const { query, timeframe } = body as Partial<AnalyzeRequest>;
    
    // Validate query parameter
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing or invalid "query" parameter. Provide a stock name or symbol.', 
          code: 'INVALID_REQUEST' 
        },
        { status: 400 }
      );
    }
    
    // Validate timeframe parameter
    if (!timeframe) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing "timeframe" parameter. Use: "15m", "1h", or "1d"', 
          code: 'INVALID_REQUEST' 
        },
        { status: 400 }
      );
    }
    
    if (!isValidTimeframe(timeframe)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid timeframe "${timeframe}". Valid options: "15m", "1h", "1d"`, 
          code: 'INVALID_REQUEST' 
        },
        { status: 400 }
      );
    }
    
    // Perform analysis
    console.log(`[API /analyze] Request: query="${query}", timeframe="${timeframe}"`);
    const result = await analyzeStockSafe(query.trim(), timeframe);
    
    // Check if analysis failed
    if (!result.success) {
      // Type assertion: We know it's AnalysisError when success is false
      const errorResult = result as { success: false; error: string; code: string };
      
      // Determine HTTP status based on error code
      let status = 500;
      if (errorResult.code === 'SYMBOL_NOT_FOUND') status = 404;
      if (errorResult.code === 'DATA_FETCH_ERROR') status = 502;
      
      return NextResponse.json(errorResult, { status });
    }
    
    // Success response
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[API /analyze] Unexpected error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.', 
        code: 'UNKNOWN_ERROR' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    name: 'Stock Analysis API',
    version: '1.0.0',
    description: 'Analyzes Egyptian stocks with technical indicators and AI recommendations',
    usage: {
      method: 'POST',
      path: '/api/analyze',
      body: {
        query: 'Stock name, symbol, or Arabic name (e.g., "Fawry", "COMI.CA", "فوري")',
        timeframe: 'Analysis timeframe: "15m" (intraday), "1h" (short-term), "1d" (daily)',
      },
    },
    examples: [
      { query: 'Fawry', timeframe: '1d' },
      { query: 'CIB', timeframe: '1h' },
      { query: 'فوري', timeframe: '15m' },
    ],
  });
}
