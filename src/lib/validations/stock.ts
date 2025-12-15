import { z } from "zod"

const stringToNumber = (val: string) => val === '' ? null : Number(val);
const stringToBoolean = (val: string) => val === 'true';

export const createStockSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.union([
    z.number(),
    z.string().transform(stringToNumber)
  ]),
  symbol: z.string().min(1).max(50),
  description: z.string().max(2000).optional().nullable(),
  companyActivity: z.string().max(1000).optional().nullable(),
  active: z.union([
    z.boolean(),
    z.string().transform(stringToBoolean)
  ]).optional(),
  prohibitedRevenuePercentage: z.union([
    z.number(),
    z.string().transform(stringToNumber)
  ]).nullable().optional(),
  interestBearingLoansPercentage: z.union([
    z.number(),
    z.string().transform(stringToNumber)
  ]).nullable().optional(),
  interestBearingDepositsPercentage: z.union([
    z.number(),
    z.string().transform(stringToNumber)
  ]).nullable().optional(),
  assetsPercentage: z.union([
    z.number(),
    z.string().transform(stringToNumber)
  ]).nullable().optional(),
  totalAssets: z.union([
    z.number(),
    z.string().transform(stringToNumber)
  ]).nullable().optional(),
  marketCapitalization: z.union([
    z.number(),
    z.string().transform(stringToNumber)
  ]).nullable().optional(),
  recommendation: z.union([
    z.boolean(),
    z.string().transform(stringToBoolean)
  ]).optional(),
  durationDays: z.union([
    z.number().int().positive(),
    z.string().transform(stringToNumber)
  ]).nullable().optional(),
  returnOnPrice: z.union([
    z.number(),
    z.string().transform(stringToNumber)
  ]).nullable().optional(),
  fairValue: z.union([
    z.number(),
    z.string().transform(stringToNumber)
  ]).nullable().optional(),
  earningsPerShare: z.union([
    z.number(),
    z.string().transform(stringToNumber)
  ]).nullable().optional(),
  expectedFairValueNextYear: z.union([
    z.number(),
    z.string().transform(stringToNumber)
  ]).nullable().optional(),
  expectedEarningsPerShare: z.union([
    z.number(),
    z.string().transform(stringToNumber)
  ]).nullable().optional(),
  purificationPercentage: z.union([
    z.number(),
    z.string().transform(stringToNumber)
  ]).nullable().optional(),
})

export const updateStockSchema = createStockSchema.partial()

export type CreateStockInput = z.infer<typeof createStockSchema>
export type UpdateStockInput = z.infer<typeof updateStockSchema>
