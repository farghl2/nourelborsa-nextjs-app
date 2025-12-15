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

export async function GET(req: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (auth.role as string | undefined) ?? ""
    if (!["ADMIN", "ACCOUNTANT"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { type } = await ctx.params
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "monthly"
    const labels = makeLabels(period)

    if (type === "users") {
      const [total, last30Count, roles] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
        prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
      ])
      if (total === 0) {
        return NextResponse.json({ cards: [], charts: [] })
      }
      const roleMap = new Map<string, number>(roles.map(r => [r.role, r._count.role]))
      const userPct = (r: string) => Math.round(((roleMap.get(r) || 0) / Math.max(total, 1)) * 100)

      const cards = [
        { title: "إجمالي عدد المستخدمين", value: total.toLocaleString() },
        { title: "المستخدمون الجدد (آخر شهر)", value: `+${last30Count.toLocaleString()}` },
        { title: "توزيع حسب الدور", value: `USER ${userPct("USER")}% / ADMIN ${userPct("ADMIN")}% / ACCOUNTANT ${userPct("ACCOUNTANT")}%` },
        { title: "معدل النمو الشهري", value: "+-" },
      ]

      const charts = [
        {
          title: "نمو المستخدمين",
          type: "line" as const,
          data: { labels, datasets: [{ label: "Users", data: spreadToSeries(total, labels.length), backgroundColor: "#0ea5e9" }] },
        },
        {
          title: "توزيع الأدوار",
          type: "doughnut" as const,
          data: { labels: ["USER", "ADMIN", "ACCOUNTANT"], datasets: [{ data: [roleMap.get("USER")||0, roleMap.get("ADMIN")||0, roleMap.get("ACCOUNTANT")||0], backgroundColor: ["#0ea5e9", "#7dd3fc", "#38bdf8"] }] },
        },
      ]

      return NextResponse.json({ cards, charts })
    }

    if (type === "subscriptions") {
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
    }

    if (type === "plans") {
      const [count, avgPrice, subByPlan] = await Promise.all([
        prisma.subscriptionPlan.count(),
        prisma.subscriptionPlan.aggregate({ _avg: { price: true } }),
        prisma.subscription.groupBy({ by: ["planId"], _count: { planId: true } }),
      ])
      if (count === 0) {
        return NextResponse.json({ cards: [], charts: [] })
      }

      const planIds = subByPlan.map(p => p.planId)
      const plans = await prisma.subscriptionPlan.findMany({ where: { id: { in: planIds } }, select: { id: true, name: true, price: true } })

      const revenueByPlan = plans.map(p => ({ name: p.name, revenue: p.price * (subByPlan.find(s=>s.planId===p.id)?._count.planId || 0) }))
      const topRevenue = revenueByPlan.sort((a,b)=>b.revenue - a.revenue)[0]?.name ?? "—"

      const usersPerPlan = plans
        .map(p => `${p.name} ${(subByPlan.find(s=>s.planId===p.id)?._count.planId || 0)}`)
        .join(" / ")

      const cards = [
        { title: "عدد الخطط", value: count.toString() },
        { title: "أكثر خطة تحقيقًا للإيرادات", value: topRevenue },
        { title: "متوسط سعر الاشتراك", value: `$${(avgPrice._avg.price ?? 0).toFixed(1)}` },
        { title: "المستخدمون لكل خطة", value: usersPerPlan || "—" },
      ]

      const labelsForPlans = plans.map(p => p.name)
      const charts = [
        {
          title: "إيرادات حسب الخطة",
          type: "bar" as const,
          data: { labels: labelsForPlans, datasets: [{ label: "Revenue", data: revenueByPlan.map(r=>Math.round(r.revenue)), backgroundColor: ["#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9"] }] },
        },
        {
          title: "متوسط السعر شهريًا",
          type: "line" as const,
          data: { labels, datasets: [{ label: "Avg Price", data: Array(labels.length).fill(avgPrice._avg.price ?? 0), backgroundColor: "#8b5cf6" }] },
        },
      ]

      return NextResponse.json({ cards, charts })
    }

    if (type === "payments") {
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
        { title: "إجمالي الإيرادات", value: `$${Math.round(totalSumAgg._sum.amount || 0).toLocaleString()}` },
        { title: "الإيرادات الشهرية", value: `$${Math.round(monthlySumAgg._sum.amount || 0).toLocaleString()}` },
        { title: "نسبة المدفوعات الناجحة", value: `${successRate}%`, hint: "مقابل ${100-successRate}% فاشلة" },
        { title: "متوسط قيمة الدفع", value: `$${(avgAgg._avg.amount || 0).toFixed(1)}` },
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
    }

    if (type === "stocks") {
      const [total, active, inactive, avgPur, recommendCount] = await Promise.all([
        prisma.stock.count(),
        prisma.stock.count({ where: { active: true } }),
        prisma.stock.count({ where: { active: false } }),
        prisma.stock.aggregate({ _avg: { purificationPercentage: true } }),
        prisma.stock.count({ where: { recommendation: true } }),
      ])

      if (total === 0) {
        return NextResponse.json({ cards: [], charts: [] })
      }

      const recPct = Math.round((recommendCount / Math.max(total, 1)) * 100)

      const avgEpsAgg = await prisma.stock.aggregate({ _avg: { earningsPerShare: true, fairValue: true, returnOnPrice: true } })
      const perfStr = `ربحية ${(avgEpsAgg._avg.earningsPerShare ?? 0).toFixed(2)} / عادل ${(avgEpsAgg._avg.fairValue ?? 0).toFixed(1)} / عائد ${(avgEpsAgg._avg.returnOnPrice ?? 0).toFixed(1)}%`

      const cards = [
        { title: "عدد الأسهم المضافة", value: total.toString() },
        { title: "النشطة مقابل غير النشطة", value: `${active} / ${inactive}` },
        { title: "متوسط نسبة التطهير", value: `${(avgPur._avg.purificationPercentage ?? 0).toFixed(1)}%` },
        { title: "الموصى بالاحتفاظ بها", value: `${recPct}%` },
        { title: "تحليل الأداء المالي", value: perfStr },
      ]

      const charts = [
        {
          title: "متوسط نسبة التطهير",
          type: "line" as const,
          data: { labels, datasets: [{ label: "% التطهير", data: Array(labels.length).fill(Number((avgPur._avg.purificationPercentage ?? 0).toFixed(2))), backgroundColor: "#06b6d4" }] },
        },
        {
          title: "التوصيات",
          type: "pie" as const,
          data: { labels: ["احتفاظ", "غير ذلك"], datasets: [{ data: [recommendCount, Math.max(total - recommendCount, 0)], backgroundColor: ["#06b6d4", "#f59e0b"] }] },
        },
      ]

      return NextResponse.json({ cards, charts })
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 })
  } catch (err) {
    console.error("/api/admin/[type]/metrics GET error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
