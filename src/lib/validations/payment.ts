import { z } from "zod"

export const initiatePaymentSchema = z.object({
  planId: z.string().min(1, "planId مطلوب"),
  provider: z.string().trim().optional(),
})

export const paymentStatusSchema = z.object({
  id: z.string().min(1),
})

export const paymentWebhookSchema = z.object({
  paymentId: z.string().min(1),
  status: z.enum(["SUCCEEDED", "PENDING", "FAILED"]),
  transactionId: z.string().optional(),
  // عند النجاح يجب توفير planId لإنشاء الاشتراك
  planId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.status === "SUCCEEDED" && !data.planId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "planId مطلوب عند نجاح الدفع" })
  }
})
