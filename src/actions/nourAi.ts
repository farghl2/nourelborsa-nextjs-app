'use server';

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

const STOCK_ANALYSIS_PROMPT = `أنت محلل فني متخصص في الأسهم. عند إدخال كود سهم + مدة زمنية، قم بتنفيذ الآتي:

1. لو المستخدم كتب (مدى قصير):
   - افتح موقع Investing.com
   - ادخل على قسم Technical
   - اختر الفريم: ساعة (1H)
   - اجلب البيانات التالية:
     * التوصية العامة (Buy / Sell / Strong Buy / Strong Sell / Neutral)
     * مؤشرات الزخم مثل RSI – MACD – STOCH – CCI
     * المتوسطات المتحركة MA & EMA (5 – 10 – 20 – 50 – 100 – 200)
     * أي تفاصيل إضافية مذكورة في الصفحة

2. لو المستخدم كتب (مدى متوسط):
   - افتح قسم Technical
   - الفريم: يومي (1D)
   - ارجع نفس البيانات المذكورة بالأعلى

3. لو المستخدم كتب (مضارب):
   - افتح قسم Technical
   - الفريم: 15 دقيقة (15m)
   - ارجع نفس البيانات بالكامل

4. طريقة عرض النتيجة للمستخدم:
   - أول سطر: نتيجة التوصية العامة
   - بعد ذلك: جدول أو قائمة للمؤشرات الفنية وتحليل كل مؤشر
   - ثم المتوسطات المتحركة وما تقول (Buy / Sell)
   - وأخيرًا رأي مختصر مبني على مجموع المؤشرات

مثال إدخال: "TAQA — مدى قصير"
مثال إخراج: "التوصية: Buy\nRSI: Buy\nMACD: Sell … الخ"

ملاحظات:
- التزم فقط بالبيانات الظاهرة على موقع Investing
- لا تخترع بيانات
- لو السهم غير موجود، اطلب من المستخدم كتابة الكود الصحيح
- لو في اختلاف بين المؤشرات، وضّح ذلك في النتيجة النهائية
- لا تقل أي شيء زيادة في الأول أو الآخر، وضح فقط كل مؤشر وإشارته وقول رأيك فقط
- التزم ب: مضارب فريم ربع ساعة، مدى قصير فريم ساعة، مدى متوسط فريم يومي`;

export async function analyzeStockWithAI(stockSymbol: string, timeframe: string) {
  try {
    if (!stockSymbol) {
      return { success: false, error: 'لم يتم إدخال رمز السهم' };
    }

    if (!timeframe) {
      return { success: false, error: 'لم يتم تحديد الفترة الزمنية' };
    }

    const prompt = `${STOCK_ANALYSIS_PROMPT}\n\nالرجاء تحليل السهم التالي:\nالرمز: ${stockSymbol}\nالفترة الزمنية: ${timeframe}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
    });

    const analysis = response.text || 'لا يوجد تحليل متاح';

    return {
      success: true,
      analysis
    };

  } catch (error) {
    console.error('Error analyzing stock:', error);
    return {
      success: false,
      error: 'فشل في تحليل السهم. يرجى المحاولة مرة أخرى.'
    };
  }
}
