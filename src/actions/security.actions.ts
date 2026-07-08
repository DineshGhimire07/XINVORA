"use server"

import { revalidatePath } from "next/cache"
import { SecurityService } from "../services/security.service"
import { SessionService } from "../services/session.service"
import type { ActionResult } from "../types/actions"
import { z } from "zod"

const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
})

export async function changePasswordAction(
  formData: z.infer<typeof PasswordChangeSchema>
): Promise<ActionResult<void>> {
  try {
    const session = await SessionService.requireAuth()
    const validated = PasswordChangeSchema.parse(formData)

    await SecurityService.changePassword(session.id, validated.currentPassword, validated.newPassword)

    revalidatePath("/account/security")

    return {
      success: true,
      data: undefined,
    }
  } catch (error: any) {
    console.error("[changePasswordAction Error]:", error)
    return {
      success: false,
      error: {
        code: "PASSWORD_CHANGE_ERROR",
        message: error.message || "Failed to update password settings.",
      },
    }
  }
}
