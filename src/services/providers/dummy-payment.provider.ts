import { PaymentProviderInstance, InitializePaymentResult, VerifyPaymentResult } from "./payment-provider.interface"

export class DummyPaymentProvider implements PaymentProviderInstance {
  async initialize(
    order: { id: string; orderNumber: string; total: number; currency: string },
    callbackUrl: string
  ): Promise<InitializePaymentResult> {
    const providerPaymentId = `DUMMY-${order.orderNumber}-${Math.random().toString(36).substring(7).toUpperCase()}`
    
    // We redirect to a dummy gateway simulator page
    const redirectUrl = `/payment/dummy-gateway?paymentId=${providerPaymentId}&amount=${order.total}&callbackUrl=${encodeURIComponent(callbackUrl)}`
    
    return {
      providerPaymentId,
      redirectUrl,
      metadata: {
        initiatedAt: new Date().toISOString(),
      }
    }
  }

  async verify(params: Record<string, any>): Promise<VerifyPaymentResult> {
    const status = params.status || "PAID"
    const providerPaymentId = params.paymentId || "DUMMY-UNKNOWN"
    
    let resolvedStatus: "PAID" | "FAILED" | "PENDING" | "CANCELLED" = "PAID"
    let failureReason: string | undefined

    if (status === "failed") {
      resolvedStatus = "FAILED"
      failureReason = "Simulated dummy payment failure."
    } else if (status === "cancelled") {
      resolvedStatus = "CANCELLED"
    } else if (status === "pending") {
      resolvedStatus = "PENDING"
    }

    return {
      status: resolvedStatus,
      providerPaymentId,
      failureReason,
      metadata: {
        verifiedAt: new Date().toISOString(),
        rawParams: params,
      }
    }
  }

  async cancel(providerPaymentId: string): Promise<boolean> {
    return true
  }

  async refund(providerPaymentId: string, amount: number): Promise<boolean> {
    return true
  }

  async getStatus(providerPaymentId: string): Promise<string> {
    return "PAID"
  }
}
