"use client"

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const { data: session, update } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    // Refresh session to get updated subscription info
    const refreshSession = async () => {
      try {
        await update();
        console.log("Session refreshed after payment");
      } catch (error) {
        console.error("Failed to refresh session:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    refreshSession();
  }, [update]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-zinc-100">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 p-4 rounded-full">
            <CheckCircle2 className="w-16 h-16 text-emerald-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">
          تمت نجاح العملية!
        </h1>
        
        <p className="text-zinc-600 mb-6 rtl">
          شكرًا لك! تم تفعيل اشتراكك بنجاح. يمكنك الآن الاستمتاع بكافة مزايا الخطة المختارة.
        </p>

        {isRefreshing ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 rtl">
            <p className="text-sm text-blue-800">
              ⏳ جاري تحديث معلومات حسابك...
            </p>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-6 rtl">
            <p className="text-sm text-emerald-800">
              ✓ تم تنشيط اشتراكك الآن ويمكنك البدء في استخدام جميع المميزات
            </p>
          </div>
        )}

        {ref && (
          <div className="bg-zinc-50 p-3 rounded-lg mb-8 text-sm font-mono text-zinc-500">
            رقم المرجع: {ref}
          </div>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full text-white bg-emerald-600 hover:bg-emerald-700">
             <Link href="/profile">
              عرض الملف الشخصي
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
             <Link href="/stocks">
              تصفح الأسهم
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
