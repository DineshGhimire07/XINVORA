import type { NormalizedSEOEntity } from "../contracts/entity.contract"

export class SEOSitemapEngine {
  public static generateSitemapIndexXML(baseUrl: string): string {
    const today = new Date().toISOString().split("T")[0]

    const subSitemaps = [
      "sitemap-products.xml",
      "sitemap-collections.xml",
      "sitemap-journal.xml",
      "sitemap-lookbooks.xml",
      "sitemap-cms.xml",
      "sitemap-images.xml",
    ]

    const xmlItems = subSitemaps
      .map(
        (name) => `  <sitemap>
    <loc>${baseUrl}/${name}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
      )
      .join("\n")

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</sitemapindex>`
  }

  public static generateEntitySitemapXML(baseUrl: string, entities: NormalizedSEOEntity[]): string {
    const urlElements = entities
      .map((entity) => {
        const fullUrl = `${baseUrl}${entity.canonicalUrl || entity.path}`
        const lastMod = entity.updatedAt ? new Date(entity.updatedAt).toISOString() : new Date().toISOString()
        const priority = entity.entityType === "PRODUCT" ? "0.9" : entity.entityType === "COLLECTION" ? "0.8" : "0.7"

        let imageTags = ""
        if (entity.images && entity.images.length > 0) {
          imageTags = entity.images
            .slice(0, 5)
            .map(
              (img) => `
    <image:image>
      <image:loc>${img.url}</image:loc>
      ${img.alt ? `<image:title>${this.escapeXml(img.alt)}</image:title>` : ""}
    </image:image>`
            )
            .join("")
        }

        return `  <url>
    <loc>${this.escapeXml(fullUrl)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>${imageTags}
  </url>`
      })
      .join("\n")

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlElements}
</urlset>`
  }

  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
  }
}
