export class PricingService {
  /**
   * Calculates shipping cost based on a tiered item count system.
   * - 200 NPR base for 1-3 items.
   * - +100 NPR per additional group of 3 items.
   */
  static calculateTieredShipping(totalItems: number): number {
    if (totalItems <= 0) return 0
    const groups = Math.ceil(totalItems / 3)
    return 20000 + ((groups - 1) * 10000)
  }

  /**
   * Calculates the discount amount for a given coupon and subtotal.
   * Respects maximum discount constraints for percentage-based coupons.
   */
  static calculateDiscountAmount(coupon: any, subtotal: number): number {
    if (coupon.discountType === "FIXED_AMOUNT") {
      return coupon.discountValue
    } else if (coupon.discountType === "PERCENTAGE") {
      const rawDiscount = Math.floor(subtotal * (coupon.discountValue / 100))
      return coupon.maxDiscountAmount 
        ? Math.min(rawDiscount, coupon.maxDiscountAmount)
        : rawDiscount
    }
    return 0
  }

  /**
   * Calculates tax. Currently hardcoded to 0 for Nepal standard (VAT threshold unreached).
   */
  static calculateTax(subtotal: number, shipping: number, discount: number): { taxRate: number, taxAmount: number } {
    return { taxRate: 0, taxAmount: 0 }
  }
}
