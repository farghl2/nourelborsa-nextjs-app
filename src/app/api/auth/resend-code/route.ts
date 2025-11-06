import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resendCodeSchema } from "@/lib/validations/auth"
import { generateVerificationCode, saveVerificationCode } from "@/lib/verification"
import { sendVerificationCodeEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const parsed = resendCodeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
    }

    const { email } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" }, { status: 200 })
    }

    const code = generateVerificationCode()
    await saveVerificationCode(email, code)
    await sendVerificationCodeEmail(email, code)

    return NextResponse.json({ message: "تم إرسال رمز تحقق جديد إلى بريدك" }, { status: 200 })
  } catch (err) {
    console.error("/api/auth/resend-code error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
