export class PricingService {
  /**
   * Calculates delivery charge: flat 170 NPR.
   */
  static calculateTieredShipping(totalItems: number): number {
    if (totalItems <= 0) return 0
    return 17000
  }

  /**
   * Calculates the discount amount for a given coupon and subtotal.
   * Respects maximum discount constraints for percentage-based coupons.
   */
  static calculateDiscountAmount(coupon: any, subtotal: number): number {
    if (!coupon || subtotal <= 0) return 0

    if (coupon.discountType === "FIXED_AMOUNT") {
      return Math.min(coupon.discountValue, subtotal)
    } else if (coupon.discountType === "PERCENTAGE") {
      const rawDiscount = Math.floor(subtotal * (coupon.discountValue / 100))
      const capped = coupon.maxDiscountAmount 
        ? Math.min(rawDiscount, coupon.maxDiscountAmount)
        : rawDiscount
      return Math.min(capped, subtotal)
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
