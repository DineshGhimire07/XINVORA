"use server"

import { revalidatePath } from "next/cache"
import { AdminBrandService } from "@/services/admin.brand.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"

const brandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
})

export async function createBrandAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
    }

    const data = brandSchema.parse(rawData)

    await AdminBrandService.createBrand(data, session.id)

    revalidatePath("/admin/brands")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create brand" }
  }
}

export async function updateBrandAction(id: string, formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
    }

    const data = brandSchema.parse(rawData)

    await AdminBrandService.updateBrand(id, data, session.id)

    revalidatePath("/admin/brands")
    revalidatePath(`/admin/brands/${id}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update brand" }
  }
}

export async function archiveBrandAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    await AdminBrandService.deleteBrand(id, session.id)
    revalidatePath("/admin/brands")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive brand" }
  }
}
