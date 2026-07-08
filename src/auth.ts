import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { AuthenticationService } from "./services/authentication.service"
import { loginSchema } from "./validations/auth"

import { DomainError } from "./services/errors"

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
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
})
