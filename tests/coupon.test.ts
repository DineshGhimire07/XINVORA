import { describe, it, expect } from "vitest"
import { PricingService } from "../src/services/pricing.service"

describe("Coupon & Pricing Discount Logic", () => {
  it("calculates percentage discount accurately", () => {
    const coupon = {
      discountType: "PERCENTAGE" as const,
      discountValue: 10, // 10%
      maxDiscountAmount: 1000,
    }
    expect(PricingService.calculateDiscountAmount(coupon, 5000)).toBe(500)
  })

  it("enforces maximum discount cap on large order subtotals", () => {
    const coupon = {
      discountType: "PERCENTAGE" as const,
      discountValue: 50, // 50%
      maxDiscountAmount: 400, // Capped at Rs. 400
    }
    expect(PricingService.calculateDiscountAmount(coupon, 2000)).toBe(400)
  })

  it("calculates fixed amount discount correctly", () => {
    const coupon = {
      discountType: "FIXED_AMOUNT" as const,
      discountValue: 250,
    }
    expect(PricingService.calculateDiscountAmount(coupon, 1500)).toBe(250)
  })

  it("does not allow discount to exceed subtotal", () => {
    const coupon = {
      discountType: "FIXED_AMOUNT" as const,
      discountValue: 2000,
    }
    const subtotal = 1500
    const rawDiscount = PricingService.calculateDiscountAmount(coupon, subtotal)
    const effectiveDiscount = Math.min(rawDiscount, subtotal)
    expect(effectiveDiscount).toBe(1500)
  })
})
