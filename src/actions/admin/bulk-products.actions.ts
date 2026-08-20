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

export interface SmartImageGroup {
  groupName: string
  categoryName: string
  suggestedPrice: number
  suggestedSizes: string
  matchedProductId?: string
  matchedProductName?: string
  images: string[]
  shortDescription?: string
  description?: string
}

export async function smartGroupAndMatchImagesAction(
  inputImages: { url: string; title: string }[]
) {
  try {
    await SessionService.requireAdmin()

    if (!inputImages || inputImages.length === 0) {
      return { success: false, error: "No images provided for smart grouping." }
    }

    // Fetch existing products for computer vision / pattern matching
    const { db } = await import("@/db/client")
    const { products } = await import("@/db/schema/products")
    const { isNull } = await import("drizzle-orm")

    const existingProducts = await db
      .select({ id: products.id, name: products.name, slug: products.slug })
      .from(products)
      .where(isNull(products.deletedAt))

    // Helper to clean image title to find core product name
    const cleanImageTitle = (rawTitle: string): string => {
      let name = rawTitle.replace(/\.[a-z0-9]+$/i, "") // remove ext
      name = name.replace(/^\d{10,}_/, "") // remove timestamp
      name = name.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "")
      name = name.replace(/[-_.]+/g, " ")

      const ignoreWords = [
        "front", "back", "side", "model", "detail", "close", "close-up", "closeup",
        "lifestyle", "lookbook", "angle", "view", "full", "crop", "cropped", "fabric",
        "img", "dsc", "photo", "image", "pic", "picture", "chatgpt", "jul", "jun", "aug", "2026", "2025"
      ]

      const tokens = name.split(/\s+/).filter((w) => {
        const lower = w.toLowerCase()
        return !ignoreWords.includes(lower) && !/^\d+$/.test(w)
      })

      let cleaned = tokens.join(" ").trim()
      if (!cleaned || cleaned.length < 3) {
        cleaned = rawTitle.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ")
      }

      // Title case
      return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
    }

    // Group images by core product title
    const groupMap = new Map<string, { groupName: string; images: string[] }>()

    for (const img of inputImages) {
      const coreName = cleanImageTitle(img.title)
      const key = coreName.toLowerCase().trim()

      if (!groupMap.has(key)) {
        groupMap.set(key, { groupName: coreName, images: [img.url] })
      } else {
        groupMap.get(key)!.images.push(img.url)
      }
    }

    // Match groups against existing DB products or generate AI attributes
    const smartGroups: SmartImageGroup[] = []

    for (const [, group] of groupMap) {
      const gNameLower = group.groupName.toLowerCase()

      // Try matching existing product by name or slug
      const matched = existingProducts.find((p) => {
        const pNameLower = p.name.toLowerCase()
        const pSlugLower = p.slug.toLowerCase()
        return (
          pNameLower.includes(gNameLower) ||
          gNameLower.includes(pNameLower) ||
          pSlugLower.includes(gNameLower.replace(/\s+/g, "-"))
        )
      })

      if (matched) {
        smartGroups.push({
          groupName: matched.name,
          categoryName: "Dresses",
          suggestedPrice: 1500,
          suggestedSizes: "S:10, M:15, L:20, XL:5",
          matchedProductId: matched.id,
          matchedProductName: matched.name,
          images: group.images
        })
      } else {
        // Auto generate AI content
        const ai = AiContentEngine.generateContent(group.groupName, "Dresses")
        smartGroups.push({
          groupName: group.groupName,
          categoryName: "Dresses",
          suggestedPrice: 1500,
          suggestedSizes: "Free Size (Fits XS-XL):20",
          images: group.images,
          shortDescription: ai.shortDescription,
          description: ai.description
        })
      }
    }

    return {
      success: true,
      data: smartGroups
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to auto-group images."
    }
  }
}

export async function attachImagesToExistingProductsAction(
  attachments: { productId: string; imageUrls: string[] }[]
) {
  try {
    await SessionService.requireAdmin()

    if (!attachments || attachments.length === 0) {
      return { success: false, error: "No attachments specified." }
    }

    const { db } = await import("@/db/client")
    const { productImages } = await import("@/db/schema/product-images")
    const { eq } = await import("drizzle-orm")

    for (const att of attachments) {
      // Find current max position
      const existing = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, att.productId))

      let maxPos = existing.reduce((max, img) => Math.max(max, img.position || 0), -1)

      const newRows = att.imageUrls.map((url) => {
        maxPos++
        return {
          productId: att.productId,
          url: url.trim(),
          position: maxPos
        }
      })

      if (newRows.length > 0) {
        await db.insert(productImages).values(newRows)
      }
    }

    revalidatePath("/admin/products")
    revalidateTag("products", {})

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to attach images to existing products." }
  }
}

