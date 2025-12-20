import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { createSubscriptionAdminSchema, updateSubscriptionAdminSchema } from "@/lib/validations/subscription"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (auth.role as string | undefined) ?? ""
    if (!["ADMIN", "ACCOUNTANT"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    
    // Fallback for metrics if routing is weird
    if (id === "metrics") {
       const url = new URL(_req.url);
       return NextResponse.redirect(new URL(`/api/admin/subscriptions/metrics${url.search}`, _req.url));
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        plan: { select: { name: true } },
      },
    })

    if (!subscription) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ subscription })
  } catch (err) {
    console.error("/api/admin/subscriptions/[id] GET error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = (auth.role as string | undefined) ?? ""
    if (!["ADMIN", "ACCOUNTANT"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await context.params

    const existing = await prisma.subscription.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const parsed = updateSubscriptionAdminSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: parsed.data,
      include: {
        user: { select: { email: true } },
        plan: { select: { name: true, purificationLimit: true, allowedStocks: true } },
      },
    })

    // If status is being set to ACTIVE, update user's purificationCount to the plan's purificationLimit
    if (parsed.data.status === "ACTIVE") {
      await prisma.user.update({
        where: { id: updated.userId },
        data: { purificationCount: updated.plan.purificationLimit ?? 0 }
      })
    }

    const result = {
      id: updated.id,
      userEmail: updated.user.email,
      plan: updated.plan.name,
      allowedStocks: updated.plan.allowedStocks,
      status: updated.status,
      renewedByAdmin: updated.renewedByAdmin,
      startDate: updated.startDate,
      endDate: updated.endDate,
    }

    return NextResponse.json({ subscription: result })
  } catch (err) {
    console.error("/api/admin/subscriptions/[id] PATCH error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = (auth.role as string | undefined) ?? ""
    if (!["ADMIN", "ACCOUNTANT"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await context.params

    const existing = await prisma.subscription.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.subscription.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("/api/admin/subscriptions/[id] DELETE error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
