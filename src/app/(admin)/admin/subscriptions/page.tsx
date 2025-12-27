"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { CreditCard, RefreshCcw } from "lucide-react"
import AdminTable, { Column } from "@/components/features/admin/AdminTable"
import CrudModal, { FieldDef } from "@/components/features/admin/CrudModal"
import FadeReveal from "@/animations/FadeReveal"
import { Badge } from "@/components/ui/badge"
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions"
import { subscriptionAdminFormSchema, subscriptionAdminCreateFormSchema } from "@/lib/validations/subscription"

export type SubscriptionRow = {
  id: string
  userEmail: string
  plan: string
  status: "ACTIVE" | "CANCELLED" | "EXPIRED"
  renewedByAdmin?: boolean
}

export default function AdminSubscriptionsPage() {
  const { subscriptions, loading, updateSubscription, createSubscription ,deleteSubscription} = useAdminSubscriptions()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SubscriptionRow | null>(null)

  type PlanOption = { id: string; name: string }
  const { data: plans = [] } = useQuery<PlanOption[]>({
    queryKey: ["admin-subscription-plans"],
    queryFn: async () => {
      const res = await fetch("/api/subscription-plans")
      if (!res.ok) throw new Error("فشل في تحميل الباقات")
      const data = await res.json()
      return (data.plans as any[]).map((p) => ({ id: p.id as string, name: p.name as string }))
    },
    staleTime: 60_000,
  })

  type UserOption = { email: string | null }
  const { data: users = [] } = useQuery<UserOption[]>({
    queryKey: ["admin-users-for-subscriptions"],
    queryFn: async () => {
      const res = await fetch("/api/users")
      if (!res.ok) throw new Error("فشل في تحميل المستخدمين")
      const data = await res.json()
      return (data.users as any[]).map((u) => ({ email: u.email as string | null }))
    },
    staleTime: 60_000,
  })

  const isEdit = !!editing

  const columns: Column<SubscriptionRow>[] = useMemo(() => [
    { key: "userEmail", label: "البريد" },
    { key: "plan", label: "الخطة" },
    {
      key: "status",
      label: "الحالة",
      render: (r) => (
        r.status === "ACTIVE"
          ? <Badge>نشطة</Badge>
          : r.status === "CANCELLED"
            ? <Badge variant="destructive">ملغاة</Badge>
            : <Badge variant="secondary">منتهية</Badge>
      ),
    },
    {
      key: "renewedByAdmin",
      label: "تجديد يدوي",
      render: (r) => (r.renewedByAdmin ? <RefreshCcw className="h-4 w-4 text-green-600" /> : "—"),
    },
  ], [])

  const editFields: FieldDef[] = [
    {
      name: "status",
      label: "الحالة",
      type: "select",
      options: [
        { label: "نشطة", value: "ACTIVE" },
        { label: "ملغاة", value: "CANCELLED" },
        { label: "منتهية", value: "EXPIRED" },
      ],
    },
    {
      name: "renewedByAdmin",
      label: "تجديد بواسطة الأدمن؟",
      type: "switch",
    },
  ]

  const createFields: FieldDef[] = [
    {
      name: "userEmail",
      label: "بريد المستخدم",
      type: "select",
      options: users
        .filter((u) => !!u.email)
        .map((u) => ({ label: u.email?.slice(0, 20) as string, value: u.email as string })),
    },
    {
      name: "planId",
      label: "الخطة",
      type: "select",
      options: plans.map((p) => ({ label: p.name, value: p.id })),
    },
    ...editFields,
  ]

  const fields: FieldDef[] = isEdit ? editFields : createFields

  function onCreate() {
    setEditing(null)
    setOpen(true)
  }

  function onEdit(row: SubscriptionRow) {
    setEditing(row)
    setOpen(true)
  }

  function onDelete(row: SubscriptionRow) {
   deleteSubscription(row.id)
  }

  function onSubmit(values: any) {
    if (editing) {
      const input = {
        status: values.status,
        renewedByAdmin: !!values.renewedByAdmin,
      }
      updateSubscription(editing.id, input)
    } else {
      const input = {
        userEmail: values.userEmail,
        planId: values.planId,
        status: values.status,
        renewedByAdmin: !!values.renewedByAdmin,
      }
      createSubscription(input)
    }
  }

  return (
    <div dir="rtl" className="space-y-4">
      <FadeReveal>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2"><CreditCard className="h-5 w-5" /> الاشتراكات</h1>
          <Button onClick={onCreate} className="flex items-center gap-2">إضافة اشتراك</Button>
        </div>
      </FadeReveal>
      <FadeReveal delay={0.05}>
        <AdminTable
          title="قائمة الاشتراكات"
          columns={columns}
          data={subscriptions as SubscriptionRow[]}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </FadeReveal>

      <CrudModal<any>
        open={open}
        setOpen={setOpen}
        title={isEdit ? "تعديل اشتراك" : "إضافة اشتراك"}
        schema={isEdit ? subscriptionAdminFormSchema : subscriptionAdminCreateFormSchema}
        fields={fields}
        defaultValues={
          isEdit
            ? {
                status: editing?.status ?? "ACTIVE",
                renewedByAdmin: editing?.renewedByAdmin ? true : false,
              }
            : {
                userEmail: "",
                planId: plans[0]?.id ?? "",
                status: "ACTIVE",
                renewedByAdmin: false,
              }
        }
        onSubmit={onSubmit}
      />
    </div>
  )
}
