"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchAdminUsers, updateUserRole, type AdminUser } from "@/lib/services/user"
import type { UpdateUserRoleInput } from "@/lib/validations/user"

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  const {
    data: users = [],
    isLoading,
  } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      try {
        const list = await fetchAdminUsers()
        return list
      } catch (err: any) {
        toast.error(err?.message || "فشل في تحميل المستخدمين")
        throw err
      }
    },
    staleTime: 60_000,
  })

  const mutation = useMutation({
    mutationKey: ["admin-users-update-role"],
    mutationFn: async ({ userId, input }: { userId: string; input: UpdateUserRoleInput }) => {
      return updateUserRole(userId, input)
    },
    onSuccess: (updated) => {
      // update cache
      queryClient.setQueryData<AdminUser[]>(["admin-users"], (old) => {
        if (!old) return [updated]
        return old.map((u) => (u.id === updated.id ? updated : u))
      })
      toast.success("تم تحديث دور المستخدم بنجاح")
    },
    onError: (err: any) => {
      toast.error(err?.message || "حدث خطأ أثناء تحديث الدور")
    },
  })

  const updateRole = (userId: string, input: UpdateUserRoleInput) =>
    mutation.mutateAsync({ userId, input })

  return {
    users,
    loading: isLoading || mutation.isPending,
    updateRole,
  }
}
