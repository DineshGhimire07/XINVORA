"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { AdminCollectionService } from "@/services/admin.collection.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"

const collectionSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  sortOrder: z.number().int().default(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  productIds: z.array(z.string().uuid()).optional(),
})

export async function createCollectionAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      parentId: formData.get("parentId") || null,
      sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
      seoTitle: formData.get("seoTitle") || undefined,
      seoDescription: formData.get("seoDescription") || undefined,
      productIds: formData.getAll("productIds").map(id => String(id)),
    }

    const data = collectionSchema.parse(rawData)

    await AdminCollectionService.createCollection(data, session.id)

    revalidateTag("collections", {})
    revalidatePath("/admin/collections")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create collection" }
  }
}

export async function updateCollectionAction(id: string, formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      parentId: formData.get("parentId") || null,
      sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
      seoTitle: formData.get("seoTitle") || undefined,
      seoDescription: formData.get("seoDescription") || undefined,
      productIds: formData.getAll("productIds").map(id => String(id)),
    }

    const data = collectionSchema.parse(rawData)

    await AdminCollectionService.updateCollection(id, data, session.id)

    revalidateTag("collections", {})
    revalidatePath("/admin/collections")
    revalidatePath(`/admin/collections/${id}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update collection" }
  }
}

export async function archiveCollectionAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    await AdminCollectionService.deleteCollection(id, session.id)
    revalidateTag("collections", {})
    revalidatePath("/admin/collections")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive collection" }
  }
}
