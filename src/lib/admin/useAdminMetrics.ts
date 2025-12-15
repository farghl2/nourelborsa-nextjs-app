"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAdminMetrics, type MetricsResponse } from "@/lib/services/adminMetrics"

export function useAdminMetrics(type: string, period: string) {
  return useQuery<MetricsResponse>({
    queryKey: ["admin-metrics", type, period],
    queryFn: () => fetchAdminMetrics(type, period),
    staleTime: 60_000,
  })
}
