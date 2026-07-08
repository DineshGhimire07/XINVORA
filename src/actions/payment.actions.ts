"use server"

import { PaymentService } from "../services/payment.service"
import { SessionService } from "../services/session.service"
import type { ActionResult } from "../types/actions"

export async function initializePaymentAction(
  orderId: string,
  provider: string,
  callbackUrl: string,
  csrfNonce: string
): Promise<ActionResult<{ paymentId: string; redirectUrl?: string; clientSecret?: string }>> {
  try {
    const session = await SessionService.requireAuth()

    // Validate security token to prevent CSRF attacks
    const isValid = await SessionService.verifyCsrfNonce(csrfNonce)
    if (!isValid) {
      throw new Error("Invalid security token. Operation blocked.")
    }

    const result = await PaymentService.initializePayment(session.id, orderId, provider, callbackUrl)
    return {
      success: true,
      data: result,
    }
  } catch (error: any) {
    console.error("[Initialize Payment Action Error]:", error)
    return {
      success: false,
      error: {
        code: "PAYMENT_INIT_ERROR",
        message: error.message || "Failed to initialize payment.",
      },
    }
  }
}

export async function verifyPaymentAction(
  paymentId: string,
  params: Record<string, any>
): Promise<ActionResult<{ status: string; orderNumber: string }>> {
  try {
    const session = await SessionService.requireAuth()
    const result = await PaymentService.verifyPayment(session.id, paymentId, params)
    return {
      success: true,
      data: result,
    }
  } catch (error: any) {
    console.error("[Verify Payment Action Error]:", error)
    return {
      success: false,
      error: {
        code: "PAYMENT_VERIFY_ERROR",
        message: error.message || "Failed to verify payment.",
      },
    }
  }
}
