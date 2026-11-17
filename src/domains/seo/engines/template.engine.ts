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
      category: entity.categoryName || "Lifestyle",
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
    const category = entity.categoryName || "Lifestyle"

    switch (entity.entityType) {
      case "PRODUCT":
        return `${name} - Quiet Luxury ${category} | XINVORA Nepal`
      case "COLLECTION":
        return `${name} Collection | Luxury ${category} Nepal | XINVORA`
      case "JOURNAL":
        return `${name} | XINVORA Editorial Journal`
      default:
        return `${name} | XINVORA Nepal`
    }
  }

  public static generateDefaultDescription(entity: NormalizedSEOEntity): string {
    const name = entity.name
    const category = (entity.categoryName || "lifestyle piece").toLowerCase()

    // Smart contextual variation based on entity ID hash to avoid duplicate text
    const seed = (entity.id || name).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const variations = [
      `Shop ${name} handcrafted by XINVORA. Discover modern ${category} available with express delivery in Kathmandu, Lalitpur, and across Nepal.`,
      `Explore ${name} by XINVORA. Quiet luxury ${category} crafted with intention and available nationwide across Nepal.`,
      `Buy ${name} at XINVORA. Timeless design and artisanal ${category} with prompt delivery in Kathmandu Valley and nationwide.`,
    ]

    const selectedVariation = variations[seed % variations.length]

    switch (entity.entityType) {
      case "PRODUCT":
        return selectedVariation
      case "COLLECTION":
        return `Discover the ${name} edition at XINVORA. Premium ${category} curated for modern living and available with nationwide shipping in Nepal.`
      case "JOURNAL":
        return `Read ${name} on XINVORA Journal. Insights into design, aesthetics, and artisanal craftsmanship.`
      default:
        return `Discover ${name} at XINVORA. Premium quiet luxury crafted with intention in Nepal.`
    }
  }
}
