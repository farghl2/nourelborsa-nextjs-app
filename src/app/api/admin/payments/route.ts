import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (auth.role as string | undefined) ?? ""
    if (!["ADMIN", "ACCOUNTANT"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    })

    const data = payments.map((p) => ({
      id: p.id,
      userEmail: p.user.email,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      transactionId: p.transactionId,
      createdAt: p.createdAt,
    }))

    return NextResponse.json({ payments: data })
  } catch (err) {
    console.error("/api/admin/payments GET error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (auth.role as string | undefined) ?? ""
    if (!["ADMIN", "ACCOUNTANT"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { userEmail, amount, currency, status, transactionId } = body as any

    const user = await prisma.user.findUnique({ where: { email: userEmail } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const created = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: Number(amount),
        currency: currency || "usd",
        status,
        transactionId: transactionId || null,
      },
      include: { user: { select: { email: true } } },
    })

    const result = {
      id: created.id,
      userEmail: created.user.email,
      amount: created.amount,
      currency: created.currency,
      status: created.status,
      transactionId: created.transactionId,
      createdAt: created.createdAt,
    }

    return NextResponse.json({ payment: result }, { status: 201 })
  } catch (err) {
    console.error("/api/admin/payments POST error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
