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

    const [totalSumAgg, monthlySumAgg, successCount, failCount, totalCount, avgAgg, topPayers] = await Promise.all([
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: new Date(Date.now() - 30*24*60*60*1000) } } }),
      prisma.payment.count({ where: { status: "SUCCEEDED" } }),
      prisma.payment.count({ where: { status: "FAILED" } }),
      prisma.payment.count(),
      prisma.payment.aggregate({ _avg: { amount: true } }),
      prisma.payment.groupBy({ by: ["userId"], _sum: { amount: true } }),
    ])

    if (totalCount === 0) {
      return NextResponse.json({ cards: [], charts: [] })
    }

    const successRate = Math.round((successCount / Math.max(totalCount, 1)) * 100)
    const top2 = topPayers.sort((a,b)=> (b._sum.amount||0) - (a._sum.amount||0)).slice(0,2)
    const users = await prisma.user.findMany({ where: { id: { in: top2.map(t=>t.userId) } }, select: { id: true, email: true } })
    const topNames = top2.map(t => users.find(u=>u.id===t.userId)?.email || t.userId).join(", ") || "—"

    const cards = [
      { title: "إجمالي الإيرادات", value: `${Math.round(totalSumAgg._sum.amount || 0).toLocaleString()} EGP` },
      { title: "الإيرادات الشهرية", value: `${Math.round(monthlySumAgg._sum.amount || 0).toLocaleString()} EGP` },
      { title: "نسبة المدفوعات الناجحة", value: `${successRate}%`, hint: `مقابل ${100-successRate}% فاشلة` },
      { title: "متوسط قيمة الدفع", value: `${(avgAgg._avg.amount || 0).toFixed(1)} EGP` },
      { title: "أكثر المستخدمين دفعًا", value: topNames },
    ]

    const charts = [
      {
        title: "الإيرادات",
        type: "line" as const,
        data: { labels, datasets: [{ label: "Revenue", data: spreadToSeries(Math.round(monthlySumAgg._sum.amount || 0), labels.length), backgroundColor: "#22c55e" }] },
      },
      {
        title: "نسبة نجاح المدفوعات",
        type: "doughnut" as const,
        data: { labels: ["ناجحة", "فاشلة"], datasets: [{ data: [successCount, failCount], backgroundColor: ["#22c55e", "#ef4444"] }] },
      },
    ]

    return NextResponse.json({ cards, charts })
  } catch (err) {
    console.error("/api/admin/payments/metrics GET error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
