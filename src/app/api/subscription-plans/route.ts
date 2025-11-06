import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createSubscriptionPlanSchema } from "@/lib/validations/subscription"
import { getAuthUser } from "@/lib/auth"

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ plans })
  } catch (err) {
    console.error("/api/subscription-plans GET error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const parsed = createSubscriptionPlanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
    }

    const auth = await getAuthUser().catch(() => null)

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        durationDays: parsed.data.durationDays,
        features: parsed.data.features,
        createdById: auth?.id,
      },
    })

    return NextResponse.json({ plan }, { status: 201 })
  } catch (err) {
    console.error("/api/subscription-plans POST error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
