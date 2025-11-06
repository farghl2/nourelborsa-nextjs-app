import nodemailer from "nodemailer"

export function getTransport() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) {
    throw new Error("Missing SMTP configuration (SMTP_HOST, SMTP_USER, SMTP_PASS)")
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html?: string; text?: string }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com"
  const transporter = getTransport()
  await transporter.sendMail({ from, to, subject, html, text })
}

export async function sendVerificationCodeEmail(to: string, code: string) {
  const subject = "رمز تأكيد البريد الإلكتروني"
  const text = `رمز التحقق الخاص بك هو: ${code}. صالح لمدة 15 دقيقة.`
  const html = `<p>مرحباً،</p><p>رمز التحقق الخاص بك هو: <strong>${code}</strong></p><p>صالح لمدة 15 دقيقة.</p>`
  await sendEmail({ to, subject, text, html })
}

export async function sendPasswordResetCodeEmail(to: string, code: string) {
  const subject = "رمز إعادة تعيين كلمة المرور"
  const text = `رمز إعادة تعيين كلمة المرور هو: ${code}. صالح لمدة 15 دقيقة.`
  const html = `<p>مرحباً،</p><p>رمز إعادة تعيين كلمة المرور الخاص بك هو: <strong>${code}</strong></p><p>صالح لمدة 15 دقيقة.</p>`
  await sendEmail({ to, subject, text, html })
}
