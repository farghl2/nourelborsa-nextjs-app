"use client"

import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { getStockBy } from "@/lib/services/stocks"
import type { UpdateStockInput } from "@/lib/validations/stock"

export type ClientStock = UpdateStockInput & { id: string; updatedAt: Date }

export function useClientStock(id?: string) {
  const {
    data: stock,
    isLoading,
  } = useQuery<ClientStock | undefined>({
    queryKey: ["stock", id],
    queryFn: async ({ queryKey }) => {
      const [_key, stockId] = queryKey
      try {
        return await getStockBy(stockId as string)
      } catch (err: any) {
        toast.error(err?.message || "فشل في تحميل السهم")
        throw err
      }
    },
    enabled: Boolean(id),
    staleTime: 60_000,
  })

  return {
    stock,
    loading: isLoading,
  }
}
