"use client"

import { useSession, signOut } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Helper function to calculate days remaining
function getDaysRemaining(endDate: string | null | undefined): number | null {
  if (!endDate) return null
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export default function ProfilePage() {
  const { data: session, status } = useSession()

  const user = session?.user as (typeof session extends { user: infer U } ? U : any) & {
    role?: string
    plan?: string
    status?: string
    subscriptionEndDate?: string
  }

  const name = user?.name || "غير معروف"
  const email = user?.email || "—"
  const role = user?.role || "USER"
  const plan = (user as any)?.plan || "Free"
  const acctStatus = (user as any)?.status || (status === "authenticated" ? "Active" : "Unknown")
  const subscriptionEndDate = (user as any)?.subscriptionEndDate
  const daysRemaining = getDaysRemaining(subscriptionEndDate)

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
            <Badge variant="secondary" className="font-medium text-white">{role}</Badge>
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
        
        {/* Show subscription end date and days remaining if available */}
        {subscriptionEndDate && daysRemaining !== null && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">تاريخ انتهاء الاشتراك</span>
              <span className="font-medium text-sm">
                {new Date(subscriptionEndDate).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">الأيام المتبقية</span>
              <Badge 
                variant={
                  daysRemaining > 14 ? "default" : 
                  daysRemaining > 7 ? "secondary" : 
                  "destructive"
                } 
                className="font-medium"
              >
                {daysRemaining} {daysRemaining === 1 ? "يوم" : "أيام"}
              </Badge>
            </div>
          </>
        )}

        <div className="pt-2 flex items-center justify-end gap-3">
          {user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT' ? <Button variant="outline" className="hover:text-white" asChild>
            <a href="/admin">لوحة التحكم</a>
          </Button>:
        plan == "Free" && <Button variant="outline" className="hover:text-white" asChild>
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
