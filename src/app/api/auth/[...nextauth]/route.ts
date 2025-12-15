import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/password"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email || "").toString().trim().toLowerCase()
        const password = (credentials?.password || "").toString()
        if (!email || !password) return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) return null
        const ok = await verifyPassword(password, user.password)
        if (!ok) return null
        return { id: user.id, name: user.name ?? null, email: user.email ?? null, image: user.image ?? null, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // initial sign-in
        token.id = (user as any).id
        token.role = (user as any).role ?? token.role
      } else if (token?.email) {
        // ensure role present for OAuth sessions
        const dbUser = await prisma.user.findUnique({ 
          where: { email: token.email },
          include: {
            subscriptions: {
              where: { status: "ACTIVE" },
              include: {
                plan: {
                  select: { name: true, allowedStocks: true }
                }
              }
            }
          }
        })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          // Add plan information
          const activeSubscription = dbUser.subscriptions[0]
          token.plan = activeSubscription?.plan?.name || "Free"
          token.status = activeSubscription ? "Active" : "Inactive"
          token.allowedStocks = activeSubscription?.plan?.allowedStocks || false
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).plan = token.plan || "Free"
        ;(session.user as any).status = token.status || "Inactive"
        ;(session.user as any).allowedStocks = token.allowedStocks || false
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
