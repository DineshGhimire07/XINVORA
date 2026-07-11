import { eq, and, sql } from "drizzle-orm"
import { db } from "@/db/client"
import { carts, cartItems, variants, inventory, products, priceBookEntries } from "@/db/schema"
import { DomainError } from "./errors"
import { getCart } from "@/db/queries/cart"
// import { TaxService } from "./tax.service"
import { ShippingService } from "./shipping.service"
import type { AddToCartInput, UpdateCartQuantityInput, RemoveFromCartInput } from "@/validations/cart"
import { PricingService } from "./pricing.service"

export class CartService {
  /**
   * Shared helper to validate product status is PUBLISHED and variant is active.
   * If throwOnError is true, throws DomainError when invalid/missing. Otherwise returns null.
   */
  static async validateProductAndVariantStatus(variantId: string, throwOnError = true) {
    const [variantData] = await db
      .select({
        isActive: variants.isActive,
        productStatus: products.status,
        price: priceBookEntries.price,
        inventory: inventory.quantity,
      })
      .from(variants)
      .innerJoin(products, eq(variants.productId, products.id))
      .leftJoin(inventory, eq(variants.id, inventory.variantId))
      .leftJoin(priceBookEntries, eq(variants.id, priceBookEntries.variantId))
      .where(eq(variants.id, variantId))

    if (!variantData) {
      if (throwOnError) {
        throw new DomainError("NOT_FOUND", "Variant not found")
      }
      return null
    }
    if (!variantData.isActive || variantData.productStatus !== "PUBLISHED") {
      if (throwOnError) {
        throw new DomainError("VALIDATION_FAILED", "This item is currently unavailable")
      }
      return null
    }
    return variantData
  }
  /**
   * Calculates standard totals for a given cart.
   */
  static async calculateTotals(cart: NonNullable<Awaited<ReturnType<typeof getCart>>>) {
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    // Tax disabled — business below VAT threshold as of July 2026. 
    // Re-enable TaxService calls here if registration status changes.
    const tax = 0

    // Tiered shipping logic moved to PricingService
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    const shipping = PricingService.calculateTieredShipping(totalItems)

    const total = subtotal + tax + shipping

    return {
      subtotal,
      tax,
      shipping, 
      total,
      isEstimate: true // Flag to tell the UI this relies on default address estimates
    }
  }

  /**
   * Retrieves or creates a cart.
   */
  static async resolveCart(userId: string | null, sessionId: string | null) {
    if (!userId && !sessionId) {
      throw new DomainError("UNAUTHORIZED", "Cannot resolve cart without user or session")
    }

    const existingCart = await getCart(userId, sessionId)
    if (existingCart) return existingCart

    // Create new cart
    const [newCart] = await db.insert(carts).values({
      userId: userId || null,
      sessionId: userId ? null : sessionId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }).returning()

    return { ...newCart, items: [] }
  }

  /**
   * Lightweight variant of resolveCart — returns only the cart ID.
   * Use this in write paths that don't need the full relational cart object.
   */
  private static async resolveCartId(userId: string | null, sessionId: string | null): Promise<string> {
    if (!userId && !sessionId) {
      throw new DomainError("UNAUTHORIZED", "Cannot resolve cart without user or session")
    }

    const whereClause = userId
      ? and(eq(carts.userId, userId))
      : and(eq(carts.sessionId, sessionId!))

    const [existing] = await db
      .select({ id: carts.id })
      .from(carts)
      .where(whereClause)
      .limit(1)

    if (existing) return existing.id

    const [newCart] = await db.insert(carts).values({
      userId: userId || null,
      sessionId: userId ? null : sessionId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }).returning({ id: carts.id })

    return newCart.id
  }

