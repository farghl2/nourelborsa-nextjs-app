export type AdminPayment = {
  id: string
  userEmail: string | null
  amount: number
  currency: string
  status: "SUCCEEDED" | "PENDING" | "FAILED"
  transactionId: string | null
  createdAt: string
}

export async function fetchAdminPayments(): Promise<AdminPayment[]> {
  const res = await fetch("/api/admin/payments", { cache: "no-store" })
  if (!res.ok) {
    throw new Error("فشل في تحميل المدفوعات")
  }
  const data = await res.json()
  return (data.payments || []) as AdminPayment[]
}

export async function updateAdminPayment(id: string, input: Partial<Omit<AdminPayment, "id" | "userEmail" | "createdAt">>): Promise<AdminPayment> {
  const res = await fetch(`/api/admin/payments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = (data as any)?.error || "فشل في تحديث الدفعة"
    throw new Error(msg)
  }

  const data = await res.json()
  return data.payment as AdminPayment
}

export async function deleteAdminPayment(id: string): Promise<void> {
  const res = await fetch(`/api/admin/payments/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = (data as any)?.error || "فشل في حذف الدفعة"
    throw new Error(msg)
  }
}
