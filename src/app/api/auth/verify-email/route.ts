import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyEmailSchema } from "@/lib/validations/auth"
import { clearVerificationCodes, validateVerificationCode } from "@/lib/verification"
import { signJwt } from "@/lib/jwt"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const parsed = verifyEmailSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
    }

    const { email, code } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const check = await validateVerificationCode(email, code)
    if (!check.valid) {
      return NextResponse.json({ error: check.reason === "expired" ? "Expired code" : "Invalid code" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    await clearVerificationCodes(email)

    const token = await signJwt({ sub: updated.id, email: updated.email, role: updated.role })
    const res = NextResponse.json({ user: updated }, { status: 200 })
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (err) {
    console.error("/api/auth/verify-email error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
