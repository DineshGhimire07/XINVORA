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
  seoKeywords: string
}

type ProductDomain =
  | "HOME_DECOR_KITCHEN"
  | "BAGS_LEATHER"
  | "JEWELRY_ACCESSORIES"
  | "FOOTWEAR"
  | "BEAUTY_WELLNESS"
  | "APPAREL"
  | "LIFESTYLE"

function detectDomain(name: string, category: string): ProductDomain {
  const combined = `${name.toLowerCase()} ${category.toLowerCase()}`

  // 1. Home, Decor, Kitchen & Living
  if (
    /\b(decor|decoration|kitchen|dining|cookware|cutlery|tableware|home|living|interior|ceramic|crockery|pottery|stoneware|vase|bowl|plate|dish|mug|cup|glass|glassware|tray|candle|diffuser|cushion|pillow|rug|carpet|blanket|throw|lamp|light|lighting|clock|mirror|planter|pot|sculpture|art|frame|tablecloth|napkin|coaster|organizer|storage|jar|canister|bottle|jug|carafe|tea|coffee|spoon|fork|knife|pan|furniture|table|chair|stool|bedding|towel|utensil)\b/.test(
      combined
    )
  ) {
    return "HOME_DECOR_KITCHEN"
  }

  // 2. Bags & Leather Goods
  if (
    /\b(bag|tote|handbag|crossbody|shoulder bag|clutch|backpack|wallet|purse|pouch|cardholder|card holder|briefcase|satchel|duffle|messenger)\b/.test(
      combined
    )
  ) {
    return "BAGS_LEATHER"
  }

  // 3. Jewelry & Accessories
  if (
    /\b(jewel|jewelry|jewellery|necklace|earring|earrings|ring|rings|bracelet|bangle|pendant|brooch|watch|sunglasses|eyewear|scarf|belt|hat|cap|hairpin|hairclip|scrunchie|cufflink|choker)\b/.test(
      combined
    )
  ) {
    return "JEWELRY_ACCESSORIES"
  }

  // 4. Footwear
  if (
    /\b(shoe|shoes|boot|boots|sneaker|sneakers|heel|heels|sandal|sandals|loafer|loafers|mule|mules|slide|slides|flat|flats|oxford|derby|footwear|slippers)\b/.test(
      combined
    )
  ) {
    return "FOOTWEAR"
  }

  // 5. Beauty & Fragrance
  if (
    /\b(perfume|fragrance|cologne|scent|skincare|serum|lotion|cream|cleanser|soap|balm|body wash|wellness|oil)\b/.test(
      combined
    )
  ) {
    return "BEAUTY_WELLNESS"
  }

  // 6. Apparel / Fashion (explicit clothing items)
  if (
    /\b(dress|gown|top|shirt|blouse|tee|t-shirt|corset|skirt|pants|pant|trouser|trousers|jeans|denim|jacket|blazer|coat|trench|sweater|knit|knitwear|cardigan|hoodie|sweatshirt|suit|vest|waistcoat|romper|jumpsuit|lingerie|bra|kimono|hood|fleece|apparel|clothing|garment|wear|fashion)\b/.test(
      combined
    )
  ) {
    return "APPAREL"
  }

  return "LIFESTYLE"
}

