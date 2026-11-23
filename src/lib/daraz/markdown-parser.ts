export interface ParsedListing {
  productId: string
  title: string
  categoryId: string | number
  brand: string
  sellerSku: string
  price: number
  specialPrice?: number
  stock: number
  color?: string
  size?: string
  size_chart?: string
  fabric?: string
  material?: string
  description: string
  highlights: string[]
  package: {
    weight: number // kg
    length?: number // cm
    width?: number // cm
    height?: number // cm
    content?: string
  }
  extraAttributes: Record<string, any>
  rawBody: string
}

/**
 * Parses listing.md frontmatter and content for XINVORA product folders
 */
export function parseListingMarkdown(markdownContent: string): ParsedListing {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/
  const match = markdownContent.match(frontmatterRegex)

  let rawFrontmatter = ""
  let bodyContent = ""

  if (match) {
    rawFrontmatter = match[1]
    bodyContent = match[2].trim()
  } else {
    rawFrontmatter = markdownContent
    bodyContent = ""
  }

  const lines = rawFrontmatter.split(/\r?\n/)
  const data: Record<string, any> = {}
  const highlights: string[] = []

  let inHighlights = false
  let inPackage = false
  const packageData: Record<string, any> = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#")) continue

    // Detect section transitions
    if (trimmed === "highlights:") {
      inHighlights = true
      inPackage = false
      continue
    }
    if (trimmed === "package:") {
      inPackage = true
      inHighlights = false
      continue
    }

    if (inHighlights) {
      if (trimmed.startsWith("- ")) {
        highlights.push(trimmed.slice(2).trim().replace(/^["']|["']$/g, ""))
        continue
      } else if (!line.startsWith(" ") && !line.startsWith("\t")) {
        inHighlights = false
      }
    }

    if (inPackage) {
      if (line.startsWith("  ") || line.startsWith("\t")) {
        const pkgMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/)
        if (pkgMatch) {
          const key = pkgMatch[1].toLowerCase()
          const val = pkgMatch[2].replace(/^["']|["']$/g, "").trim()
          packageData[key] = !isNaN(Number(val)) ? Number(val) : val
        }
        continue
      } else {
        inPackage = false
      }
    }

    // Normal key-value parsing
    const kvMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/)
    if (kvMatch) {
      const key = kvMatch[1].toLowerCase()
      let val: any = kvMatch[2].trim()

      // Handle multiline description pipe
      if (val === "|") {
        let multiline = ""
        while (i + 1 < lines.length && (lines[i + 1].startsWith("  ") || lines[i + 1].startsWith("\t") || !lines[i + 1].trim())) {
          i++
          multiline += lines[i].trim() + "\n"
        }
        val = multiline.trim()
      } else {
        val = val.replace(/^["']|["']$/g, "")
        if (val === "true") val = true
        else if (val === "false") val = false
        else if (!isNaN(Number(val)) && val !== "") val = Number(val)
      }

      data[key] = val
    }
  }

  const description = data.description || bodyContent || ""

  return {
    productId: data.product_id || data.id || "PRODUCT_001",
    title: data.title || data.name || "Untitled Product",
    categoryId: data.category_id || data.category || "1740",
    brand: data.brand || "XINVORA",
    sellerSku: data.seller_sku || data.sku || `XIN-${Date.now().toString().slice(-4)}`,
    price: Number(data.price) || 0,
    specialPrice: data.special_price !== undefined ? Number(data.special_price) : undefined,
    stock: Number(data.stock || data.quantity) || 1,
    color: data.color || data.color_family,
    size: data.size,
    size_chart: data.size_chart || data.sizechart || data.sizing_chart,
    fabric: data.fabric || data.fabric_type,
    material: data.material,
    description,
    highlights,
    package: {
      weight: Number(packageData.weight || data.package_weight) || 0.3,
      length: Number(packageData.length || data.package_length) || 25,
      width: Number(packageData.width || data.package_width) || 20,
      height: Number(packageData.height || data.package_height) || 5,
      content: packageData.content || data.package_content || data.whats_in_the_box || "1x Product",
    },
    extraAttributes: data,
    rawBody: bodyContent,
  }
}
