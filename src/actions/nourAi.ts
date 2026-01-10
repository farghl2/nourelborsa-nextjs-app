'use server';

/**
 * Nour AI Server Actions
 * Server-side functions for stock analysis with AI
 * 
 * These actions handle:
 * - User authentication verification
 * - Usage limit tracking
 * - Stock analysis using the stock-analysis module
 */

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { analyzeStock, Timeframe } from '@/lib/stock-analysis';

/**
 * Map UI timeframe labels to API timeframe values
 */
const TIMEFRAME_MAP: Record<string, Timeframe> = {
  'مضارب': '15m',        // Intraday (30 minutes / 15m data)
  'مدى قصير': '1h',      // Short term (1 hour data)
  'مدى متوسط': '1d',     // Medium term (daily data)
};

/**
 * Default AI usage limit per billing period
 */
const DEFAULT_AI_LIMIT = 5;

/**
 * Result type for AI analysis
 */
interface AnalysisResult {
  success: boolean;
  analysis?: string;
  error?: string;
  remainingCount?: number;
  symbol?: string;
  recommendation?: string;
  indicators?: {
    rsi?: number | null;
    macd?: number | null;
    currentPrice?: number;
    priceChange?: number;
    priceChangePercent?: number;
  };
}

/**
 * Result type for usage info
 */
interface UsageInfoResult {
  success: boolean;
  remainingCount?: number;
  totalLimit?: number;
  error?: string;
}

/**
 * Get the AI limit for a user based on their active subscription
 */
async function getUserAILimit(userId: string): Promise<number> {
  // Find user's active subscription with plan
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
    },
    include: {
      plan: {
        select: { aiLimit: true }
      }
    },
    orderBy: {
      startDate: 'desc'
    }
  });
  
  return subscription?.plan?.aiLimit ?? DEFAULT_AI_LIMIT;
}

/**
 * Get AI usage information for the current user
 * @returns Usage count and limit information
 */
export async function getAIUsageInfo(): Promise<UsageInfoResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: 'يجب تسجيل الدخول' };
    }
    
    const userId = (session.user as any).id;
    if (!userId) {
      return { success: false, error: 'يجب تسجيل الدخول' };
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        aiUsageCount: true,
      },
    });
    
    if (!user) {
      return { success: false, error: 'المستخدم غير موجود' };
    }
    
    const aiLimit = await getUserAILimit(user.id);
    const usedCount = user.aiUsageCount ?? 0;
    const remainingCount = Math.max(0, aiLimit - usedCount);
    
    return {
      success: true,
      remainingCount,
      totalLimit: aiLimit,
    };
  } catch (error) {
    console.error('[Nour AI] Error getting usage info:', error);
    return { success: false, error: 'حدث خطأ في الخادم' };
  }
}

/**
 * Analyze a stock using AI
 * 
 * @param stockSymbol - Stock symbol or name (e.g., "FWRY", "Fawry", "فوري")
 * @param timeframeLabel - UI timeframe label (e.g., "مضارب", "مدى قصير", "مدى متوسط")
 * @returns Analysis result with AI report
 */
export async function analyzeStockWithAI(
  stockSymbol: string,
  timeframeLabel: string
): Promise<AnalysisResult> {
  try {
    // 1. Verify authentication using NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: 'يجب تسجيل الدخول لاستخدام هذه الميزة' };
    }
    
    const userId = (session.user as any).id;
    if (!userId) {
      return { success: false, error: 'يجب تسجيل الدخول لاستخدام هذه الميزة' };
    }
    
    // 2. Get user and check usage limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        aiUsageCount: true,
      },
    });
    
    if (!user) {
      return { success: false, error: 'المستخدم غير موجود' };
    }
    
    const aiLimit = await getUserAILimit(user.id);
    const usedCount = user.aiUsageCount ?? 0;
    
    if (usedCount >= aiLimit) {
      return { 
        success: false, 
        error: 'لقد استنفدت جميع محاولاتك. قم بالترقية للحصول على المزيد.',
        remainingCount: 0,
      };
    }
    
    // 3. Map timeframe
    const timeframe = TIMEFRAME_MAP[timeframeLabel] || '1d';
    
    console.log(`[Nour AI] Analyzing ${stockSymbol} with timeframe ${timeframe} for user ${user.id}`);
    
    // 4. Perform stock analysis
    const result = await analyzeStock(stockSymbol, timeframe);
    
    if (!result.success) {
      return { 
        success: false, 
        error: 'فشل في تحليل السهم. تأكد من صحة رمز السهم.',
        remainingCount: aiLimit - usedCount,
      };
    }
    
    // 5. Increment usage count
    await prisma.user.update({
      where: { id: user.id },
      data: { aiUsageCount: { increment: 1 } },
    });
    
    const newRemainingCount = aiLimit - usedCount - 1;
    
    // 6. Format the response
    return {
      success: true,
      analysis: result.aiReport.analysis,
      recommendation: result.aiReport.recommendation,
      symbol: result.symbol,
      remainingCount: newRemainingCount,
      indicators: {
        rsi: result.indicators.rsi,
        macd: result.indicators.macd.histogram,
        currentPrice: result.indicators.currentPrice,
        priceChange: result.indicators.priceChange,
        priceChangePercent: result.indicators.priceChangePercent,
      },
    };
    
  } catch (error) {
    console.error('[Nour AI] Analysis error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('Symbol')) {
        return { 
          success: false, 
          error: `لم يتم العثور على السهم "${stockSymbol}". تأكد من صحة الرمز.` 
        };
      }
      if (error.message.includes('data')) {
        return { 
          success: false, 
          error: 'لا تتوفر بيانات كافية لهذا السهم.' 
        };
      }
    }
    
    return { 
      success: false, 
      error: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' 
    };
  }
}
