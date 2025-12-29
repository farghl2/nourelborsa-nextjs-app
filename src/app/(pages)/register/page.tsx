"use client"

import { z } from "zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BASE_URL } from "@/lib/data/const-data"

const registerSchema = z
  .object({
    name: z.string().min(2, "الاسم لا يقل عن حرفين"),
    email: z.string().email("ادخل بريدًا صالحًا"),
    password: z.string().min(6, "كلمة المرور لا تقل عن 6 أحرف"),
    confirmPassword: z.string().min(6, "كلمة المرور لا تقل عن 6 أحرف"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  })

export default function RegisterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Redirect logged-in users to home
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/")
    }
  }, [status, router])

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Show nothing while checking auth status
  if (status === "loading" || status === "authenticated") {
    return null
  }

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const message = (data as any)?.error || "حدث خطأ أثناء إنشاء الحساب"
        alert(message)
        return
      }

      alert((data as any)?.message || "تم إنشاء الحساب بنجاح")

      // بعد إنشاء الحساب بنجاح، نقوم بتسجيل الدخول تلقائياً لإنشاء جلسة NextAuth
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl: "/profile",
      })

      if (result?.error) {
        console.error("NextAuth signIn after register error", result.error)
        // في حالة الفشل نعيد توجيه المستخدم يدوياً
        window.location.href = "/login"
        return
      }

      if (result?.url) {
        // window.location.href = result.url
        window.location.href = `${BASE_URL}/profile`
      } else {
        window.location.href = `${BASE_URL}/profile`
      }
    } catch (error) {
      console.error("register submit error", error)
      alert("حدث خطأ غير متوقع. حاول مرة أخرى.")
    }
  }

  return (
    <div dir="rtl" className="container mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">إنشاء حساب</h1>
      <p className="text-muted-foreground mt-2">أنشئ حسابك للبدء.</p>

      <div className="mt-8 rounded-lg border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input placeholder="اسمك" {...field} />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كلمة المرور</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="******" {...field} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute hover:bg-white inset-y-0 left-1 h-8 w-8 my-auto"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تأكيد كلمة المرور</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showConfirm ? "text" : "password"} placeholder="******" {...field} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 left-1 h-8 w-8 my-auto"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "جاري الإنشاء..." : "إنشاء حساب"}
            </Button>

            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">أو</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={() => signIn("google", { callbackUrl: "/" })}>
              المتابعة بواسطة Google
            </Button> */}

            <p className="text-sm text-muted-foreground text-center">
              لديك حساب بالفعل؟ {" "}
              <Link href="/login" className="text-primary hover:underline">تسجيل الدخول</Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  )
}
