"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchAdminPlans, createAdminPlan, updateAdminPlan, deleteAdminPlan, toggleAdminPlanActive, type AdminPlan } from "@/lib/services/plans"
import type { CreateSubscriptionPlanInput, UpdateSubscriptionPlanInput } from "@/lib/validations/subscription"

export function useAdminPlans() {
  const queryClient = useQueryClient()

  const {
    data: plans = [],
    isLoading,
  } = useQuery<AdminPlan[]>({
    queryKey: ["admin-plans"],
    queryFn: async () => {
      try {
        return await fetchAdminPlans()
      } catch (err: any) {
        toast.error(err?.message || "فشل في تحميل الباقات")
        throw err
      }
    },
    staleTime: 60_000,
  })

  const createMutation = useMutation({
    mutationKey: ["admin-plans-create"],
    mutationFn: async (input: CreateSubscriptionPlanInput) => {
      return createAdminPlan(input)
    },
    onSuccess: (created) => {
      queryClient.setQueryData<AdminPlan[]>(["admin-plans"], (old) => {
        if (!old) return [created]
        return [created, ...old]
      })
      toast.success("تم إنشاء الباقة بنجاح")
    },
    onError: (err: any) => {
      toast.error(err?.message || "حدث خطأ أثناء إنشاء الباقة")
    },
  })

  const updateMutation = useMutation({
    mutationKey: ["admin-plans-update"],
    mutationFn: async ({ id, input }: { id: string; input: UpdateSubscriptionPlanInput }) => {
      return updateAdminPlan(id, input)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminPlan[]>(["admin-plans"], (old) => {
        if (!old) return [updated]
        return old.map((p) => (p.id === updated.id ? updated : p))
      })
      toast.success("تم تحديث الباقة بنجاح")
    },
    onError: (err: any) => {
      toast.error(err?.message || "حدث خطأ أثناء تحديث الباقة")
    },
  })

  const deleteMutation = useMutation({
    mutationKey: ["admin-plans-delete"],
    mutationFn: async (id: string) => {
      await deleteAdminPlan(id)
      return id
    },
    onSuccess: (id) => {
      queryClient.setQueryData<AdminPlan[]>(["admin-plans"], (old) => {
        if (!old) return []
        return old.filter((p) => p.id !== id)
      })
      toast.success("تم حذف الباقة بنجاح")
    },
    onError: (err: any) => {
      toast.error(err?.message || "حدث خطأ أثناء حذف الباقة")
    },
  })

  const toggleActiveMutation = useMutation({
    mutationKey: ["admin-plans-toggle-active"],
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      return toggleAdminPlanActive(id, active)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminPlan[]>(["admin-plans"], (old) => {
        if (!old) return [updated]
        return old.map((p) => (p.id === updated.id ? updated : p))
      })
    },
    onError: (err: any) => {
      toast.error(err?.message || "حدث خطأ أثناء تغيير حالة الباقة")
    },
  })

  const createPlan = (input: CreateSubscriptionPlanInput) => {
    createMutation.mutateAsync(input)
    
  }

  const updatePlan = (id: string, input: UpdateSubscriptionPlanInput) => {
    updateMutation.mutateAsync({ id, input })
    
  }

  const deletePlan = (id: string) => {
    deleteMutation.mutateAsync(id)
   
  }

  const togglePlanActive = (id: string, active: boolean) => {
    toggleActiveMutation.mutateAsync({ id, active })
    toast.success("تم تغيير حالة الباقة بنجاح")
  }


  return {
    plans,
    loading:
      isLoading ||
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      toggleActiveMutation.isPending,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanActive,
  }
}
