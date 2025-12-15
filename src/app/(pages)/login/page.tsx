"use client"

import { z } from "zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"


const loginSchema = z.object({
  email: z.string().email("ادخل بريدًا صالحًا"),
  password: z.string().min(6, "كلمة المرور لا تقل عن 6 أحرف"),
})

export default function LoginPage() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  })
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const message = (data as any)?.error || "تعذر تسجيل الدخول. تأكد من البريد وكلمة المرور."
        alert(message)
        return
      }

      
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl: "/",
      })

      if (result?.error) {

        console.error("NextAuth signIn error", result.error)
        window.location.href = "/"
        return
      }

      if (result?.url) {
        window.location.href = result.url
      } else {
        window.location.href = "/"
      }
    } catch (error) {
      console.error("login submit error", error)
      alert("حدث خطأ غير متوقع. حاول مرة أخرى.")
    }
  }

  return (
    <div dir="rtl" className="container mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">تسجيل الدخول</h1>
      <p className="text-muted-foreground mt-2">مرحباً بعودتك. سجل الدخول للمتابعة.</p>

      <div className="mt-8 rounded-lg border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
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

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "جاري الدخول..." : "دخول"}
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
              لا تملك حساباً؟ {" "}
              <Link href="/register" className="text-primary hover:underline">إنشاء حساب</Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  )
}
