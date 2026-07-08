import { z } from "zod"

export const addToCartSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(99, "Quantity cannot exceed 99"),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>

export const updateCartQuantitySchema = z.object({
  cartItemId: z.string().uuid("Invalid cart item ID"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(99, "Quantity cannot exceed 99"),
})

export type UpdateCartQuantityInput = z.infer<typeof updateCartQuantitySchema>

export const removeFromCartSchema = z.object({
  cartItemId: z.string().uuid("Invalid cart item ID"),
})

export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>
