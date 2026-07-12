import { eq, and, desc, sql, inArray, isNull } from "drizzle-orm"
import { db } from "../client"
import { carts, cartItems, variants, products, productImages, colors, sizes, variantImages, priceBookEntries } from "../schema"
import type { CartResult, CartItemResult, HeaderCommerceState } from "./types"
import { cache } from "react"

export const getCart = cache(async (
  userId: string | null,
  sessionId: string | null
): Promise<CartResult | null> => {
  if (!userId && !sessionId) return null

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

  const variantSubquery = db
    .select({ variantId: cartItems.variantId })
    .from(cartItems)
    .innerJoin(variants, and(eq(cartItems.variantId, variants.id), isNull(variants.deletedAt)))
    .where(eq(cartItems.cartId, cart.id))

  const productSubquery = db
    .select({ productId: variants.productId })
    .from(cartItems)
    .innerJoin(variants, and(eq(cartItems.variantId, variants.id), isNull(variants.deletedAt)))
    .where(eq(cartItems.cartId, cart.id))

  const [images, livePrices, prodImages] = await Promise.all([
    db
      .select()
      .from(variantImages)
      .where(inArray(variantImages.variantId, variantSubquery)),
    db
      .select()
      .from(priceBookEntries)
      .where(inArray(priceBookEntries.variantId, variantSubquery)),
    db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productSubquery)),
  ])

  const resolvedItems: CartItemResult[] = items.map((row) => {
    let itemImages = images.filter((img) => img.variantId === row.variant.id)
    
    // Fallback to product images if variant has no specific images
    if (itemImages.length === 0) {
      itemImages = prodImages
        .filter((img) => img.productId === row.product.id)
        .map((img) => ({ ...img, variantId: row.variant.id })) as any
    }

    const priceEntry = livePrices.find((p) => p.variantId === row.variant.id)

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
    }
  })

  return {
    ...cart,
    items: resolvedItems,
  }
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
