import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateSubscriptionPlanSchema } from "@/lib/validations/subscription"
import { SubscriptionPlan } from "@/generated/prisma"
import { getAuthUser } from "@/lib/auth"



export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser()
    const { id } = await context.params
    let plan:SubscriptionPlan | null;
    if(auth?.role === "ADMIN") {
       plan = await prisma.subscriptionPlan.findUnique({ where: { id } })
    }
    else {
     plan = await prisma.subscriptionPlan.findUnique({ where: { id , active: true} })
    }
    if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ plan })
  } catch (err) {
    console.error("/api/subscription-plans/[id] GET error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const parsed = updateSubscriptionPlanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
    }

    const { id } = await context.params
    const existing = await prisma.subscriptionPlan.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (auth.role !== "ADMIN" && existing.createdById && existing.createdById !== auth.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await prisma.subscriptionPlan.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ plan: updated })
  } catch (err) {
    console.error("/api/subscription-plans/[id] PATCH error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await context.params
    const existing = await prisma.subscriptionPlan.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (auth.role !== "ADMIN" && existing.createdById && existing.createdById !== auth.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.subscriptionPlan.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("/api/subscription-plans/[id] DELETE error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

