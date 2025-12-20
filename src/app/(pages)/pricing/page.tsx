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
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type PricePlan = {
  title: string;
  price: number;
  period?: string;
  features: string[];
  highlighted?: boolean;
};

 function PricePlanCard({ id, name, active, durationDays, price, description, features, purificationLimit}: AdminPlan) {
  const [isPaying, setIsPaying] = useState(false);
  const router = useRouter();

  const handlePay = async () => {
    try {
      setIsPaying(true);
      
      // 1. Create pending payment
      const paymentRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: id, provider: "paysky" }),
      });

      if (!paymentRes.ok) {
        const errorData = await paymentRes.json().catch(() => ({}));
        if (paymentRes.status === 401) {
          toast.error("يرجى تسجيل الدخول أولاً");
          router.push("/login");
          return;
        }
        throw new Error(errorData.error || "فشل في بدء عملية الدفع");
      }

      const { payment } = await paymentRes.json();
      
      // PaySky expects amount in piasters (e.g., 100 EGP = 10000). 
      const amount = Math.round(price * 100).toString();
      
      const merchantReference = payment.merchantReference;

      // 2. Get Secure Hash
      const hashRes = await fetch("/api/paysky/hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, merchantReference }),
      });

      if (!hashRes.ok) throw new Error("فشل في تهيئة بوابة الدفع");

      const data = await hashRes.json();

      // 3. Configure and Show Lightbox
      // @ts-ignore
      if (typeof Lightbox === 'undefined') {
        throw new Error("بوابة الدفع غير جاهزة، يرجى المحاولة مرة أخرى");
      }

      // @ts-ignore
      Lightbox.Checkout.configure = {
        MID: data.MID,
        TID: data.TID,
        AmountTrxn: amount,
        SecureHash: data.SecureHash,
        MerchantReference: merchantReference,
        TrxDateTime: data.TrxDateTime,
        CurrencyCode: "818", 
        AppType: "Web",
        DefaultRoute: "Main",
        ReturnURL: window.location.origin + "/api/webhooks/paysky", 

        completeCallback: (response: any) => {
          console.log("Payment Success", response);
          toast.success("تمت عملية الدفع بنجاح");
          router.push(`/payments/success?ref=${merchantReference}`);
        },
        errorCallback: (error: any) => {
          console.error("Payment Error", error);
          toast.error("فشلت عملية الدفع، يرجى المحاولة مرة أخرى");
          fetch(`/api/payments/${payment.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "FAILED" }),
          }).catch(console.error);
        },
        cancelCallback: () => {
          console.log("Payment Cancelled");
          toast.info("تم إلغاء عملية الدفع");
          fetch(`/api/payments/${payment.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "CANCELLED" }),
          }).catch(console.error);
        },
      };

      // @ts-ignore
      Lightbox.Checkout.showLightbox();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "حدث خطأ غير متوقع");
    } finally {
      setIsPaying(false);
    }
  };

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
          <Button 
            className="w-full text-white" 
            variant={"secondary"}
            onClick={handlePay}
            disabled={isPaying}
          >
            {isPaying ? "جاري التحويل..." : "ابدأ الآن"}
          </Button>
        </CardFooter>
      </Card>
    </FadeInUP>
  );
}
