import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payment = await prisma.payment.findUnique({ where: { id: params.id } })
    if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (auth.role !== "ADMIN" && payment.userId !== auth.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ payment })
  } catch (err) {
    console.error("/api/payments/[id] GET error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
