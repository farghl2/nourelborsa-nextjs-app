import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { verifyJwt } from "@/lib/jwt"

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

  // Protect both private APIs and /admin pages
  if (!isPublic || isAdminPage) {
    // Try custom auth_token first (from /api/auth/login custom route)
    const customToken = req.cookies.get("auth_token")?.value
    
    let userId: string | null = null
    let userRole: string | null = null
    
    if (customToken) {
      // Verify custom JWT token
      const payload = await verifyJwt<{ sub?: string; role?: string }>(customToken)
      if (payload?.sub) {
        userId = payload.sub
        userRole = payload.role || null
      }
    }
    
    // If no custom token, try NextAuth session token
    if (!userId) {
      try {
        // Use NextAuth's getToken to decrypt the session JWT
        const token = await getToken({ 
          req, 
          secret: process.env.NEXTAUTH_SECRET 
        })
        
        if (token) {
          userId = (token.id as string) || token.sub || null
          userRole = (token.role as string) || null
          console.log("[Proxy] NextAuth token found:", { userId, userRole })
        }
      } catch (error) {
        console.error("[Proxy] Error decoding NextAuth token:", error)
      }
    }
    
    // No valid auth found
    if (!userId) {
      console.log("[Proxy] No valid auth, redirecting to login. Path:", pathname)
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Inject user headers for downstream handlers (used by getAuthUser)
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id", userId)
    if (userRole) requestHeaders.set("x-user-role", String(userRole))

    const role = String(userRole || "")

    // Restrict /admin pages to ADMIN and ACCOUNTANT, redirect to home if unauthorized
    if (isAdminPage) {
      if (!["ADMIN", "ACCOUNTANT"].includes(role)) {
        console.log("[Proxy] User role not authorized for admin:", role)
        const homeUrl = new URL("/", req.nextUrl.origin)
        homeUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
        return NextResponse.redirect(homeUrl)
      }
    }

    // Enforce ADMIN only for subscription-plans write operations
    const isSubscriptionPlans = pathname.startsWith("/api/subscription-plans")
    const isWrite = req.method === "POST" || req.method === "PATCH" || req.method === "DELETE"
    if (isSubscriptionPlans && isWrite && userRole !== "ADMIN") {
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
