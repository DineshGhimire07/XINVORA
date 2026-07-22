import type { NormalizedSEOEntity } from "../contracts/entity.contract"

export class SEOTemplateEngine {
  public static interpolate(
    template: string,
    entity: NormalizedSEOEntity,
    extraVariables?: Record<string, string>
  ): string {
    if (!template) return ""

    let result = template

    const variables: Record<string, string> = {
      product: entity.name,
      collection: entity.name,
      journal: entity.name,
      title: entity.name,
      name: entity.name,
      site_name: "XINVORA",
      brand: "XINVORA",
      category: entity.categoryName || "Collection",
      price: entity.price ? `Rs. ${entity.price.toLocaleString()}` : "",
      currency: entity.currency || "NPR",
      author: entity.authorName || "Editorial Team",
      ...extraVariables,
    }

    Object.entries(variables).forEach(([key, val]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "gi")
      result = result.replace(regex, val || "")
    })

    // Clean double spaces or leading/trailing hyphens
    return result.replace(/\s+/g, " ").trim()
  }

  public static generateDefaultTitle(entity: NormalizedSEOEntity): string {
    switch (entity.entityType) {
      case "PRODUCT":
        return this.interpolate("{{product}} | Premium Luxury Edition | XINVORA", entity)
      case "COLLECTION":
        return this.interpolate("{{collection}} Edition | XINVORA", entity)
      case "JOURNAL":
        return this.interpolate("{{title}} | Editorial Stories | XINVORA", entity)
      default:
        return this.interpolate("{{title}} | XINVORA", entity)
    }
  }

  public static generateDefaultDescription(entity: NormalizedSEOEntity): string {
    switch (entity.entityType) {
      case "PRODUCT":
        return this.interpolate("Explore {{product}} handcrafted by XINVORA. Designed for quiet luxury, premium materials, and timeless elegance.", entity)
      case "COLLECTION":
        return this.interpolate("Discover the {{collection}} edition. Curated luxury pieces crafted with uncompromising detail by XINVORA.", entity)
      case "JOURNAL":
        return this.interpolate("Read {{title}} on XINVORA Journal. Insights on craftsmanship, materials, and quiet luxury living.", entity)
      default:
        return this.interpolate("Discover {{title}} at XINVORA. Handcrafted luxury items designed for thoughtful living.", entity)
    }
  }
}
