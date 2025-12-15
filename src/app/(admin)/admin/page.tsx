"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronsUpDown, Gauge, Users, CreditCard, Package2, Receipt, LineChart } from "lucide-react"
import { cn } from "@/lib/utils"
import ChartCanvas from "@/components/features/admin/ChartCanvas"
import FadeReveal from "@/animations/FadeReveal"
import { useAdminMetrics } from "@/lib/admin/useAdminMetrics"
import { Spinner } from "@/components/ui/spinner"

const PERIODS = [
  { label: "يومي", value: "daily" },
  { label: "أسبوعي", value: "weekly" },
  { label: "شهري", value: "monthly" },
  { label: "سنوي", value: "yearly" },
  { label: "الكل", value: "all" },
] as const

const TYPES = [
  { label: "Users", value: "users", icon: Users },
  { label: "Subscriptions", value: "subscriptions", icon: CreditCard },
  { label: "Plans", value: "plans", icon: Package2 },
  { label: "Payments", value: "payments", icon: Receipt },
  { label: "Stocks", value: "stocks", icon: LineChart },
] as const

type TypeValue = typeof TYPES[number]["value"]

type Metric = { title: string; value: string; hint?: string }
type Section = "users" | "subscriptions" | "plans" | "payments" | "stocks"

const sectionColors: Record<Section, { bg: string; ring: string; text: string }> = {
  users: { bg: "bg-sky-50", ring: "ring-sky-200", text: "text-sky-700" },
  subscriptions: { bg: "bg-emerald-50", ring: "ring-emerald-200", text: "text-emerald-700" },
  plans: { bg: "bg-violet-50", ring: "ring-violet-200", text: "text-violet-700" },
  payments: { bg: "bg-green-50", ring: "ring-green-200", text: "text-green-700" },
  stocks: { bg: "bg-cyan-50", ring: "ring-cyan-200", text: "text-cyan-700" },
}

function MetricCard({ title, value, hint, section = "users" as Section }: Metric & { section?: Section }) {
  return (
    <Card className={cn(sectionColors[section].bg, sectionColors[section].ring, "ring-1 border-0") }>
      <CardHeader>
        <CardTitle className={cn("text-sm", sectionColors[section].text)}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", sectionColors[section].text)}>{value}</div>
        {hint ? <div className="text-xs mt-1 opacity-80">{hint}</div> : null}
      </CardContent>
    </Card>
  )
}

