import { db } from "../db/client"
import {
  products,
  variants,
  productImages,
  priceBookEntries,
  priceBooks,
  inventory,
  categories,
  brands,
  colors,
  sizes,
  darazSyncedProducts,
} from "../db/schema"
import { eq, and, sql, inArray } from "drizzle-orm"
import type { CloudinaryAssetRecord } from "./cloudinary-media-sync.service"

export interface StorefrontMapOptions {
  publishImmediately?: boolean // Default false: keeps products in DRAFT until validated
}

export interface StorefrontMapResult {
  darazItemId: string
  productId: string
  slug: string
  status: "DRAFT" | "PUBLISHED"
  variantsCount: number
  imagesCount: number
  pricesCount: number
}

// Fallback XINVORA brand ID
const DEFAULT_BRAND_ID = "05649399-ebd8-414e-bd58-4a33c9ac38f3"
// Default NPR Price Book ID
const DEFAULT_NPR_PRICE_BOOK_ID = "79346424-912a-4ea0-b6f2-c54eb08f6a8d"

export class DarazStorefrontMapper {
  /**
   * Generates a clean, URL-safe slug from product title and Daraz item ID
   */
  public static generateSlug(title: string, itemId: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70)
      .replace(/-+$/, "")

    return `${baseSlug}-${itemId}`
  }

  /**
   * Resolves or dynamically creates a storefront category for a Daraz category
   */
  public static async resolveCategory(categoryName: string): Promise<string> {
    const cleanName = categoryName.trim()
    const cleanSlug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    // 1. Try to find existing category by slug or name
    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(sql`lower(${categories.slug}) = ${cleanSlug.toLowerCase()} or lower(${categories.name}) = ${cleanName.toLowerCase()}`)
      .limit(1)

    if (existing) {
      return existing.id
    }

    // 2. If not found, insert new category
    const [inserted] = await db
      .insert(categories)
      .values({
        name: cleanName,
        slug: cleanSlug,
        description: `Curated XINVORA ${cleanName} collection`,
      })
      .returning({ id: categories.id })

    return inserted.id
  }

  /**
   * Resolves or matches color/size options for a SKU
   */
  public static async resolveColorAndSize(saleProp: Record<string, any> = {}): Promise<{
    colorId: string | null
    sizeId: string | null
  }> {
    let colorId: string | null = null
    let sizeId: string | null = null

    const colorName = saleProp.color_family || saleProp.color
    if (colorName && typeof colorName === "string") {
      const [existingColor] = await db
        .select({ id: colors.id })
        .from(colors)
        .where(sql`lower(${colors.name}) = ${colorName.trim().toLowerCase()}`)
        .limit(1)

      if (existingColor) {
        colorId = existingColor.id
      } else {
        // Create new color record
        const [newColor] = await db
          .insert(colors)
          .values({
            name: colorName.trim(),
            hexCode: "#808080", // Neutral default swatch
          })
          .returning({ id: colors.id })
        colorId = newColor.id
      }
    }

    const sizeName = saleProp.size || saleProp.Size
    if (sizeName && typeof sizeName === "string") {
      const [existingSize] = await db
        .select({ id: sizes.id })
        .from(sizes)
        .where(sql`lower(${sizes.name}) = ${sizeName.trim().toLowerCase()}`)
        .limit(1)

      if (existingSize) {
        sizeId = existingSize.id
      } else {
        const [newSize] = await db
          .insert(sizes)
          .values({
            name: sizeName.trim(),
            abbreviation: sizeName.trim().slice(0, 10),
            category: "Apparel",
          })
          .returning({ id: sizes.id })
        sizeId = newSize.id
      }
    }

    return { colorId, sizeId }
  }

  /**
   * Maps a single Daraz item (with all its SKUs) to native XINVORA storefront tables:
   * products, product_images, variants, price_book_entries, inventory
   */
  public static async mapProduct(
    darazItemId: string,
    options: StorefrontMapOptions = {}
  ): Promise<StorefrontMapResult> {
    const skuRows = await db
      .select()
      .from(darazSyncedProducts)
      .where(eq(darazSyncedProducts.darazItemId, darazItemId))

    if (skuRows.length === 0) {
      throw new Error(`Daraz Item ${darazItemId} not found in daraz_synced_products`)
    }

    const firstSku = skuRows[0]
    const title = firstSku.title
    const description = firstSku.description || ""
    const shortDescription = firstSku.shortDescription || ""
    const categoryName = firstSku.categoryName || "General"
    const slug = this.generateSlug(title, darazItemId)
    const categoryId = await this.resolveCategory(categoryName)

    const publishStatus: "DRAFT" | "PUBLISHED" = options.publishImmediately ? "PUBLISHED" : "DRAFT"

    // 1. Create or Update `products` record
    let productId = firstSku.websiteProductId

    if (productId) {
      await db
        .update(products)
        .set({
          name: title,
          slug,
          description,
          shortDescription,
          categoryId,
          brandId: DEFAULT_BRAND_ID,
          status: publishStatus,
          isDarazMaster: true,
          isLegacyArchived: false,
          seoTitle: `${title} | XINVORA`,
          seoDescription: shortDescription || description.slice(0, 160),
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
    } else {
      const [insertedProduct] = await db
        .insert(products)
        .values({
          name: title,
          slug,
          description,
          shortDescription,
          categoryId,
          brandId: DEFAULT_BRAND_ID,
          status: publishStatus,
          isDarazMaster: true,
          isLegacyArchived: false,
          seoTitle: `${title} | XINVORA`,
          seoDescription: shortDescription || description.slice(0, 160),
        })
        .returning({ id: products.id })

      productId = insertedProduct.id
    }

    // 2. Map Images into `product_images`
    // Extract unique Cloudinary assets across all SKUs of this product
    const rawAssets: CloudinaryAssetRecord[] = (firstSku.cloudinaryImages as CloudinaryAssetRecord[]) || []
    
    // Clean old images for this product before re-inserting
    await db.delete(productImages).where(eq(productImages.productId, productId))

    let imagesCount = 0
    for (const asset of rawAssets) {
      if (asset.secureUrl && asset.secureUrl.includes("res.cloudinary.com")) {
        await db.insert(productImages).values({
          productId,
          url: asset.secureUrl,
          altText: `${title} - XINVORA Collection`,
          position: asset.position || (imagesCount + 1),
          imageRole: asset.role || "gallery",
        })
        imagesCount++
      }
    }

    // 3. Map SKUs into `variants`, `price_book_entries`, `inventory`
    let variantsCount = 0
    let pricesCount = 0

    // Fetch existing variants for this product
    const existingVariants = await db
      .select()
      .from(variants)
      .where(eq(variants.productId, productId))

    for (const skuRow of skuRows) {
      const sellerSku = skuRow.sellerSku
      let variantId = skuRow.websiteVariantId

      // Check if variant already exists by SKU
      const matched = existingVariants.find((v) => v.sku === sellerSku)
      if (matched) {
        variantId = matched.id
      }

      const isLiveOnDaraz = skuRow.productStatus.toLowerCase() === "active" || skuRow.productStatus.toLowerCase() === "live"

      if (variantId) {
        await db
          .update(variants)
          .set({
            isActive: isLiveOnDaraz,
            updatedAt: new Date(),
          })
          .where(eq(variants.id, variantId))
      } else {
        const [newVariant] = await db
          .insert(variants)
          .values({
            productId,
            sku: sellerSku,
            isActive: isLiveOnDaraz,
          })
          .returning({ id: variants.id })

        variantId = newVariant.id
      }
      variantsCount++

      // 4. Map Pricing into `price_book_entries` (Price in minor units / paisa: NPR 424.00 -> 42400)
      const websitePricePaisa = Math.round(Number(skuRow.websiteCalculatedPrice) * 100)
      const darazOrigPricePaisa = Math.round(Number(skuRow.darazOriginalPrice) * 100)

      // Upsert into Default NPR price book
      await db
        .insert(priceBookEntries)
        .values({
          priceBookId: DEFAULT_NPR_PRICE_BOOK_ID,
          variantId,
          price: websitePricePaisa,
          compareAtPrice: darazOrigPricePaisa,
        })
        .onConflictDoUpdate({
          target: [priceBookEntries.priceBookId, priceBookEntries.variantId],
          set: {
            price: websitePricePaisa,
            compareAtPrice: darazOrigPricePaisa,
            updatedAt: new Date(),
          },
        })

      pricesCount++

      // 5. Map Stock into `inventory`
      const stockQty = skuRow.darazStock
      const invStatus = stockQty > 0 ? (stockQty <= 5 ? "LOW_STOCK" : "IN_STOCK") : "OUT_OF_STOCK"

      await db
        .insert(inventory)
        .values({
          variantId,
          quantity: stockQty,
          status: invStatus,
        })
        .onConflictDoUpdate({
          target: [inventory.variantId],
          set: {
            quantity: stockQty,
            status: invStatus,
            updatedAt: new Date(),
          },
        })

      // 6. Update back-pointer in `daraz_synced_products`
      await db
        .update(darazSyncedProducts)
        .set({
          websiteProductId: productId,
          websiteVariantId: variantId,
          isPublishedOnWebsite: publishStatus === "PUBLISHED",
          updatedAt: new Date(),
        })
        .where(eq(darazSyncedProducts.id, skuRow.id))
    }

    return {
      darazItemId,
      productId,
      slug,
      status: publishStatus,
      variantsCount,
      imagesCount,
      pricesCount,
    }
  }
}
