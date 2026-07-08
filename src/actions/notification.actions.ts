"use server"

import { revalidatePath } from "next/cache"
import { NotificationService } from "../services/notification.service"
import { SessionService } from "../services/session.service"
import type { ActionResult } from "../types/actions"

export async function markReadAction(id: string): Promise<ActionResult<void>> {
  try {
    const session = await SessionService.requireAuth()
    await NotificationService.markRead(session.id, id)
    
    revalidatePath("/account")
    revalidatePath("/account/notifications")

    return { success: true, data: undefined }
  } catch (error: any) {
    console.error("[markReadAction Error]:", error)
    return {
      success: false,
      error: {
        code: "NOTIFICATION_UPDATE_ERROR",
        message: error.message || "Failed to update notification.",
      },
    }
  }
}

export async function markAllReadAction(): Promise<ActionResult<void>> {
  try {
    const session = await SessionService.requireAuth()
    await NotificationService.markAllRead(session.id)
    
    revalidatePath("/account")
    revalidatePath("/account/notifications")

    return { success: true, data: undefined }
  } catch (error: any) {
    console.error("[markAllReadAction Error]:", error)
    return {
      success: false,
      error: {
        code: "NOTIFICATION_UPDATE_ALL_ERROR",
        message: error.message || "Failed to update notifications.",
      },
    }
  }
}

export async function deleteNotificationAction(id: string): Promise<ActionResult<void>> {
  try {
    const session = await SessionService.requireAuth()
    await NotificationService.deleteNotification(session.id, id)
    
    revalidatePath("/account")
    revalidatePath("/account/notifications")

    return { success: true, data: undefined }
  } catch (error: any) {
    console.error("[deleteNotificationAction Error]:", error)
    return {
      success: false,
      error: {
        code: "NOTIFICATION_DELETE_ERROR",
        message: error.message || "Failed to delete notification.",
      },
    }
  }
}
