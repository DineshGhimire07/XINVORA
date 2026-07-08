export interface ShippingMethod {
  id: string
  name: string
  estimatedDays: string
  isActive: boolean
}

export class ShippingService {
  /**
   * Abstracted shipping engine.
   * Currently only provides names and estimated days. Real cost is calculated dynamically.
   */
  static async getShippingMethods(): Promise<ShippingMethod[]> {
    return [
      {
        id: "standard",
        name: "Standard Shipping",
        estimatedDays: "3-5",
        isActive: true,
      },
      {
        id: "express",
        name: "Express Shipping",
        estimatedDays: "1-2",
        isActive: true,
      },
      {
        id: "pickup",
        name: "In-Store Pickup",
        estimatedDays: "Same Day",
        isActive: true,
      },
    ]
  }

  static async getShippingMethodById(id: string): Promise<ShippingMethod | null> {
    const methods = await this.getShippingMethods()
    return methods.find((m) => m.id === id) ?? null
  }
}
