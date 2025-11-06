import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto"

const SCRYPT_N = 16384 // CPU/memory cost
const SCRYPT_r = 8
const SCRYPT_p = 1
const KEYLEN = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    scryptCb(password, salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_r, p: SCRYPT_p }, (err, dk) => {
      if (err) reject(err)
      else resolve(dk as Buffer)
    })
  })
  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split("$")
    if (parts.length !== 3 || parts[0] !== "scrypt") return false
    const salt = Buffer.from(parts[1], "hex")
    const hash = Buffer.from(parts[2], "hex")
    const derivedKey = await new Promise<Buffer>((resolve, reject) => {
      scryptCb(password, salt, hash.length, { N: SCRYPT_N, r: SCRYPT_r, p: SCRYPT_p }, (err, dk) => {
        if (err) reject(err)
        else resolve(dk as Buffer)
      })
    })
    return timingSafeEqual(hash, derivedKey)
  } catch {
    return false
  }
}
