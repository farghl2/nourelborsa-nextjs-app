import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
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

        {searchParams.ref && (
          <div className="bg-zinc-50 p-3 rounded-lg mb-8 text-sm font-mono text-zinc-500">
            رقم المرجع: {searchParams.ref}
          </div>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full text-white bg-emerald-600 hover:bg-emerald-700">
             <Link href="/">
              الذهاب إلى الصفحة الرئيسية
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
