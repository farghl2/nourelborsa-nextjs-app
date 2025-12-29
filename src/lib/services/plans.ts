import type { CreateSubscriptionPlanInput, UpdateSubscriptionPlanInput } from "@/lib/validations/subscription"

export type AdminPlan  = {
  id: string
  name: string
  description?: string | null
  price: number
  durationDays: number
  purificationLimit?: number | null
  aiLimit?: number | null
  active: boolean
  allowedStocks: boolean
  createdAt: string
  features?: string[]
}

export async function fetchAdminPlans(): Promise<AdminPlan[]> {
  const res = await fetch("/api/subscription-plans", { cache: "no-store" })
  if (!res.ok) {
    throw new Error("فشل في تحميل الباقات")
  }
  const data = await res.json()
  return (data.plans || []) as AdminPlan[]
}

export async function createAdminPlan(input: CreateSubscriptionPlanInput): Promise<AdminPlan> {
  const res = await fetch("/api/subscription-plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = data?.error || "فشل في إنشاء الباقة"
    throw new Error(msg)
  }

  const data = await res.json()
  return data.plan as AdminPlan
}

export async function updateAdminPlan(id: string, input: UpdateSubscriptionPlanInput): Promise<AdminPlan> {
  const res = await fetch(`/api/subscription-plans/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = data?.error || "فشل في تحديث الباقة"
    throw new Error(msg)
  }

  const data = await res.json()
  return data.plan as AdminPlan
}

export async function deleteAdminPlan(id: string): Promise<void> {
  const res = await fetch(`/api/subscription-plans/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = data?.error || "فشل في حذف الباقة"
    throw new Error(msg)
  }
}

export async function toggleAdminPlanActive(id: string, active: boolean): Promise<AdminPlan> {
  return updateAdminPlan(id, { active })
}
