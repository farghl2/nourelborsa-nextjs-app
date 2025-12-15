"use client";
import FadeInUP from "@/animations/FadeInUP";



export default function PricesPlanSection() {
  const {plans, loading} = useAdminPlans();

  if(loading) return <Loading />
  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <FadeInUP>
            <h2 className="text-2xl sm:text-4xl font-bold text-black/90">خطط الاشتركات</h2>
          </FadeInUP>
          <FadeInUP>
            <p className="mt-3 text-zinc-600 max-w-2xl mx-auto text-sm sm:text-base">
              اختر الخطة المناسبة لاحتياجاتك وابدأ رحلتك في التداول الشرعي بثقة.
            </p>
          </FadeInUP>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <PricePlanCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}



import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminPlans } from "@/hooks/useAdminPlans";
import Loading from "@/app/loading";
import { AdminPlan } from "@/lib/services/plans";

export type PricePlan = {
  title: string;
  price: number;
  period?: string;
  features: string[];
  highlighted?: boolean;
};

 function PricePlanCard({ name, active, durationDays, price, description, features, purificationLimit}: AdminPlan) {
  return (
    <FadeInUP>
      <Card className={` border-zinc-200 h-full flex flex-col bg-white`}>
        <CardHeader className="text-center">
          <CardTitle className={`text-xl font-bold `}>{name}</CardTitle>
          <p className="text-xs sm:text-sm  text-gray-400 max-w-xs">{description}</p>
          <div className="mt-2 flex items-end justify-center gap-1">
            <span className="text-4xl font-extrabold text-zinc-900">{price}</span>
            <span className="text-sm text-zinc-500">ج.م</span>
            <span className="text-lg text-zinc-500">/ {durationDays} يوم</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2" dir="rtl">
             <li  className="flex items-start gap-2 text-sm text-zinc-700">
                <Check className="size-4 text-primary mt-0.5" />
                <span className="text-end">عدد مرات حساب نسبة التطهير {purificationLimit}</span>
              </li>
            {features!.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                <Check className="size-4 text-primary mt-0.5" />
                <span className="text-end">{f}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="pt-0">
          <Button className="w-full text-white" variant={"secondary"}>
            ابدأ الآن
          </Button>
        </CardFooter>
      </Card>
    </FadeInUP>
  );
}
