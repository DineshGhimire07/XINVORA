"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { SessionService } from "@/services/session.service"
import {
  AdminBulkProductService,
  BulkProductItemInput
} from "@/services/admin.bulk-product.service"
import { AiContentEngine } from "@/domains/seo/engines/ai-content.engine"

export async function bulkUploadProductsAction(items: BulkProductItemInput[]) {
  try {
    const session = await SessionService.requireAdmin()

    if (!items || items.length === 0) {
      return { success: false, error: "No products provided for upload." }
    }

    const result = await AdminBulkProductService.bulkCreateProducts(items, session.id)

    revalidatePath("/admin/products")
    revalidatePath("/admin/collections")
    revalidateTag("products", {})

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Bulk product upload failed."
    }
  }
}

export async function generateAiProductContentAction(
  items: { name: string; categoryName: string }[]
) {
  try {
    await SessionService.requireAdmin()

    const generatedResults = items.map((item) => {
      if (!item.name || !item.name.trim()) return null
      return AiContentEngine.generateContent(item.name, item.categoryName || "Apparel")
    })

    return {
      success: true,
      data: generatedResults
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to auto-generate AI content."
    }
  }
}
