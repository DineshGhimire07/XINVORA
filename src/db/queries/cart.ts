import { eq, and, desc, sql, inArray, isNull } from "drizzle-orm"
import { db } from "../client"
import { carts, cartItems, variants, products, productImages, colors, sizes, variantImages, priceBookEntries, inventory } from "../schema"
import type { CartResult, CartItemResult, HeaderCommerceState } from "./types"
import { cache } from "react"

// ── Short-lived per-user cart cache ──────────────────────────────────────────
const cartMemCache = new Map<string, { data: CartResult | null; ts: number }>()
const CART_CACHE_TTL_MS = 5_000 // 5 seconds

/**
 * Invalidates the in-memory cart cache for a given user/session.
 * Must be called after any cart mutation to prevent stale reads.
 */
export function invalidateCartCache(userId: string | null, sessionId: string | null) {
  if (userId) cartMemCache.delete(`user:${userId}`)
  if (sessionId) cartMemCache.delete(`session:${sessionId}`)
}

export const getCart = cache(async (
  userId: string | null,
  sessionId: string | null
): Promise<CartResult | null> => {
  if (!userId && !sessionId) return null

  // Check short-lived in-memory cache
  const cacheKey = userId ? `user:${userId}` : `session:${sessionId!}`
  const cached = cartMemCache.get(cacheKey)
  if (cached && (Date.now() - cached.ts) < CART_CACHE_TTL_MS) {
    return cached.data
  }

  const cartFilters = []
  if (userId) {
    cartFilters.push(eq(carts.userId, userId))
  } else if (sessionId) {
    cartFilters.push(eq(carts.sessionId, sessionId))
  }

  const cartList = await db
    .select()
    .from(carts)
    .where(cartFilters.length === 1 ? cartFilters[0] : undefined)
    .limit(1)

  if (cartList.length === 0) return null

  const cart = cartList[0]

  const items = await db
    .select({
      cartItem: cartItems,
      variant: variants,
      product: products,
      color: colors,
      size: sizes,
    })
    .from(cartItems)
    .innerJoin(variants, and(eq(cartItems.variantId, variants.id), isNull(variants.deletedAt)))
    .innerJoin(products, eq(variants.productId, products.id))
    .leftJoin(colors, eq(variants.colorId, colors.id))
    .leftJoin(sizes, eq(variants.sizeId, sizes.id))
    .where(eq(cartItems.cartId, cart.id))
    .orderBy(desc(cartItems.createdAt))

  // Extract IDs from already-resolved items — avoids 2 redundant
  // cartItems→variants subqueries that the old code ran per fetch
  const variantIds = items.map(row => row.variant.id)
  const productIds = [...new Set(items.map(row => row.product.id))]

  const [images, livePrices, prodImages, allVariants] = variantIds.length > 0
    ? await Promise.all([
        db.select().from(variantImages).where(inArray(variantImages.variantId, variantIds)),
        db.select().from(priceBookEntries).where(inArray(priceBookEntries.variantId, variantIds)),
        db.select().from(productImages).where(inArray(productImages.productId, productIds)),
        // Fetch all variants for the same products (for size swapper)
        db
          .select({ id: variants.id, productId: variants.productId, sizeId: variants.sizeId })
          .from(variants)
          .where(and(inArray(variants.productId, productIds), isNull(variants.deletedAt))),
        // And their inventory
        db.select().from(inventory).where(inArray(inventory.variantId, variantIds)),
      ])
    : [[], [], [], [], []]

  // Fetch size names for all sibling variant sizeIds
  const allSizeIds = [...new Set(allVariants.map(v => v.sizeId).filter(Boolean) as string[])]
  const allSizes = allSizeIds.length > 0
    ? await db.select({ id: sizes.id, name: sizes.name, abbreviation: sizes.abbreviation })
        .from(sizes)
        .where(inArray(sizes.id, allSizeIds))
    : []

  // Fetch inventory for sibling variants
  const siblingVariantIds = allVariants.map(v => v.id)
  const siblingInventory = siblingVariantIds.length > 0
    ? await db.select().from(inventory).where(inArray(inventory.variantId, siblingVariantIds))
    : []

  const resolvedItems: CartItemResult[] = items.map((row) => {
    let itemImages = images.filter((img) => img.variantId === row.variant.id)
    
    // Fallback to product images if variant has no specific images
    if (itemImages.length === 0) {
      itemImages = prodImages
        .filter((img) => img.productId === row.product.id)
        .map((img) => ({ ...img, variantId: row.variant.id })) as any
    }

    const priceEntry = livePrices.find((p) => p.variantId === row.variant.id)

    // Build sibling variants for this product
    const siblings = allVariants
      .filter(v => v.productId === row.product.id)
      .map(v => {
        const sizeRow = allSizes.find(s => s.id === v.sizeId)
        const inv = siblingInventory.find(i => i.variantId === v.id)
        return {
          id: v.id,
          size: sizeRow ? { name: sizeRow.name, abbreviation: sizeRow.abbreviation } : null,
          inStock: (inv?.quantity ?? 0) > 0,
        }
      })
      .sort((a, b) => (a.size?.name ?? "").localeCompare(b.size?.name ?? ""))

    return {
      ...row.cartItem,
      price: priceEntry?.price ?? 0,
      variant: {
        id: row.variant.id,
        sku: row.variant.sku,
        product: {
          id: row.product.id,
          name: row.product.name,
          slug: row.product.slug,
          categoryId: row.product.categoryId,
        },
        color: row.color ? { name: row.color.name } : null,
        size: row.size ? { name: row.size.name } : null,
        images: itemImages.map((img) => ({
          url: img.url,
          altText: img.altText,
        })),
      },
      siblingVariants: siblings,
    }
  })

  const result: CartResult = {
    ...cart,
    items: resolvedItems,
  }

  // Populate short-lived cache
  cartMemCache.set(cacheKey, { data: result, ts: Date.now() })

  return result
})

import { wishlists, wishlistItems } from "../schema"

export async function getHeaderCommerceState(
  userId: string | null,
  sessionId: string | null
): Promise<HeaderCommerceState> {
  const result: HeaderCommerceState = {
    cartCount: 0,
    wishlistCount: 0,
  }

  // Phase 1: Resolve cart and wishlist records concurrently
  const [cartList, wlList] = await Promise.all([
    (userId || sessionId)
      ? db
          .select({ id: carts.id })
          .from(carts)
          .where(userId ? eq(carts.userId, userId) : eq(carts.sessionId, sessionId!))
          .limit(1)
      : Promise.resolve([]),
    userId
      ? db
          .select({ id: wishlists.id })
          .from(wishlists)
          .where(eq(wishlists.userId, userId))
          .limit(1)
      : Promise.resolve([]),
  ])

  const cartId = cartList[0]?.id
  const wishlistId = wlList[0]?.id

  // Phase 2: Count cart and wishlist items concurrently
  const [cartCountResult, wishlistCountResult] = await Promise.all([
    cartId
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(cartItems)
          .where(eq(cartItems.cartId, cartId))
      : Promise.resolve([]),
    wishlistId
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(wishlistItems)
          .where(eq(wishlistItems.wishlistId, wishlistId))
      : Promise.resolve([]),
  ])

  result.cartCount = Number(cartCountResult[0]?.count ?? 0)
  result.wishlistCount = Number(wishlistCountResult[0]?.count ?? 0)

  return result
}
