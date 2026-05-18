import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

/**
 * Single NextAuth configuration — no more split between auth.ts and
 * auth.config.ts.  The edge-safe split was only needed for the old
 * middleware.ts pattern; Next.js 16 proxy runs on Node.js by default.
 */
export const { handlers, signIn, signOut, auth: nextAuth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    /**
     * Persist the database user ID into the JWT so it's available
     * in the session without an extra DB lookup on every request.
     */
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
