import { z } from "zod"

export const createStockSchema = z.object({
  name: z.string().min(1).max(255),
  symbol: z.string().min(1).max(50),
  description: z.string().max(2000).optional().nullable(),
  companyActivity: z.string().max(1000).optional().nullable(),
  prohibitedRevenuePercentage: z.number().finite().min(0).max(100).optional().nullable(),
  interestBearingLoansPercentage: z.number().finite().min(0).max(100).optional().nullable(),
  interestBearingDepositsPercentage: z.number().finite().min(0).max(100).optional().nullable(),
  assetsPercentage: z.number().finite().min(0).max(100).optional().nullable(),
  totalAssets: z.number().finite().min(0).optional().nullable(),
  marketCapitalization: z.number().finite().min(0).optional().nullable(),
  recommendation: z.boolean().optional(),
  durationDays: z.number().int().positive().optional().nullable(),
  returnOnPrice: z.number().finite().optional().nullable(),
  fairValue: z.number().finite().optional().nullable(),
  earningsPerShare: z.number().finite().optional().nullable(),
  expectedFairValueNextYear: z.number().finite().optional().nullable(),
  expectedEarningsPerShare: z.number().finite().optional().nullable(),
  purificationPercentage: z.number().finite().min(0).max(100).optional().nullable(),
})

export const updateStockSchema = createStockSchema.partial()

export type CreateStockInput = z.infer<typeof createStockSchema>
export type UpdateStockInput = z.infer<typeof updateStockSchema>
