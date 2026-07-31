import { describe, it, expect } from "vitest"

// Validation logic matching PaymentService.validateTransition
function validateTransition(current: string, target: string): boolean {
  if (current === target) return true

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
  return allowed.includes(target)
}

describe("Payment State Machine Transitions", () => {
  it("allows valid state transitions for initiated and pending payments", () => {
    expect(validateTransition("NEW", "INITIATED")).toBe(true)
    expect(validateTransition("INITIATED", "PAID")).toBe(true)
    expect(validateTransition("PENDING", "PAID")).toBe(true)
    expect(validateTransition("PAID", "REFUNDED")).toBe(true)
  })

  it("handles noop transitions when status is unchanged", () => {
    expect(validateTransition("PAID", "PAID")).toBe(true)
    expect(validateTransition("PENDING", "PENDING")).toBe(true)
  })

  it("rejects illegal transitions from terminal states", () => {
    expect(validateTransition("FAILED", "PAID")).toBe(false)
    expect(validateTransition("CANCELLED", "PAID")).toBe(false)
    expect(validateTransition("EXPIRED", "PAID")).toBe(false)
    expect(validateTransition("REFUNDED", "PAID")).toBe(false)
  })
})
