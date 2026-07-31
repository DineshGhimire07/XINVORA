import { describe, it, expect } from "vitest"
import { PricingService } from "../src/services/pricing.service"

describe("PricingService", () => {
  it("calculates percentage coupon discount correctly", () => {
    const coupon = {
      discountType: "PERCENTAGE" as const,
      discountValue: 15,
      maxDiscountAmount: 500,
    }
    const subtotal = 2000 // Rs. 2000
    const discount = PricingService.calculateDiscountAmount(coupon, subtotal)
    expect(discount).toBe(300) // 15% of 2000 = 300
  })

  it("caps percentage discount at maxDiscountAmount", () => {
    const coupon = {
      discountType: "PERCENTAGE" as const,
      discountValue: 20,
      maxDiscountAmount: 200,
    }
    const subtotal = 2000 // 20% of 2000 = 400, capped at 200
    const discount = PricingService.calculateDiscountAmount(coupon, subtotal)
    expect(discount).toBe(200)
  })

  it("calculates fixed amount coupon discount correctly", () => {
    const coupon = {
      discountType: "FIXED_AMOUNT" as const,
      discountValue: 500,
    }
    const subtotal = 2000
    const discount = PricingService.calculateDiscountAmount(coupon, subtotal)
    expect(discount).toBe(500)
  })

  it("calculates shipping costs in paisa based on total item count", () => {
    expect(PricingService.calculateTieredShipping(1)).toBe(20000)
  })
})
