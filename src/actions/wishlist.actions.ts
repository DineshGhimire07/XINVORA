"use server"

import { revalidatePath } from "next/cache"
import { WishlistService } from "../services/wishlist.service"
import { SessionService } from "../services/session.service"
import { CartService } from "../services/cart.service"
import type { ActionResult } from "../types/actions"
import { addToWishlistSchema, removeFromWishlistSchema } from "../validations/wishlist"
import { type TimingEntry, printTimingSummary } from "@/lib/perf"
import { invalidateCartCache } from "@/db/queries/cart"

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

    invalidateCartCache(session.id, null)
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
  const totalStart = performance.now()
  const timings: TimingEntry[] = []
  try {
    const sessionStart = performance.now()
    const session = await SessionService.requireAuth()
    timings.push({ name: 'requireAuth', ms: performance.now() - sessionStart })
    
    // Find first variant for this product
    const { db } = await import("@/db/client")
    const { variants } = await import("@/db/schema")
    const { eq, and } = await import("drizzle-orm")
    const { WishlistService } = await import("@/services/wishlist.service")

    const dbStart = performance.now()
    const firstVariant = await db.query.variants.findFirst({
      where: and(eq(variants.productId, productId), eq(variants.isActive, true)),
    })
    timings.push({ name: 'findFirstVariant', ms: performance.now() - dbStart })

    if (!firstVariant) {
      throw new Error("No active variants found for this product.")
    }

    const toggleStart = performance.now()
    const { wishlisted } = await WishlistService.toggleWishlistLightweight(firstVariant.id, session.id)
    timings.push({ name: 'toggleWishlistLightweight', ms: performance.now() - toggleStart })

    revalidatePath("/wishlist")
    revalidatePath("/account/wishlist")

    printTimingSummary('toggleWishlistByProductIdAction', timings, performance.now() - totalStart)

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

/**
 * Toggles a product variant in the wishlist by its variantId.
 */
export async function toggleWishlistAction(variantId: string): Promise<ActionResult<{ wishlisted: boolean }>> {
  const totalStart = performance.now()
  const timings: TimingEntry[] = []
  try {
    const sessionStart = performance.now()
    const session = await SessionService.requireAuth()
    timings.push({ name: 'requireAuth', ms: performance.now() - sessionStart })

    const { WishlistService } = await import("@/services/wishlist.service")

    const toggleStart = performance.now()
    const { wishlisted } = await WishlistService.toggleWishlistLightweight(variantId, session.id)
    timings.push({ name: 'toggleWishlistLightweight', ms: performance.now() - toggleStart })

    revalidatePath("/wishlist")
    revalidatePath("/account/wishlist")

    printTimingSummary('toggleWishlistAction', timings, performance.now() - totalStart)

    return { success: true, data: { wishlisted } }
  } catch (error: any) {
    console.error("[toggleWishlistAction Error]:", error)
    return {
      success: false,
      error: {
        code: "WISHLIST_TOGGLE_ERROR",
        message: error.message || "Failed to toggle wishlist.",
      },
    }
  }
}

