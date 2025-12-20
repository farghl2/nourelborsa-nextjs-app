import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// Helpers
function makeLabels(period: string): string[] {
  switch (period) {
    case "daily":
      return ["س", "٢", "٣", "٤", "٥", "٦", "٧"]
    case "weekly":
      return ["أسبوع ١", "أسبوع ٢", "أسبوع ٣", "أسبوع ٤"]
    case "all":
      return ["الكل"]
    case "yearly":
      return ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠", "١١", "١٢"]
    default:
      return ["ينا", "فبر", "مارس", "أبر", "ماي", "يون", "يول", "أغس", "سبت", "أكت", "نوف", "ديس"]
  }
}

function spreadToSeries(total: number, len: number): number[] {
  if (len <= 0) return []
  const base = Math.floor(total / len)
  const rem = total % len
  return Array.from({ length: len }, (_ , i) => base + (i < rem ? 1 : 0))
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (auth.role as string | undefined) ?? ""
    if (!["ADMIN", "ACCOUNTANT"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "monthly"
    const labels = makeLabels(period)

    const [total, active, cancelled, expired, last30, byPlan, renewedCount] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({ where: { status: "CANCELLED" } }),
      prisma.subscription.count({ where: { status: "EXPIRED" } }),
      prisma.subscription.count({ where: { startDate: { gte: new Date(Date.now() - 30*24*60*60*1000) } } }),
      prisma.subscription.groupBy({ by: ["planId"], _count: { planId: true } }),
      prisma.subscription.count({ where: { renewedByAdmin: true } }),
    ])

    if (total === 0) {
      return NextResponse.json({ cards: [], charts: [] })
    }

    let topPlan = "—"
    if (byPlan.length) {
      const top = byPlan.sort((a,b)=>b._count.planId - a._count.planId)[0]
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: top.planId } })
      topPlan = plan?.name ?? "—"
    }
    const renewedPct = Math.round(((renewedCount || 0) / Math.max(total, 1)) * 100)

    const cards = [
      { title: "الاشتراكات النشطة", value: active.toString() },
      { title: "المنتهية/الملغاة", value: `${expired} / ${cancelled}` },
      { title: "الجديدة (آخر شهر)", value: last30.toString() },
      { title: "أكثر خطة استخدامًا", value: topPlan },
      { title: "نسبة التجديد اليدوي", value: `${renewedPct}%`, hint: "renewedByAdmin" },
    ]

    const charts = [
      {
        title: "اشتراكات جديدة",
        type: "bar" as const,
        data: { labels, datasets: [{ label: "New", data: spreadToSeries(last30, labels.length), backgroundColor: "#10b981" }] },
      },
      {
        title: "نشطة vs منتهية",
        type: "pie" as const,
        data: { labels: ["نشطة", "منتهية/ملغاة"], datasets: [{ data: [active, cancelled+expired], backgroundColor: ["#10b981", "#3b82f6"] }] },
      },
    ]

    return NextResponse.json({ cards, charts })
  } catch (err) {
    console.error("/api/admin/subscriptions/metrics GET error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
