import { eq, and } from "drizzle-orm"
import { db } from "@/db/client"
import { wishlists, wishlistItems } from "@/db/schema"
import { DomainError } from "./errors"
import { getWishlist } from "@/db/queries/wishlist"
import { CartService } from "./cart.service"
import type { AddToWishlistInput, RemoveFromWishlistInput, MoveWishlistItemToCartInput } from "@/validations/wishlist"

export class WishlistService {
  /**
   * Retrieves or creates a wishlist for the user.
   */
  static async resolveWishlist(userId: string) {
    const existingList = await getWishlist(userId)
    if (existingList) return existingList

    const [newList] = await db.insert(wishlists).values({
      userId,
    }).returning()

    return { ...newList, items: [] }
  }

  /**
   * Adds a variant to the wishlist. Ignores duplicates silently.
   */
  static async addToWishlist(input: AddToWishlistInput, userId: string) {
    const wishlist = await this.resolveWishlist(userId)

    const exists = wishlist.items.some(i => i.variant.id === input.variantId)
    if (!exists) {
      await db.insert(wishlistItems).values({
        wishlistId: wishlist.id,
        variantId: input.variantId,
      })
    }

    return { success: true }
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