function detectMaterials(lowerName: string, domain: ProductDomain): string[] {
  const materials: string[] = []

  if (domain === "HOME_DECOR_KITCHEN") {
    if (lowerName.includes("ceramic")) materials.push("Glazed Ceramic")
    if (lowerName.includes("stoneware")) materials.push("Artisanal Stoneware")
    if (lowerName.includes("porcelain")) materials.push("Fine Porcelain")
    if (lowerName.includes("brass")) materials.push("Solid Brushed Brass")
    if (lowerName.includes("marble")) materials.push("Natural Honed Marble")
    if (lowerName.includes("wood") || lowerName.includes("oak") || lowerName.includes("teak") || lowerName.includes("walnut")) materials.push("Natural Solid Wood")
    if (lowerName.includes("glass")) materials.push("Mouth-Blown Glass")
    if (lowerName.includes("linen")) materials.push("Woven European Linen")
    if (lowerName.includes("terracotta")) materials.push("Earthy Terracotta")
    if (lowerName.includes("steel")) materials.push("Brushed Stainless Steel")
    if (materials.length === 0) materials.push("Premium Artisanal Material")
  } else if (domain === "BAGS_LEATHER") {
    if (lowerName.includes("leather")) materials.push("Full-Grain Supple Leather")
    if (lowerName.includes("suede")) materials.push("Tactile Velveteen Suede")
    if (lowerName.includes("canvas")) materials.push("Heavyweight Structured Canvas")
    if (materials.length === 0) materials.push("Fine Crafted Leather")
  } else if (domain === "JEWELRY_ACCESSORIES") {
    if (lowerName.includes("gold")) materials.push("18k Gold Plated Brass")
    if (lowerName.includes("silver")) materials.push("Sterling 925 Silver")
    if (lowerName.includes("pearl")) materials.push("Freshwater Baroque Pearl")
    if (materials.length === 0) materials.push("Precious Alloy")
  } else {
    // Apparel / Footwear / Lifestyle
    if (lowerName.includes("silk")) materials.push("Mulberry Silk")
    if (lowerName.includes("linen")) materials.push("Natural Washed Linen")
    if (lowerName.includes("cotton")) materials.push("Organic Combed Cotton")
    if (lowerName.includes("velvet")) materials.push("Plush Velvet")
    if (lowerName.includes("satin")) materials.push("Fluid Lustrous Satin")
    if (lowerName.includes("leather")) materials.push("Supple Leather")
    if (lowerName.includes("wool")) materials.push("Merino Wool")
    if (lowerName.includes("cashmere")) materials.push("Pure Cashmere")
    if (materials.length === 0) materials.push("Premium Selected Material")
  }

  return materials
}

function pickByHash(arr: string[], seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return arr[h % arr.length]
}

const LUXURY_OPENERS = [
  "Artisanally designed",
  "Meticulously curated",
  "Thoughtfully crafted",
  "Masterfully constructed",
  "Formed with intention",
]

const DELIVERY_PHRASES = [
  "Express nationwide delivery across Nepal.",
  "Complimentary express delivery in Kathmandu and across Nepal.",
  "Delivered with signature premium packaging.",
  "Available with prompt dispatch nationwide.",
]

