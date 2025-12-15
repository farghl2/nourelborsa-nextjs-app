"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchAdminStocks, createAdminStock, updateAdminStock, deleteAdminStock, toggleAdminStockActive, getStockBy } from "@/lib/services/stocks"
import type { CreateStockInput, UpdateStockInput } from "@/lib/validations/stock"

export type AdminStockRow = UpdateStockInput & { id: string;  updatedAt: Date }

export function useAdminStocks(id?: string) {
  const queryClient = useQueryClient()

  const {
    data: stocks = [],
    isLoading,
  } = useQuery<AdminStockRow[]>({
    queryKey: ["admin-stocks"],
    queryFn: async () => {
      try {
        return await fetchAdminStocks()
      } catch (err: any) {
        toast.error(err?.message || "فشل في تحميل الأسهم")
        throw err
      }
    },
    staleTime: 60_000,
  })
  const {
    data: stock,
    isLoading: stockLoading,
  } = useQuery<AdminStockRow | undefined>({
    queryKey: ["stock", id],
    queryFn: async ({ queryKey }) => {
      const [_key, stockId] = queryKey
      try {
        return await getStockBy(stockId as string)
      } catch (err: any) {
        toast.error(err?.message || "فشل في تحميل الأسهم")
        throw err
      }
    },
    enabled: Boolean(id),
    staleTime: 60_000,
  })

  const createMutation = useMutation({
    mutationKey: ["admin-stocks-create"],
    mutationFn: async (input: CreateStockInput) => {
      return createAdminStock(input)
    },
    onSuccess: (created) => {
      queryClient.setQueryData<AdminStockRow[]>(["admin-stocks"], (old) => {
        if (!old) return [created]
        return [created, ...old]
      })
      toast.success("تم إنشاء السهم بنجاح")
    },
    onError: (err: any) => {
      toast.error(err?.message || "حدث خطأ أثناء إنشاء السهم")
    },
  })

  const updateMutation = useMutation({
    mutationKey: ["admin-stocks-update",id],
    mutationFn: async ({ id, input }: { id: string; input: UpdateStockInput }) => {
      const currentData = queryClient.getQueryData<AdminStockRow[]>(["admin-stocks"])?.find(s => s.id === id);
      return updateAdminStock(id, input, currentData);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminStockRow[]>(["admin-stocks"], (old) => {
        if (!old) return [updated];
        return old.map((s) => (s.id === updated.id ? updated : s));
      });
      toast.success("تم تحديث السهم بنجاح");
    },
    onError: (err: any) => {
      // Don't show error if there were no changes
      if (err.message !== 'لا توجد تغييرات لحفظها') {
        toast.error(err?.message || "حدث خطأ أثناء تحديث السهم");
      }
    },
  })

  const deleteMutation = useMutation({
    mutationKey: ["admin-stocks-delete", id],
    mutationFn: async (id: string) => {
      await deleteAdminStock(id)
      return id
    },
    onSuccess: (id) => {
      queryClient.setQueryData<AdminStockRow[]>(["admin-stocks"], (old) => {
        if (!old) return []
        return old.filter((s) => s.id !== id)
      })
      toast.success("تم حذف السهم بنجاح")
    },
    onError: (err: any) => {
      toast.error(err?.message || "حدث خطأ أثناء حذف السهم")
    },
  })

  const toggleActiveMutation = useMutation({
    mutationKey: ["admin-stocks-toggle-active",id],
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const currentData = queryClient.getQueryData<AdminStockRow[]>(["admin-stocks"])?.find(s => s.id === id);
      return toggleAdminStockActive(id, active, currentData);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminStockRow[]>(["admin-stocks"], (old) => {
        if (!old) return [updated];
        return old.map((s) => (s.id === updated.id ? updated : s));
      });
      toast.success("تم تغيير حالة السهم بنجاح");
    },
    onError: (err: any) => {
      // Don't show error if the state didn't change
      if (err.message !== 'حالة السهم لم تتغير') {
        toast.error(err?.message || "حدث خطأ أثناء تغيير حالة السهم");
      }
    },
  })

  const createStock = (input: CreateStockInput) =>
    createMutation.mutateAsync(input)

  const updateStock = (id: string, input: UpdateStockInput) =>{

    updateMutation.mutateAsync({ id, input })
  }

  const deleteStock = (id: string) =>{

    deleteMutation.mutateAsync(id)
  }

  const toggleStockActive = (id: string, active: boolean) =>{
    toggleActiveMutation.mutateAsync({ id, active })
   
  }

  return {
    stocks,
    stock,
    loading:
      isLoading ||
      stockLoading ||
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      toggleActiveMutation.isPending,
    createStock,
    updateStock,
    deleteStock,
    toggleStockActive,
  }
}
