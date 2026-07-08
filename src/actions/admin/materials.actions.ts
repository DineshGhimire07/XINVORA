"use server"

import { revalidatePath } from "next/cache"
import { AdminMaterialService } from "@/services/admin.material.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"

const materialSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export async function createMaterialAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
    }

    const data = materialSchema.parse(rawData)

    await AdminMaterialService.createMaterial(data, session.id)

    revalidatePath("/admin/materials")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create material" }
  }
}

export async function updateMaterialAction(id: string, formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
    }

    const data = materialSchema.parse(rawData)

    await AdminMaterialService.updateMaterial(id, data, session.id)

    revalidatePath("/admin/materials")
    revalidatePath(`/admin/materials/${id}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update material" }
  }
}

export async function archiveMaterialAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    await AdminMaterialService.deleteMaterial(id, session.id)
    revalidatePath("/admin/materials")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive material" }
  }
}
