import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (auth.role as string | undefined) ?? ""
    if (!["ADMIN", "ACCOUNTANT"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    const body = await _req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { amount, currency, status, transactionId } = body as any

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        amount: amount !== undefined ? Number(amount) : undefined,
        currency,
        status,
        transactionId,
      },
      include: { user: { select: { email: true } } },
    })

    const result = {
      id: updated.id,
      userEmail: updated.user.email,
      amount: updated.amount,
      currency: updated.currency,
      status: updated.status,
      transactionId: updated.transactionId,
      createdAt: updated.createdAt,
    }

    return NextResponse.json({ payment: result })
  } catch (err) {
    console.error("/api/admin/payments/[id] PATCH error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (auth.role as string | undefined) ?? ""
    if (!["ADMIN", "ACCOUNTANT"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    await prisma.payment.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("/api/admin/payments/[id] DELETE error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
