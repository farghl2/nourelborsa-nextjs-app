"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, LineChart, Search } from "lucide-react"
import AdminTable, { Column } from "@/components/features/admin/AdminTable"
import CrudModal, { FieldDef } from "@/components/features/admin/CrudModal"
import FadeReveal from "@/animations/FadeReveal"
import { Badge } from "@/components/ui/badge"
import { useAdminStocks, type AdminStockRow } from "@/hooks/useAdminStocks"
import { createStockSchema, updateStockSchema, type CreateStockInput, type UpdateStockInput } from "@/lib/validations/stock"

export type StockRow = AdminStockRow

// Helper function to convert category string to display label
const categoryToLabel = (category: string | null | undefined): string => {
  if (!category) return "—";
  
  switch (category) {
    case "less_than_5": return "اقل من 5%";
    case "more_than_5": return "اكبر من 5%";
    case "less_than_10": return "اقل من 10%";
    case "more_than_10": return "اكبر من 10%";
    default: return category;
  }
};

// No longer needed - remove the number to category conversion
// const numberToProhibitedRevenueCategory = ...

export default function AdminStocksPage() {

  const { stocks, loading, createStock, updateStock, deleteStock, toggleStockActive } = useAdminStocks()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<StockRow | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const columns: Column<StockRow>[] = useMemo(() => [
    { key: "symbol", label: "الرمز" },
    { key: "name", label: "الاسم" },
    {
      key: "price",
      label: "السعر",
      render: (r) => (r.price != null ? r.price.toFixed(2) : "—"),
    },
    {
      key: "prohibitedRevenuePercentage",
      label: "نسبة الإيرادات المحرمة",
      render: (r) => categoryToLabel(r.prohibitedRevenuePercentage),
    },
    {
      key: "fairValue",
      label: "القيمة العادلة",
      render: (r) => (r.fairValue != null ? r.fairValue.toFixed(2) : "—"),
    },
    {
      key: "returnOnPrice",
      label: "العائد على السعر",
      render: (r) => (r.returnOnPrice != null ? r.returnOnPrice.toFixed(2) : "—"),
    },
    {
      key: "purificationPercentage",
      label: "نسبة التطهير (%)",
      render: (r) =>
        r.purificationPercentage != null
          ? `${r.purificationPercentage.toFixed(2)}%`
          : "—",
    },
     {
      key: "active",
      label: "الحالة",
      render: (r) => (
        r.active?(
        <Badge className="bg-green-600">نشط</Badge>
        ) : (
          <Badge variant="destructive">غير نشط</Badge>
        )
      ),
    },
    {
      key: "recommendation",
      label: "التوصية",
      render: (r) =>
        r.recommendation ? (
          <Badge className="bg-green-600">احتفاظ</Badge>
        ) : (
          <Badge variant="destructive">لا</Badge>
        ),
    },
    {
      key: "updatedAt",
      label: "آخر تحديث",
      render: (r) => {
  const d = new Date(r.updatedAt);
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
    }
  ], [toggleStockActive])

  // Filter stocks based on search query
  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return stocks
    
    const query = searchQuery.toLowerCase()
    return stocks.filter(stock => 
      stock.symbol?.toLowerCase().includes(query) ||
      stock.name?.toLowerCase().includes(query) ||
      stock.description?.toLowerCase().includes(query)
    )
  }, [stocks, searchQuery])

  const fields: FieldDef[] = [
    { name: "symbol", label: "الرمز", placeholder: "AAPL" },
    { name: "name", label: "الاسم", placeholder: "Apple" },
    { name: "price", label: "السعر", type: "number", placeholder: "0" },
    { name: "description", label: "الوصف", placeholder: "وصف مختصر" },
    { name: "companyActivity", label: "نشاط الشركة", placeholder: "نشاط الشركة" },
    {
      name: "active",
      label: "نشط؟",
      type: "switch",
    },
    {
      name: "prohibitedRevenuePercentage",
      label: "الدخل المحظور - الخيار الأول (%)",
      type: "select",
      options: [
        { label: "اقل من 5%", value: "less_than_5" },
        { label: "اكبر من 5%", value: "more_than_5" },
       
      ],
    },
    {
      name: "prohibitedRevenuePercentageSecondary",
      label: "الدخل المحظور - الخيار الثاني (%)",
      type: "select",
      options: [
        { label: "لا يوجد", value: "" },
        { label: "اقل من 10%", value: "less_than_10" },
        { label: "اكبر من 10%", value: "more_than_10" },
      ],
    },
    {
      name: "interestBearingLoansPercentage",
      label: "نسبة القروض الربوية (%)",
      type: "number",
      placeholder: "0",
    },
    {
      name: "interestBearingDepositsPercentage",
      label: "نسبة الودائع الربوية (%)",
      type: "number",
      placeholder: "0",
    },
    {
      name: "assetsPercentage",
      label: "نسبة الأصول المحرمة (%)",
      type: "number",
      placeholder: "0",
    },
    {
      name: "totalAssets",
      label: "إجمالي الأصول",
      type: "number",
      placeholder: "0",
    },
    {
      name: "marketCapitalization",
      label: "القيمة السوقية",
      type: "number",
      placeholder: "0",
    },
    {
      name: "fairValue",
      label: "القيمة العادلة",
      type: "number",
      placeholder: "0",
    },
    {
      name: "returnOnPrice",
      label: "العائد على السعر",
      type: "number",
      placeholder: "0",
    },
    {
      name: "purificationPercentage",
      label: "نسبة التطهير (%)",
      type: "number",
      placeholder: "0",
    },
    {
      name: "durationDays",
      label: "مدة التوصية (أيام)",
      type: "number",
      placeholder: "30",
    },
    {
      name: "earningsPerShare",
      label: "ربحية السهم",
      type: "number",
      placeholder: "0",
    },
    {
      name: "expectedFairValueNextYear",
      label: "القيمة العادلة المتوقعة للسنة القادمة",
      type: "number",
      placeholder: "0",
    },
    {
      name: "expectedEarningsPerShare",
      label: "ربحية السهم المتوقعة",
      type: "number",
      placeholder: "0",
    },
    {
      name: "recommendation",
      label: "نوصي بالاحتفاظ؟",
      type: "switch",
    },
  ]

  const isEdit = !!editing

  function onCreate() { setEditing(null); setOpen(true) }
  function onEdit(row: StockRow) { setEditing(row); setOpen(true) }
  function onDelete(row: StockRow) { deleteStock(row.id) }

  async function onSubmit(values: CreateStockInput | UpdateStockInput) {
    if (isEdit && editing) {
      await updateStock(editing.id, values as UpdateStockInput)
    } else {
      await createStock(values as CreateStockInput)
    }
  }

  return (
    <div dir="rtl" className="space-y-4">
      <FadeReveal>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2"><LineChart className="h-5 w-5" /> الأسهم</h1>
          <Button onClick={onCreate} className="flex items-center gap-2" disabled={loading}>
            <Plus className="h-4 w-4" /> إضافة سهم
          </Button>
        </div>
      </FadeReveal>
      <FadeReveal delay={0.05}>
        <AdminTable
          title="قائمة الأسهم"
          columns={columns}
          data={filteredStocks as StockRow[]}
          onEdit={onEdit}
          onDelete={onDelete}
          topRight={
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن سهم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
          }
        />
      </FadeReveal>

      <CrudModal<any>
        open={open}
        setOpen={setOpen}
        title={editing ? "تعديل سهم" : "إضافة سهم"}
        schema={isEdit ? updateStockSchema : createStockSchema}
        fields={fields}
        defaultValues={
          editing
            ? {
                ...editing,
                active: editing.active ? true : false,
                recommendation: editing.recommendation ? true : false,
                prohibitedRevenuePercentage: editing.prohibitedRevenuePercentage || "less_than_5",
                prohibitedRevenuePercentageSecondary: (editing as any).prohibitedRevenuePercentageSecondary || "",
              }
            : {
                symbol: "",
                name: "",
                price: 0,
                description: "",
                companyActivity: "",
                active: false,
                prohibitedRevenuePercentage: "less_than_5",
                prohibitedRevenuePercentageSecondary: "",
                interestBearingLoansPercentage: undefined,
                interestBearingDepositsPercentage: undefined,
                assetsPercentage: undefined,
                totalAssets: undefined,
                marketCapitalization: undefined,
                fairValue: undefined,
                returnOnPrice: undefined,
                purificationPercentage: undefined,
                durationDays: undefined,
                earningsPerShare: undefined,
                expectedFairValueNextYear: undefined,
                expectedEarningsPerShare: undefined,
                recommendation: false,
              }
        }
        onSubmit={onSubmit}
      />
    </div>
  )
}
