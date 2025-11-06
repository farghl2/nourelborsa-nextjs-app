import { z } from "zod"

export const createSubscriptionPlanSchema = z.object({
  name: z.string().trim().min(1, "ادخل اسم الباقة"),
  description: z.string().trim().optional().or(z.literal(""))
    .transform(v => v === "" ? undefined : v),
  price: z.coerce.number().nonnegative("السعر غير صحيح"),
  durationDays: z.coerce.number().int().positive("المدة يجب أن تكون بالأيام"),
  features: z.any().optional(),
})

export const updateSubscriptionPlanSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  price: z.coerce.number().nonnegative().optional(),
  durationDays: z.coerce.number().int().positive().optional(),
  features: z.any().optional(),
}).refine(obj => Object.keys(obj).length > 0, {
  message: "لا توجد تغييرات",
})
