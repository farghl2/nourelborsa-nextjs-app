"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchAdminPayments, updateAdminPayment, deleteAdminPayment, type AdminPayment } from "@/lib/services/payments"

export function useAdminPayments() {
  const queryClient = useQueryClient()

  const {
    data: payments = [],
    isLoading,
  } = useQuery<AdminPayment[]>({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      try {
        return await fetchAdminPayments()
      } catch (err: any) {
        toast.error(err?.message || "فشل في تحميل المدفوعات")
        throw err
      }
    },
    staleTime: 60_000,
  })



  const updateMutation = useMutation({
    mutationKey: ["admin-payments-update"],
    mutationFn: async ({ id, input }: { id: string; input: Partial<{ amount: number; currency: string; status: "SUCCEEDED" | "PENDING" | "FAILED"; transactionId?: string | null }> }) => {
      return updateAdminPayment(id, input)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminPayment[]>(["admin-payments"], (old) => {
        if (!old) return [updated]
        return old.map((p) => (p.id === updated.id ? updated : p))
      })
      toast.success("تم تحديث الدفعة بنجاح")
    },
    onError: (err: any) => {
      toast.error(err?.message || "حدث خطأ أثناء تحديث الدفعة")
    },
  })

  const deleteMutation = useMutation({
    mutationKey: ["admin-payments-delete"],
    mutationFn: async (id: string) => {
      await deleteAdminPayment(id)
      return id
    },
    onSuccess: (id) => {
      queryClient.setQueryData<AdminPayment[]>(["admin-payments"], (old) => {
        if (!old) return []
        return old.filter((p) => p.id !== id)
      })
      toast.success("تم حذف الدفعة بنجاح")
    },
    onError: (err: any) => {
      toast.error(err?.message || "حدث خطأ أثناء حذف الدفعة")
    },
  })

 
  const updatePayment = (id: string, input: Partial<{ amount: number; currency: string; status: "SUCCEEDED" | "PENDING" | "FAILED"; transactionId?: string | null }>) =>
    updateMutation.mutateAsync({ id, input })

  const deletePayment = (id: string) => deleteMutation.mutateAsync(id)

  return {
    payments,
    loading:
      isLoading ||
      updateMutation.isPending ||
      deleteMutation.isPending,

    updatePayment,
    deletePayment,
  }
}
