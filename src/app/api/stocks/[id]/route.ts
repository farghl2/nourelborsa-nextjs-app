import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { hasActiveSubscription } from "@/lib/subscription"
import { updateStockSchema } from "@/lib/validations/stock"
import { redactStock } from "@/lib/redact"

 
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser()

    const { id } = await context.params

    const stock = await prisma.stock.findUnique({ where: { id } })

    if (!stock) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const subscribed = !auth ?false: auth.role === "ADMIN" || auth.role === "ACCOUNTANT" ? true : await hasActiveSubscription(auth.id)
    return NextResponse.json({ stock: redactStock(stock as any, subscribed) })
  } catch (err) {
    console.error("/api/stocks/[id] GET error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await context.params
    const existing = await prisma.stock.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const role = (auth.role as string | undefined) ?? ""
    if (!["ADMIN","ACCOUNTANT"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const parsed = updateStockSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
    }

    // Convert null values to undefined for Prisma (Prisma doesn't accept null in updates)
    const updateData = Object.fromEntries(
      Object.entries(parsed.data).map(([key, value]) => [key, value === null ? undefined : value])
    )

    const updated = await prisma.stock.update({ where: { id }, data: updateData })
    const subscribed = await hasActiveSubscription(auth.id)
    return NextResponse.json({ stock: redactStock(updated as any, subscribed) })
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Symbol already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await context.params
    const existing = await prisma.stock.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const role = (auth.role as string | undefined) ?? ""
    if (!["ADMIN","ACCOUNTANT"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.stock.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("/api/stocks/[id] DELETE error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
