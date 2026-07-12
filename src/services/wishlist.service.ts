import { eq } from "drizzle-orm"
import { db } from "@/db/client"
import { wishlists, wishlistItems } from "@/db/schema"
import { DomainError } from "./errors"
import { getWishlist } from "@/db/queries/wishlist"
import { CartService } from "./cart.service"
import type { AddToWishlistInput, RemoveFromWishlistInput, MoveWishlistItemToCartInput } from "@/validations/wishlist"
import type { WishlistResult } from "@/db/queries/types"

export class WishlistService {
  /**
   * Resolves the wishlist ID for a user, creating the wishlist record if it doesn't exist.
   * Lightweight: fetches only the `id` column — no items, no joins.
   */
  private static async resolveWishlistId(userId: string): Promise<string> {
    const existing = await db
      .select({ id: wishlists.id })
      .from(wishlists)
      .where(eq(wishlists.userId, userId))
      .limit(1)

    if (existing.length > 0) return existing[0].id

    const [newList] = await db
      .insert(wishlists)
      .values({ userId })
      .returning({ id: wishlists.id })

    return newList.id
  }

  /**
   * Retrieves or creates a wishlist for the user.
   */
  static async resolveWishlist(userId: string): Promise<WishlistResult> {
    const existingList = await getWishlist(userId)
    if (existingList) return existingList

    const [newList] = await db.insert(wishlists).values({
      userId,
    }).returning()

    return { ...newList, items: [] }
  }

  /**
   * Adds a variant to the wishlist. Ignores duplicates silently.
   * Uses onConflictDoNothing() — the DB unique index on (wishlistId, variantId)
   * enforces uniqueness, so no application-level existence check is needed.
   */
  static async addToWishlist(input: AddToWishlistInput, userId: string) {
    const wishlistId = await this.resolveWishlistId(userId)

    await db
      .insert(wishlistItems)
      .values({ wishlistId, variantId: input.variantId })
      .onConflictDoNothing()

    return { success: true }
  }

  /**
   * Lightweight toggle flow for a variant. Ensures wishlist exists, checks existence
   * of the variant in wishlistItems with a simple query, and inserts or deletes it.
   */
  static async toggleWishlistLightweight(variantId: string, userId: string): Promise<{ wishlisted: boolean }> {
    const wishlistId = await this.resolveWishlistId(userId)

    // Check if item exists in wishlistItems using a simple SELECT
    const [existing] = await db
      .select({ id: wishlistItems.id })
      .from(wishlistItems)
      .where(
        eq(wishlistItems.wishlistId, wishlistId) &&
        eq(wishlistItems.variantId, variantId)
      )
      .limit(1)

    if (existing) {
      await db.delete(wishlistItems).where(eq(wishlistItems.id, existing.id))
      return { wishlisted: false }
    } else {
      await db.insert(wishlistItems).values({
        wishlistId,
        variantId,
      })
      return { wishlisted: true }
    }
  }

  /**
   * Removes an item from the wishlist.
   */
  static async removeFromWishlist(input: RemoveFromWishlistInput, userId: string) {
    const wishlist = await getWishlist(userId)
    if (!wishlist) throw new DomainError("NOT_FOUND", "Wishlist not found")

    const item = wishlist.items.find(i => i.id === input.wishlistItemId)
    if (!item) throw new DomainError("NOT_FOUND", "Wishlist item not found")

    await db.delete(wishlistItems).where(eq(wishlistItems.id, input.wishlistItemId))

    return { success: true }
  }

  /**
   * Moves a wishlist item to the cart.
   */
  static async moveWishlistItemToCart(input: MoveWishlistItemToCartInput, userId: string) {
    const wishlist = await getWishlist(userId)
    if (!wishlist) throw new DomainError("NOT_FOUND", "Wishlist not found")

    const item = wishlist.items.find(i => i.id === input.wishlistItemId)
    if (!item) throw new DomainError("NOT_FOUND", "Wishlist item not found")

    // Add to Cart via CartService
    await CartService.addToCart(
      { variantId: item.variant.id, quantity: 1 },
      userId,
      null // Wishlists strictly belong to authenticated users
    )

    if (input.removeFromWishlist) {
      await db.delete(wishlistItems).where(eq(wishlistItems.id, input.wishlistItemId))
    }

    return { success: true }
  }

  /**
   * Clears the entire wishlist.
   */
  static async clearWishlist(userId: string) {
    const wishlist = await getWishlist(userId)
    if (!wishlist) return { success: true }

    await db.delete(wishlistItems).where(eq(wishlistItems.wishlistId, wishlist.id))

    return { success: true }
  }
}
