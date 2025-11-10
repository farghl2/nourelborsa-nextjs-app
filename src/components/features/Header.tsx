"use client";
import { ChartSpline, DollarSign, Home, Info, Menu, MenuIcon, Phone, PhoneCall } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";


const PHONE = "01204862933"
const headerData = [
    { title: "الرئيسية", link: "/", icon: Home },
    { title: "الخدمات", link: "/#services", icon: ChartSpline },
    { title: "الأسعار", link: "/#pricing", icon: DollarSign },
    { title: "من نحن", link: "/#about", icon: Info },
    { title: "تواصل معنا", link: "/#contact", icon: PhoneCall },
]

export default function Header() {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(headerData[0].title);
    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b rounded-b-lg">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" dir="rtl">
                <div className="flex h-16 items-center justify-between gap-4">
                    <div className="flex items-center gap-3">

                        <Link href="/"

                            className="text-xl font-semibold tracking-tight">
                            <Image src="/ful-logo.png" alt="Logo" width={80} height={80} />
                        </Link>
                    </div>

                    <nav className="hidden sm:flex items-center gap-6 text-sm lg:text-lg" aria-label="الرئيسية">
                        {headerData.map((item) => (
                            <Link key={item.title}
                                href={item.link}
                                onClick={() => setActive(item.title)}
                                className={`font-medium link ${item.title === active ? "text-primary font-bold active" : ""}`} aria-label={item.title}>{item.title}</Link>
                        ))}
                    </nav>
                    <div className="hidden sm:flex items-center gap-4 text-sm" dir="rtl">
                        <a href={`tel:${PHONE}`} className="hidden lg:inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-900">
                            <Phone size={"18"} />
                            <span>{PHONE}</span>
                        </a>
                        <Button asChild variant="default" className="hidden sm:inline-flex">
                            <Link href={'/login'}>
                                تسجيل الدخول
                            </Link>
                        </Button>
                    </div>
                    <div className="block sm:hidden">

                        <Sidebar />
                    </div>
                </div>


            </div>
        </header>
    );
}



import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import SocialCards from "../atoms/SocilaCards";


const Sidebar = () => {
  return (
    <Sheet>
      <SheetTrigger
        className={` ${cn(
            ` md:hidden hover:bg-accent/5 hover:text-secondary rounded-full px-3 py-2 cursor-pointer`
          )}`}
      >
        <Menu className="size-5 text-secondary" />
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-[400px]">
        <SheetHeader className="w-full flex items-start justify-center  h-[55px]  sticky">
          <SheetTitle>القائمة</SheetTitle>
          
        </SheetHeader>
        <MobilleNav />
      </SheetContent>
    </Sheet>
  );
};

const MobilleNav = () => (
  <nav>
    <ul className="flex items-center w-full  flex-col justify-center gap-1">
      {headerData.map((item,index) => (
        <li key={index} className="w-full">
          <SheetClose asChild>
            <Link
              className="w-full px-6 py-4  flex items-center justify-between cursor-pointer text-[16px] font-semibold hover:bg-accent/30"
              href={item.link}
              
            >
              <item.icon className="size-5" />
              {item.title}
            </Link>
          </SheetClose>
          <Separator className="bg-primary h-1" />
        </li>
      ))}
    </ul>
    <div className="mt-5 px-6 ">
      <h3 className="text-xl font-semibold text-primary text-end">تابعنا علي </h3>
    <SocialCards />

    </div>
  </nav>
);
