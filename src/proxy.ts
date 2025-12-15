import { NextResponse, type NextRequest } from "next/server"
import { verifyJwt } from "@/lib/jwt"
import { redirect } from "next/navigation"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isApi = pathname.startsWith("/api")
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/")

  // If it's neither API nor admin page, let it pass
  if (!isApi && !isAdminPage) return NextResponse.next()

  // Public API routes (do not require auth)
  const publicMatchers = [
    /^\/api\/auth\//,      // register, login, next-auth, verify-email, resend-code, forgot-password, reset-password
    /^\/api\/stocks(?:\/|$)/,     // stocks (with or without trailing slash)
    /^\/api\/subscription-plans(?:\/|$)/,     // subscription-plans (with or without trailing slash)
    /^\/api\/webhooks\//,  // webhooks
  ]
  const isPublic = publicMatchers.some((re) => re.test(pathname))

  const token = req.cookies.get("auth_token")?.value

  // Protect both private APIs and /admin pages
  if (!isPublic || isAdminPage) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    const payload = await verifyJwt<{ sub?: string; role?: string }>(token)
    if (!payload || !payload.sub) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Inject user headers for downstream handlers (used by getAuthUser)
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id", payload.sub)
    if (payload.role) requestHeaders.set("x-user-role", String(payload.role))

    const role = String(payload.role || "")

   

    // Restrict /admin pages to ADMIN and ACCOUNTANT, redirect to /login if unauthorized
    if (isAdminPage) {
      if (!["ADMIN", "ACCOUNTANT"].includes(role)) {
        const homeUrl = new URL("/", req.nextUrl.origin)
        homeUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
        return NextResponse.redirect(homeUrl)
      }
    }

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
  matcher: ["/api/:path*", "/admin/:path*", "/admin"],
}
