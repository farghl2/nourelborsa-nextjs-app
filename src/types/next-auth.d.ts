import NextAuth, { DefaultSession } from "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"

// Extend built-in types to include `role`, `plan`, and `status`
declare module "next-auth" {
  interface User {
    role?: "ADMIN" | "USER" | "ACCOUNTANT"
    id?: string
  }

  interface Session {
    user: (DefaultSession["user"] & {
      role?: "ADMIN" | "USER" | "ACCOUNTANT"
      id?: string
      plan?: string
      status?: string
      allowedStocks?:boolean
    })
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string
    role?: "ADMIN" | "USER" | "ACCOUNTANT"
    plan?: string
    status?: string
  }
}
