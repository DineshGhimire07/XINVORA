import { describe, it, expect } from "vitest"
import { SEOScoreEngine } from "../src/domains/seo/engines/score.engine"
import type { NormalizedSEOEntity } from "../src/domains/seo/contracts/entity.contract"

describe("SEOScoreEngine", () => {
  it("calculates 100/100 score for a fully compliant product entity", () => {
    const entity: NormalizedSEOEntity = {
      id: "prod_1",
      entityType: "PRODUCT",
      name: "Aurora Pleated Silk Skirt",
      slug: "aurora-pleated-silk-skirt",
      path: "/products/aurora-pleated-silk-skirt",
      isIndexed: true,
      seoTitle: "Aurora Pleated Silk Skirt | Premium Women's Skirt | XINVORA Nepal",
      seoDescription: "Shop Aurora Pleated Silk Skirt handcrafted by XINVORA. Discover modern fashion, premium materials, and fast delivery in Kathmandu, Lalitpur, and across Nepal.",
      canonicalUrl: "https://xinvora.com.np/products/aurora-pleated-silk-skirt",
      ogImage: "https://xinvora.com.np/images/aurora-skirt.jpg",
      twitterImage: "https://xinvora.com.np/images/aurora-skirt.jpg",
      images: [{ url: "https://xinvora.com.np/images/aurora-skirt.jpg", alt: "Aurora Skirt" }],
      updatedAt: new Date(),
      raw: {
        productImages: [{ altText: "Aurora Pleated Silk Skirt Front View" }],
      },
    }

    const report = SEOScoreEngine.calculateEntityScore(entity)
    expect(report.score).toBeGreaterThanOrEqual(90)
    expect(report.grade).toBe("A+")
  })

  it("penalizes short or missing titles and descriptions", () => {
    const entity: NormalizedSEOEntity = {
      id: "prod_2",
      entityType: "PRODUCT",
      name: "Short",
      slug: "short",
      path: "/products/short",
      isIndexed: false,
      seoTitle: "Short",
      seoDescription: "Short desc",
      canonicalUrl: "https://xinvora.com.np/products/short",
      ogImage: "",
      twitterImage: "",
      images: [],
      updatedAt: new Date(),
      raw: {},
    }

    const report = SEOScoreEngine.calculateEntityScore(entity)
    expect(report.score).toBeLessThan(70)
  })
})
