import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { registerSchema } from "@/lib/validations/auth"
import { generateVerificationCode, saveVerificationCode } from "@/lib/verification"
import { sendVerificationCodeEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
    }
    const { name, email, password } = parsed.data

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const hashed = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name: name ?? undefined,
        email,
        password: hashed,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    const code = generateVerificationCode()
    await saveVerificationCode(email, code)
    await sendVerificationCodeEmail(email, code)

    return NextResponse.json({ message: "تم إنشاء الحساب. تم إرسال رمز التحقق إلى بريدك الإلكتروني." }, { status: 201 })
  } catch (err) {
    console.error("/api/auth/register error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
