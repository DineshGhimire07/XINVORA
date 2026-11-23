import type { DarazAttributeItem } from "./client"

export interface ProductListingInput {
  primaryCategory: string | number
  title: string // maps to Attributes -> name
  highlights?: string[] | string // maps to Attributes -> short_description
  description?: string // maps to Attributes -> description
  brand?: string // maps to Attributes -> brand (default: "XINVORA" or "No Brand")
  whiteBackgroundImage?: string // maps to Attributes -> promotion_whitebkg_image (1:1 square)
  normalAttributes?: Record<string, string | number | boolean>
  sku: {
    sellerSku: string // maps to Sku -> SellerSku
    price: number // maps to Sku -> price
    specialPrice?: number // maps to Sku -> special_price
    quantity?: number // maps to Sku -> quantity
    colorFamily?: string // maps to Sku -> color_family
    packageWeight: number // kg, maps to Sku -> package_weight
    packageLength?: number // cm, maps to Sku -> package_length
    packageWidth?: number // cm, maps to Sku -> package_width
    packageHeight?: number // cm, maps to Sku -> package_height
    packageContent?: string // maps to Sku -> package_content
    images: string[] // Daraz uploaded CDN image URLs
    skuAttributes?: Record<string, string | number | boolean>
  }
}

/**
 * Escapes XML special characters
 */
