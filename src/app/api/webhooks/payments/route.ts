import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { paymentWebhookSchema } from "@/lib/validations/payment"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    // In the future, verify provider signatures here.
    const parsed = paymentWebhookSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
    }

    const { paymentId, status, transactionId, planId } = parsed.data

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 })

    // Update payment status/transactionId
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status, transactionId: transactionId ?? undefined },
    })

    // On success, optionally create subscription if planId provided
    if (status === "SUCCEEDED" && planId) {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
      if (!plan) {
        return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 })
      }

      const sub = await prisma.subscription.create({
        data: {
          userId: payment.userId,
          planId,
          status: "ACTIVE",
          paymentId: payment.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
        },
      })
      return NextResponse.json({ payment: updatedPayment, subscription: sub }, { status: 200 })
    }

    return NextResponse.json({ payment: updatedPayment }, { status: 200 })
  } catch (err) {
    console.error("/api/webhooks/payments POST error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
