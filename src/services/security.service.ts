import { eq } from "drizzle-orm"
import * as argon2 from "argon2"
import { db } from "../db/client"
import { users } from "../db/schema"

export class SecurityService {
  /**
   * Changes the password for an authenticated user.
   * No current password check — the active session already proves identity.
   */
  static async changePassword(userId: string, replacement: string) {
    // Hash new password with Argon2id
    const newHash = await argon2.hash(replacement, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    })

    // Save
    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, userId))

    return { success: true }
  }
}
