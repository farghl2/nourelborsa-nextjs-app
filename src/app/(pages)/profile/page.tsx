"use client"

import { useSession, signOut } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const { data: session, status } = useSession()

  const user = session?.user as (typeof session extends { user: infer U } ? U : any) & {
    role?: string
    plan?: string
    status?: string
  }

  const name = user?.name || "غير معروف"
  const email = user?.email || "—"
  const role = user?.role || "USER"
  const plan = (user as any)?.plan || "Free"
  const acctStatus = (user as any)?.status || (status === "authenticated" ? "Active" : "Unknown")

  return (
    <div dir="rtl" className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">الملف الشخصي</h1>
      <p className="text-muted-foreground mt-2">معلومات حسابك الحالية.</p>

      <div className="mt-8 rounded-lg border p-6 grid gap-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">الاسم</span>
          <span className="font-medium">{name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">البريد الإلكتروني</span>
          <span className="font-medium">{email}</span>
        </div>
        {role !== "USER" && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">الدور</span>
            <Badge variant="secondary" className="font-medium">{role}</Badge>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">خطة الاشتراك الحالية</span>
          <Badge className="font-medium">{plan}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">الحالة</span>
          <Badge variant="outline" className="font-medium">{acctStatus}</Badge>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
        {plan == "Free" && <Button variant="outline" className="hover:text-white" asChild>
            <a href="/pricing">ترقية الخطة</a>
          </Button>}
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" })
              } catch (e) {
                console.error("Failed to clear auth_token on logout", e)
              }
              await signOut({ callbackUrl: "/" })
            }}
          >
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  )
}
