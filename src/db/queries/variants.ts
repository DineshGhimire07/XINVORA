/**
 * db/queries/variants.ts — XINVORA Variant Repository
 *
 * Business-oriented read queries for Product Variants.
 * All cart additions, inventory checks, and price evaluations
 * target specific Variants, not root Products.
 */

import "server-only"
import { eq, and, isNull } from "drizzle-orm"
import { db } from "../client"
import { variants } from "../schema"

/**
 * Fetch a single variant by its SKU.
 * Highly critical for SKU scanning, checkout lookups, and inventory updates.
 */
export async function findVariantBySku(sku: string) {
  const result = await db.query.variants.findFirst({
    where: and(eq(variants.sku, sku), eq(variants.isActive, true), isNull(variants.deletedAt)),
    with: {
      product: true,
      color: true,
      size: true,
      inventory: true,
      variantImages: {
        orderBy: (vi, { asc }) => [asc(vi.position)],
      },
    },
  })
  return result ?? null
}

/**
 * Fetch all active variants for a given Product ID.
 * Typically used for variant selectors or PDP displays.
 */
export async function findVariantsByProductId(productId: string) {
  const rows = await db.query.variants.findMany({
    where: and(eq(variants.productId, productId), eq(variants.isActive, true), isNull(variants.deletedAt)),
    with: {
      color: true,
      size: true,
      inventory: true,
      variantImages: {
        orderBy: (vi, { asc }) => [asc(vi.position)],
      },
    },
  })
  return rows
}
