'use client';

import React from 'react';
import { useAdminStocks } from '@/hooks/useAdminStocks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Loading from '@/app/loading';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lock } from 'lucide-react';

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

  // Calculate percentage and filter stocks with valid price and fairValue (only active stocks)
  const stocksWithPercentage: StockWithPercentage[] = stocks
    .filter(stock => stock.active !== false && stock.name && stock.symbol && stock.price != null && stock.fairValue && stock.fairValue > 0)
    .map(stock => ({
      id: stock.id,
      name: stock.name!,
      symbol: stock.symbol!,
      price: stock.price!,
      fairValue: stock.fairValue!,
      percentage: ((stock.fairValue! - stock.price!) / stock.price!) * 100
    }))
    .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending

    console.log(stocksWithPercentage[0])
  const filterStocks = stocks
    .filter(stock => stock.active !== false && stock.price != null && stock.fairValue && stock.fairValue > 0)
    .map(stock => ({
      id: stock.id,
      price: stock.price!,
      fairValue: stock.fairValue!,
      percentage: ((stock.price! - stock.fairValue!) / stock.price!) * 100
    }))
    .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending

  const getPercentageColor = (percentage: number) => {
    if (percentage <0) return 'text-red-600 bg-red-50';
    if (percentage > 0) return 'text-green-600 bg-green-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const getPercentageText = (percentage: number) => {
    if (percentage < 0) return `${percentage.toFixed(2)}%`;
    return `${percentage.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen from-blue-50 to-indigo-100 p-2 sm:p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">افضل الأسهم ماليا</h1>
          <p className="text-sm sm:text-base text-gray-600">افضل الأسهم ماليا بناء علي القيمة معدل الربحية</p>
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
                        <span className="text-xs sm:text-sm text-gray-500">اسم السهم:</span>
                        <div className={`${data?.user.allowedStocks? 'blur-none':'blur-sm'}  transition-all duration-300 cursor-pointer}`}>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800">{stock.name}</h3>
                        </div>
                      </div>
                      
                      <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 items-center">
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500">الرمز:</span>
                          <div className={`${data?.user.allowedStocks? 'blur-none':'blur-sm'} transition-all duration-300 cursor-pointer`}>
                            <p className="text-sm sm:text-base font-medium text-gray-700">{stock.symbol}</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500">السعر الحالي:</span>
                          <div className={`${data?.user.allowedStocks? 'blur-none':'blur-sm'} transition-all duration-300 cursor-pointer`}>
                            <p className="text-sm sm:text-base font-medium text-gray-700">{stock.price.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500">القيمة العادلة:</span>
                          <div className={`${data?.user.allowedStocks? 'blur-none':'blur-sm'} transition-all duration-300 cursor-pointer`}>
                            <p className="text-sm sm:text-base font-medium text-gray-700">{stock.fairValue.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500">الفرق:</span>
                          <p className="text-sm sm:text-base font-medium text-gray-700">
                            {(stock.price - stock.fairValue).toFixed(2)}
                          </p>
                        </div>

                        <div className="col-span-2 sm:col-span-1 flex justify-center sm:justify-end">
                          <Badge 
                            className={`text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2 font-bold ${getPercentageColor(stock.percentage)}`}
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
                      
                      <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 items-center">
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500">الرمز: <Link href="/pricing"><Lock className="size-4" /></Link></span>
                          <div className={`blur-sm transition-all duration-300 cursor-pointer`}>
                            <p className="text-sm sm:text-base font-medium text-gray-700">XXX</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500">السعر الحالي: <Link href="/pricing"><Lock className="size-4" /></Link></span>
                          <div className={`blur-sm transition-all duration-300 cursor-pointer`}>
                            <p className="text-sm sm:text-base font-medium text-gray-700">XX.XX</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500">القيمة العادلة: <Link href="/pricing"><Lock className="size-4" /></Link></span>
                          <div className={`blur-sm transition-all duration-300 cursor-pointer`}>
                            <p className="text-sm sm:text-base font-medium text-gray-700">XX.XX</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500">الفرق: <Link href="/pricing"><Lock className="size-4" /></Link></span>
                          <p className="blur-sm text-sm sm:text-base font-medium text-gray-700">
                            {(stock.price! - stock.fairValue!).toFixed(2)}
                          </p>
                        </div>

                        <div className="col-span-2 sm:col-span-1 flex justify-center sm:justify-end">
                          <Badge 
                            className={`text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2 font-bold ${getPercentageColor(stock.percentage!)}`}
                          >
                            {getPercentageText(stock.percentage!)}
                          </Badge>
                        </div>
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