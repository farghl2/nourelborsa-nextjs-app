import type { UpdateUserRoleInput } from "@/lib/validations/user"

export type AdminUser = {
  id: string
  name: string | null
  email: string | null
  role: "USER" | "ADMIN" | "ACCOUNTANT"
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch("/api/users", { cache: "no-store" })
  if (!res.ok) {
    throw new Error("فشل في تحميل المستخدمين")
  }
  const data = await res.json()
  return data.users as AdminUser[]
}

export async function updateUserRole(userId: string, input: UpdateUserRoleInput): Promise<AdminUser> {
  const res = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = data?.error || "فشل في تحديث دور المستخدم"
    throw new Error(msg)
  }

  const data = await res.json()
  return data.user as AdminUser
}
