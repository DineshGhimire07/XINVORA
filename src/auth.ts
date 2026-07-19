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
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
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
      return token
    },
  },
})
