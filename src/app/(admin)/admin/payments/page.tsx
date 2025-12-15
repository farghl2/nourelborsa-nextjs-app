"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Plus, Receipt } from "lucide-react"
import AdminTable, { Column } from "@/components/features/admin/AdminTable"
import CrudModal, { FieldDef } from "@/components/features/admin/CrudModal"
import FadeReveal from "@/animations/FadeReveal"
import { Badge } from "@/components/ui/badge"
import { useAdminPayments } from "@/hooks/useAdminPayments"

export type PaymentRow = {
  id: string
  userEmail: string | null
  amount: number
  currency: string
  status: "SUCCEEDED" | "PENDING" | "FAILED"
  transactionId: string | null
  createdAt: string
}

export default function AdminPaymentsPage() {
  const { payments, loading, updatePayment, deletePayment } = useAdminPayments()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PaymentRow | null>(null)

  type UserOption = { email: string | null }
  const { data: users = [] } = useQuery<UserOption[]>({
    queryKey: ["admin-users-for-payments"],
    queryFn: async () => {
      const res = await fetch("/api/users")
      if (!res.ok) throw new Error("فشل في تحميل المستخدمين")
      const data = await res.json()
      return (data.users as any[]).map((u) => ({ email: u.email as string | null }))
    },
    staleTime: 60_000,
  })

  const columns: Column<PaymentRow>[] = useMemo(
    () => [
      { key: "userEmail", label: "البريد" },
      { key: "amount", label: "القيمة", render: (r) => `$${r.amount.toFixed(2)} ${r.currency.toUpperCase()}` },
      {
        key: "status",
        label: "الحالة",
        render: (r) =>
          r.status === "SUCCEEDED" ? (
            <Badge>ناجحة</Badge>
          ) : r.status === "FAILED" ? (
            <Badge variant="destructive">فاشلة</Badge>
          ) : (
            <Badge variant="secondary">قيد التنفيذ</Badge>
          ),
      },
      { key: "transactionId", label: "رقم العملية" },
      { key: "createdAt", label: "التاريخ", render: (r) => new Date(r.createdAt).toLocaleString() },
    ],
    [],
  )

  const fields: FieldDef[] = [
    {
      name: "userEmail",
      label: "بريد المستخدم",
      type: "select",
      options: users
        .filter((u) => !!u.email)
        .map((u) => ({ label: u.email as string, value: u.email as string })),
    },
    { name: "amount", label: "القيمة", type: "number", placeholder: "0" },
    { name: "currency", label: "العملة", type: "text", placeholder: "usd" },
    {
      name: "status",
      label: "الحالة",
      type: "select",
      options: [
        { label: "ناجحة", value: "SUCCEEDED" },
        { label: "قيد التنفيذ", value: "PENDING" },
        { label: "فاشلة", value: "FAILED" },
      ],
    },
    { name: "transactionId", label: "رقم العملية", placeholder: "اختياري" },
  ]

  const isEdit = !!editing
  function onEdit(row: PaymentRow) {
    setEditing(row)
    setOpen(true)
  }
  function onDelete(row: PaymentRow) {
    deletePayment(row.id)
  }
  function onSubmit(values: any) {
    const normalized = {
      userEmail: values.userEmail,
      amount: Number(values.amount),
      currency: values.currency || "usd",
      status: values.status as PaymentRow["status"],
      transactionId: values.transactionId || null,
    }

    if (!editing) return

    updatePayment(editing.id, {
      amount: normalized.amount,
      currency: normalized.currency,
      status: normalized.status,
      transactionId: normalized.transactionId,
    })
  }

  return (
    <div dir="rtl" className="space-y-4">
      <FadeReveal>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2"><Receipt className="h-5 w-5" /> المدفوعات</h1>
        </div>
      </FadeReveal>
      <FadeReveal delay={0.05}>
        <AdminTable
          title="قائمة المدفوعات"
          columns={columns}
          data={payments as PaymentRow[]}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </FadeReveal>

      <CrudModal<any>
        open={open}
        setOpen={setOpen}
        title={isEdit ? "تعديل دفعة" : "إضافة دفعة"}
        fields={fields}
        defaultValues={
          isEdit
            ? {
                userEmail: editing?.userEmail ?? "",
                amount: editing?.amount ?? 0,
                currency: editing?.currency ?? "usd",
                status: editing?.status ?? "PENDING",
                transactionId: editing?.transactionId ?? "",
              }
            : {
                userEmail: "",
                amount: 0,
                currency: "usd",
                status: "PENDING",
                transactionId: "",
              }
        }
        onSubmit={onSubmit}
      />
    </div>
  )
}
