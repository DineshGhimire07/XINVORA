export interface InitializePaymentResult {
  providerPaymentId: string
  redirectUrl?: string
  clientSecret?: string
  metadata?: Record<string, any>
}

export interface VerifyPaymentResult {
  status: "PAID" | "FAILED" | "PENDING" | "CANCELLED"
  providerPaymentId: string
  failureReason?: string
  metadata?: Record<string, any>
}

export interface PaymentProviderInstance {
  initialize(
    order: { id: string; orderNumber: string; total: number; currency: string },
    callbackUrl: string
  ): Promise<InitializePaymentResult>
  
  verify(params: Record<string, any>): Promise<VerifyPaymentResult>
  
  cancel(providerPaymentId: string): Promise<boolean>
  
  refund(providerPaymentId: string, amount: number): Promise<boolean>
  
  getStatus(providerPaymentId: string): Promise<string>
}
