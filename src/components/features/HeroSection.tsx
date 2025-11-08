import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-10 sm:py-16 lg:py-24">
          <div className="order-2 lg:order-1 text-center lg:text-right">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-snug">
              اجعل <span className="inline-block align-middle">NOUR</span>
              <br className="hidden sm:block" />
              مستشارك
              <br className="hidden sm:block" />
              المالي و الشرعي
              <br className="hidden sm:block" />
              في البورصة.
            </p>
            <p className="mt-5 text-zinc-600 text-sm sm:text-base leading-7 max-w-xl mx-auto lg:mx-0">
              نستساعدك على التداول بشكل شرعي كامل و 100% مع
              المساعدات الكاملة لاستثماراتك المالية و التقنية.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link href="#start" className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 px-6 py-2.5 text-zinc-900 font-medium shadow-sm hover:from-yellow-400 hover:to-yellow-600">
                ابدأ الآن
              </Link>
              <Link href="#contact" className="inline-flex items-center rounded-full border border-zinc-200 px-6 py-2.5 text-zinc-800 hover:bg-zinc-50">
                تواصل معنا
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="mx-auto flex items-center bg-secondary justify-center max-w-[520px] lg:max-w-none">
              
                  <Image src={'/ful-logo.png'} alt="Logo" width={400} height={400} className="rounded-full border-2 "/>
                
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
