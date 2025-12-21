import { z } from "zod"

export const createSubscriptionPlanSchema = z.object({
  name: z.string().trim().min(1, "ادخل اسم الباقة"),
  description: z.string().trim().optional().or(z.literal(""))
    .transform(v => v === "" ? undefined : v),
  price: z.coerce.number().nonnegative("السعر غير صحيح"),
  durationDays: z.coerce.number().int().positive("المدة يجب أن تكون بالأيام"),
  purificationLimit: z.coerce.number().int().nonnegative().optional(),
  active: z.coerce.boolean().optional(),
  allowedStocks: z.coerce.boolean().optional(),
  features: z.array(z.string()).min(1, 'اضف علي الاقل ميزة واحدة').optional(),
})

export const updateSubscriptionPlanSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  price: z.coerce.number().nonnegative().optional(),
  durationDays: z.coerce.number().int().positive().optional(),
  purificationLimit: z.coerce.number().int().nonnegative().optional(),
  active: z.coerce.boolean().optional(),
  allowedStocks: z.coerce.boolean().optional(),
  features: z.any().optional(),
}).refine(obj => Object.keys(obj).length > 0, {
  message: "لا توجد تغييرات",
})

// Admin create for a user's Subscription record
export const createSubscriptionAdminSchema = z.object({
  userEmail: z.string().trim().toLowerCase().email("ادخل بريد المستخدم"),
  planId: z.string().trim().min(1, "اختر الخطة"),
  status: z.enum(["ACTIVE", "CANCELLED", "EXPIRED"]).optional(),
  renewedByAdmin: z.boolean().optional(),
})

export type CreateSubscriptionAdminInput = z.infer<typeof createSubscriptionAdminSchema>

// Admin update for a single user's Subscription record
// Maps directly to Prisma enum SubscriptionStatus: ACTIVE / CANCELLED / EXPIRED
export const updateSubscriptionAdminSchema = z.object({
  status: z.enum(["ACTIVE", "CANCELLED", "EXPIRED"]).optional(),
  renewedByAdmin: z.boolean().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(obj => Object.keys(obj).length > 0, {
  message: "لا توجد تغييرات",
})

export type CreateSubscriptionPlanInput = z.infer<typeof createSubscriptionPlanSchema>
export type UpdateSubscriptionPlanInput = z.infer<typeof updateSubscriptionPlanSchema>

export type UpdateSubscriptionAdminInput = z.infer<typeof updateSubscriptionAdminSchema>

// Form schema for the admin subscriptions page (used with CrudModal)
// Here renewedByAdmin is represented as string values "true" / "false" in the UI
export const subscriptionAdminFormSchema = z.object({
  status: z.enum(["ACTIVE", "CANCELLED", "EXPIRED"]),
  renewedByAdmin: z.enum(["true", "false"]),
})

export type SubscriptionAdminFormValues = z.infer<typeof subscriptionAdminFormSchema>

// Form schema for creating a subscription from the admin page
export const subscriptionAdminCreateFormSchema = z.object({
  userEmail: z.string().trim().toLowerCase().email("ادخل بريد المستخدم"),
  planId: z.string().trim().min(1, "اختر الخطة"),
  status: z.enum(["ACTIVE", "CANCELLED", "EXPIRED"]),
  renewedByAdmin: z.enum(["true", "false"]),
})

export type SubscriptionAdminCreateFormValues = z.infer<typeof subscriptionAdminCreateFormSchema>
