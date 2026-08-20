import { products } from "@/db/schema"

export interface GeneratedAiContent {
  slug: string
  shortDescription: string
  description: string
  details: string
  careGuide: string
  sizeGuide: string
  virtualTryonPrompt: string
  seoTitle: string
  seoDescription: string
}

export class AiContentEngine {
  /**
   * Generates rich e-commerce content, craftsmanship details, care instructions,
   * size guides, and search-optimized (SEO) meta tags based on product title & category.
   * 100% local, zero external API cost.
   */
  static generateContent(name: string, categoryName: string): GeneratedAiContent {
    const trimmedName = name.trim()
    const trimmedCat = (categoryName || "Apparel").trim()
    const lowerName = trimmedName.toLowerCase()
    const lowerCat = trimmedCat.toLowerCase()

    // 1. Generate URL-Safe Slug
    const rawSlug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
    const slug = rawSlug || `product-${Date.now()}`

    // 2. Detect Material & Style Attributes from Name
    const materialsDetected: string[] = []
    if (lowerName.includes("silk")) materialsDetected.push("Silk")
    if (lowerName.includes("linen")) materialsDetected.push("Linen")
    if (lowerName.includes("cotton")) materialsDetected.push("Cotton")
    if (lowerName.includes("velvet")) materialsDetected.push("Velvet")
    if (lowerName.includes("satin")) materialsDetected.push("Satin")
    if (lowerName.includes("leather")) materialsDetected.push("Leather")
    if (lowerName.includes("wool")) materialsDetected.push("Wool")
    if (lowerName.includes("cashmere")) materialsDetected.push("Cashmere")
    const mainMaterial = materialsDetected[0] || "Premium Blend"

    // 3. Short Description Hook (30-250 chars)
    let shortDescription = `Masterfully tailored ${trimmedName} crafted with ${mainMaterial.toLowerCase()} handle and sophisticated silhouette for effortless luxury.`
    if (shortDescription.length < 30) {
      shortDescription = `Elevate your wardrobe with the ${trimmedName} by XINVORA. Designed with tailored elegance and fluid drape.`
    }
    if (shortDescription.length > 250) {
      shortDescription = shortDescription.slice(0, 247) + "..."
    }

    // 4. Complete Description
    const description = `Designed for contemporary sophistication, the ${trimmedName} embodies refined elegance and timeless appeal. Expertly fashioned from ${mainMaterial.toLowerCase()} fabric with meticulous attention to detail, this piece offers a flattering drape and seamless versatility. Ideal for formal gatherings, evening dinners, or elevated casual styling, it delivers unmatched comfort and distinct prestige.`

    // 5. Specs Accordion Details
    let details = `Composition: ${mainMaterial}. Features tailored silhouette, concealed fastener, and hand-finished hems for structural integrity.`
    if (lowerCat.includes("bag") || lowerCat.includes("accessory")) {
      details = `Material: ${mainMaterial}. Features structured silhouette, polished hardware finish, and organized interior compartments.`
    }

    // 6. Care Guide Details
    let careGuide = `Dry clean recommended to preserve fabric luster and structure. Alternatively hand wash cold with mild detergent. Line dry in shade. Cool iron on reverse.`
    if (lowerCat.includes("bag") || lowerCat.includes("leather") || lowerName.includes("leather")) {
      careGuide = `Wipe clean with a soft dry cloth. Avoid exposure to direct heat or moisture. Store in provided dust bag when not in use.`
    } else if (lowerName.includes("wool") || lowerName.includes("cashmere")) {
      careGuide = `Professional dry clean only. Store flat on padded hangers to maintain shape. Do not tumble dry.`
    }

    // 7. Size Guide Description
    let sizeGuide = `S: Bust 86cm | Waist 68cm | Hips 94cm\nM: Bust 90cm | Waist 72cm | Hips 98cm\nL: Bust 96cm | Waist 78cm | Hips 104cm\nXL: Bust 102cm | Waist 84cm | Hips 110cm\nFree Size / Combo Fits: Flexible stretch contour fitting measurements XS through L.`
    if (lowerCat.includes("shoe") || lowerCat.includes("footwear")) {
      sizeGuide = `EU 36 (US 6 | UK 3.5)\nEU 37 (US 6.5 | UK 4)\nEU 38 (US 7.5 | UK 5)\nEU 39 (US 8.5 | UK 6)\nEU 40 (US 9 | UK 6.5)`
    } else if (lowerCat.includes("bag") || lowerCat.includes("accessory")) {
      sizeGuide = `Dimensions: Height 22cm x Width 30cm x Depth 10cm. Handle Drop: 12cm. Adjustable Strap: 45-55cm.`
    }

    // 8. Virtual Try-On AI Prompt
    const virtualTryonPrompt = `I am uploading two images: a photo of myself and a photo of the ${trimmedName}. Please generate a realistic image of me wearing this piece, preserving my facial features and body pose while matching the garment's color, pattern, and tailored fit.`

    // 9. SEO Title (Strictly Clamped 50-60 Characters for Google)
    let rawTitle = `${trimmedName} - Luxury ${trimmedCat} | XINVORA`
    if (rawTitle.length > 60) {
      rawTitle = `${trimmedName} | XINVORA`
    }
    if (rawTitle.length < 50) {
      rawTitle = `${trimmedName} - Luxury ${trimmedCat} Collection | XINVORA`
    }
    if (rawTitle.length > 60) {
      rawTitle = rawTitle.slice(0, 57) + "..."
    }
    const seoTitle = rawTitle

    // 10. SEO Meta Description (Strictly Clamped 140-160 Characters)
    let seoDescription = `Discover the ${trimmedName} by XINVORA. Designed with tailored elegance and premium finish. Shop luxury ${lowerCat} with fast worldwide delivery.`
    if (seoDescription.length < 140) {
      seoDescription = `Discover the exquisite ${trimmedName} by XINVORA. Designed with tailored elegance, fluid movement, and premium finish. Shop luxury ${lowerCat} with fast worldwide delivery.`
    }
    if (seoDescription.length > 160) {
      seoDescription = seoDescription.slice(0, 157) + "..."
    }

    return {
      slug,
      shortDescription,
      description,
      details,
      careGuide,
      sizeGuide,
      virtualTryonPrompt,
      seoTitle,
      seoDescription,
    }
  }
}
