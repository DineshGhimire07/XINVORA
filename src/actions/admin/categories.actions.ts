"use server"

import { revalidatePath } from "next/cache"
import { AdminCategoryService } from "@/services/admin.category.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
})

export async function createCategoryAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
    }

    const data = categorySchema.parse(rawData)

    await AdminCategoryService.createCategory(data, session.id)

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" }
  }
}

export async function updateCategoryAction(id: string, formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
    }

    const data = categorySchema.parse(rawData)

    await AdminCategoryService.updateCategory(id, data, session.id)

    revalidatePath("/admin/categories")
    revalidatePath(`/admin/categories/${id}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category" }
  }
}

export async function archiveCategoryAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    await AdminCategoryService.deleteCategory(id, session.id)
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive category" }
  }
}
