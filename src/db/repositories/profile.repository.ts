import { eq } from "drizzle-orm"
import { db } from "../client"
import { profiles, users } from "../schema"

export class ProfileRepository {
  static async findByUserId(tx: any, userId: string) {
    const client = tx || db
    const result = await client
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1)
    return result[0] ?? null
  }

  static async createProfile(tx: any, data: any) {
    const client = tx || db
    const [profile] = await client
      .insert(profiles)
      .values(data)
      .returning()
    return profile
  }

  static async updateProfile(tx: any, userId: string, data: any) {
    const client = tx || db
    const [profile] = await client
      .update(profiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId))
      .returning()
    return profile
  }

  static async updateUserNames(tx: any, userId: string, firstName: string, lastName: string) {
    const client = tx || db
    const [user] = await client
      .update(users)
      .set({
        firstName,
        lastName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      })
    return user
  }
}
