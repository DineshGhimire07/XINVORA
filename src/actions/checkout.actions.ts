"use server"

import { revalidatePath } from "next/cache"
import { CheckoutSubmissionSchema, type CheckoutSubmission } from "@/validations/checkout"
import { SessionService } from "@/services/session.service"
import { CheckoutService } from "@/services/checkout.service"
import { db } from "@/db/client"
import { orders } from "@/db/schema/orders"
import { eq } from "drizzle-orm"
import { getCart } from "@/db/queries/cart"
import type { ActionResult } from "@/types/actions"

export async function submitCheckoutAction(
  data: CheckoutSubmission
): Promise<ActionResult<{ orderId: string; orderNumber: string }>> {
  try {
    const session = await SessionService.requireAuth()

    // Validate
    const parsed = CheckoutSubmissionSchema.safeParse(data)
    if (!parsed.success) {
      console.error("[Checkout Validation Failed]:", parsed.error.flatten().fieldErrors, "Data received:", data)
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check your delivery details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
      }
    }

    const submission = parsed.data

    // Empty Cart Check
    const cart = await getCart(session.id, null)
    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        error: {
          code: "CART_EMPTY",
          message: "Your cart is empty. Please add items before checking out.",
        },
      }
    }

    // Idempotency Check: if an order with this key already exists, skip creation
    if (submission.idempotencyKey) {
      const existingOrder = await db
        .select({ id: orders.id, orderNumber: orders.orderNumber })
        .from(orders)
        .where(eq(orders.idempotencyKey, submission.idempotencyKey))
        .limit(1)
        
      if (existingOrder.length > 0) {
        return {
          success: true,
          data: { orderId: existingOrder[0].id, orderNumber: existingOrder[0].orderNumber },
        }
      }
    }

    // Call unified createOrder
    const order = await CheckoutService.createOrder(session.id, submission)

    revalidatePath("/cart")
    revalidatePath("/checkout")

    return {
      success: true,
      data: { orderId: order.orderId, orderNumber: order.orderNumber },
    }
  } catch (error: any) {
    console.error("[Checkout Error]:", error)
    return {
      success: false,
      error: {
        code: error.message === "Your cart is empty." ? "CART_EMPTY" : "INTERNAL_SERVER_ERROR",
        message: error.message || "An unexpected error occurred. Please try again.",
      },
    }
  }
}

export async function getPaymentQrsAction(): Promise<ActionResult<any>> {
  try {
    const { AdminSettingsService } = await import("@/services/admin/settings.service")
    const paymentQrs = await AdminSettingsService.getSetting("payment_qrs")
    return {
      success: true,
      data: paymentQrs,
    }
  } catch (error: any) {
    console.error("[getPaymentQrsAction Error]:", error)
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch payment QR codes.",
      },
    }
  }
}

