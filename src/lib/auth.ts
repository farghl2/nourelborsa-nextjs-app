import { cookies, headers } from "next/headers"
import { verifyJwt } from "@/lib/jwt"

export type AuthUser = { id: string; role?: string | null; email?: string | null }

export async function getAuthUser(): Promise<AuthUser | null> {
  // Prefer middleware-injected headers if present
  try {
    const h = await headers()
    const id = h.get("x-user-id")
    if (id) {
      const role = h.get("x-user-role")
      return { id, role }
    }
  } catch {}

  // Fallback to reading cookie and verifying JWT
  const store = await cookies()
  const token = store.get("auth_token")?.value
  if (!token) return null
  const payload = await verifyJwt<{ sub?: string; role?: string; email?: string }>(token)
  if (!payload?.sub) return null
  return { id: payload.sub, role: payload.role ?? null, email: payload.email ?? null }
}
