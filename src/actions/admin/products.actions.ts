"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { AdminProductService } from "@/services/admin.product.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"

// Ideally this schema lives in a shared lib/validations file, inline here for brevity
const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  badge: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
  careGuide: z.string().optional().nullable(),
  sizeGuide: z.string().optional().nullable(),
  instagramReelUrl: z.string().optional().nullable(),
  virtualTryonPrompt: z.string().optional().nullable(),
  shortDescription: z.string().min(30, "Short description must be at least 30 characters").max(250, "Short description must be at most 250 characters"),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  basePrice: z.number().or(z.string().transform(Number)),
  compareAtPrice: z.union([z.number(), z.string()]).optional().nullable().transform((val) => {
    if (val === "" || val === undefined || val === null) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }),
  stockQuantity: z.number().or(z.string().transform(Number)).default(0),
  images: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  collectionIds: z.array(z.string()).optional(),
  materialIds: z.array(z.string()).optional(),
  pairedProductIds: z.array(z.string()).optional(),
  sizeStocks: z.record(z.string(), z.number()).optional(),
})

function extractDbError(error: any): string {
  if (error.cause?.message) {
    return error.cause.message;
  }
  return error.message || "An unknown database error occurred.";
}

export async function createProductAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const sizeStocks: Record<string, number> = {}
    for (const [key, val] of formData.entries()) {
      if (key.startsWith("sizeStock_")) {
        const sizeId = key.replace("sizeStock_", "")
        sizeStocks[sizeId] = Number(val) || 0
      }
    }

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      badge: formData.get("badge") || null,
      details: formData.get("details") || null,
      careGuide: formData.get("careGuide") || null,
      sizeGuide: formData.get("sizeGuide") || null,
      instagramReelUrl: formData.get("instagramReelUrl") || null,
      virtualTryonPrompt: formData.get("virtualTryonPrompt") || null,
      shortDescription: formData.get("shortDescription") || "",
      categoryId: formData.get("categoryId"),
      brandId: formData.get("brandId") || null,
      status: formData.get("status"),
      basePrice: formData.get("basePrice"),
      compareAtPrice: formData.get("compareAtPrice"),
      stockQuantity: formData.get("stockQuantity") || "0",
      images: formData.getAll("images"),
      seoTitle: formData.get("seoTitle") || undefined,
      seoDescription: formData.get("seoDescription") || undefined,
      collectionIds: formData.getAll("collectionIds"),
      materialIds: formData.getAll("materialIds"),
      pairedProductIds: formData.getAll("pairedProductIds"),
      sizeStocks: sizeStocks,
    }

    const data = productSchema.parse(rawData)

    // Ensure slug is URL-safe
    data.slug = data.slug
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    const newProduct = await AdminProductService.createProduct(
      {
        ...data,
        basePrice: data.basePrice.toString(),
        compareAtPrice: data.compareAtPrice ? data.compareAtPrice.toString() : null
      },
      session.id
    )

    revalidatePath("/admin/products")
    revalidateTag("products", {})
    return { success: true }
  } catch (error: any) {
    return { success: false, error: extractDbError(error) }
  }
}

export async function updateProductAction(id: string, formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const sizeStocks: Record<string, number> = {}
    for (const [key, val] of formData.entries()) {
      if (key.startsWith("sizeStock_")) {
        const sizeId = key.replace("sizeStock_", "")
        sizeStocks[sizeId] = Number(val) || 0
      }
    }

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      badge: formData.get("badge") || null,
      details: formData.get("details") || null,
      careGuide: formData.get("careGuide") || null,
      sizeGuide: formData.get("sizeGuide") || null,
      instagramReelUrl: formData.get("instagramReelUrl") || null,
      virtualTryonPrompt: formData.get("virtualTryonPrompt") || null,
      shortDescription: formData.get("shortDescription") || "",
      categoryId: formData.get("categoryId"),
      brandId: formData.get("brandId") || null,
      status: formData.get("status"),
      basePrice: formData.get("basePrice"),
      compareAtPrice: formData.get("compareAtPrice"),
      stockQuantity: formData.get("stockQuantity") || "0",
      images: formData.getAll("images"),
      seoTitle: formData.get("seoTitle") || undefined,
      seoDescription: formData.get("seoDescription") || undefined,
      collectionIds: formData.getAll("collectionIds"),
      materialIds: formData.getAll("materialIds"),
      pairedProductIds: formData.getAll("pairedProductIds"),
      sizeStocks: sizeStocks,
    }

    const data = productSchema.parse(rawData)
    
    // Ensure slug is URL-safe
    data.slug = data.slug
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    await AdminProductService.updateProduct(
      id,
      {
        ...data,
        basePrice: data.basePrice.toString(),
        compareAtPrice: data.compareAtPrice ? data.compareAtPrice.toString() : null
      },
      session.id
    )

    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/${id}`)
    revalidateTag("products", {})
    return { success: true }
  } catch (error: any) {
    return { success: false, error: extractDbError(error) }
  }
}

export async function archiveProductAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    await AdminProductService.deleteProduct(id, session.id)
    revalidatePath("/admin/products")
    revalidateTag("products", {})
    return { success: true }
  } catch (error: any) {
    return { success: false, error: extractDbError(error) }
  }
}

export async function hardDeleteProductAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    await AdminProductService.hardDeleteProduct(id, session.id)
    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidatePath("/collections")
    revalidateTag("products", {})
    return { success: true }
  } catch (error: any) {
    return { success: false, error: extractDbError(error) }
  }
}
