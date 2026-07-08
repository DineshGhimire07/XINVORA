import { PaymentProviderInstance } from "./payment-provider.interface"
import { DummyPaymentProvider } from "./dummy-payment.provider"

export class EsewaPaymentProvider extends DummyPaymentProvider {
  async initialize(
    order: { id: string; orderNumber: string; total: number; currency: string },
    callbackUrl: string
  ) {
    const res = await super.initialize(order, callbackUrl)
    res.redirectUrl = `${res.redirectUrl}&provider=ESEWA`
    return res
  }
}

export class KhaltiPaymentProvider extends DummyPaymentProvider {
  async initialize(
    order: { id: string; orderNumber: string; total: number; currency: string },
    callbackUrl: string
  ) {
    const res = await super.initialize(order, callbackUrl)
    res.redirectUrl = `${res.redirectUrl}&provider=KHALTI`
    return res
  }
}

export class StripePaymentProvider extends DummyPaymentProvider {
  async initialize(
    order: { id: string; orderNumber: string; total: number; currency: string },
    callbackUrl: string
  ) {
    const res = await super.initialize(order, callbackUrl)
    res.redirectUrl = `${res.redirectUrl}&provider=STRIPE`
    return res
  }
}

export class PaymentProviderFactory {
  static getProvider(provider: string): PaymentProviderInstance {
    const formattedProvider = provider.toUpperCase()
    
    if (formattedProvider === "DUMMY") {
      return new DummyPaymentProvider()
    }
    if (formattedProvider === "ESEWA") {
      return new EsewaPaymentProvider()
    }
    if (formattedProvider === "KHALTI") {
      return new KhaltiPaymentProvider()
    }
    if (formattedProvider === "STRIPE") {
      return new StripePaymentProvider()
    }
    
    throw new Error(`Unsupported payment provider: ${provider}`)
  }
}
