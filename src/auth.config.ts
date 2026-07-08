import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [], // Configured in auth.ts to avoid Edge compatibility issues with bcrypt/argon2
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized() {
      // Base authorization logic.
      // Can be extended in middleware.ts or left simple here.
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as "CUSTOMER" | "ADMIN"
        token.firstName = user.firstName as string | null
        token.lastName = user.lastName as string | null
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig
