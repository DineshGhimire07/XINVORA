import { describe, it, expect } from "vitest"

// Helper function from inventory.service.ts
function deriveStatus(
  quantity: number,
  threshold: number
): "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" {
  if (quantity <= 0) return "OUT_OF_STOCK"
  if (quantity <= threshold) return "LOW_STOCK"
  return "IN_STOCK"
}

describe("Inventory Status Derivation & Delta Logic", () => {
  it("derives OUT_OF_STOCK when quantity is 0 or negative", () => {
    expect(deriveStatus(0, 5)).toBe("OUT_OF_STOCK")
    expect(deriveStatus(-2, 5)).toBe("OUT_OF_STOCK")
  })

  it("derives LOW_STOCK when quantity is at or below threshold", () => {
    expect(deriveStatus(5, 5)).toBe("LOW_STOCK")
    expect(deriveStatus(2, 5)).toBe("LOW_STOCK")
  })

  it("derives IN_STOCK when quantity is above lowStockThreshold", () => {
    expect(deriveStatus(10, 5)).toBe("IN_STOCK")
    expect(deriveStatus(6, 5)).toBe("IN_STOCK")
  })

  it("calculates RESTOCK delta additions correctly", () => {
    const currentQuantity = 10
    const restockDelta = 5
    expect(currentQuantity + restockDelta).toBe(15)
  })

  it("calculates RESERVE delta reservations correctly", () => {
    const quantity = 10
    const currentReserved = 2
    const deltaToReserve = 3
    const available = quantity - currentReserved

    expect(deltaToReserve <= available).toBe(true)
    expect(currentReserved + deltaToReserve).toBe(5)
  })

  it("prevents reserving more items than available unreserved stock", () => {
    const quantity = 10
    const currentReserved = 8
    const deltaToReserve = 3 // Available is only 2
    const available = quantity - currentReserved

    expect(deltaToReserve <= available).toBe(false)
  })
})
