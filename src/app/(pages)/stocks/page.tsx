'use client';

import React from 'react';
import { useAdminStocks } from '@/hooks/useAdminStocks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Loading from '@/app/loading';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface StockWithPercentage {
  id: string;
  name: string;
  symbol: string;
  price: number;
  fairValue: number;
  percentage: number;
}

const StocksPage = () => {
  const { stocks, loading } = useAdminStocks();
const {data} = useSession()

  if (loading) return <Loading />;

  // Calculate percentage and filter stocks with valid price and fairValue
  const stocksWithPercentage: StockWithPercentage[] = stocks
    .filter(stock => stock.name && stock.symbol && stock.price != null && stock.fairValue && stock.fairValue > 0)
    .map(stock => ({
      id: stock.id,
      name: stock.name!,
      symbol: stock.symbol!,
      price: stock.price!,
      fairValue: stock.fairValue!,
      percentage: ((stock.price! - stock.fairValue!) / stock.fairValue!) * 100
    }))
    .sort((a, b) => a.percentage - b.percentage); // Sort by percentage descending
  const filterStocks = stocks
    .filter(stock => stock.price != null && stock.fairValue && stock.fairValue > 0)
    .map(stock => ({
      id: stock.id,
      price: stock.price!,
      fairValue: stock.fairValue!,
      percentage: ((stock.price! - stock.fairValue!) / stock.fairValue!) * 100
    }))
    .sort((a, b) => a.percentage - b.percentage); // Sort by percentage descending

  const getPercentageColor = (percentage: number) => {
    if (percentage > 10) return 'text-red-600 bg-red-50';
    if (percentage > 5) return 'text-orange-600 bg-orange-50';
    if (percentage > 0) return 'text-yellow-600 bg-yellow-50';
    if (percentage > -5) return 'text-green-600 bg-green-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const getPercentageText = (percentage: number) => {
    if (percentage > 0) return `+${percentage.toFixed(2)}%`;
    return `${percentage.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen from-blue-50 to-indigo-100 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">تحليل الأسهم</h1>
          <p className="text-gray-600">نسبة السعر إلى القيمة العادلة للأسهم المتاحة</p>
        </div>

        {data && data.user.allowedStocks ===true?  
        <div className="grid gap-2">
          {stocksWithPercentage.map((stock) => (
            <Card key={stock.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-2 sm:px-8 ">
                <div className="flex items-center justify-between">
                  {/* Stock info with blur effect */}
        
                    <div className="w-full space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">اسم السهم:</span>
                        <div className={`${data?.user.allowedStocks? 'blur-none':'blur-sm'}  transition-all duration-300 cursor-pointer}`}>
                          <h3 className="text-lg font-semibold text-gray-800">{stock.name}</h3>
                        </div>
                      </div>
                      
                      <div className="w-full flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-500">الرمز:</span>
                          <div className={`${data?.user.allowedStocks? 'blur-none':'blur-sm'} transition-all duration-300 cursor-pointer`}>
                            <p className="font-medium text-gray-700">{stock.symbol}</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-500">السعر الحالي:</span>
                          <div className={`${data?.user.allowedStocks? 'blur-none':'blur-sm'} transition-all duration-300 cursor-pointer`}>
                            <p className="font-medium text-gray-700">{stock.price.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-500">القيمة العادلة:</span>
                          <div className={`${data?.user.allowedStocks? 'blur-none':'blur-sm'} transition-all duration-300 cursor-pointer`}>
                            <p className="font-medium text-gray-700">{stock.fairValue.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-500">الفرق:</span>
                          <p className=" font-medium text-gray-700">
                            {(stock.price - stock.fairValue).toFixed(2)}
                          </p>
                        </div>
                  <div className="ml-4">
                    <Badge 
                      className={`text-lg px-4 py-2 font-bold ${getPercentageColor(stock.percentage)}`}
                    >
                      {getPercentageText(stock.percentage)}
                    </Badge>
                  </div>
                      </div>
                    </div>
                </div>
               
                
                
                
              </CardContent>
            </Card>
          ))}
        </div>
          :
       
          <div className="grid gap-2">
          {filterStocks.map((stock) => (
            <Card key={stock.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-2 sm:px-8 ">
                <div className="flex items-center justify-between">
                  {/* Stock info with blur effect */}
        
                    <div className="w-full space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">اسم السهم:</span>
                        <div className={`blur-sm  transition-all duration-300 cursor-pointer}`}>
                          <h3 className="text-lg font-semibold text-gray-800">jjjjjjjjj</h3>
                        </div>
                      </div>
                      
                      <div className="w-full flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-500">الرمز:</span>
                          <div className={`blur-sm transition-all duration-300 cursor-pointer`}>
                            <p className="font-medium text-gray-700">jjj</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-500">السعر الحالي:</span>
                          <div className={`blur-sm transition-all duration-300 cursor-pointer`}>
                            <p className="font-medium text-gray-700">jjjfff</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-500">القيمة العادلة:</span>
                          <div className={`blur-sm transition-all duration-300 cursor-pointer`}>
                            <p className="font-medium text-gray-700">jjjfff</p>
                          </div>
                        </div>
                        
                       {stocks && <div>
                          <span className="text-sm text-gray-500">الفرق:</span>
                          <p className="blur-sm font-medium text-gray-700">
                            {(stock.price! - stock.fairValue!).toFixed(2)}
                          </p>
                        </div>}
                        {stocks &&
                  <div className="ml-4">
                    <Badge 
                      className={` text-lg px-4 py-2 font-bold ${getPercentageColor(stock.percentage!)}`}
                    >
                      {getPercentageText(stock.percentage!)}
                    </Badge>
                  </div>}
                      </div>
                    </div>
                </div>
               
                
                
                
              </CardContent>
            </Card>
          ))}
        </div>
        }
      </div>
    </div>
  );
};

export default StocksPage;