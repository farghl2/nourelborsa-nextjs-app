"use client"

import { useSession, signOut } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BASE_URL } from "@/lib/data/const-data"

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
    <div dir="rtl" className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">الملف الشخصي</h1>
      <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">معلومات حسابك الحالية.</p>

      <div className="mt-6 sm:mt-8 rounded-lg border p-4 sm:p-6 grid gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <span className="text-xs sm:text-sm text-muted-foreground">الاسم</span>
          <span className="font-medium text-sm sm:text-base">{name}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <span className="text-xs sm:text-sm text-muted-foreground">البريد الإلكتروني</span>
          <span className="font-medium text-sm sm:text-base break-all">{email}</span>
        </div>
        {role !== "USER" && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
            <span className="text-xs sm:text-sm text-muted-foreground">الدور</span>
            <Badge variant="secondary" className="font-medium text-white w-fit">{role}</Badge>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <span className="text-xs sm:text-sm text-muted-foreground">خطة الاشتراك الحالية</span>
          <Badge className="font-medium w-fit">{plan}</Badge>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <span className="text-xs sm:text-sm text-muted-foreground">الحالة</span>
          <Badge variant="outline" className="font-medium w-fit">{acctStatus}</Badge>
        </div>
        
        {/* Show subscription end date and days remaining if available */}
        {subscriptionEndDate && daysRemaining !== null && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm text-muted-foreground">تاريخ انتهاء الاشتراك</span>
              <span className="font-medium text-xs sm:text-sm">
                {new Date(subscriptionEndDate).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm text-muted-foreground">الأيام المتبقية</span>
              <Badge 
                variant={
                  daysRemaining > 14 ? "default" : 
                  daysRemaining > 7 ? "secondary" : 
                  "destructive"
                } 
                className="font-medium w-fit"
              >
                {daysRemaining} {daysRemaining === 1 ? "يوم" : "أيام"}
              </Badge>
            </div>
          </>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
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
              await signOut({ redirect: false })
              window.location.href = BASE_URL
            }}
          >
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  )
}
