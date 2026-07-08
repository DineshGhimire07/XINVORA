"use server"

import { revalidatePath } from "next/cache"
import { WishlistService } from "../services/wishlist.service"
import { SessionService } from "../services/session.service"
import { CartService } from "../services/cart.service"
import type { ActionResult } from "../types/actions"
import { addToWishlistSchema, removeFromWishlistSchema } from "../validations/wishlist"

export async function saveForLaterAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  try {
    const session = await SessionService.requireAuth()
    const cartItemId = formData.get("cartItemId") as string
    const variantId = formData.get("variantId") as string

    // 1. Add variant to wishlist
    await WishlistService.addToWishlist({ variantId }, session.id)

    // 2. Remove variant from cart
    await CartService.removeFromCart({ cartItemId }, session.id, null)

    revalidatePath("/cart")
    revalidatePath("/wishlist")
    revalidatePath("/account/wishlist")

    return {
      success: true,
      data: { success: true }
    }
  } catch (error: any) {
    console.error("[saveForLaterAction Error]:", error)
    return {
      success: false,
      error: {
        code: "SAVE_FOR_LATER_ERROR",
        message: error.message || "Failed to save item for later."
      }
    }
  }
}

/**
 * Server Action for adding items to the wishlist.
 * Support for form actions (receives FormData).
 */
export async function addToWishlistAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  try {
    const session = await SessionService.requireAuth()
    const variantId = formData.get("variantId") as string
    
    const validated = addToWishlistSchema.parse({ variantId })
    await WishlistService.addToWishlist(validated, session.id)

    revalidatePath("/wishlist")
    revalidatePath("/account/wishlist")

    return {
      success: true,
      data: { success: true },
    }
  } catch (error: any) {
    console.error("[addToWishlistAction Error]:", error)
    return {
      success: false,
      error: {
        code: "WISHLIST_ADD_ERROR",
        message: error.message || "Failed to add item to wishlist.",
      },
    }
  }
}

/**
 * Server Action for removing items from the wishlist.
 * Support for form actions (receives FormData).
 */
export async function removeFromWishlistAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  try {
    const session = await SessionService.requireAuth()
    const wishlistItemId = formData.get("wishlistItemId") as string

    const validated = removeFromWishlistSchema.parse({ wishlistItemId })
    await WishlistService.removeFromWishlist(validated, session.id)

    revalidatePath("/wishlist")
    revalidatePath("/account/wishlist")

    return {
      success: true,
      data: { success: true },
    }
  } catch (error: any) {
    console.error("[removeFromWishlistAction Error]:", error)
    return {
      success: false,
      error: {
        code: "WISHLIST_REMOVE_ERROR",
        message: error.message || "Failed to remove item from wishlist.",
      },
    }
  }
}

/**
 * Dashboard-specific direct remove handler
 */
export async function removeWishlistItemAction(wishlistItemId: string): Promise<ActionResult<void>> {
  try {
    const session = await SessionService.requireAuth()
    const validated = removeFromWishlistSchema.parse({ wishlistItemId })
    await WishlistService.removeFromWishlist(validated, session.id)

    revalidatePath("/wishlist")
    revalidatePath("/account/wishlist")

    return { success: true, data: undefined }
  } catch (error: any) {
    console.error("[removeWishlistItemAction Error]:", error)
    return {
      success: false,
      error: {
        code: "WISHLIST_REMOVE_ERROR",
        message: error.message || "Failed to remove item from wishlist.",
      },
    }
  }
}

/**
 * Dashboard-specific move to cart handler
 */
export async function moveWishlistItemToCartAction(wishlistItemId: string): Promise<ActionResult<void>> {
  try {
    const session = await SessionService.requireAuth()
    await WishlistService.moveWishlistItemToCart({ wishlistItemId, removeFromWishlist: true }, session.id)

    revalidatePath("/wishlist")
    revalidatePath("/account/wishlist")
    revalidatePath("/cart")

    return { success: true, data: undefined }
  } catch (error: any) {
    console.error("[moveWishlistItemToCartAction Error]:", error)
    return {
      success: false,
      error: {
        code: "WISHLIST_TO_CART_ERROR",
        message: error.message || "Failed to move item to cart.",
      },
    }
  }
}

/**
 * Moves all wishlist items to the cart and clears the wishlist.
 */
export async function moveAllWishlistItemsToCartAction(): Promise<ActionResult<void>> {
  try {
    const session = await SessionService.requireAuth()
    const { getWishlist } = await import("@/db/queries/wishlist")
    const { CartService } = await import("@/services/cart.service")
    
    const wishlist = await getWishlist(session.id)
    if (!wishlist || wishlist.items.length === 0) {
      return { success: true, data: undefined }
    }

    // Add all items to cart
    for (const item of wishlist.items) {
      await CartService.addToCart({ variantId: item.variant.id, quantity: 1 }, session.id, null)
    }

    // Clear wishlist
    await WishlistService.clearWishlist(session.id)

    revalidatePath("/wishlist")
    revalidatePath("/account/wishlist")
    revalidatePath("/cart")

    return { success: true, data: undefined }
  } catch (error: any) {
    console.error("[moveAllWishlistItemsToCartAction Error]:", error)
    return {
      success: false,
      error: {
        code: "WISHLIST_TO_CART_ERROR",
        message: error.message || "Failed to move items to cart.",
      },
    }
  }
}

/**
 * Toggles a product in the wishlist by its productId (wishlists the first variant).
 */
export async function toggleWishlistByProductIdAction(productId: string): Promise<ActionResult<{ wishlisted: boolean }>> {
  try {
    const session = await SessionService.requireAuth()
    
    // Find first variant for this product
    const { db } = await import("@/db/client")
    const { variants, wishlistItems, wishlists } = await import("@/db/schema")
    const { eq, and } = await import("drizzle-orm")
    const { WishlistService } = await import("@/services/wishlist.service")

    const firstVariant = await db.query.variants.findFirst({
      where: and(eq(variants.productId, productId), eq(variants.isActive, true)),
    })

    if (!firstVariant) {
      throw new Error("No active variants found for this product.")
    }

    const wishlist = await WishlistService.resolveWishlist(session.id)
    const existingItem = wishlist.items.find(i => i.variant.id === firstVariant.id)

    let wishlisted = false
    if (existingItem) {
      await db.delete(wishlistItems).where(eq(wishlistItems.id, existingItem.id))
      wishlisted = false
    } else {
      await db.insert(wishlistItems).values({
        wishlistId: wishlist.id,
        variantId: firstVariant.id,
      })
      wishlisted = true
    }

    revalidatePath("/wishlist")
    revalidatePath("/account/wishlist")

    return { success: true, data: { wishlisted } }
  } catch (error: any) {
    console.error("[toggleWishlistByProductIdAction Error]:", error)
    return {
      success: false,
      error: {
        code: "WISHLIST_TOGGLE_ERROR",
        message: error.message || "Failed to toggle wishlist.",
      },
    }
  }
}
