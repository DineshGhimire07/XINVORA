import type { NormalizedSEOEntity } from "../contracts/entity.contract"

export interface CategorySEOMetadata {
  h1Title: string
  introParagraph: string
  buyingGuide: {
    title: string
    content: string
  }
  popularKeywords: string[]
}

export class SEOCategoryEngine {
  public static generateCategorySEO(collectionName: string, categoryType?: string): CategorySEOMetadata {
    const cleanName = collectionName.trim()
    const type = (categoryType || "clothing").toLowerCase()

    return {
      h1Title: `${cleanName} - Designer Women's ${collectionName}`,
      introParagraph: `Explore the ${cleanName} collection at XINVORA. Handcrafted with ultra-premium fabrics, timeless tailoring, and quiet luxury aesthetic. Available with express delivery across Kathmandu, Lalitpur, Pokhara, Butwal, and nationwide Nepal.`,
      buyingGuide: {
        title: `How to Style & Choose ${cleanName}`,
        content: `When selecting pieces from our ${cleanName} edition, look for versatile silhouettes that transition seamlessly from day to evening. Pair with delicate artisan jewelry for a refined, modern wardrobe.`,
      },
      popularKeywords: [
        `${cleanName} Nepal`,
        `buy ${type} online Kathmandu`,
        `designer ${type} Lalitpur`,
        `quiet luxury ${cleanName}`,
        `women's fashion 2026`,
      ],
    }
  }
}
