import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { hasActiveSubscription } from "@/lib/subscription"
import { createStockSchema } from "@/lib/validations/stock"
import { redactStock } from "@/lib/redact"

 

export async function GET(req: Request) {
  try {
    const auth = await getAuthUser()
    const url = new URL(req.url)
    const q = url.searchParams.get("q")?.trim()

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { symbol: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}

    const list = await prisma.stock.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    const subscribed = !auth ?false: auth.role === "ADMIN" || auth.role === "ACCOUNTANT" ? true : await hasActiveSubscription(auth.id)
    const data = list.map((s) => redactStock(s, subscribed))

    return NextResponse.json({ stocks: data })
  } catch (err) {
    console.error("/api/stocks GET error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (auth.role as string | undefined) ?? ""
    if (!['ADMIN','ACCOUNTANT'].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const parsed = createStockSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
    }

    const created = await prisma.stock.create({
      data: {
        ...parsed.data,
        createdById: auth.id,
      },
    })

    const subscribed = await hasActiveSubscription(auth.id)
    return NextResponse.json({ stock: redactStock(created, subscribed) }, { status: 201 })
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Symbol already exists" }, { status: 409 })
    }
    console.error("/api/stocks POST error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
