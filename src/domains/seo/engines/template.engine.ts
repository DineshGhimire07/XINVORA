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
      category: entity.categoryName || "Fashion",
      price: entity.price ? `Rs. ${entity.price.toLocaleString()}` : "",
      currency: entity.currency || "NPR",
      author: entity.authorName || "Editorial Team",
      ...extraVariables,
    }

    Object.entries(variables).forEach(([key, val]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "gi")
      result = result.replace(regex, val || "")
    })

    return result.replace(/\s+/g, " ").trim()
  }

  public static generateDefaultTitle(entity: NormalizedSEOEntity): string {
    const name = entity.name
    const category = (entity.categoryName || "Fashion").toLowerCase()

    switch (entity.entityType) {
      case "PRODUCT":
        return `${name} - Quiet Luxury ${entity.categoryName || "Fashion"} | XINVORA Nepal`
      case "COLLECTION":
        return `${name} Collection | Women's Designer ${entity.categoryName || "Clothing"} Nepal | XINVORA`
      case "JOURNAL":
        return `${name} | XINVORA Fashion Journal`
      default:
        return `${name} | XINVORA Nepal`
    }
  }

  public static generateDefaultDescription(entity: NormalizedSEOEntity): string {
    const name = entity.name
    const category = (entity.categoryName || "clothing").toLowerCase()

    // Smart contextual variation based on entity ID hash to avoid duplicate text
    const seed = (entity.id || name).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const variations = [
      `Shop ${name} handcrafted by XINVORA. Discover modern ${category} available with express delivery in Kathmandu, Lalitpur, and across Nepal.`,
      `Explore ${name} by XINVORA. Quiet luxury ${category} designed for women in Pokhara, Butwal, and nationwide Nepal.`,
      `Buy ${name} at XINVORA. Timeless designer ${category} with fast shipping in Kathmandu Valley, Chitwan, and Dharan.`,
    ]

    const selectedVariation = variations[seed % variations.length]

    switch (entity.entityType) {
      case "PRODUCT":
        return selectedVariation
      case "COLLECTION":
        return `Discover the ${name} edition at XINVORA. Premium women's ${category} available with nationwide shipping in Nepal.`
      case "JOURNAL":
        return `Read ${name} on XINVORA Journal. Styling insights and luxury fashion trends for 2026.`
      default:
        return `Discover ${name} at XINVORA. Premium handcrafted luxury fashion designed in Nepal.`
    }
  }
}
