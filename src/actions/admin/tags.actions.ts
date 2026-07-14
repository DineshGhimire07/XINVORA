"use server"

import { revalidatePath, updateTag } from "next/cache"
import { AdminTagService } from "@/services/admin.tag.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"

const tagSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
})

export async function createTagAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
    }

    const data = tagSchema.parse(rawData)

    await AdminTagService.createTag(data, session.id)

    updateTag("tags")
    revalidatePath("/admin/tags")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create tag" }
  }
}

export async function updateTagAction(id: string, formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
    }

    const data = tagSchema.parse(rawData)

    await AdminTagService.updateTag(id, data, session.id)

    updateTag("tags")
    revalidatePath("/admin/tags")
    revalidatePath(`/admin/tags/${id}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update tag" }
  }
}

export async function deleteTagAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    await AdminTagService.deleteTag(id, session.id)
    updateTag("tags")
    revalidatePath("/admin/tags")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete tag" }
  }
}