export function escapeXml(str: any): string {
  if (str === null || str === undefined) return ""
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/**
 * Builds the official Daraz CreateProduct XML payload matching Daraz OpenAPI specs:
 *
 * <?xml version="1.0" encoding="utf-8"?>
 * <Request>
 *   <Product>
 *     <PrimaryCategory>...</PrimaryCategory>
 *     <Attributes>
 *       <name>...</name>
 *       <short_description>...</short_description>
 *       <description>...</description>
 *       <brand>...</brand>
 *       ...
 *     </Attributes>
 *     <Skus>
 *       <Sku>
 *         <SellerSku>...</SellerSku>
 *         <price>...</price>
 *         <special_price>...</special_price>
 *         <quantity>...</quantity>
 *         <package_weight>...</package_weight>
 *         <package_length>...</package_length>
 *         <package_width>...</package_width>
 *         <package_height>...</package_height>
 *         <package_content>...</package_content>
 *         <Images>
 *           <Image>url</Image>
 *           ...
 *         </Images>
 *       </Sku>
 *     </Skus>
 *   </Product>
 * </Request>
 */
export function buildDarazProductXml(input: ProductListingInput): string {
  const brand = input.brand || "XINVORA"

  // Format highlights (short_description) as CDATA HTML unordered list
  let shortDesc = ""
  if (Array.isArray(input.highlights) && input.highlights.length > 0) {
    const listHtml = `<ul>${input.highlights.map((h) => `<li>${escapeXml(h)}</li>`).join("")}</ul>`
    shortDesc = `<![CDATA[${listHtml}]]>`
  } else if (input.highlights) {
    shortDesc = `<![CDATA[${escapeXml(input.highlights)}]]>`
  }

  // Assemble Rich Description: Images first (Daraz Lorikeet style), then text description
  const allImages = (input.sku.images || []).filter(Boolean)
  let richDescHtml = ""
  if (allImages.length > 0) {
    for (const imgUrl of allImages) {
      richDescHtml += `<p><img src="${imgUrl}" alt="${escapeXml(input.title)}" /></p>\n`
    }
  }
  if (input.description) {
    const formattedText = escapeXml(input.description)
      .replace(/\r?\n\r?\n+/g, "</p><p>")
      .replace(/\r?\n/g, "<br />")
    richDescHtml += `<p>${formattedText}</p>`
  }
  const description = richDescHtml ? `<![CDATA[${richDescHtml}]]>` : ""

  // Assemble Normal Attributes
  let normalAttrsXml = `      <name>${escapeXml(input.title)}</name>\n`
  if (shortDesc) {
    normalAttrsXml += `      <short_description>${shortDesc}</short_description>\n`
  }
  if (description) {
    normalAttrsXml += `      <description>${description}</description>\n`
  }
  normalAttrsXml += `      <brand>${escapeXml(brand)}</brand>\n`

  // White Background Image (Photo 1 formatted 1:1 square on pure white background) - Daraz Buyer Promotion Image
  const whiteBgImage = input.whiteBackgroundImage || (allImages.length > 0 ? allImages[0] : undefined)
  if (whiteBgImage) {
    normalAttrsXml += `      <promotion_whitebkg_image>${whiteBgImage}</promotion_whitebkg_image>\n`
  }

  if (input.normalAttributes) {
    const skuKeys = new Set([
      "product_id",
      "id",
      "title",
      "name",
      "category_id",
      "category",
      "seller_sku",
      "sku",
      "price",
      "special_price",
      "stock",
      "quantity",
      "color",
      "color_family",
      "package",
      "package_weight",
      "package_length",
      "package_width",
      "package_height",
      "package_content",
      "highlights",
      "description",
      "short_description",
      "brand",
      "images",
      "fabric",
      "promotion_whitebkg_image",
    ])

    for (const [key, val] of Object.entries(input.normalAttributes)) {
      if (
        val !== undefined &&
        val !== null &&
        !skuKeys.has(key.toLowerCase())
      ) {
        normalAttrsXml += `      <${key}>${escapeXml(val)}</${key}>\n`
      }
    }
  }

  // Assemble Images (only valid non-empty URLs, up to 8 slots)
  const images = (input.sku.images || []).filter(Boolean).slice(0, 8)
  let imagesXml = "          <Images>\n"
  for (const imgUrl of images) {
    imagesXml += `            <Image>${escapeXml(imgUrl)}</Image>\n`
  }
  imagesXml += "          </Images>\n"

  // Assemble SKU
  const sku = input.sku
  let skuXml = "      <Sku>\n"
  skuXml += `        <SellerSku>${escapeXml(sku.sellerSku)}</SellerSku>\n`
  skuXml += `        <price>${sku.price.toFixed(2)}</price>\n`
  if (sku.specialPrice !== undefined && sku.specialPrice !== null) {
    skuXml += `        <special_price>${sku.specialPrice.toFixed(2)}</special_price>\n`
    const today = new Date().toISOString().slice(0, 10)
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    skuXml += `        <special_from_date>${today}</special_from_date>\n`
    skuXml += `        <special_to_date>${nextYear}</special_to_date>\n`
  }
  skuXml += `        <quantity>${sku.quantity ?? 1}</quantity>\n`
  if (sku.colorFamily) {
    skuXml += `        <color_family>${escapeXml(sku.colorFamily)}</color_family>\n`
  }
  skuXml += `        <package_weight>${sku.packageWeight}</package_weight>\n`
  if (sku.packageLength !== undefined) {
    skuXml += `        <package_length>${sku.packageLength}</package_length>\n`
  }
  if (sku.packageWidth !== undefined) {
    skuXml += `        <package_width>${sku.packageWidth}</package_width>\n`
  }
  if (sku.packageHeight !== undefined) {
    skuXml += `        <package_height>${sku.packageHeight}</package_height>\n`
  }
  if (sku.packageContent) {
    skuXml += `        <package_content>${escapeXml(sku.packageContent)}</package_content>\n`
  }

  if (sku.skuAttributes) {
    for (const [key, val] of Object.entries(sku.skuAttributes)) {
      if (val !== undefined && val !== null) {
        skuXml += `        <${key}>${escapeXml(val)}</${key}>\n`
      }
    }
  }

  skuXml += imagesXml
  skuXml += "      </Sku>\n"

  return `<?xml version="1.0" encoding="utf-8"?>
<Request>
  <Product>
    <PrimaryCategory>${input.primaryCategory}</PrimaryCategory>
    <Attributes>
${normalAttrsXml}    </Attributes>
    <Skus>
${skuXml}    </Skus>
  </Product>
</Request>`
}

/**
 * Validates product data against retrieved Daraz category attribute schema
 */
export function validateProductPayload(
  input: ProductListingInput,
  categoryAttributes: DarazAttributeItem[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!input.primaryCategory) {
    errors.push("Missing primaryCategory ID.")
  }
  if (!input.title || input.title.trim().length === 0) {
    errors.push("Product title (name) is required.")
  }
  if (!input.sku?.sellerSku || input.sku.sellerSku.trim().length === 0) {
    errors.push("SellerSku is required.")
  }
  if (!input.sku?.price || input.sku.price <= 0) {
    errors.push("Valid positive price is required.")
  }
  if (input.sku?.packageWeight === undefined || input.sku.packageWeight <= 0) {
    errors.push("Package weight is required and must be greater than 0.")
  }
  if (!input.sku?.images || input.sku.images.length === 0) {
    errors.push("At least 1 product image URL is required.")
  }

  // Validate category-specific mandatory attributes
  const providedKeys = new Set([
    "name",
    "short_description",
    "description",
    "brand",
    "SellerSku",
    "price",
    "special_price",
    "quantity",
    "color_family",
    "package_weight",
    "package_length",
    "package_width",
    "package_height",
    "package_content",
    "__images__",
    ...Object.keys(input.normalAttributes || {}),
    ...Object.keys(input.sku.skuAttributes || {}),
  ])

  for (const attr of categoryAttributes) {
    if (attr.is_mandatory === 1 || (attr as any).isMandatory === 1) {
      if (!providedKeys.has(attr.name)) {
        errors.push(`Missing mandatory category attribute: '${attr.label || attr.name}' (${attr.name}).`)
      }
    }

    // Validate singleSelect options with case-insensitive auto-matching
    if (attr.input_type === "singleSelect" && attr.options && attr.options.length > 0) {
      const val = input.normalAttributes?.[attr.name] || (input.sku.skuAttributes as any)?.[attr.name]
      if (val) {
        const allowed = attr.options.map((o) => o.name)
        const match = allowed.find((opt) => opt.toLowerCase() === String(val).toLowerCase())
        if (match) {
          // Normalize to exact official casing
          if (input.normalAttributes && input.normalAttributes[attr.name] !== undefined) {
            input.normalAttributes[attr.name] = match
          }
        } else {
          errors.push(
            `Invalid option '${val}' for '${attr.label || attr.name}'. Allowed values: ${allowed.slice(0, 5).join(", ")}${allowed.length > 5 ? "..." : ""}`
          )
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
