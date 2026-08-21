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

const LUXURY_OPENERS = [
  "Exclusively crafted",
  "Artisanally designed",
  "Meticulously curated",
  "Impeccably tailored",
  "Masterfully constructed",
]

const LUXURY_ATTRS = [
  "refined silhouette and couture-grade finish",
  "sculptural drape and bespoke detailing",
  "heritage craftsmanship and elevated aesthetic",
  "precision cut and hand-finished seams",
  "signature silhouette and premium construction",
]

const DELIVERY_PHRASES = [
  "Free global express delivery.",
  "Worldwide luxury delivery included.",
  "Complimentary international shipping.",
  "Ships worldwide — premium packaging guaranteed.",
]

function pickByHash(arr: string[], seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return arr[h % arr.length]
}

export class AiContentEngine {
  /**
   * Generates rich e-commerce content, craftsmanship details, care instructions,
   * size guides, and search-optimized (SEO) meta tags based on product title & category.
   * 100% local, zero external API cost. Uses luxury/premium language throughout.
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

    // Pick luxury descriptors deterministically from product name (unique per product)
    const opener = pickByHash(LUXURY_OPENERS, trimmedName)
    const attr = pickByHash(LUXURY_ATTRS, trimmedCat + trimmedName)
    const delivery = pickByHash(DELIVERY_PHRASES, trimmedName + trimmedCat)

    // 3. Short Description Hook (30-250 chars)
    let shortDescription = `${opener} — the ${trimmedName} is a statement of quiet luxury. ${mainMaterial} construction meets ${attr} for those who demand effortless sophistication.`
    if (shortDescription.length > 250) shortDescription = shortDescription.slice(0, 247) + "..."
    if (shortDescription.length < 30) {
      shortDescription = `Elevate your wardrobe with the ${trimmedName} by XINVORA — where ${attr} defines every stitch.`
    }

    // 4. Complete Description
    const description = `${opener} for the discerning wardrobe, the ${trimmedName} is a testament to XINVORA's commitment to understated opulence. Fashioned from ${mainMaterial.toLowerCase()} with ${attr}, this piece transcends trends and embodies enduring elegance. Whether styled for intimate gatherings, editorial moments, or elevated everyday wear, it delivers unrivalled presence and sartorial confidence.`

    // 5. Specs Accordion Details
    let details = `Composition: ${mainMaterial}. Features ${attr}, concealed fastening, and hand-finished hems for structural integrity.`
    if (lowerCat.includes("bag") || lowerCat.includes("accessory")) {
      details = `Material: ${mainMaterial}. Features ${attr}, polished hardware finish, and organized interior compartments.`
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

    // 9. SEO Title — premium luxury copy, clamped 50–60 chars for Google
    const titleVariants = [
      `${trimmedName} — Luxury ${trimmedCat} | XINVORA`,
      `${trimmedName} | Luxury ${trimmedCat} — XINVORA`,
      `Shop ${trimmedName} | Premium ${trimmedCat} | XINVORA`,
      `${trimmedName} | XINVORA Luxury`,
    ]
    let seoTitle = titleVariants[0]
    for (const v of titleVariants) {
      if (v.length >= 50 && v.length <= 60) { seoTitle = v; break }
    }
    if (seoTitle.length > 60) seoTitle = seoTitle.slice(0, 57) + "..."

    // 10. SEO Meta Description — luxury premium copy, clamped 140–160 chars
    const descVariants = [
      `${opener} — the ${trimmedName} by XINVORA. Defined by ${attr}. Shop premium ${lowerCat} and arrive in quiet luxury. ${delivery}`,
      `Discover the ${trimmedName} by XINVORA — ${attr}. A statement piece for the discerning wardrobe. ${delivery}`,
      `The ${trimmedName} by XINVORA: ${attr}. Elevate your collection with this premium ${lowerCat} piece. ${delivery}`,
    ]
    let seoDescription = descVariants[0]
    for (const v of descVariants) {
      if (v.length >= 140 && v.length <= 160) { seoDescription = v; break }
    }
    if (seoDescription.length > 160) seoDescription = seoDescription.slice(0, 157) + "..."
    if (seoDescription.length < 140) {
      seoDescription = `${opener} — the ${trimmedName} by XINVORA radiates ${attr}. A premium ${lowerCat} designed for those who dress with intention. ${delivery}`
      if (seoDescription.length > 160) seoDescription = seoDescription.slice(0, 157) + "..."
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
