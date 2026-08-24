import { describe, it, expect } from "vitest"

describe("Product Color & Variant Inventory Logic", () => {
  it("validates and formats hex color codes properly", () => {
    const formatHex = (hex: string) => {
      let trimmed = hex.trim()
      if (!trimmed.startsWith("#")) trimmed = `#${trimmed}`
      return trimmed.toUpperCase()
    }

    expect(formatHex("800020")).toBe("#800020")
    expect(formatHex("#1a1a1a")).toBe("#1A1A1A")
    expect(formatHex("#ffffff")).toBe("#FFFFFF")
  })

  it("filters out empty or default placeholder colors", () => {
    const rawColors = [
      { id: "c1", name: "Midnight Black", hexCode: "#1A1A1A" },
      { id: "c2", name: "Burgundy", hexCode: "#800020" },
      { id: "c3", name: "Default", hexCode: "" },
      { id: "c4", name: "", hexCode: "#FFFFFF" },
    ]

    const validColors = rawColors.filter((c) => c && c.name && c.name !== "Default")
    expect(validColors.length).toBe(2)
    expect(validColors[0].name).toBe("Midnight Black")
    expect(validColors[1].name).toBe("Burgundy")
  })

  it("generates deterministic variant SKUs for color and size combinations", () => {
    const slug = "silk-wrap-dress"
    const colorId = "c8fd985a-1111-2222-3333-444455556666"
    const sizeId = "s1234567-8888-9999-aaaa-bbbbccccdddd"

    const sku = `${slug}-${colorId.slice(0, 4)}-${sizeId.slice(0, 4)}`.toUpperCase()
    expect(sku).toBe("SILK-WRAP-DRESS-C8FD-S123")
  })

  it("resolves available in-stock sizes accurately for a selected color", () => {
    const mockSizes = [
      { id: "s-sm", name: "Small", abbreviation: "S" },
      { id: "s-md", name: "Medium", abbreviation: "M" },
      { id: "s-lg", name: "Large", abbreviation: "L" },
    ]

    const mockVariants = [
      // Black: Small (3), Medium (0), Large (2)
      { id: "v1", color: { id: "c-black", name: "Black" }, size: { id: "s-sm" }, inventory: { quantity: 3 } },
      { id: "v2", color: { id: "c-black", name: "Black" }, size: { id: "s-md" }, inventory: { quantity: 0 } },
      { id: "v3", color: { id: "c-black", name: "Black" }, size: { id: "s-lg" }, inventory: { quantity: 2 } },
      // Burgundy: Small (0), Medium (5), Large (0)
      { id: "v4", color: { id: "c-burgundy", name: "Burgundy" }, size: { id: "s-sm" }, inventory: { quantity: 0 } },
      { id: "v5", color: { id: "c-burgundy", name: "Burgundy" }, size: { id: "s-md" }, inventory: { quantity: 5 } },
      { id: "v6", color: { id: "c-burgundy", name: "Burgundy" }, size: { id: "s-lg" }, inventory: { quantity: 0 } },
    ]

    const getAvailableSizesForColor = (colorId: string) => {
      return mockSizes.filter((size) => {
        const match = mockVariants.find(
          (v) => v.size.id === size.id && v.color.id === colorId
        )
        return match && match.inventory.quantity > 0
      })
    }

    const blackAvailable = getAvailableSizesForColor("c-black")
    expect(blackAvailable.map((s) => s.abbreviation)).toEqual(["S", "L"])

    const burgundyAvailable = getAvailableSizesForColor("c-burgundy")
    expect(burgundyAvailable.map((s) => s.abbreviation)).toEqual(["M"])
  })

  it("handles color deletion and removes deleted color from active selections", () => {
    let customColors = [
      { id: "c1", name: "Midnight Black", hexCode: "#1A1A1A" },
      { id: "c2", name: "Burgundy", hexCode: "#800020" },
      { id: "c3", name: "Sage Green", hexCode: "#8A9A5B" },
    ]
    let selectedColorIds = ["c1", "c2"]

    const deleteColorId = "c2"
    customColors = customColors.filter((c) => c.id !== deleteColorId)
    selectedColorIds = selectedColorIds.filter((id) => id !== deleteColorId)

    expect(customColors.map((c) => c.id)).toEqual(["c1", "c3"])
    expect(selectedColorIds).toEqual(["c1"])
  })
})
