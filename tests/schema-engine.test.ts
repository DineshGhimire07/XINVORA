import { describe, it, expect } from "vitest"
import { SEOSchemaEngine } from "../src/domains/seo/engines/schema.engine"
import type { NormalizedSEOEntity } from "../src/domains/seo/contracts/entity.contract"

describe("SEOSchemaEngine - JSON-LD Structured Data", () => {
  it("generates Product JSON-LD with Merchant Center shipping and return policies", () => {
    const entity: NormalizedSEOEntity = {
      id: "prod_100",
      entityType: "PRODUCT",
      name: "Aurora Pleated Silk Skirt",
      slug: "aurora-pleated-silk-skirt",
      path: "/products/aurora-pleated-silk-skirt",
      isIndexed: true,
      seoTitle: "Aurora Pleated Silk Skirt | XINVORA",
      seoDescription: "Luxury silk skirt handcrafted in Nepal.",
      canonicalUrl: "https://xinvora.com.np/products/aurora-pleated-silk-skirt",
      ogImage: "https://xinvora.com.np/images/skirt.jpg",
      twitterImage: "https://xinvora.com.np/images/skirt.jpg",
      images: [{ url: "https://xinvora.com.np/images/skirt.jpg", alt: "Silk Skirt" }],
      updatedAt: new Date(),
      raw: {
        price: 2500,
        status: "IN_STOCK",
      },
    }

    const schemas = SEOSchemaEngine.generateJSONLD("https://xinvora.com.np", entity)
    const productSchema = schemas.find((s) => s["@type"] === "Product")

    expect(productSchema).toBeDefined()
    expect(productSchema["@type"]).toBe("Product")
    expect(productSchema.name).toBe("Aurora Pleated Silk Skirt")
    expect(productSchema.offers.priceCurrency).toBe("NPR")
    expect(productSchema.offers.shippingDetails.shippingRate.currency).toBe("NPR")
    expect(productSchema.offers.hasMerchantReturnPolicy.merchantReturnDays).toBe(7)
  })

  it("generates BreadcrumbList JSON-LD correctly", () => {
    const entity: NormalizedSEOEntity = {
      id: "prod_101",
      entityType: "PRODUCT",
      name: "Kathmandu Wool Coat",
      slug: "kathmandu-wool-coat",
      path: "/products/kathmandu-wool-coat",
      isIndexed: true,
      seoTitle: "Kathmandu Wool Coat",
      seoDescription: "Warm luxury coat.",
      canonicalUrl: "https://xinvora.com.np/products/kathmandu-wool-coat",
      ogImage: "",
      twitterImage: "",
      images: [],
      updatedAt: new Date(),
      raw: {},
    }

    const schemas = SEOSchemaEngine.generateJSONLD("https://xinvora.com.np", entity)
    const breadcrumbSchema = schemas.find((s) => s["@type"] === "BreadcrumbList")

    expect(breadcrumbSchema).toBeDefined()
    expect(breadcrumbSchema.itemListElement.length).toBeGreaterThan(0)
  })
})
