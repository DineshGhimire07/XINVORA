"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { AdminOffSectionService } from "@/services/admin.off-section.service"
import { SessionService } from "@/services/session.service"
import { isProductInOffSection } from "@/db/queries/off-section"
import { z } from "zod"

const addSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  originalPrice: z.number().positive("Original price must be positive"),
  sellingPrice: z.number().positive("Selling price must be positive"),
}).refine(
  (data) => data.originalPrice > data.sellingPrice,
  { message: "Original price must be greater than selling price", path: ["originalPrice"] }
)

const updateSchema = z.object({
  originalPrice: z.number().positive().optional(),
  sellingPrice: z.number().positive().optional(),
  isOffEnabled: z.boolean().optional(),
})

function revalidateAll() {
  revalidatePath("/admin/off-section")
  revalidatePath("/")
  revalidatePath("/collections")
  revalidateTag("products", {})
  revalidateTag("collections", {})
  revalidateTag("homepage-collections", {})
}

export async function addToOffSectionAction(data: {
  productId: string
  originalPrice: number
  sellingPrice: number
}) {
  try {
    await SessionService.requireAdmin()

    const validated = addSchema.parse(data)

    // Check if product is already in Off Section
    const exists = await isProductInOffSection(validated.productId)
    if (exists) {
      return { success: false, error: "This product is already in the Off Section." }
    }

    await AdminOffSectionService.addProduct(validated)

    revalidateAll()
    return { success: true }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" }
    }
    return { success: false, error: error.message || "An unknown error occurred." }
  }
}

export async function updateOffSectionAction(id: string, data: {
  originalPrice?: number
  sellingPrice?: number
  isOffEnabled?: boolean
}) {
  try {
    await SessionService.requireAdmin()

    const validated = updateSchema.parse(data)

    // Validate original > selling if both are present
    if (validated.originalPrice !== undefined && validated.sellingPrice !== undefined) {
      if (validated.originalPrice <= validated.sellingPrice) {
        return { success: false, error: "Original price must be greater than selling price." }
      }
    }

    await AdminOffSectionService.update(id, validated)

    revalidateAll()
    return { success: true }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" }
    }
    return { success: false, error: error.message || "An unknown error occurred." }
  }
}

export async function toggleOffStatusAction(id: string, isEnabled: boolean) {
  try {
    await SessionService.requireAdmin()

    await AdminOffSectionService.toggleStatus(id, isEnabled)

    revalidateAll()
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "An unknown error occurred." }
  }
}

export async function removeFromOffSectionAction(id: string) {
  try {
    await SessionService.requireAdmin()

    await AdminOffSectionService.remove(id)

    revalidateAll()
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "An unknown error occurred." }
  }
}
