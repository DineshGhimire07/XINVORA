import { z } from "zod"

export const addToWishlistSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
})

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>

export const removeFromWishlistSchema = z.object({
  wishlistItemId: z.string().uuid("Invalid wishlist item ID"),
})

export type RemoveFromWishlistInput = z.infer<typeof removeFromWishlistSchema>

export const moveWishlistItemToCartSchema = z.object({
  wishlistItemId: z.string().uuid("Invalid wishlist item ID"),
  removeFromWishlist: z.coerce.boolean().default(true),
})

export type MoveWishlistItemToCartInput = z.infer<typeof moveWishlistItemToCartSchema>
