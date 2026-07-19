"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { CartService } from "@/services/cart.service"
import { SessionService } from "@/services/session.service"
import { validateInput, handleServiceCall } from "@/services/shared/action-utils"
import { addToCartSchema, updateCartQuantitySchema, removeFromCartSchema } from "@/validations/cart"
import type { ActionResult } from "@/types/actions"
import { type TimingEntry, printTimingSummary } from "@/lib/perf"
import { invalidateCartCache } from "@/db/queries/cart"

/**
 * Gets or creates the guest cart session ID from cookies.
 */
async function getCartSessionId(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get("cart_session")?.value
  
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    cookieStore.set("cart_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })
  }
  
  return sessionId
}

/**
 * Resolves authentication or session tracking.
 */
async function resolveCommerceIdentity() {
  const session = await SessionService.optionalAuth()
  const userId = session?.id ?? null
  const sessionId = userId ? null : await getCartSessionId()
  
  return { userId, sessionId }
}

export async function addToCartAction(
  prevState: ActionResult<unknown> | null,
  formData: FormData
): Promise<ActionResult<unknown>> {
  const totalStart = performance.now()
  const timings: TimingEntry[] = []

  const data = Object.fromEntries(formData.entries())
  
  const validation = validateInput(addToCartSchema, data)
  if (!validation.success) return validation

  const identityStart = performance.now()
  const { userId, sessionId } = await resolveCommerceIdentity()
  timings.push({ name: 'resolveCommerceIdentity', ms: performance.now() - identityStart })

  const serviceStart = performance.now()
  const result = await handleServiceCall(() => 
    CartService.addToCart(validation.data, userId, sessionId)
  )
  timings.push({ name: 'CartService.addToCart', ms: performance.now() - serviceStart })
  if (result.success) {
    invalidateCartCache(userId, sessionId)
    revalidatePath("/cart")
  }

  printTimingSummary('addToCartAction', timings, performance.now() - totalStart)

  return result
}

export async function updateCartQuantityAction(
  prevState: ActionResult<unknown> | null,
  formData: FormData
): Promise<ActionResult<unknown>> {
  const data = Object.fromEntries(formData.entries())
  
  const validation = validateInput(updateCartQuantitySchema, data)
  if (!validation.success) return validation

  const { userId, sessionId } = await resolveCommerceIdentity()

  const result = await handleServiceCall(() => 
    CartService.updateQuantity(validation.data, userId, sessionId)
  )

  if (result.success) {
    invalidateCartCache(userId, sessionId)
    revalidatePath("/cart")
  }

  return result
}

export async function removeFromCartAction(
  prevState: ActionResult<unknown> | null,
  formData: FormData
): Promise<ActionResult<unknown>> {
  const data = Object.fromEntries(formData.entries())
  
  const validation = validateInput(removeFromCartSchema, data)
  if (!validation.success) return validation

  const { userId, sessionId } = await resolveCommerceIdentity()

  const result = await handleServiceCall(() => 
    CartService.removeFromCart(validation.data, userId, sessionId)
  )

  if (result.success) {
    invalidateCartCache(userId, sessionId)
    revalidatePath("/cart")
  }

  return result
}

export async function clearCartAction(
  prevState: ActionResult<unknown> | null,
  formData: FormData
): Promise<ActionResult<unknown>> {
  const { userId, sessionId } = await resolveCommerceIdentity()

  const result = await handleServiceCall(() => 
    CartService.clearCart(userId, sessionId)
  )
  if (result.success) {
    invalidateCartCache(userId, sessionId)
    revalidatePath("/cart")
  }

  return result
}

export async function changeCartItemVariantAction(
  prevState: ActionResult<unknown> | null,
  formData: FormData
): Promise<ActionResult<unknown>> {
  const cartItemId = formData.get("cartItemId")?.toString()
  const newVariantId = formData.get("newVariantId")?.toString()

  if (!cartItemId || !newVariantId) {
    return { success: false, error: { code: "VALIDATION_FAILED", message: "Missing cart item or variant." } }
  }

  const { userId, sessionId } = await resolveCommerceIdentity()

  const result = await handleServiceCall(() =>
    CartService.changeVariant(cartItemId, newVariantId, userId, sessionId)
  )

  if (result.success) {
    invalidateCartCache(userId, sessionId)
    revalidatePath("/cart")
  }

  return result
}
