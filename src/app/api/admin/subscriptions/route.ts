import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { createSubscriptionAdminSchema } from "@/lib/validations/subscription"

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (auth.role as string | undefined) ?? ""
    if (!["ADMIN", "ACCOUNTANT"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const subs = await prisma.subscription.findMany({
      orderBy: { startDate: "desc" },
      include: {
        user: { select: { email: true } },
        plan: { select: { name: true } },
      },
    })

    const data = subs.map((s: any) => ({
      id: s.id,
      userEmail: s.user.email,
      plan: s.plan.name,
      status: s.status, // ACTIVE / CANCELLED / EXPIRED
      renewedByAdmin: s.renewedByAdmin,
      startDate: s.startDate,
      endDate: s.endDate,
    }))

    return NextResponse.json({ subscriptions: data })
  } catch (err) {
    console.error("/api/admin/subscriptions GET error", err)
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

    const parsed = createSubscriptionAdminSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
    }

    const { userEmail, planId, status, renewedByAdmin } = parsed.data

    const user = await prisma.user.findUnique({ where: { email: userEmail } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // prevent creating if user already has an ACTIVE subscription
    const existingActive = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
    })
    if (existingActive) {
      return NextResponse.json({ error: "User already has an active subscription" }, { status: 400 })
    }

    const created = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: status ?? "ACTIVE",
        renewedByAdmin: renewedByAdmin ?? false,
      },
      include: {
        user: { select: { email: true } },
        plan: { select: { name: true, allowedStocks: true } },
      },
    })

    // Update user's purificationCount to the plan's purificationLimit
    await prisma.user.update({
      where: { id: user.id },
      data: { purificationCount: plan.purificationLimit ?? 0 }
    })

    const result = {
      id: created.id,
      userEmail: created.user.email,
      plan: created.plan.name,
      allowedStocks: created.plan.allowedStocks,
      status: created.status,
      renewedByAdmin: created.renewedByAdmin,
      startDate: created.startDate,
      endDate: created.endDate,
    }

    return NextResponse.json({ subscription: result }, { status: 201 })
  } catch (err) {
    console.error("/api/admin/subscriptions POST error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
