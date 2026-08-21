import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { authConfig } from "./auth.config"
import { AuthenticationService } from "./services/authentication.service"
import { loginSchema } from "./validations/auth"

import { DomainError } from "./services/errors"

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials)
          if (!parsed.success) return null

          const user = await AuthenticationService.verifyCredentials(parsed.data)
          if (!user) return null

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
          }
        } catch (error: any) {
          if (error instanceof DomainError) {
            throw error
          }
          // Returning null tells Auth.js to reject the login.
          return null
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      if (user && account) {
        if (account.provider === "google") {
          const email = user.email!
          const { db } = await import("./db/client")
          const { users } = await import("./db/schema/users")
          const { eq } = await import("drizzle-orm")

          let dbUser = await db.query.users.findFirst({
            where: eq(users.email, email),
          })

          if (!dbUser) {
            const nameParts = (user.name || "").split(" ")
            const firstName = nameParts[0] || "Google"
            const lastName = nameParts.slice(1).join(" ") || "User"

            const [inserted] = await db
              .insert(users)
              .values({
                email,
                firstName,
                lastName,
                role: "CUSTOMER",
              })
              .returning()
            dbUser = inserted
          }

          token.id = dbUser.id
          token.role = dbUser.role
          token.firstName = dbUser.firstName
          token.lastName = dbUser.lastName
        } else {
          token.id = user.id as string
          token.role = user.role as "CUSTOMER" | "ADMIN"
          token.firstName = user.firstName as string | null
          token.lastName = user.lastName as string | null
        }
      }

      // BUG FIX #7: Invalidate session if the user has been soft-deleted.
      // Optimisation: Throttle DB checks to once every 60 seconds and handle connection issues gracefully.
      if (token?.id) {
        const now = Math.floor(Date.now() / 1000)
        const lastChecked = token.lastChecked as number | undefined

        if (lastChecked && now - lastChecked < 60) {
          if (token.isDeleted) {
            return {} as any
          }
        } else {
          try {
            const { db } = await import("./db/client")
            const { users } = await import("./db/schema/users")
            const { eq } = await import("drizzle-orm")

            const dbUser = await db.query.users.findFirst({
              where: eq(users.id, token.id as string),
              columns: { deletedAt: true },
            })

            token.lastChecked = now

            if (!dbUser || dbUser.deletedAt) {
              token.isDeleted = true
              return {} as any
            }
          } catch (err) {
            console.warn("[Auth JWT check] Database connection timeout or unreachable. Bypassing check.", err)
          }
        }
      }

      return token
    },
  },
})
