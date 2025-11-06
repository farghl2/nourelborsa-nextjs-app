import { z } from "zod"

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  email: z.string().trim().toLowerCase().email("ادخل بريدك الالكتروني"),
  password: z.string().min(6, "ادخل كلمة مرور قوية"),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("ادخل بريدك الالكتروني"),
  password: z.string().min(1, "ادخل كلمة السر"),
})

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("ادخل بريدك الالكتروني"),
  code: z
    .string()
    .regex(/^\d{6}$/, "رمز التحقق يجب أن يكون 6 أرقام")
})

export const resendCodeSchema = z.object({
  email: z.string().trim().toLowerCase().email("ادخل بريدك الالكتروني"),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("ادخل بريدك الالكتروني"),
})

export const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("ادخل بريدك الالكتروني"),
  code: z.string().regex(/^\d{6}$/, "رمز التحقق يجب أن يكون 6 أرقام"),
  password: z.string().min(6, "ادخل كلمة مرور قوية"),
})
