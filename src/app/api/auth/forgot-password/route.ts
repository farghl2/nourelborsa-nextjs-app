import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { forgotPasswordSchema } from "@/lib/validations/auth"
import { generateVerificationCode, saveVerificationCode } from "@/lib/verification"
import { sendPasswordResetCodeEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
    }

    const { email } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Do not reveal whether email exists
      return NextResponse.json({ message: "إذا كان البريد موجودًا، سيتم إرسال رمز إعادة التعيين." }, { status: 200 })
    }

    const code = generateVerificationCode()
    await saveVerificationCode(email, code)
    await sendPasswordResetCodeEmail(email, code)

    return NextResponse.json({ message: "تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني." }, { status: 200 })
  } catch (err) {
    console.error("/api/auth/forgot-password error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
