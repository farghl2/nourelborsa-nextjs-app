"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

export type Column<T> = {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
}

export default function AdminTable<T extends { id: string | number }>({
  title,
  columns,
  data,
  onEdit,
  onDelete,
  topRight,
}: {
  title: string
  columns: Column<T>[]
  data: T[]
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  topRight?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">{topRight}</div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((c) => (
                  <th key={String(c.key)} className="px-3 py-2 text-start font-medium whitespace-nowrap">
                    {c.label}
                  </th>
                ))}
                {(onEdit || onDelete) && <th className="px-3 py-2 text-start font-medium">إجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={String(row.id)} className="border-b last:border-0">
                  {columns.map((c) => (
                    <td key={String(c.key)} className="px-3 py-2 align-middle whitespace-nowrap">
                      {c.render ? c.render(row) : (row as any)[c.key as string]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {onEdit && (
                          <Button variant="outline" size="icon" onClick={() => onEdit(row)} aria-label="تعديل">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button variant="destructive" size="icon" onClick={
                            () =>{
                              const confirm = window.confirm("هل انت متأكد من الحذف ؟")
                              if(!confirm)return
                              onDelete(row)
                            }
                            } aria-label="حذف">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
