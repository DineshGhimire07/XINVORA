import { eq } from "drizzle-orm"
import * as argon2 from "argon2"
import { db } from "../db/client"
import { users } from "../db/schema"
import { DomainError, DomainErrorCode } from "./errors"

export class SecurityService {
  /**
   * Securely changes password verifying original via Argon2 verification.
   */
  static async changePassword(userId: string, current: string, replacement: string) {
    // 1. Fetch user hash
    const [user] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user || !user.passwordHash) {
      throw new DomainError(DomainErrorCode.UNAUTHORIZED, "Unauthorized credentials")
    }

    // 2. Validate current password match
    const isValid = await argon2.verify(user.passwordHash, current)
    if (!isValid) {
      throw new DomainError(DomainErrorCode.UNAUTHORIZED, "Current password verification failed")
    }

    // 3. Hash replacement password
    const newHash = await argon2.hash(replacement, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    })

    // 4. Save
    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, userId))

    return { success: true }
  }
}
