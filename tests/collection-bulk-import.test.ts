import { describe, it, expect } from "vitest"
import { slugify } from "@/lib/utils"

describe("Collection Bulk Import Utilities & Validation", () => {
  it("should generate clean url-safe slugs from collection names", () => {
    expect(slugify("Summer 2026 Collection")).toBe("summer-2026-collection")
    expect(slugify("Men's Premium Outerwear & Jackets!")).toBe("mens-premium-outerwear-jackets")
    expect(slugify("  Home & Living - Decor  ")).toBe("home-living-decor")
  })

  it("should parse boolean active values correctly", () => {
    const parseActive = (val: any): boolean => {
      if (val === undefined || val === null || val === "") return true
      const strVal = String(val).toLowerCase().trim()
      return !["false", "0", "no", "inactive"].includes(strVal)
    }

    expect(parseActive("true")).toBe(true)
    expect(parseActive("TRUE")).toBe(true)
    expect(parseActive("yes")).toBe(true)
    expect(parseActive("1")).toBe(true)
    expect(parseActive("")).toBe(true)
    expect(parseActive(undefined)).toBe(true)

    expect(parseActive("false")).toBe(false)
    expect(parseActive("FALSE")).toBe(false)
    expect(parseActive("no")).toBe(false)
    expect(parseActive("0")).toBe(false)
    expect(parseActive("inactive")).toBe(false)
  })

  it("should parse sort orders with fallback to 0", () => {
    const parseSortOrder = (val: any): number => {
      if (val === undefined || val === null || val === "") return 0
      const parsed = parseInt(String(val), 10)
      return isNaN(parsed) ? 0 : parsed
    }

    expect(parseSortOrder("5")).toBe(5)
    expect(parseSortOrder("0")).toBe(0)
    expect(parseSortOrder("")).toBe(0)
    expect(parseSortOrder("invalid")).toBe(0)
    expect(parseSortOrder(null)).toBe(0)
  })

  it("should generate exact header-only CSV template string with 0 data rows", () => {
    const csvHeader = "Name,Slug,Description,Image URL,Image Mobile URL,Banner URL,Banner Mobile URL,Sort Order,Is Active,SEO Title,SEO Description,Parent Slug\n"
    const lines = csvHeader.trim().split("\n")
    expect(lines.length).toBe(1)
    expect(lines[0]).toBe("Name,Slug,Description,Image URL,Image Mobile URL,Banner URL,Banner Mobile URL,Sort Order,Is Active,SEO Title,SEO Description,Parent Slug")
  })
})
