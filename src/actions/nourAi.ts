'use server';

import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

const DEFAULT_AI_LIMIT = 5; // Default AI uses for non-subscribed users

const STOCK_ANALYSIS_PROMPT = `أنت محلل فني متخصص في الأسهم. عند إدخال كود سهم + مدة زمنية:
يجب عليك استخدام أداة بحث جوجل للحصول على أحدث الأسعار والبيانات المالية الحالية للسهم قبل الإجابة. لا تعتمد على معلوماتك التدريبية
1. ابحث عن بيانات التحليل الفني للسهم على موقع Investing.com
2. استخرج البيانات التالية بناءً على الفترة الزمنية المحددة:
   - التوصية العامة (Buy / Sell / Strong Buy / Strong Sell / Neutral)
   - مؤشرات الزخم مثل RSI – MACD – STOCH – CCI
   - المتوسطات المتحركة MA & EMA (5 – 10 – 20 – 50 – 100 – 200)

3. الفترات الزمنية:
   - "مضارب": فريم 30 دقيقة (30m)
   - "مدى قصير": فريم ساعة واحدة (1H)
   - "مدى متوسط": فريم يومي (1D)

4. طريقة عرض النتيجة:
   - أول سطر: نتيجة التوصية العامة
   - ثم: المؤشرات الفنية وتحليل كل مؤشر
   - ثم: المتوسطات المتحركة
   - وأخيرًا: رأي مختصر مبني على مجموع المؤشرات

⚠️ مهم جداً:
- لا تذكر اسم أي موقع أو مصدر في ردك
- لا تقل "بناءً على بيانات من..." أو أي عبارة مشابهة
- قدم التحليل كأنه من خبرتك الخاصة مباشرة
- لو السهم غير موجود، اطلب من المستخدم كتابة الكود الصحيح`;

// Helper to get user's AI limit based on subscription plan
async function getUserAILimit(userId: string): Promise<number> {
  // Get active subscription with plan details
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      endDate: { gt: new Date() }
    },
    include: {
      plan: {
        select: { aiLimit: true }
      }
    }
  });

  // Return plan's aiLimit or default (5 for non-subscribed)
  return activeSubscription?.plan?.aiLimit ?? DEFAULT_AI_LIMIT;
}

// Get user's remaining AI usage
export async function getAIUsageInfo() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'يجب تسجيل الدخول أولاً' };
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aiUsageCount: true }
    });

    if (!user) {
      return { success: false, error: 'المستخدم غير موجود' };
    }

    // Get user's AI limit from their subscription plan
    const aiLimit = await getUserAILimit(userId);
    const usedCount = user.aiUsageCount || 0;
    const remainingCount = Math.max(0, aiLimit - usedCount);

    return {
      success: true,
      usedCount,
      remainingCount,
      limit: aiLimit
    };
  } catch (error) {
    console.error('Error getting AI usage info:', error);
    return { success: false, error: 'فشل في جلب معلومات الاستخدام' };
  }
}

export async function analyzeStockWithAI(stockSymbol: string, timeframe: string) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'يجب تسجيل الدخول أولاً لاستخدام هذه الميزة' };
    }

    const userId = (session.user as any).id;

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aiUsageCount: true }
    });

    if (!user) {
      return { success: false, error: 'المستخدم غير موجود' };
    }

    // Get user's AI limit from their subscription plan
    const aiLimit = await getUserAILimit(userId);
    const usedCount = user.aiUsageCount || 0;
    
    if (usedCount >= aiLimit) {
      return { 
        success: false, 
        error: `لقد استنفدت جميع محاولاتك (${aiLimit} مرات). يرجى الترقية للحصول على المزيد.` 
      };
    }

    if (!stockSymbol) {
      return { success: false, error: 'لم يتم إدخال رمز السهم' };
    }

    if (!timeframe) {
      return { success: false, error: 'لم يتم تحديد الفترة الزمنية' };
    }

    const prompt = `${STOCK_ANALYSIS_PROMPT}\n\nالرجاء تحليل السهم التالي:\nالرمز: ${stockSymbol}\nالفترة الزمنية: ${timeframe}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {
          // @ts-ignore - dynamicRetrievalConfig is valid but not in TypeScript definitions yet
          dynamicRetrievalConfig: {
            mode: "MODE_DYNAMIC",
            dynamicThreshold: 0,
          },
        } }],  // Enable Google Search grounding for 2.5
      }
    });

    let analysis = response.text || 'لا يوجد تحليل متاح';
    
    // Remove any source citations that might appear
    analysis = analysis
      .replace(/\[.*?\]/g, '')  // Remove [1], [2], etc.
      .replace(/المصدر:.*/gi, '')
      .replace(/Source:.*/gi, '')
      .replace(/\(\s*https?:\/\/[^\)]+\)/g, '')  // Remove URLs in parentheses
      .replace(/https?:\/\/[^\s]+/g, '')  // Remove standalone URLs
      .replace(/Investing\.com/gi, '')
      .replace(/investing\.com/gi, '');

    // Increment usage count after successful analysis
    await prisma.user.update({
      where: { id: userId },
      data: { aiUsageCount: { increment: 1 } }
    });

    const newRemainingCount = aiLimit - (usedCount + 1);

    return {
      success: true,
      analysis: analysis.trim(),
      remainingCount: newRemainingCount,
      limit: aiLimit
    };

  } catch (error) {
    console.error('Error analyzing stock:', error);
    return {
      success: false,
      error: 'فشل في تحليل السهم. يرجى المحاولة مرة أخرى.'
    };
  }
}
