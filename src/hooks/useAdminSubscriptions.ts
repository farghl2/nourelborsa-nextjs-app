"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchAdminSubscriptions, updateAdminSubscription, createAdminSubscription, deleteAdminSubscription, type AdminSubscription } from "@/lib/services/subscription"
import type { CreateSubscriptionAdminInput, UpdateSubscriptionAdminInput } from "@/lib/validations/subscription"

export function useAdminSubscriptions() {
  const queryClient = useQueryClient()

  const {
    data: subscriptions = [],
    isLoading,
  } = useQuery<AdminSubscription[]>({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      try {
        return await fetchAdminSubscriptions()
      } catch (err: any) {
        toast.error(err?.message || "فشل في تحميل الاشتراكات")
        throw err
      }
    },
    staleTime: 60_000,
  })

  const deleteMutation = useMutation({
    mutationKey: ["admin-subscriptions-delete"],
    mutationFn: async (id: string) => {
      await deleteAdminSubscription(id)
      return id
    },
    onSuccess: (id) => {
      queryClient.setQueryData<AdminSubscription[]>(["admin-subscriptions"], (old) => {
        if (!old) return []
        return old.filter((s) => s.id !== id)
      })
      toast.success("تم حذف الاشتراك بنجاح")
    },
    onError: (err: any) => {
      toast.error(err?.message || "حدث خطأ أثناء حذف الاشتراك")
    },
  })

  const updateMutation = useMutation({
    mutationKey: ["admin-subscriptions-update"],
    mutationFn: async ({ id, input }: { id: string; input: UpdateSubscriptionAdminInput }) => {
      return updateAdminSubscription(id, input)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminSubscription[]>(["admin-subscriptions"], (old) => {
        if (!old) return [updated]
        return old.map((s) => (s.id === updated.id ? updated : s))
      })
      toast.success("تم تحديث الاشتراك بنجاح")
    },
    onError: (err: any) => {
      toast.error(err?.message || "حدث خطأ أثناء تحديث الاشتراك")
    },
  })

  const createMutation = useMutation({
    mutationKey: ["admin-subscriptions-create"],
    mutationFn: async (input: CreateSubscriptionAdminInput) => {
      return createAdminSubscription(input)
    },
    onSuccess: (created) => {
      queryClient.setQueryData<AdminSubscription[]>(["admin-subscriptions"], (old) => {
        if (!old) return [created]
        return [created, ...old]
      })
      toast.success("تم إنشاء الاشتراك بنجاح")
    },
    onError: (err: any) => {
      toast.error(err?.message || "حدث خطأ أثناء إنشاء الاشتراك")
    },
  })

  const updateSubscription = (id: string, input: UpdateSubscriptionAdminInput) =>
    updateMutation.mutateAsync({ id, input })

  const createSubscription = (input: CreateSubscriptionAdminInput) =>
    createMutation.mutateAsync(input)

  const deleteSubscription = (id: string) =>
    deleteMutation.mutateAsync(id)

  return {
    subscriptions,
    loading: isLoading || updateMutation.isPending || createMutation.isPending || deleteMutation.isPending,
    updateSubscription,
    createSubscription,
    deleteSubscription,
  }
}
