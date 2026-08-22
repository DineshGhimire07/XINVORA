"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { AdminProductService } from "@/services/admin.product.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"

// Ideally this schema lives in a shared lib/validations file, inline here for brevity
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  badge: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
  careGuide: z.string().optional().nullable(),
  sizeGuide: z.string().optional().nullable(),
  instagramReelUrl: z.string().optional().nullable(),
  virtualTryonPrompt: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable().transform((val) => {
    if (!val || !val.trim()) return "Premium quality garment crafted with attention to detail and timeless style."
    return val.trim()
  }),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.union([z.string().uuid(), z.literal(""), z.null()]).optional().transform((v) => (v && v.trim() ? v.trim() : null)),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  basePrice: z.number().or(z.string().transform(Number)),
  compareAtPrice: z.union([z.number(), z.string()]).optional().nullable().transform((val) => {
    if (val === "" || val === undefined || val === null) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }),
  stockQuantity: z.number().or(z.string().transform(Number)).default(0),
  images: z.array(z.string()).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  collectionIds: z.array(z.string()).optional(),
  materialIds: z.array(z.string()).optional(),
  pairedProductIds: z.array(z.string()).optional(),
  sizeStocks: z.record(z.string(), z.number()).optional(),
})

function extractDbError(error: any): string {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => `${issue.path.join(".") || "Field"}: ${issue.message}`).join(" | ")
  }
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
      seoKeywords: formData.get("seoKeywords") || undefined,
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
    revalidateTag("products", "default")
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
      seoKeywords: formData.get("seoKeywords") || undefined,
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
    revalidateTag("products", "default")
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
    revalidateTag("products", "default")
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
    revalidateTag("products", "default")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: extractDbError(error) }
  }
}

export async function bulkDeleteProductsAction(ids: string[]) {
  try {
    const session = await SessionService.requireAdmin()
    const results = await Promise.allSettled(
      ids.map(id => AdminProductService.hardDeleteProduct(id, session.id))
    )
    const deleted = results.filter(r => r.status === "fulfilled").length
    const failed = results.filter(r => r.status === "rejected").length
    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidatePath("/collections")
    revalidateTag("products", "default")
    return { success: true, deleted, failed }
  } catch (error: any) {
    return { success: false, error: extractDbError(error) }
  }
}

export async function getAdminProductsListAction() {
  try {
    await SessionService.requireAdmin()
    const { db } = await import("@/db/client")
    const { products } = await import("@/db/schema/products")
    const { productImages } = await import("@/db/schema/product-images")
    const { isNull, desc, eq, count } = await import("drizzle-orm")

    const list = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        status: products.status,
        imageCount: count(productImages.id),
      })
      .from(products)
      .leftJoin(productImages, eq(products.id, productImages.productId))
      .where(isNull(products.deletedAt))
      .groupBy(products.id, products.name, products.slug, products.status, products.createdAt)
      .orderBy(desc(products.createdAt))

    // Sort: Products with 0 images or DRAFT status first, then products with existing images pushed to bottom
    list.sort((a, b) => {
      if (a.imageCount === 0 && b.imageCount > 0) return -1
      if (a.imageCount > 0 && b.imageCount === 0) return 1
      if (a.status === "DRAFT" && b.status !== "DRAFT") return -1
      if (a.status !== "DRAFT" && b.status === "DRAFT") return 1
      return a.imageCount - b.imageCount
    })

    return { success: true, data: list }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch products list" }
  }
}

export async function quickUpdateProductAction(
  id: string,
  updates: {
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"
    price?: number
    stock?: number
  }
) {
  try {
    await SessionService.requireAdmin()
    const { db } = await import("@/db/client")
    const { products, variants, priceBookEntries, inventory, priceBooks } = await import("@/db/schema")
    const { eq } = await import("drizzle-orm")

    // Update Product status if provided
    if (updates.status) {
      await db
        .update(products)
        .set({ status: updates.status, updatedAt: new Date() })
        .where(eq(products.id, id))
    }

    // Get primary variant for this product
    const existingVariants = await db
      .select()
      .from(variants)
      .where(eq(variants.productId, id))
      .limit(1)

    let variantId = existingVariants[0]?.id

    if (!variantId && (updates.price !== undefined || updates.stock !== undefined)) {
      // Create default variant if none exists
      const p = await db.select().from(products).where(eq(products.id, id)).limit(1)
      if (p.length > 0) {
        const [newVar] = await db
          .insert(variants)
          .values({
            productId: id,
            sku: `${p[0].slug}-DEFAULT-${Date.now()}`,
          })
          .returning()
        variantId = newVar.id
      }
    }

    if (variantId) {
      // Update Price if provided
      if (updates.price !== undefined && updates.price >= 0) {
        const priceInCents = Math.round(updates.price * 100)
        const defaultPB = await db
          .select()
          .from(priceBooks)
          .where(eq(priceBooks.isDefault, true))
          .limit(1)

        if (defaultPB.length > 0) {
          const pbId = defaultPB[0].id
          const existingPrice = await db
            .select()
            .from(priceBookEntries)
            .where(eq(priceBookEntries.variantId, variantId))
            .limit(1)

          if (existingPrice.length > 0) {
            await db
              .update(priceBookEntries)
              .set({ price: priceInCents, updatedAt: new Date() })
              .where(eq(priceBookEntries.id, existingPrice[0].id))
          } else {
            await db.insert(priceBookEntries).values({
              priceBookId: pbId,
              variantId: variantId,
              price: priceInCents,
            })
          }
        }
      }

      // Update Stock if provided
      if (updates.stock !== undefined && updates.stock >= 0) {
        const existingInv = await db
          .select()
          .from(inventory)
          .where(eq(inventory.variantId, variantId))
          .limit(1)

        if (existingInv.length > 0) {
          await db
            .update(inventory)
            .set({ quantity: updates.stock, updatedAt: new Date() })
            .where(eq(inventory.id, existingInv[0].id))
        } else {
          await db.insert(inventory).values({
            variantId: variantId,
            quantity: updates.stock,
          })
        }
      }
    }

    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/${id}`)
    revalidateTag("products", "default")

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update product." }
  }
}
