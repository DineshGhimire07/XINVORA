import { PaymentRepository } from "../db/repositories/payment.repository"
import { OrderRepository } from "../db/repositories/order.repository"
import { CheckoutRepository } from "../db/repositories/checkout.repository" // to execute transactions
import { PaymentProviderFactory } from "./providers/payment-provider.factory"
import { findOrderById } from "../db/queries/orders"

export class PaymentService {
  /**
   * State Machine Validations.
   * Rejects illegal transitions:
   * Valid transitions:
   * - NEW -> INITIATED
   * - INITIATED -> PENDING, PAID, FAILED, CANCELLED, EXPIRED
   * - PENDING -> PAID, FAILED, CANCELLED, EXPIRED
   * - PAID -> REFUNDED, PARTIALLY_REFUNDED
   */
  private static validateTransition(current: string, target: string) {
    if (current === target) return // noop

    const allowedTransitions: Record<string, string[]> = {
      NEW: ["INITIATED", "FAILED", "CANCELLED"],
      INITIATED: ["PENDING", "PAID", "FAILED", "CANCELLED", "EXPIRED"],
      PENDING: ["PAID", "FAILED", "CANCELLED", "EXPIRED"],
      AUTHORIZED: ["PAID", "FAILED", "CANCELLED"],
      PAID: ["REFUNDED", "PARTIALLY_REFUNDED"],
      FAILED: [],
      CANCELLED: [],
      REFUNDED: [],
      PARTIALLY_REFUNDED: ["REFUNDED"],
      EXPIRED: [],
    }

    const allowed = allowedTransitions[current] || []
    if (!allowed.includes(target)) {
      throw new Error(`Illegal payment status transition from ${current} to ${target}`)
    }
  }

  /**
   * Initializes a payment attempt for a given order.
   */
  static async initializePayment(
    userId: string,
    orderId: string,
    provider: string,
    callbackUrl: string
  ) {
    // 1. Validate Order
    const order = await findOrderById(orderId)
    if (!order) {
      throw new Error("Order not found")
    }
    if (order.userId !== userId) {
      throw new Error("Unauthorized access to order")
    }
    if (order.status !== "PENDING_PAYMENT") {
      throw new Error(`Cannot pay for an order in status: ${order.status}`)
    }

    // 2. Prevent concurrent duplicate payments
    // Check if there are active non-expired payment sessions
    const history = await PaymentRepository.findPaymentsByOrder(null, orderId)
    const activePayment = history.find(
      (p: any) =>
        ["NEW", "INITIATED", "PENDING"].includes(p.status) &&
        new Date(p.sessionExpiresAt) > new Date()
    )

    if (activePayment) {
      // Return redirectUrl if it exists and matches same provider
      if (activePayment.provider === provider && (activePayment.metadata as any).redirectUrl) {
        return {
          paymentId: activePayment.id,
          redirectUrl: (activePayment.metadata as any).redirectUrl,
        }
      }
      
      // Otherwise, cancel the active payment before starting a new one
      await PaymentRepository.updatePaymentStatus(null, activePayment.id, "CANCELLED", {
        metadata: {
          ...(activePayment.metadata as Record<string, any>),
          cancelledAt: new Date().toISOString(),
          reason: "Superseded by new payment initialization",
        }
      })
    }

    // 3. Create NEW Payment Record
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15) // 15 minute session

    const providerName = provider.toUpperCase()
    const payment = await PaymentRepository.createPayment(null, {
      orderId,
      provider: providerName,
      status: "NEW",
      amount: order.total,
      currency: order.currency,
      sessionExpiresAt: expiresAt,
      metadata: {
        events: [{ event: "INITIALIZED", timestamp: new Date().toISOString() }],
      }
    })

    // 4. Invoke Provider Factory
    const paymentProvider = PaymentProviderFactory.getProvider(providerName)
    const initResult = await paymentProvider.initialize(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        currency: order.currency,
      },
      callbackUrl
    )

    // 5. Update Status to INITIATED
    const updatedMetadata = {
      ...(payment.metadata as Record<string, any>),
      ...initResult.metadata,
      redirectUrl: initResult.redirectUrl,
      clientSecret: initResult.clientSecret,
      events: [
        ...((payment.metadata as any).events || []),
        { event: "INITIATED", timestamp: new Date().toISOString() },
      ]
    }

    await PaymentRepository.updatePaymentStatus(null, payment.id, "INITIATED", {
      metadata: updatedMetadata,
      providerPaymentId: initResult.providerPaymentId,
    })

    return {
      paymentId: payment.id,
      redirectUrl: initResult.redirectUrl,
      clientSecret: initResult.clientSecret,
    }
  }

  /**
   * Verifies the payment result and updates database state atomically.
   */
  static async verifyPayment(userId: string, paymentId: string, params: Record<string, any>) {
    // 1. Load Payment and Order
    const payment = await PaymentRepository.findPayment(null, paymentId)
    if (!payment) {
      throw new Error("Payment record not found")
    }

    const order = await findOrderById(payment.orderId)
    if (!order) {
      throw new Error("Related order not found")
    }
    if (order.userId !== userId) {
      throw new Error("Unauthorized payment verification")
    }

    // Check expiration
    const isExpired = new Date(payment.sessionExpiresAt) < new Date()
    if (isExpired && ["NEW", "INITIATED", "PENDING"].includes(payment.status)) {
      await PaymentRepository.updatePaymentStatus(null, payment.id, "EXPIRED", {
        failureReason: "Payment session expired (15 minutes limit)",
        metadata: {
          ...(payment.metadata as Record<string, any>),
          events: [
            ...((payment.metadata as any).events || []),
            { event: "EXPIRED", timestamp: new Date().toISOString() }
          ]
        }
      })
      throw new Error("Payment session has expired")
    }

    // 2. Invoke Provider verify
    const paymentProvider = PaymentProviderFactory.getProvider(payment.provider)
    const verifyResult = await paymentProvider.verify(params)

    // 3. State transition checks
    this.validateTransition(payment.status, verifyResult.status)

    // 4. Update Database inside a transaction context
    const updatedMetadata = {
      ...(payment.metadata as Record<string, any>),
      ...verifyResult.metadata,
      events: [
        ...((payment.metadata as any).events || []),
        { event: verifyResult.status, timestamp: new Date().toISOString() }
      ]
    }

    const orderStatusMapping: Record<string, string> = {
      PAID: "PAID",
      FAILED: "PENDING_PAYMENT",
      CANCELLED: "PENDING_PAYMENT",
    }

    await CheckoutRepository.executeTransaction(async (tx) => {
      // Save payment status update
      await PaymentRepository.updatePaymentStatus(tx, payment.id, verifyResult.status, {
        completedAt: verifyResult.status === "PAID" ? new Date() : undefined,
        failureReason: verifyResult.failureReason,
        metadata: updatedMetadata,
      })

      // Update Order status
      const targetOrderStatus = orderStatusMapping[verifyResult.status]
      if (targetOrderStatus) {
        await OrderRepository.updateOrderStatus(tx, order.id, targetOrderStatus, {
          paymentStatus: verifyResult.status,
          paymentProvider: payment.provider,
          paymentIntentId: verifyResult.providerPaymentId,
        })
      }
    })

    // Trigger notification outside of transaction
    try {
      const { NotificationService } = await import("./notification.service")
      await NotificationService.triggerOrderNotification(userId, order.orderNumber, verifyResult.status)
    } catch (notifErr) {
      console.error("Failed to trigger order notification:", notifErr)
    }

    return {
      status: verifyResult.status,
      orderNumber: order.orderNumber,
    }
  }
}