  /**
   * Adds an item to the cart, verifying inventory limits.
   * If the item already exists, its quantity is incremented.
   */
  static async addToCart(input: AddToCartInput, userId: string | null, sessionId: string | null) {
    // Resolve the cart ID with a lightweight query (no items/joins)
    const cartId = await this.resolveCartId(userId, sessionId)

    const variantData = await this.validateProductAndVariantStatus(input.variantId, true)
    if (!variantData) return { success: false }

    const availableInventory = variantData.inventory ?? 0

    // Targeted lookup — only fetch the columns we actually need
    const [existingItem] = await db
      .select({ id: cartItems.id, quantity: cartItems.quantity })
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, input.variantId)))
      .limit(1)

    const newQuantity = (existingItem?.quantity ?? 0) + input.quantity

    if (newQuantity > availableInventory) {
      throw new DomainError("VALIDATION_FAILED", `Only ${availableInventory} items available in stock`)
    }
    if (newQuantity > 99) {
      throw new DomainError("VALIDATION_FAILED", "Maximum quantity limit reached")
    }

    if (existingItem) {
      await db.update(cartItems)
        .set({ quantity: newQuantity, updatedAt: new Date() })
        .where(eq(cartItems.id, existingItem.id))
    } else {
      await db.insert(cartItems).values({
        cartId,
        variantId: input.variantId,
        quantity: input.quantity,
        priceSnapshot: 0, // Ignored on read, live prices used
      })
    }

    return { success: true }
  }

  /**
   * Updates an item's quantity directly.
   */
  static async updateQuantity(input: UpdateCartQuantityInput, userId: string | null, sessionId: string | null) {
    const cart = await getCart(userId, sessionId)
    if (!cart) throw new DomainError("NOT_FOUND", "Cart not found")

    const item = cart.items.find(i => i.id === input.cartItemId)
    if (!item) throw new DomainError("NOT_FOUND", "Cart item not found")

    let variantData
    try {
      variantData = await this.validateProductAndVariantStatus(item.variant.id, true)
    } catch (e) {
      throw new DomainError("VALIDATION_FAILED", "This item is no longer available and cannot be updated.")
    }
    if (!variantData) {
      throw new DomainError("VALIDATION_FAILED", "This item is no longer available and cannot be updated.")
    }

    const availableInventory = variantData.inventory ?? 0

    if (input.quantity > availableInventory) {
      throw new DomainError("VALIDATION_FAILED", `Only ${availableInventory} items available in stock`)
    }

    await db.update(cartItems)
      .set({ quantity: input.quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, input.cartItemId))

    return { success: true }
  }

  /**
   * Removes an item from the cart.
   */
  static async removeFromCart(input: RemoveFromCartInput, userId: string | null, sessionId: string | null) {
    const cart = await getCart(userId, sessionId)
    if (!cart) throw new DomainError("NOT_FOUND", "Cart not found")

    // Verify ownership
    const item = cart.items.find(i => i.id === input.cartItemId)
    if (!item) throw new DomainError("NOT_FOUND", "Cart item not found")

    await db.delete(cartItems).where(eq(cartItems.id, input.cartItemId))

    return { success: true }
  }

  /**
   * Clears the entire cart.
   */
  static async clearCart(userId: string | null, sessionId: string | null) {
    const cart = await getCart(userId, sessionId)
    if (!cart) return { success: true }

    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id))

    return { success: true }
  }

  /**
   * Merges a guest cart into a user cart when logging in.
   * Duplicate variants will take the larger quantity (capped by inventory).
   * Called by Authentication flow.
   */
  static async mergeGuestCart(sessionId: string, userId: string) {
    const guestCart = await getCart(null, sessionId)
    if (!guestCart || guestCart.items.length === 0) {
      if (guestCart) {
        await db.delete(carts).where(eq(carts.id, guestCart.id))
      }
      return { skippedCount: 0 }
    }

    const userCart = await this.resolveCart(userId, null)
    let skippedCount = 0

    for (const guestItem of guestCart.items) {
      // Validate product and variant status (do not throw on error, just skip)
      const variantData = await this.validateProductAndVariantStatus(guestItem.variant.id, false)
      if (!variantData) {
        skippedCount++
        continue
      }

      const userItem = userCart.items.find(i => i.variant.id === guestItem.variant.id)
      
      if (userItem) {
        // Resolve duplicate: Keep larger quantity
        let mergedQuantity = Math.max(userItem.quantity, guestItem.quantity)
        
        // Ensure we don't exceed inventory
        const available = variantData.inventory ?? 0
        mergedQuantity = Math.min(mergedQuantity, available, 99)

        if (mergedQuantity > 0) {
          await db.update(cartItems)
            .set({ quantity: mergedQuantity, updatedAt: new Date() })
            .where(eq(cartItems.id, userItem.id))
        }
      } else {
        // Move guest item to user cart
        await db.insert(cartItems).values({
          cartId: userCart.id,
          variantId: guestItem.variant.id,
          quantity: guestItem.quantity,
          priceSnapshot: variantData.price ?? 0, // Fixed price bug
        })
      }
    }

    // Delete guest cart
    await db.delete(carts).where(eq(carts.id, guestCart.id))

    return { skippedCount }
  }
}
