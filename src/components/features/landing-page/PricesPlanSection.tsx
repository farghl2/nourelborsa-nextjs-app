"use client";
import FadeInUP from "@/animations/FadeInUP";

const plans: PricePlan[] = [
  {
    title: "بداية",
    price: 0,
    period: "/مجاني",
    features: [
      "وصول إلى مقالات أساسية",
      "نصائح عامة حول التداول الشرعي",
      "دعم عبر البريد خلال 48 ساعة",
    ],
  },
  {
    title: "محترف",
    price: 199,
    period: "/شهري",
    highlighted: true,
    features: [
      "تحليلات أسبوعية للأسهم",
      "متابعة شرعية مخصصة",
      "تنبيهات عبر البريد والواتساب",
      "أولوية في الدعم",
      "أولوية في الدعم",
      "أولوية في الدعم",
      "أولوية في الدعم",
      "أولوية في الدعم",
    ],
  },
  {
    title: "شركات",
    price: 499,
    period: "/شهري",
    features: [
      "استشارات مخصصة للشركات",
      "تقارير أداء شهرية",
      "جلسات تدريب للفريق",
      "مدير حساب مخصص",
    ],
  },
];

export default function PricesPlanSection() {
  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <FadeInUP>
            <h2 className="text-2xl sm:text-4xl font-bold text-black/90">خطط الأسعار</h2>
          </FadeInUP>
          <FadeInUP>
            <p className="mt-3 text-zinc-600 max-w-2xl mx-auto text-sm sm:text-base">
              اختر الخطة المناسبة لاحتياجاتك وابدأ رحلتك في التداول الشرعي بثقة.
            </p>
          </FadeInUP>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <PricePlanCard key={p.title} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}



import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type PricePlan = {
  title: string;
  price: number;
  period?: string;
  features: string[];
  highlighted?: boolean;
};

 function PricePlanCard({ title, price, period = "/شهري", features, highlighted }: PricePlan) {
  return (
    <FadeInUP>
      <Card className={`${highlighted ? "border-primary shadow-md" : "border-zinc-200"} h-full flex flex-col bg-white`}>
        <CardHeader className="text-center">
          <CardTitle className={`text-xl font-bold ${highlighted ? "text-primary" : "text-zinc-900"}`}>{title}</CardTitle>
          <div className="mt-2 flex items-end justify-center gap-1">
            <span className="text-4xl font-extrabold text-zinc-900">{price}</span>
            <span className="text-sm text-zinc-500">{period}</span>
            <span className="text-sm text-zinc-500">ج.م</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2" dir="rtl">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                <Check className="size-4 text-primary mt-0.5" />
                <span className="text-end">{f}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="pt-0">
          <Button className="w-full text-white" variant={highlighted ? "default" : "secondary"}>
            ابدأ الآن
          </Button>
        </CardFooter>
      </Card>
    </FadeInUP>
  );
}
