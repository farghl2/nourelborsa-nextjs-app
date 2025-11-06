import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resetPasswordSchema } from "@/lib/validations/auth"
import { validateVerificationCode, clearVerificationCodes } from "@/lib/verification"
import { hashPassword } from "@/lib/password"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const parsed = resetPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
    }

    const { email, code, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Hide existence of user
      return NextResponse.json({ message: "تم تحديث كلمة المرور إذا كان البريد موجودًا." }, { status: 200 })
    }

    const check = await validateVerificationCode(email, code)
    if (!check.valid) {
      return NextResponse.json({ error: check.reason === "expired" ? "Expired code" : "Invalid code" }, { status: 400 })
    }

    const hashed = await hashPassword(password)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

    await clearVerificationCodes(email)

    return NextResponse.json({ message: "تم تحديث كلمة المرور بنجاح" }, { status: 200 })
  } catch (err) {
    console.error("/api/auth/reset-password error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
