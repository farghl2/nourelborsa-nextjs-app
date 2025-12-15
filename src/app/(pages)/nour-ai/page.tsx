'use client';

import React, { useState } from 'react';
import { analyzeStockWithAI } from '@/actions/nourAi';
import FadeReveal from '@/animations/FadeReveal';

const NourAi = () => {
  // Stock analysis states
  const [stockSymbol, setStockSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('مدى قصير');
  const [stockAnalysis, setStockAnalysis] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState('');

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

  return (
    <div dir="rtl">
      <FadeReveal className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-2">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-center mb-8 text-gray-800">
            Nour AI
          </h1>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleStockAnalysis} className="space-y-6">
              {/* Stock Symbol Input */}
              <div>
                <label htmlFor="stock-symbol" className="block text-sm font-medium text-gray-700 mb-2">
                  رمز السهم
                </label>
                <input

                  id="stock-symbol"
                  type="text"
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="مثال: TAQA"
                  
                />
              </div>

              {/* Timeframe Selection */}
              <div>
                <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-2">
                  الفترة الزمنية
                </label>
                <select
                  id="timeframe"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="مضارب">مضارب (15 دقيقة)</option>
                  <option value="مدى قصير">مدى قصير (ساعة)</option>
                  <option value="مدى متوسط">مدى متوسط (يومي)</option>
                </select>
              </div>

              {/* Stock Analysis Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={stockLoading || !stockSymbol.trim()}
                  className="flex-1 py-3 px-4 bg-secondary text-white rounded-lg hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {stockLoading ? 'جاري التحليل...' : 'تحليل السهم'}
                </button>
                <button
                  type="button"
                  onClick={handleStockReset}
                  className="py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  حذف
                </button>
              </div>
            </form>
          </div>

          {/* Error Display */}
          {stockError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{stockError}</p>
            </div>
          )}

          {/* Stock Analysis Result */}
          {stockAnalysis && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                نتائج التحليل الفني:
              </h3>
              <div className="text-gray-700 whitespace-pre-wrap">
                {stockAnalysis.analysis}
              </div>
            </div>
          )}
        </div>
      </FadeReveal>
    </div>
  );
};

export default NourAi;