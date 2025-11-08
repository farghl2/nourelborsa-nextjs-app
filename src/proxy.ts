import { NextResponse, type NextRequest } from "next/server"
import { verifyJwt } from "@/lib/jwt"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Apply only to API routes
  const isApi = pathname.startsWith("/api")
  if (!isApi) return NextResponse.next()

  // Public API routes (do not require auth)
  const publicMatchers = [
    /^\/api\/auth\//,      // register, login, next-auth, verify-email, resend-code, forgot-password, reset-password
    /^\/api\/stocks\//,     // stocks
    /^\/api\/subscription-plans\//,     // subscription-plans
    /^\/api\/webhooks\//,  // webhooks
  ]
  const isPublic = publicMatchers.some((re) => re.test(pathname))

  const token = req.cookies.get("auth_token")?.value

  if (!isPublic) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const payload = await verifyJwt<{ sub?: string; role?: string }>(token)
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Inject user headers for downstream handlers (used by getAuthUser)
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id", payload.sub)
    if (payload.role) requestHeaders.set("x-user-role", String(payload.role))

    // Enforce ADMIN only for subscription-plans write operations
    const isSubscriptionPlans = pathname.startsWith("/api/subscription-plans")
    const isWrite = req.method === "POST" || req.method === "PATCH" || req.method === "DELETE"
    if (isSubscriptionPlans && isWrite && payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Public route passthrough
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}
