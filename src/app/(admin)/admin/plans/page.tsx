"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Package2 } from "lucide-react"
import AdminTable, { Column } from "@/components/features/admin/AdminTable"
import CrudModal, { FieldDef } from "@/components/features/admin/CrudModal"
import FadeReveal from "@/animations/FadeReveal"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAdminPlans } from "@/hooks/useAdminPlans"
import { createSubscriptionPlanSchema, updateSubscriptionPlanSchema } from "@/lib/validations/subscription"
import type { AdminPlan } from "@/lib/services/plans"

export type PlanRow = AdminPlan

export default function AdminPlansPage() {

  const { plans, loading, createPlan, updatePlan, deletePlan, togglePlanActive } = useAdminPlans()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PlanRow | null>(null)

  const columns: Column<PlanRow>[] = useMemo(() => [
    { key: "name", label: "الخطة" },
    { key: "price", label: "السعر", render: (r) => `${r.price}` },
    { key: "durationDays", label: "المدة (يوم)" },
    {
      key: "active",
      label: "مفعلة",
      render: (r) => (
        <Switch dir="ltr" className="cursor-pointer"
          checked={r.active}
          onCheckedChange={(val) => togglePlanActive(r.id, !!val)}
        />
      ),
    },
  ], [togglePlanActive])

  const fields: FieldDef[] = [
    { name: "name", label: "الاسم", placeholder: "اسم الخطة" },
    { name: "description", label: "الوصف", placeholder: "وصف الباقة" },
    { name: "price", label: "السعر", type: "number", placeholder: "0" },
    { name: "durationDays", label: "المدة بالأيام", type: "number", placeholder: "30" },
    { name: "purificationLimit", label: "حد مرات التطهير", type: "number", placeholder: "0" },
    {
      name: "active",
      label: "مفعلة؟",
      type: "switch",
    },
    {
      name: "allowedStocks",
      label: "مسموح بتحليلات الأسهم؟",
      type: "switch",
    },
    {
      name: "features",
      label: "المميزات",
      type: "array",
      itemType: "string",
      placeholder: "مثال: دعم 24 ساعة",
      itemPlaceholder: "أضف ميزة جديدة"
    }
  ]

  const isEdit = !!editing
  const schema = isEdit ? updateSubscriptionPlanSchema : createSubscriptionPlanSchema

  function onCreate() { setEditing(null); setOpen(true) }
  function onEdit(row: PlanRow) { setEditing(row); setOpen(true) }
  function onDelete(row: PlanRow) { deletePlan(row.id) }
  async function onSubmit(values: any) {
    // Ensure features is always an array and remove empty strings
    const processedValues = {
      ...values,
      features: Array.isArray(values.features) 
        ? values.features.filter((f: string) => f.trim() !== '')
        : [],
    };
    
    if (isEdit && editing) {
      await updatePlan(editing.id, processedValues);
    } else {
      console.log('values', processedValues)
      await createPlan(processedValues);
    }
  }

  return (
    <div dir="rtl" className="space-y-4">
      <FadeReveal>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2"><Package2 className="h-5 w-5" /> الخطط</h1>
          <Button onClick={onCreate} className="flex items-center gap-2" disabled={loading}>
            <Plus className="h-4 w-4" /> إضافة خطة
          </Button>
        </div>
      </FadeReveal>
      <FadeReveal delay={0.05}>
        <AdminTable
          title="قائمة الخطط"
          columns={columns}
          data={plans as PlanRow[]}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </FadeReveal>

      <CrudModal<any>
        open={open}
        setOpen={setOpen}
        title={isEdit ? `تعديل ${editing?.name}` : 'إضافة خطة جديدة'}
        schema={schema}
        fields={fields}
        defaultValues={{
          ...editing,
          features: editing?.features || [],
          active: editing?.active ?? true,
          durationDays: editing?.durationDays || 30,
          purificationLimit: editing?.purificationLimit || 0
        }}
        onSubmit={onSubmit}
      />
    </div>
  )
}