export class AiContentEngine {
  /**
   * Generates rich e-commerce content, craftsmanship details, care instructions,
   * size/dimensions guides, and search-optimized (SEO) meta tags.
   * Dynamically adapts to Decor, Kitchen, Lifestyle, Bags, Jewelry, or Apparel.
   */
  static generateContent(name: string, categoryName: string): GeneratedAiContent {
    const trimmedName = name.trim()
    const trimmedCat = (categoryName || "Lifestyle").trim()
    const lowerName = trimmedName.toLowerCase()
    const lowerCat = trimmedCat.toLowerCase()

    // 1. Detect Domain
    const domain = detectDomain(name, categoryName)

    // 2. Slug
    const rawSlug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
    const slug = rawSlug || `product-${Date.now()}`

    // 3. Materials
    const materialsDetected = detectMaterials(lowerName, domain)
    const mainMaterial = materialsDetected[0]

    // 4. Domain-specific luxury attributes
    let attrList: string[]
    if (domain === "HOME_DECOR_KITCHEN") {
      attrList = [
        "architectural silhouette and serene interior presence",
        "tactile materiality and enduring everyday utility",
        "hand-finished organic texture and minimalist balance",
        "considered proportions and elevated functional elegance",
        "sculptural form crafted to enrich daily living rituals",
      ]
    } else if (domain === "BAGS_LEATHER") {
      attrList = [
        "structural precision and supple tactile grain",
        "bespoke hardware accents and timeless utility",
        "enduring artisanal craftsmanship and streamlined silhouette",
        "architectural geometry and seamless daily functionality",
      ]
    } else if (domain === "JEWELRY_ACCESSORIES") {
      attrList = [
        "delicate luminous polish and sculptural curves",
        "timeless artisanal craftsmanship and subtle statement presence",
        "refined proportions and elevated everyday luster",
      ]
    } else if (domain === "FOOTWEAR") {
      attrList = [
        "sculpted profile and ergonomic modern silhouette",
        "cushioned comfort paired with quiet sartorial presence",
        "clean architectural lines and artisanal sole finish",
      ]
    } else {
      // Apparel / Lifestyle
      attrList = [
        "refined silhouette and couture-grade finish",
        "effortless drape and elevated aesthetic",
        "heritage craftsmanship and relaxed modern elegance",
        "clean architectural cut and signature finish",
      ]
    }

    const opener = pickByHash(LUXURY_OPENERS, trimmedName)
    const attr = pickByHash(attrList, trimmedCat + trimmedName)
    const delivery = pickByHash(DELIVERY_PHRASES, trimmedName + trimmedCat)

    // 5. Short Description Hook
    let shortDescription: string
    if (domain === "HOME_DECOR_KITCHEN") {
      shortDescription = `${opener} — the ${trimmedName} brings understated beauty and tactile presence to modern living. ${mainMaterial} craftsmanship meets ${attr}.`
    } else if (domain === "BAGS_LEATHER" || domain === "JEWELRY_ACCESSORIES") {
      shortDescription = `${opener} — the ${trimmedName} is a testament to quiet luxury and functional beauty. Made from ${mainMaterial.toLowerCase()} with ${attr}.`
    } else {
      shortDescription = `${opener} — the ${trimmedName} embodies timeless simplicity. ${mainMaterial} craftsmanship meets ${attr} for elevated daily living.`
    }
    if (shortDescription.length > 250) shortDescription = shortDescription.slice(0, 247) + "..."

    // 6. Complete Description
    let description: string
    if (domain === "HOME_DECOR_KITCHEN") {
      description = `${opener} for mindful spaces, the ${trimmedName} is a testament to XINVORA's dedication to quiet luxury and purposeful interior design. Formed from ${mainMaterial.toLowerCase()} with ${attr}, this piece brings organic warmth and aesthetic harmony into contemporary spaces. Whether showcased as an everyday essential or a sculptural focal point, it elevates home rituals with enduring grace.`
    } else if (domain === "BAGS_LEATHER" || domain === "JEWELRY_ACCESSORIES") {
      description = `${opener} for discerning collections, the ${trimmedName} combines refined aesthetics with purposeful utility. Crafted from ${mainMaterial.toLowerCase()} featuring ${attr}, this piece transitions effortlessly across occasions, offering enduring sophistication for daily life.`
    } else {
      description = `${opener} for considered living, the ${trimmedName} reflects XINVORA's commitment to quiet luxury and enduring craft. Fashioned from ${mainMaterial.toLowerCase()} with ${attr}, this piece transcends passing trends, delivering presence, tactile comfort, and effortless elegance.`
    }

    // 7. Details Specs
    let details: string
    if (domain === "HOME_DECOR_KITCHEN") {
      details = `Material: ${mainMaterial}. Features ${attr}, protective hand-finished surface, and substantial balanced weight. Designed for contemporary interior spaces.`
    } else if (domain === "BAGS_LEATHER") {
      details = `Material: ${mainMaterial}. Features ${attr}, polished hardware finish, and organized interior compartments.`
    } else if (domain === "JEWELRY_ACCESSORIES") {
      details = `Composition: ${mainMaterial}. Hand-finished with protective luster coating. Hypoallergenic and crafted for daily wear.`
    } else if (domain === "FOOTWEAR") {
      details = `Upper: ${mainMaterial}. Features cushioned footbed, reinforced heel counter, and durable artisanal sole.`
    } else {
      details = `Composition: ${mainMaterial}. Features ${attr}, clean concealed seams, and structural integrity.`
    }

    // 8. Care Guide
    let careGuide: string
    if (domain === "HOME_DECOR_KITCHEN") {
      careGuide = `Gently hand wash with mild soap and warm water. Avoid abrasive scrubbers to preserve the natural surface finish. For stone, ceramic, or glass, handle with care. Dry thoroughly with a soft cloth after cleaning.`
    } else if (domain === "BAGS_LEATHER") {
      careGuide = `Wipe clean with a soft dry microfiber cloth. Avoid exposure to direct moisture, harsh sunlight, or extreme heat. Store in the provided dust bag when not in use.`
    } else if (domain === "JEWELRY_ACCESSORIES") {
      careGuide = `Keep away from water, perfumes, and chemical lotions. Store individually in a soft pouch to prevent surface scratches. Gently buff with a microfiber cloth.`
    } else if (domain === "FOOTWEAR") {
      careGuide = `Clean with a soft brush or damp cloth. Allow to air dry naturally away from direct heat sources. Treat leather periodically with conditioner.`
    } else {
      careGuide = `Delicate hand wash or gentle cycle in cold water with mild detergent. Alternatively dry clean to maintain shape and texture. Dry flat in shade. Cool iron on reverse.`
    }

    // 9. Size / Dimensions Guide
    let sizeGuide: string
    if (domain === "HOME_DECOR_KITCHEN") {
      sizeGuide = `Dimensions & Proportions:\nStandard Size: Proportionate architectural scale for modern countertops, dining surfaces, and shelves.\nProfile: Balanced functional volume tailored for daily use and interior staging.`
    } else if (domain === "BAGS_LEATHER") {
      sizeGuide = `Dimensions: Height 24cm x Width 32cm x Depth 11cm.\nHandle Drop: 14cm.\nAdjustable Crossbody Strap: 45cm–55cm.`
    } else if (domain === "JEWELRY_ACCESSORIES") {
      sizeGuide = `Size & Fit:\nStandard universal fit with adjustable sizing or comfort-contour dimension.`
    } else if (domain === "FOOTWEAR") {
      sizeGuide = `EU 36 (US 6 | UK 3.5)\nEU 37 (US 6.5 | UK 4)\nEU 38 (US 7.5 | UK 5)\nEU 39 (US 8.5 | UK 6)\nEU 40 (US 9 | UK 6.5)\nEU 41 (US 9.5 | UK 7)`
    } else {
      sizeGuide = `S: Bust 86cm | Waist 68cm | Hips 94cm\nM: Bust 90cm | Waist 72cm | Hips 98cm\nL: Bust 96cm | Waist 78cm | Hips 104cm\nXL: Bust 102cm | Waist 84cm | Hips 110cm\nFree Size: Flexible contoured fit accommodating XS through L.`
    }

    // 10. Virtual Try-On / Staging AI Prompt
    let virtualTryonPrompt: string
    if (domain === "HOME_DECOR_KITCHEN") {
      virtualTryonPrompt = `Interior staging render: Place the ${trimmedName} on a minimalist quiet luxury kitchen counter or living room table. Natural architectural daylight, warm neutral aesthetic, high-end design editorial style.`
    } else if (domain === "BAGS_LEATHER" || domain === "JEWELRY_ACCESSORIES") {
      virtualTryonPrompt = `Editorial styling photo: Generate a realistic lifestyle shot featuring the ${trimmedName} styled elegantly with minimalist contemporary apparel and warm natural lighting.`
    } else {
      virtualTryonPrompt = `I am uploading two images: a photo of myself and a photo of the ${trimmedName}. Please generate a realistic image of me wearing this piece, preserving my facial features and body pose while matching the garment's color, pattern, and tailored fit.`
    }

    // 11. SEO Title — Clamped 50–60 chars for Google
    let titleVariants: string[]
    if (domain === "HOME_DECOR_KITCHEN") {
      titleVariants = [
        `${trimmedName} — Modern ${trimmedCat} | XINVORA`,
        `${trimmedName} | Luxury Home & Living — XINVORA`,
        `Buy ${trimmedName} | Modern Decor — XINVORA`,
        `${trimmedName} | XINVORA Home & Living`,
      ]
    } else {
      titleVariants = [
        `${trimmedName} — Luxury ${trimmedCat} | XINVORA`,
        `${trimmedName} | Luxury ${trimmedCat} — XINVORA`,
        `Shop ${trimmedName} | Premium ${trimmedCat} | XINVORA`,
        `${trimmedName} | XINVORA Nepal`,
      ]
    }

    let seoTitle = titleVariants[0]
    for (const v of titleVariants) {
      if (v.length >= 50 && v.length <= 60) {
        seoTitle = v
        break
      }
    }
    if (seoTitle.length > 60) seoTitle = seoTitle.slice(0, 57) + "..."

    // 12. SEO Meta Description — Clamped 140–160 chars
    let descVariants: string[]
    if (domain === "HOME_DECOR_KITCHEN") {
      descVariants = [
        `${opener} — the ${trimmedName} by XINVORA. Defined by ${attr}. Elevate your home living space with quiet luxury. ${delivery}`,
        `Discover the ${trimmedName} at XINVORA: ${attr}. Thoughtfully formed for modern interior living and dining. ${delivery}`,
        `Shop ${trimmedName} by XINVORA. Premium ${lowerCat} piece crafted with ${mainMaterial.toLowerCase()} for daily rituals. ${delivery}`,
      ]
    } else {
      descVariants = [
        `${opener} — the ${trimmedName} by XINVORA. Defined by ${attr}. Shop premium ${lowerCat} and enjoy quiet luxury. ${delivery}`,
        `Discover the ${trimmedName} by XINVORA — ${attr}. A statement piece crafted with intention. ${delivery}`,
        `The ${trimmedName} by XINVORA: ${attr}. Elevate your collection with this premium ${lowerCat} piece. ${delivery}`,
      ]
    }

    let seoDescription = descVariants[0]
    for (const v of descVariants) {
      if (v.length >= 140 && v.length <= 160) {
        seoDescription = v
        break
      }
    }
    if (seoDescription.length > 160) seoDescription = seoDescription.slice(0, 157) + "..."
    if (seoDescription.length < 140) {
      seoDescription = `${opener} — the ${trimmedName} by XINVORA brings ${attr}. A premium ${lowerCat} designed with intention. ${delivery}`
      if (seoDescription.length > 160) seoDescription = seoDescription.slice(0, 157) + "..."
    }

    // 13. SEO Keywords & Search Tags
    const baseKeywords = [
      trimmedName.toLowerCase(),
      `${trimmedName.toLowerCase()} nepal`,
      `buy ${trimmedName.toLowerCase()} online`,
      `luxury ${lowerCat}`,
      `${lowerCat} in nepal`,
      `designer ${lowerCat}`,
      `xinvora ${lowerCat}`,
      "xinvora nepal",
    ]

    if (domain === "HOME_DECOR_KITCHEN") {
      baseKeywords.push("luxury home decor nepal")
      baseKeywords.push("modern interior accessories kathmandu")
      baseKeywords.push("contemporary tableware nepal")
    } else {
      baseKeywords.push("nepal luxury lifestyle")
      baseKeywords.push("contemporary design kathmandu")
    }

    if (materialsDetected.length > 0) {
      baseKeywords.push(`${materialsDetected[0].toLowerCase()} ${lowerCat}`)
    }

    const seoKeywords = Array.from(new Set(baseKeywords)).join(", ")

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
      seoKeywords,
    }
  }
}
