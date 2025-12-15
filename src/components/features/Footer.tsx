"use client";
import Link from "next/link";
import Image from "next/image";
import SocialCards from "../atoms/SocilaCards";
import { headerData } from "@/lib/data/const-data";
import FadeInUP from "@/animations/FadeInUP";


export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t rounded-t-lg  bg-secondary backdrop-blur supports-backdrop-filter:bg-secondary" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <FadeInUP>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="flex flex-col gap-3 items-start md:items-start text-start">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/ful-logo.png" alt="Logo" width={80} height={80} />
            </Link>
            <p className="text-sm text-white/90">نحن نقدم لك الحلول المالية و الشرعية التي تجعل بامكان التداول بطريقة شرعية</p>
          </div>

          <nav className="flex flex-col gap-2 items-start md:items-center text-sm text-white">
            {headerData.map((item) => (
              <Link key={item.title} href={item.link} className="link font-medium hover:text-primary">
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 items-start md:items-start">
            <h3 className="text-lg font-semibold text-white">تابعنا</h3>
            <SocialCards />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t rounded-t-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/90">
          <p className="order-2 sm:order-1">© {year} جميع الحقوق محفوظة.</p>
        
        </div>
        </FadeInUP>
      </div>
    </footer>
  );
}
