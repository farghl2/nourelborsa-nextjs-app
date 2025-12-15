"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserRound } from "lucide-react"
import AdminTable, { Column } from "@/components/features/admin/AdminTable"
import CrudModal, { FieldDef } from "@/components/features/admin/CrudModal"
import FadeReveal from "@/animations/FadeReveal"
import { useUpdateUserRole } from "@/hooks/useUpdateUserRole"
import { updateUserRoleSchema } from "@/lib/validations/user"

export type UserRow = { id: string; name: string | null; email: string | null; role: "USER"|"ADMIN"|"ACCOUNTANT" }

export default function AdminUsersPage() {
  const { users, loading, updateRole } = useUpdateUserRole()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const columns: Column<UserRow>[] = useMemo(() => [
    { key: "name", label: "الاسم" },
    { key: "email", label: "البريد" },
    { key: "role", label: "الدور" },
  ], [])

  const fields: FieldDef[] = [
    { name: "role", label: "الدور", type: "select", options: [
      { label: "USER", value: "USER" },
      { label: "ADMIN", value: "ADMIN" },
      { label: "ACCOUNTANT", value: "ACCOUNTANT" },
    ] },
  ]

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return users as UserRow[]
    return (users as UserRow[]).filter((u) => {
      const name = (u.name || "").toLowerCase()
      const email = (u.email || "").toLowerCase()
      return name.includes(term) || email.includes(term)
    })
  }, [users, searchTerm])

  function onEdit(row: UserRow) { setEditing(row); setOpen(true) }
  function onDelete(_row: UserRow) { /* deletion not implemented yet */ }

  function onSubmit(values: any) {
    if (!editing) return
    updateRole(editing.id, { role: values.role })
  }

  return (
    <div dir="rtl" className="space-y-4">
      <FadeReveal>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2"><UserRound className="h-5 w-5" /> المستخدمون</h1>
          <Button disabled className="flex items-center gap-2 opacity-60 cursor-not-allowed">إضافة مستخدم</Button>
        </div>
      </FadeReveal>
      <FadeReveal delay={0.05}>
        <AdminTable
          title="قائمة المستخدمين"
          columns={columns}
          data={filteredUsers}
          onEdit={onEdit}
          onDelete={onDelete}
          topRight={(
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">بحث:</span>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم أو البريد"
                className="h-8 w-56"
              />
            </div>
          )}
        />
      </FadeReveal>

      <CrudModal<Partial<UserRow>>
        open={open}
        setOpen={setOpen}
        title={editing ? "تعديل دور المستخدم" : "تعديل مستخدم"}
        schema={updateUserRoleSchema}
        fields={fields}
        defaultValues={editing || undefined}
        onSubmit={onSubmit}
      />
    </div>
  )
}
