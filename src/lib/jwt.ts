import { SignJWT, jwtVerify } from "jose"

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
  if (!secret) throw new Error("Missing NEXTAUTH_SECRET or JWT_SECRET")
  return new TextEncoder().encode(secret)
}

export async function signJwt(payload: Record<string, unknown>, expiresIn = "7d"): Promise<string> {
  const secret = getSecret()
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
  return token
}

export async function verifyJwt<T = unknown>(token: string): Promise<T | null> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload as T
  } catch {
    return null
  }
}
