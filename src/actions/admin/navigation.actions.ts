"use server"

import { revalidatePath } from "next/cache"
import { NavigationService } from "@/services/navigation.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"

const menuSchema = z.object({
  name: z.string().min(1),
  handle: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
})

const safeUrlSchema = z.string().refine((val) => {
  if (!val) return true
  try {
    const url = new URL(val, "http://localhost")
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
  } catch {
    return false
  }
}, { message: "Invalid or unsafe URL format" }).optional()

const menuItemSchema = z.object({
  menuId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  label: z.string().min(1),
  url: safeUrlSchema,
  sortOrder: z.number().or(z.string().transform(Number)),
})

export async function createMenuAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      name: formData.get("name"),
      handle: formData.get("handle"),
      status: formData.get("status"),
    }

    const data = menuSchema.parse(rawData)

    await NavigationService.createMenu(data, session.id)

    revalidatePath("/admin/cms/navigation")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create menu" }
  }
}

export async function updateMenuAction(id: string, formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      name: formData.get("name"),
      handle: formData.get("handle"),
      status: formData.get("status"),
    }

    const data = menuSchema.parse(rawData)

    await NavigationService.updateMenu(id, data, session.id)

    revalidatePath("/admin/cms/navigation")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update menu" }
  }
}

export async function archiveMenuAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    await NavigationService.deleteMenu(id, session.id)
    revalidatePath("/admin/cms/navigation")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive menu" }
  }
}
