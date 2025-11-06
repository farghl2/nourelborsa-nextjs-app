import { prisma } from "@/lib/prisma"

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function saveVerificationCode(email: string, code: string, ttlMinutes = 15) {
  const expires = new Date(Date.now() + ttlMinutes * 60 * 1000)
  // Remove old tokens for this email, then create the new one
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires,
    },
  })
}

export async function validateVerificationCode(email: string, code: string) {
  const vt = await prisma.verificationToken.findFirst({
    where: { identifier: email, token: code },
  })
  if (!vt) return { valid: false, reason: "invalid" as const }
  if (vt.expires < new Date()) return { valid: false, reason: "expired" as const }
  return { valid: true as const }
}

export async function clearVerificationCodes(email: string) {
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })
}
