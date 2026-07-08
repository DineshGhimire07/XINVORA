"use server"

import { revalidatePath } from "next/cache"
import { AnnouncementService } from "@/services/announcement.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"

const safeUrlSchema = z.string().refine((val) => {
  if (!val) return true
  try {
    const url = new URL(val, "http://localhost")
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
  } catch {
    return false
  }
}, { message: "Invalid or unsafe URL format" }).optional()

const announcementSchema = z.object({
  message: z.string().min(1),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: safeUrlSchema,
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  priority: z.number().or(z.string().transform(Number)),
})

export async function createAnnouncementAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      message: formData.get("message"),
      backgroundColor: formData.get("backgroundColor") || undefined,
      textColor: formData.get("textColor") || undefined,
      buttonText: formData.get("buttonText") || undefined,
      buttonUrl: formData.get("buttonUrl") || undefined,
      status: formData.get("status"),
      priority: formData.get("priority") || "0",
    }

    const data = announcementSchema.parse(rawData)

    await AnnouncementService.createAnnouncement(data, session.id)

    revalidatePath("/admin/cms/announcements")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create announcement" }
  }
}

export async function updateAnnouncementAction(id: string, formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      message: formData.get("message"),
      backgroundColor: formData.get("backgroundColor") || undefined,
      textColor: formData.get("textColor") || undefined,
      buttonText: formData.get("buttonText") || undefined,
      buttonUrl: formData.get("buttonUrl") || undefined,
      status: formData.get("status"),
      priority: formData.get("priority") || "0",
    }

    const data = announcementSchema.parse(rawData)

    await AnnouncementService.updateAnnouncement(id, data, session.id)

    revalidatePath("/admin/cms/announcements")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update announcement" }
  }
}

export async function archiveAnnouncementAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    await AnnouncementService.deleteAnnouncement(id, session.id)
    revalidatePath("/admin/cms/announcements")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive announcement" }
  }
}
