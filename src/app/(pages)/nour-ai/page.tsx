'use client';

import React, { useState, useEffect } from 'react';
import { analyzeStockWithAI, getAIUsageInfo } from '@/actions/nourAi';
import FadeReveal from '@/animations/FadeReveal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Clock, BarChart3, AlertCircle, Loader2, RefreshCw, Lock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const NourAi = () => {
  const { data: session, status } = useSession();
  const [stockSymbol, setStockSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('مدى قصير');
  const [stockAnalysis, setStockAnalysis] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState('');
  const [remainingCount, setRemainingCount] = useState<number | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  // Fetch usage info on mount
  useEffect(() => {
    const fetchUsageInfo = async () => {
      if (status === 'authenticated') {
        setUsageLoading(true);
        const result = await getAIUsageInfo();
        if (result.success) {
          setRemainingCount(result.remainingCount ?? null);
        }
        setUsageLoading(false);
      } else if (status === 'unauthenticated') {
        setUsageLoading(false);
      }
    };
    fetchUsageInfo();
  }, [status]);

  const handleStockAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockSymbol.trim()) {
      setStockError('يرجى إدخال رمز السهم');
      return;
    }

    setStockLoading(true);
    setStockError('');
    setStockAnalysis(null);

    try {
      const result = await analyzeStockWithAI(stockSymbol.trim(), timeframe);

      if (result.success && result.analysis) {
        setStockAnalysis({ analysis: result.analysis });
        if (typeof result.remainingCount === 'number') {
          setRemainingCount(result.remainingCount);
        }
      } else {
        setStockError(result.error || 'فشل في تحليل السهم');
      }
    } catch (err) {
      setStockError('حدث خطأ غير متوقع');
    } finally {
      setStockLoading(false);
    }
  };

  const handleStockReset = () => {
    setStockSymbol('');
    setTimeframe('مدى قصير');
    setStockAnalysis(null);
    setStockError('');
  };

  const timeframeOptions = [
    { value: 'مضارب', label: 'مضارب', icon: Clock, description: '30 دقيقة', color: 'text-orange-600' },
    { value: 'مدى قصير', label: 'مدى قصير', icon: TrendingUp, description: 'ساعة واحدة', color: 'text-blue-600' },
    { value: 'مدى متوسط', label: 'مدى متوسط', icon: BarChart3, description: 'يومي', color: 'text-green-600' },
  ];

  const isAuthenticated = status === 'authenticated';
  // Show form if count is null (not loaded yet), loading, or has remaining uses
  const canUseAI = usageLoading || remainingCount === null || remainingCount > 0;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        {/* Header */}
        <FadeReveal>
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Nour AI
              </h1>
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto">
              محلل فني ذكي مدعوم بالذكاء الاصطناعي لتحليل الأسهم وتقديم التوصيات الاستثمارية
            </p>
            
            {/* Usage Counter */}
            {isAuthenticated && !usageLoading && remainingCount !== null && (
              <div className="mt-4">
                <Badge 
                  variant={remainingCount > 0 ? "default" : "destructive"} 
                  className="text-sm px-4 py-1"
                >
                  {remainingCount > 0 
                    ? `المحاولات المتبقية: ${remainingCount} من 5`
                    : 'لقد استنفدت جميع محاولاتك'
                  }
                </Badge>
              </div>
            )}
          </div>
        </FadeReveal>

        {/* Login Required Card */}
        {status !== 'loading' && !isAuthenticated && (
          <FadeReveal>
            <Card className="max-w-md mx-auto shadow-xl border-0 bg-white/80 backdrop-blur text-center">
              <CardContent className="pt-8 pb-6">
                <Lock className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">يجب تسجيل الدخول</h3>
                <p className="text-gray-600 mb-6">
                  يرجى تسجيل الدخول لاستخدام ميزة تحليل الأسهم بالذكاء الاصطناعي
                </p>
                <div className="flex gap-3 justify-center">
                  <Button asChild>
                    <Link href="/login">تسجيل الدخول</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/register">إنشاء حساب</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeReveal>
        )}

        {/* No Remaining Uses Card */}
        {isAuthenticated && !usageLoading && remainingCount === 0 && (
          <FadeReveal>
            <Card className="max-w-md mx-auto shadow-xl border-0 bg-gradient-to-br from-orange-50 to-red-50 text-center">
              <CardContent className="pt-8 pb-6">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                <h3 className="text-xl font-bold mb-2">لقد استنفدت جميع محاولاتك</h3>
                <p className="text-gray-600 mb-6">
                  لقد استخدمت 5 تحليلات مجانية. قم بالترقية للحصول على المزيد من التحليلات.
                </p>
                <Button asChild>
                  <Link href="/pricing">الترقية الآن</Link>
                </Button>
              </CardContent>
            </Card>
          </FadeReveal>
        )}

        {/* Main Content - Only show if authenticated and can use AI */}
        {isAuthenticated && canUseAI && remainingCount !== 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Analysis Card */}
            <FadeReveal className="lg:col-span-2">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    تحليل السهم
                  </CardTitle>
                  <CardDescription>
                    أدخل رمز السهم واختر الفترة الزمنية للحصول على تحليل فني شامل
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStockAnalysis} className="space-y-6">
                    {/* Stock Symbol Input */}
                    <div className="space-y-2">
                      <label htmlFor="stock-symbol" className="text-sm font-medium text-gray-700">
                        رمز السهم
                      </label>
                      <Input
                        id="stock-symbol"
                        type="text"
                        value={stockSymbol}
                        onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                        className="text-lg font-semibold"
                        placeholder="مثال: TAQA"
                        disabled={stockLoading}
                      />
                    </div>

                    {/* Timeframe Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        الفترة الزمنية
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {timeframeOptions.map((option) => {
                          const Icon = option.icon;
                          const isSelected = timeframe === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setTimeframe(option.value)}
                              disabled={stockLoading}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/5 shadow-md'
                                  : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                              } ${stockLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : option.color}`} />
                                <span className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                                  {option.label}
                                </span>
                                <span className="text-xs text-gray-500">{option.description}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={stockLoading || !stockSymbol.trim()}
                        className="flex-1 h-12 text-base font-semibold"
                        size="lg"
                      >
                        {stockLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                            جاري التحليل...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 ml-2" />
                            تحليل السهم
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleStockReset}
                        variant="outline"
                        className="h-12"
                        disabled={stockLoading}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </FadeReveal>

            {/* Info Sidebar */}
            <FadeReveal delay={0.1} className="lg:col-span-1">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-primary/5 to-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    كيفية الاستخدام
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1 bg-primary">1</Badge>
                      <p className="text-sm text-gray-700">أدخل رمز السهم (مثل: AAPL لشركة Apple)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1 bg-primary">2</Badge>
                      <p className="text-sm text-gray-700">اختر الفترة الزمنية المناسبة لاستراتيجيتك</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1 bg-primary">3</Badge>
                      <p className="text-sm text-gray-700">اضغط على "تحليل السهم" للحصول على التحليل الفني</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-sm mb-2 text-gray-800">ما ستحصل عليه:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        التوصية العامة (Buy/Sell)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        مؤشرات الزخم (RSI, MACD)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        المتوسطات المتحركة
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        رأي تحليلي مختصر
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </FadeReveal>
          </div>
        )}

        {/* Error Display */}
        {stockError && (
          <FadeReveal delay={0.2} className="mt-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">حدث خطأ</h4>
                    <p className="text-red-700 text-sm">{stockError}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeReveal>
        )}

        {/* Analysis Result */}
        {stockAnalysis && (
          <FadeReveal delay={0.2} className="mt-6">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    نتائج التحليل الفني
                  </CardTitle>
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    {stockSymbol}
                  </Badge>
                </div>
                <CardDescription>
                  تحليل مدعوم بالذكاء الاصطناعي • الفترة: {timeframe}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-green-100">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                      {stockAnalysis.analysis}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeReveal>
        )}

        {/* Footer Note */}
        <FadeReveal delay={0.3} className="mt-8">
          <p className="text-center text-xs text-gray-500">
            ⚠️ التحليل الفني لا يضمن النتائج المستقبلية. استخدم هذه المعلومات كجزء من استراتيجية استثمارية شاملة.
          </p>
        </FadeReveal>
      </div>
    </div>
  );
};

export default NourAi;