function getCharts(type: TypeValue, labels: string[]) {
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true }, tooltip: { enabled: true } },
    scales: { y: { beginAtZero: true } },
  }

  if (type === "users") {
    return [
      {
        title: "نمو المستخدمين",
        type: "line" as const,
        data: {
          labels,
          datasets: [{ label: "Users", data: labels.map((_, i) => 200 + i * 20 + (i % 2 ? 40 : 0)), backgroundColor: "#0ea5e9" }],
        },
        options: commonOptions,
      },
      {
        title: "توزيع الأدوار",
        type: "doughnut" as const,
        data: { labels: ["USER", "ADMIN", "ACCOUNTANT"], datasets: [{ data: [84, 10, 6], backgroundColor: ["#0ea5e9", "#7dd3fc", "#38bdf8"] }] },
        options: commonOptions,
      },
    ]
  }

  if (type === "subscriptions") {
    return [
      {
        title: "اشتراكات جديدة",
        type: "bar" as const,
        data: { labels, datasets: [{ label: "New", data: labels.map((_, i) => 10 + (i % 3) * 4), backgroundColor: "#10b981" }] },
        options: commonOptions,
      },
      {
        title: "نشطة vs منتهية",
        type: "pie" as const,
        data: { labels: ["نشطة", "منتهية/ملغاة"], datasets: [{ data: [420, 58], backgroundColor: ["#10b981", "#3b82f6"] }] },
        options: commonOptions,
      },
    ]
  }

  if (type === "plans") {
    return [
      {
        title: "إيرادات حسب الخطة",
        type: "bar" as const,
        data: { labels: ["Free", "Pro", "Business", "Enterprise"], datasets: [{ label: "Revenue", data: [0, 9800, 13500, 5150], backgroundColor: ["#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9"] }] },
        options: commonOptions,
      },
      {
        title: "متوسط السعر شهريًا",
        type: "line" as const,
        data: { labels, datasets: [{ label: "Avg Price", data: labels.map((_, i) => 10 + (i % 5)), backgroundColor: "#8b5cf6" }] },
        options: commonOptions,
      },
    ]
  }

  if (type === "payments") {
    return [
      {
        title: "الإيرادات",
        type: "line" as const,
        data: { labels, datasets: [{ label: "Revenue", data: labels.map((_, i) => 1000 + i * 250 + (i % 2 ? 300 : 0)), backgroundColor: "#22c55e" }] },
        options: commonOptions,
      },
      {
        title: "نسبة نجاح المدفوعات",
        type: "doughnut" as const,
        data: { labels: ["ناجحة", "فاشلة"], datasets: [{ data: [95, 5], backgroundColor: ["#22c55e", "#ef4444"] }] },
        options: commonOptions,
      },
    ]
  }

  return [
    {
      title: "متوسط نسبة التطهير",
      type: "line" as const,
      data: { labels, datasets: [{ label: "% التطهير", data: labels.map((_, i) => 2 + (i % 3) * 0.4), backgroundColor: "#06b6d4" }] },
      options: commonOptions,
    },
    {
      title: "التوصيات",
      type: "pie" as const,
      data: { labels: ["احتفاظ", "غير ذلك"], datasets: [{ data: [61, 39], backgroundColor: ["#06b6d4", "#f59e0b"] }] },
      options: commonOptions,
    },
  ]
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<typeof PERIODS[number]["value"]>("monthly")
  const [type, setType] = useState<TypeValue>("users")

  const metrics: Record<TypeValue, Metric[]> = useMemo(
    () => ({
      users: [
        { title: "إجمالي عدد المستخدمين", value: "1,240" },
        { title: "المستخدمون الجدد (آخر شهر)", value: "+120" },
        { title: "توزيع حسب الدور", value: "USER 84% / ADMIN 10% / ACCOUNTANT 6%" },
        { title: "معدل النمو الشهري", value: "+8%" },
      ],
      subscriptions: [
        { title: "الاشتراكات النشطة", value: "420" },
        { title: "المنتهية/الملغاة", value: "58" },
        { title: "الجديدة (آخر شهر)", value: "76" },
        { title: "أكثر خطة استخدامًا", value: "Pro" },
        { title: "نسبة التجديد اليدوي", value: "12%", hint: "renewedByAdmin" },
      ],
      plans: [
        { title: "عدد الخطط", value: "4" },
        { title: "أكثر خطة تحقيقًا للإيرادات", value: "Business" },
        { title: "متوسط سعر الاشتراك", value: "$14.3" },
        { title: "المستخدمون لكل خطة", value: "Free 600 / Pro 380 / Business 180 / Enterprise 80" },
      ],
      payments: [
        { title: "إجمالي الإيرادات", value: "$28,450" },
        { title: "الإيرادات الشهرية", value: "$6,120" },
        { title: "نسبة المدفوعات الناجحة", value: "95%" , hint: "مقابل 5% فاشلة"},
        { title: "متوسط قيمة الدفع", value: "$23.4" },
        { title: "أكثر المستخدمين دفعًا", value: "user_231, user_982" },
      ],
      stocks: [
        { title: "عدد الأسهم المضافة", value: "212" },
        { title: "النشطة مقابل غير النشطة", value: "180 / 32" },
        { title: "متوسط نسبة التطهير", value: "2.8%" },
        { title: "الموصى بالاحتفاظ بها", value: "61%" },
        { title: "تحليل الأداء المالي", value: "ربحية 1.12 / عادل 32.5 / عائد 4.6%" },
      ],
    }),
    []
  )

  const headerIcon = useMemo(() => {
    const entry = TYPES.find((t) => t.value === type)!
    const Icon = entry.icon
    return <Icon className="h-4 w-4" />
  }, [type])

  const labelsByPeriod = useMemo(() => {
    switch (period) {
      case "daily":
        return ["س", "٢", "٣", "٤", "٥", "٦", "٧"]
      case "weekly":
        return ["أسبوع ١", "أسبوع ٢", "أسبوع ٣", "أسبوع ٤"]
      case "yearly":
        return ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠", "١١", "١٢"]
      default:
        return ["ينا", "فبر", "مارس", "أبر", "ماي", "يون", "يول", "أغس", "سبت", "أكت", "نوف", "ديس"]
    }
  }, [period])

  const charts = useMemo(() => getCharts(type, labelsByPeriod), [type, labelsByPeriod])
  const { data: apiData, isLoading, isError } = useAdminMetrics(type, period)
  const hasApiNoData = !!apiData && (apiData.cards?.length === 0) && (apiData.charts?.length === 0)

  return (
    <div dir="rtl" className="space-y-4">
      <FadeReveal>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Gauge className="h-5 w-5" />
          <span>Analytics Dashboard</span>
        </div>
        <div className="ms-auto" />
        <FilterPopover
          label="المدة الزمنية"
          value={PERIODS.find((p) => p.value === period)?.label || ""}
          onSelect={(v) => setPeriod((PERIODS.find((p) => p.label === v)?.value || period))}
          options={PERIODS.map((p) => p.label)}
        />
        <FilterPopover
          label="نوع البيانات"
          value={TYPES.find((t) => t.value === type)?.label || ""}
          onSelect={(v) => setType((TYPES.find((t) => t.label === v)?.value || type))}
          options={TYPES.map((t) => t.label)}
          icon={headerIcon}
        />
      </div>
      </FadeReveal>

      <FadeReveal delay={0.05}>
        {isError && (
          <div className="text-sm text-red-600">حدث خطأ أثناء تحميل البيانات. سيتم عرض بيانات افتراضية.</div>
        )}
        {hasApiNoData ? (
          <div className="text-sm text-muted-foreground">ليس هناك معلومات بعد</div>
        ) : isLoading && !apiData ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Spinner /> <span>جاري التحميل...</span></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(apiData?.cards ?? metrics[type]).map((m) => (
              <MetricCard key={m.title} {...m} section={type as Section} />
            ))}
          </div>
        )}
      </FadeReveal>

      <FadeReveal delay={0.1}>
        {hasApiNoData ? (
          <div className="text-sm text-muted-foreground">ليس هناك معلومات بعد</div>
        ) : isLoading && !apiData ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Spinner /> <span>جاري تحميل الرسوم...</span></div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {(apiData?.charts ?? charts).map((c, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">{c.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartCanvas type={c.type} data={c.data} options={c.options} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </FadeReveal>
    </div>
  )
}

function FilterPopover({ label, value, options, onSelect, icon }: { label: string; value: string; options: string[]; onSelect: (v: string) => void; icon?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="min-w-[160px] justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className={cn("truncate", !value && "text-muted-foreground")}>{value || label}</span>
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[220px]" align="end">
        <Command>
          <CommandInput placeholder={label} />
          <CommandList>
            <CommandEmpty>لا يوجد نتائج</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem key={opt} value={opt} onSelect={(v) => { onSelect(v); setOpen(false) }} className="cursor-pointer">
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
