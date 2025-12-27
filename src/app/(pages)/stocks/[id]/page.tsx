"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import PurificationCalculator from "@/components/features/stocks/PurificationCalculator"
import { useClientStock } from "@/hooks/useClientStock"
import Loading from "@/app/loading"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"

// Helper function to convert category string to numeric value for comparison
const categoryToNumber = (category: string | null | undefined): number | null => {
  if (!category) return null;
  
  switch (category) {
    case "less_than_5": return 2.5;
    case "more_than_5": return 7.5;
    case "less_than_10": return 7.5;
    case "more_than_10": return 15;
    default: return null;
  }
};

// Helper function to convert category string to display label
const categoryToLabel = (category: string | null | undefined): string => {
  if (!category) return "—";
  
  switch (category) {
    case "less_than_5": return "اقل من 5%";
    case "more_than_5": return "اكبر من 5%";
    case "less_than_10": return "اقل من 10%";
    case "more_than_10": return "اكبر من 10%";
    default: return category;
  }
};

const chips = [
  { label: "نسبة الإيرادات الربوية", value: "أقل من 5%" },
  { label: "نسبة القروض الربوية", value: "أقل من 10%" },
  { label: "نسبة الالتزامات الربوية", value: "—" },
  { label: "الرسالة", value: "النشاط مباح" },
]

