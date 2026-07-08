import "server-only"
import { eq } from "drizzle-orm"
import { db } from "@/db/client"
import { users } from "@/db/schema"
import { DomainError, DomainErrorCode } from "./errors"
import type { RegisterInput } from "@/validations/auth"

export class UserService {
  /**
   * Normalize an email address by converting it to lowercase and trimming whitespace.
   */
  public static normalizeEmail(email: string): string {
    return email.trim().toLowerCase()
  }

  /**
   * Find a user by their exact email address.
   */
  public static async getUserByEmail(email: string) {
    const normalizedEmail = this.normalizeEmail(email)
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1)

    return result[0] || null
  }

  /**
   * Create a new user record.
   * Assumes the password has already been hashed by the authentication service.
   */
  public static async createUser(
    input: Omit<RegisterInput, "password">,
    passwordHash: string,
    role: "CUSTOMER" | "ADMIN" = "CUSTOMER"
  ) {
    const normalizedEmail = this.normalizeEmail(input.email)

    // Check if user already exists
    const existingUser = await this.getUserByEmail(normalizedEmail)
    if (existingUser) {
      throw new DomainError(
        DomainErrorCode.CONFLICT,
        "A user with this email already exists."
      )
    }

    try {
      const [newUser] = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          firstName: input.firstName,
          lastName: input.lastName,
          passwordHash,
          role,
        })
        .returning()

      return newUser
    } catch (error) {
      console.error("[UserService.createUser] Error:", error)
      throw new DomainError(
        DomainErrorCode.UNKNOWN,
        "Failed to create user account."
      )
    }
  }
}
