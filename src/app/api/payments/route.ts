import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { initiatePaymentSchema } from "@/lib/validations/payment"
import { getAuthUser } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const parsed = initiatePaymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: parsed.data.planId, active: true } })
    if (!plan) return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 })

    const payment = await prisma.payment.create({
      data: {
        userId: auth.id,
        planId: parsed.data.planId,
        amount: plan.price,
        status: "PENDING",
      },
    })

    // Create a clean merchant reference
    const merchantReference = `ORD${payment.id.toUpperCase().slice(-12)}`
    
    // Update the payment with the reference
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { merchantReference },
      select: { id: true, amount: true, currency: true, status: true, createdAt: true, merchantReference: true },
    })

    const provider = parsed.data.provider ?? "manual"
    
    if (provider === "paysky") {
      return NextResponse.json({ payment: updatedPayment }, { status: 201 })
    }

    const redirectUrl = `/payments/${payment.id}/continue?provider=${encodeURIComponent(provider)}`

    return NextResponse.json({ payment, redirectUrl }, { status: 201 })
  } catch (err) {
    console.error("/api/payments POST error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
