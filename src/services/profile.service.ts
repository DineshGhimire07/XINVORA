import { ProfileRepository } from "../db/repositories/profile.repository"
import { db } from "../db/client"
import { eq } from "drizzle-orm"
import { users } from "../db/schema"

export class ProfileService {
  /**
   * Resolves the profile details of the user. Creates profile if not found.
   */
  static async getProfile(userId: string) {
    // 1. Fetch user base details
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      throw new Error("User not found")
    }

    // 2. Fetch profile or create default
    let profile = await ProfileRepository.findByUserId(null, userId)
    if (!profile) {
      profile = await ProfileRepository.createProfile(null, {
        userId,
        languagePreference: "en",
        timezone: "UTC",
        newsletterPreference: false,
      })
    }

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: profile.phone ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
      profileImage: profile.profileImage ?? "",
      newsletterPreference: profile.newsletterPreference,
      languagePreference: profile.languagePreference,
      timezone: profile.timezone,
      createdAt: user.createdAt,
    }
  }

  /**
   * Updates profile fields.
   */
  static async updateProfile(
    userId: string,
    data: {
      firstName: string
      lastName: string
      phone?: string
      dateOfBirth?: string | null
      newsletterPreference?: boolean
      languagePreference?: string
      timezone?: string
    }
  ) {
    // Update User level names
    await ProfileRepository.updateUserNames(null, userId, data.firstName, data.lastName)

    // Update Profile level details
    const profileFields: Record<string, any> = {}
    if (data.phone !== undefined) profileFields.phone = data.phone
    if (data.dateOfBirth !== undefined) profileFields.dateOfBirth = data.dateOfBirth
    if (data.newsletterPreference !== undefined) profileFields.newsletterPreference = data.newsletterPreference
    if (data.languagePreference !== undefined) profileFields.languagePreference = data.languagePreference
    if (data.timezone !== undefined) profileFields.timezone = data.timezone

    await ProfileRepository.updateProfile(null, userId, profileFields)

    return this.getProfile(userId)
  }
}
