import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { verifyJwt } from "@/lib/jwt"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isApi = pathname.startsWith("/api")
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/")

  // If it's neither API nor admin page, let it pass
  if (!isApi && !isAdminPage) return NextResponse.next()

  if (isApi || isAdminPage) {
    // 1. Try custom auth_token first
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
    
    // 2. If no custom token, try NextAuth session token
    if (!userId) {
      try {
        const token = await getToken({ 
          req, 
          secret: process.env.NEXTAUTH_SECRET 
        })
        
        if (token) {
          userId = (token.id as string) || token.sub || null
          userRole = (token.role as string) || null
        }
      } catch (error) {
        console.error("[Proxy] Error decoding NextAuth token:", error)
      }
    }

    // 3. Define Public Matchers
    const publicMatchers = [
        /^\/api\/auth\//,      // register, login, next-auth, verify-email, resend-code, forgot-password, reset-password
        /^\/api\/stocks(?:\/|$)/,     // stocks (with or without trailing slash)
        /^\/api\/subscription-plans(?:\/|$)/,     // subscription-plans (with or without trailing slash)
        /^\/api\/webhooks\//,  // webhooks
    ]
    const isPublic = publicMatchers.some((re) => re.test(pathname))
    
    // 4. Enforce Auth for Private Routes (if not public and no user)
    if (!isPublic && !userId) {
      if (isAdminPage) {
           return NextResponse.redirect(new URL("/login", req.url))
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // 5. Inject Headers (if user found)
    const requestHeaders = new Headers(req.headers)
    if (userId) {
        requestHeaders.set("x-user-id", userId)
        if (userRole) requestHeaders.set("x-user-role", String(userRole))
    }

    const role = String(userRole || "")

    // 6. Admin Page Access Control
    if (isAdminPage) {
      if (!["ADMIN", "ACCOUNTANT"].includes(role)) {
        console.log("[Proxy] User role not authorized for admin:", role)
        const homeUrl = new URL("/", req.nextUrl.origin)
        homeUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
        return NextResponse.redirect(homeUrl)
      }
    }

    // 7. Special Case: subscription-plans write operations
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
