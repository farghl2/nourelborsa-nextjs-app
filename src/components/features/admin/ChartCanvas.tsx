"use client"

import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"

export type ChartKind = "line" | "bar" | "doughnut" | "pie"

type ChartJSLike = {
  labels: string[]
  datasets: { label?: string; data: number[]; borderColor?: string; backgroundColor?: string | string[] }[]
}

export default function ChartCanvas({
  type = "line",
  data,
  options,
  height = 260,
}: {
  type?: ChartKind
  data: ChartJSLike | any
  options?: any
  height?: number
}) {
  const styles = getComputedStyle(document.documentElement)
  const grid = (styles.getPropertyValue("--border") || "#e5e7eb").trim()
  const colors = [
    "#0ea5e9",
    "#22c55e",
    "#a855f7",
    "#ef4444",
    "#f59e0b",
    "#3b82f6",
  ]

  // Convert Chart.js-like structure to Recharts rows
  const toRows = (input: ChartJSLike) => {
    const rows = input.labels.map((label, i) => {
      const row: any = { label }
      input.datasets.forEach((ds, idx) => {
        row[ds.label || `d${idx + 1}`] = ds.data[i] ?? 0
      })
      return row
    })
    const keys = input.datasets.map((ds, idx) => ds.label || `d${idx + 1}`)
    const seriesColors = input.datasets.map((ds, idx) => (typeof ds.backgroundColor === "string" ? ds.backgroundColor : colors[idx % colors.length]))
    return { rows, keys, seriesColors }
  }

  const toPie = (input: ChartJSLike) => {
    const ds = input.datasets[0] || { data: [] as number[] }
    const parts = input.labels.map((name, i) => ({ name, value: ds.data[i] ?? 0 }))
    const fills: string[] = Array.isArray(ds.backgroundColor) ? ds.backgroundColor : colors
    return { parts, fills }
  }

  // If consumer already passes array rows, use as is
  const isChartJsLike = !!(data && (data as ChartJSLike).labels && (data as ChartJSLike).datasets)

  if ((type === "pie" || type === "doughnut") && isChartJsLike) {
    const { parts, fills } = toPie(data as ChartJSLike)
    return (
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={parts}
              dataKey="value"
              nameKey="name"
              innerRadius={type === "doughnut" ? 60 : 0}
              outerRadius={90}
            >
              {parts.map((_, i) => (
                <Cell key={i} fill={fills[i % fills.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if ((type === "line" || type === "bar") && isChartJsLike) {
    const { rows, keys, seriesColors } = toRows(data as ChartJSLike)
    return (
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              {keys.map((k, i) => (
                <Line key={k} type="monotone" dataKey={k} stroke={seriesColors[i]} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          ) : (
            <BarChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              {keys.map((k, i) => (
                <Bar key={k} dataKey={k} fill={seriesColors[i]} radius={4} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  }

  // Fallback: try to render pie with provided array
  if (type === "pie" || type === "doughnut") {
    const parts = Array.isArray(data) ? data : []
    const fills = colors
    return (
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie data={parts} dataKey="value" nameKey="name" innerRadius={type === "doughnut" ? 60 : 0} outerRadius={90}>
              {parts.map((_: any, i: number) => (
                <Cell key={i} fill={fills[i % fills.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="text-sm text-muted-foreground" style={{ height }}>
      لا يوجد مخطط متاح لهذا النوع.
    </div>
  )
}
