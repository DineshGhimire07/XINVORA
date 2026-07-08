import { eq, desc, inArray, and, isNull } from "drizzle-orm"
import { db } from "../client"
import { wishlists, wishlistItems, variants, products, productImages, colors, sizes, variantImages, priceBookEntries } from "../schema"
import type { WishlistResult, WishlistItemResult } from "./types"

export async function getWishlist(
  userId: string
): Promise<WishlistResult | null> {
  const wlList = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.userId, userId))
    .limit(1)

  if (wlList.length === 0) return null

  const wishlist = wlList[0]

  const items = await db
    .select({
      wishlistItem: wishlistItems,
      variant: variants,
      product: products,
      color: colors,
      size: sizes,
    })
    .from(wishlistItems)
    .innerJoin(variants, and(eq(wishlistItems.variantId, variants.id), isNull(variants.deletedAt)))
    .innerJoin(products, eq(variants.productId, products.id))
    .leftJoin(colors, eq(variants.colorId, colors.id))
    .leftJoin(sizes, eq(variants.sizeId, sizes.id))
    .where(eq(wishlistItems.wishlistId, wishlist.id))
    .orderBy(desc(wishlistItems.addedAt))

  const variantSubquery = db
    .select({ variantId: wishlistItems.variantId })
    .from(wishlistItems)
    .innerJoin(variants, and(eq(wishlistItems.variantId, variants.id), isNull(variants.deletedAt)))
    .where(eq(wishlistItems.wishlistId, wishlist.id))

  const productSubquery = db
    .select({ productId: variants.productId })
    .from(wishlistItems)
    .innerJoin(variants, and(eq(wishlistItems.variantId, variants.id), isNull(variants.deletedAt)))
    .where(eq(wishlistItems.wishlistId, wishlist.id))

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
      .where(inArray(productImages.productId, productSubquery))
  ])

  const resolvedItems: WishlistItemResult[] = items.map((row) => {
    let itemImages = images.filter((img) => img.variantId === row.variant.id)
    if (itemImages.length === 0) {
      itemImages = prodImages.filter((img) => img.productId === row.product.id) as any
    }

    const priceEntry = livePrices.find((p) => p.variantId === row.variant.id)

    return {
      ...row.wishlistItem,
      price: priceEntry?.price ?? null,
      variant: {
        id: row.variant.id,
        sku: row.variant.sku,
        product: {
          id: row.product.id,
          name: row.product.name,
          slug: row.product.slug,
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
    ...wishlist,
    items: resolvedItems,
  }
}
