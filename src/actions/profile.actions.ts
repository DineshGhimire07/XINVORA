"use server"

import { revalidatePath } from "next/cache"
import { ProfileService } from "../services/profile.service"
import { SessionService } from "../services/session.service"
import type { ActionResult } from "../types/actions"
import { z } from "zod"

const ProfileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().max(50).optional(),
  dateOfBirth: z.string().nullable().optional(),
  newsletterPreference: z.boolean().optional(),
  languagePreference: z.string().max(10).optional(),
  timezone: z.string().max(100).optional(),
})

export async function updateProfileAction(
  formData: z.infer<typeof ProfileUpdateSchema>
): Promise<ActionResult<any>> {
  try {
    const session = await SessionService.requireAuth()
    const validated = ProfileUpdateSchema.parse(formData)

    const updated = await ProfileService.updateProfile(session.id, {
      ...validated,
      dateOfBirth: validated.dateOfBirth ? validated.dateOfBirth : null,
    })

    revalidatePath("/account")
    revalidatePath("/account/profile")

    return {
      success: true,
      data: updated,
    }
  } catch (error: any) {
    console.error("[updateProfileAction Error]:", error)
    return {
      success: false,
      error: {
        code: "PROFILE_UPDATE_ERROR",
        message: error.message || "Failed to update profile settings.",
      },
    }
  }
}
