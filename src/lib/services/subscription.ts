import type { CreateSubscriptionAdminInput, UpdateSubscriptionAdminInput } from "@/lib/validations/subscription"

export type AdminSubscription = {
  id: string
  userEmail: string
  plan: string
  status: "ACTIVE" | "CANCELLED" | "EXPIRED"
  renewedByAdmin: boolean
  startDate: string
  endDate: string | null
}

export async function fetchAdminSubscriptions(): Promise<AdminSubscription[]> {
  const res = await fetch("/api/admin/subscriptions", { cache: "no-store" })
  if (!res.ok) {
    throw new Error("فشل في تحميل الاشتراكات")
  }
  const data = await res.json()
  return data.subscriptions as AdminSubscription[]
}

export async function updateAdminSubscription(id: string, input: UpdateSubscriptionAdminInput): Promise<AdminSubscription> {
  const res = await fetch(`/api/admin/subscriptions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = data?.error || "فشل في تحديث الاشتراك"
    throw new Error(msg)
  }

  const data = await res.json()
  return data.subscription as AdminSubscription
}

export async function createAdminSubscription(input: CreateSubscriptionAdminInput): Promise<AdminSubscription> {
  const res = await fetch("/api/admin/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = data?.error || "فشل في إنشاء الاشتراك"
    throw new Error(msg)
  }

  const data = await res.json()
  return data.subscription as AdminSubscription
}

export async function deleteAdminSubscription(id: string): Promise<void> {
  const res = await fetch(`/api/admin/subscriptions/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = data?.error || "فشل في حذف الاشتراك"
    throw new Error(msg)
  }
}