export default function StockDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = (params?.id || "").toString()

  const { stock, loading } = useClientStock(id)
  const router = useRouter()
  const goToPlans = () => router.push("/pricing")
  const totals = [
    { label: "إجمالي الأصول", value: "1.2B" },
    { label: "القيمة السوقية", value: "8.4B" },
  ]

 
  if(loading) return <Loading />
  console.log(stock)

  return (
    <div dir="rtl" className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold"> السهم: {stock?.name} </h1>
        {typeof stock?.recommendation === "undefined" || stock?.recommendation === null ? (
          <button
            type="button"
            onClick={goToPlans}
            className="inline-flex flex-col
             sm:flex-row items-center justify-center gap-2 text-sm text-primary hover:underline"
            aria-label="الترقية لعرض التوصية"
          ><div className="flex items-center gap-2">

            <Lock className="size-4" />
            <p>ننصح بالاحتفاظ ؟</p>
          </div>
            <p>اشترك لعرض التوصية</p>
          </button>
        ) : (
          <Badge variant={stock.recommendation ? "default" : "destructive"} className="text-base py-1">
            {stock.recommendation ? "ننصح بالاحتفاظ🔥" : "لا ننصح"}
          </Badge>
        )}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-4 flex-wrap">
              <p>

              نشاط الشركة: {stock?.companyActivity}
              </p>
              <p className="text-sm text-muted-foreground">{stock?.updatedAt ? new Date(stock.updatedAt).toLocaleString() : ''}</p>

            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Prohibited Revenue - Dual Display */}
              <div className="rounded-lg  border overflow-hidden">
                <div className="text-sm text-muted-foreground text-center pt-4 px-2 mb-3">الدخل المحظور</div>
                <div className="flex h-16">
                  {/* First Value */}
                  <div 
                    className={`flex-1 flex items-center justify-center text-xl font-semibold ${
                      (() => {
                        const numValue = categoryToNumber(stock?.prohibitedRevenuePercentage);
                        if (numValue === null) return 'bg-secondary/20';
                        if (numValue < 5) return 'bg-green-500/20 text-green-700 dark:text-green-400';
                        if (numValue >= 10) return 'bg-red-500/20 text-red-700 dark:text-red-400';
                        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
                      })()
                    }`}
                  >
                    {categoryToLabel(stock?.prohibitedRevenuePercentage)}
                  </div>
                  
                  {/* Vertical Divider */}
                  <div className="w-px bg-border"></div>
                  
                  {/* Second Value */}
                  <div 
                    className={`flex-1 flex items-center justify-center text-xl font-semibold ${
                      (() => {
                        const numValue = categoryToNumber(stock?.prohibitedRevenuePercentageSecondary);
                        if (numValue === null) return 'bg-secondary/20';
                        if (numValue < 10) return 'bg-green-500/20 text-green-700 dark:text-green-400';
                        return 'bg-red-500/20 text-red-700 dark:text-red-400';
                      })()
                    }`}
                  >
                    {categoryToLabel(stock?.prohibitedRevenuePercentageSecondary)}
                  </div>
                </div>
              </div>


              {/* Other fields with color coding */}
              {/* القروض الربوية - Interest Bearing Loans */}
              <div className={`rounded-lg border p-4 text-center ${
                stock?.interestBearingLoansPercentage === null || stock?.interestBearingLoansPercentage === undefined
                  ? 'bg-secondary/20'
                  : stock.interestBearingLoansPercentage < 30
                  ? 'bg-green-500/20'
                  : 'bg-red-500/20'
              }`}>
                <div className="text-sm text-muted-foreground">القروض الربوية</div>
                <div className={`mt-1 text-xl font-semibold ${
                  stock?.interestBearingLoansPercentage !== null && stock?.interestBearingLoansPercentage !== undefined
                    ? stock.interestBearingLoansPercentage < 30
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400'
                    : ''
                }`}>
                  {stock?.interestBearingLoansPercentage === null || stock?.interestBearingLoansPercentage === undefined 
                    ? "—" 
                    : `${stock.interestBearingLoansPercentage}%`}
                </div>
              </div>

              {/* الايدعات الربوية - Interest Bearing Deposits */}
              <div className={`rounded-lg border p-4 text-center ${
                stock?.interestBearingDepositsPercentage === null || stock?.interestBearingDepositsPercentage === undefined
                  ? 'bg-secondary/20'
                  : stock.interestBearingDepositsPercentage < 30
                  ? 'bg-green-500/20'
                  : 'bg-red-500/20'
              }`}>
                <div className="text-sm text-muted-foreground">الايدعات الربوية</div>
                <div className={`mt-1 text-xl font-semibold ${
                  stock?.interestBearingDepositsPercentage !== null && stock?.interestBearingDepositsPercentage !== undefined
                    ? stock.interestBearingDepositsPercentage < 30
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400'
                    : ''
                }`}>
                  {stock?.interestBearingDepositsPercentage === null || stock?.interestBearingDepositsPercentage === undefined 
                    ? "—" 
                    : `${stock.interestBearingDepositsPercentage}%`}
                </div>
              </div>

              {/* الاصول السائلة - Liquid Assets */}
              <div className={`rounded-lg border p-4 text-center ${
                stock?.assetsPercentage === null || stock?.assetsPercentage === undefined
                  ? 'bg-secondary/20'
                  : stock.assetsPercentage < 70
                  ? 'bg-green-500/20'
                  : 'bg-red-500/20'
              }`}>
                <div className="text-sm text-muted-foreground">الاصول السائلة</div>
                <div className={`mt-1 text-xl font-semibold ${
                  stock?.assetsPercentage !== null && stock?.assetsPercentage !== undefined
                    ? stock.assetsPercentage < 70
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400'
                    : ''
                }`}>
                  {stock?.assetsPercentage === null || stock?.assetsPercentage === undefined 
                    ? "—" 
                    : `${stock.assetsPercentage}%`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1  gap-6">
          <Card>
            <CardHeader>
              <CardTitle>الملخص</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {[ 
                { label: "القيمة العادلة", value: stock?.earningsPerShare=== null ? null:stock?.fairValue },
                { label: "ربحية السهم", value: stock?.earningsPerShare },
                { label: "القيمة العادلة المتوقعة للسنة الجديدة", value: stock?.expectedFairValueNextYear },
                { label: "ربحية السهم المتوقعة", value: stock?.expectedEarningsPerShare },
                { label: "العائد على السعر", value: stock?.returnOnPrice },
                { label: "ننصح بالاحتفاظ لمدة (ايام)", value: stock?.durationDays },
                { label: "القيمة السوقية", value: stock?.marketCapitalization },
                { label: " اجمالي الاصول", value: stock?.totalAssets },
              ].map((t) => (
                <div key={t.label} className="rounded-md border p-4 text-center">
                  <div className="text-xs text-muted-foreground">{t.label}</div>
                  {t.value === null || typeof t.value === "undefined" ? (
                    <button
                      type="button"
                      onClick={goToPlans}
                      className="mt-2 inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                      aria-label="الترقية لعرض البيانات"
                    >
                      <Lock className="size-4" />
                      <span>اشترك لعرض البيانات</span>
                    </button>
                  ) : (
                    <div className="text-xl font-semibold">{String(t.value)}</div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          
        </div>

        <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-secondary/10 p-4">
        <div className="flex items-center justify-center gap-4">
          {/* {stock?.purificationPercentage !== undefined && stock?.purificationPercentage !== null && (
            <p className="text-sm">نسبة التطهير: {stock.purificationPercentage}%</p>
          )} */}
          <PurificationCalculator purificationPercentage={stock?.purificationPercentage ?? 0}/>
        </div>
        <p className="font-semibold text-lg">اجعل استثمارك حلال 100%</p>

        </div>
      </div>
    </div>
  )
}
