export type ChartDef = { title: string; type: "line" | "bar" | "pie" | "doughnut"; data: any; options?: any }
export type MetricCard = { title: string; value: string; hint?: string }
export type MetricsResponse = { cards: MetricCard[]; charts: ChartDef[] }

export async function fetchAdminMetrics(type: string, period: string): Promise<MetricsResponse> {
  const res = await fetch(`/api/admin/${encodeURIComponent(type)}/metrics?period=${encodeURIComponent(period)}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || "Failed to load metrics")
  }
  return res.json()
}
