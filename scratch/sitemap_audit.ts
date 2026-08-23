import { SEOService } from "@/domains/seo/services/seo.service"
import { getSiteUrl } from "@/lib/seo/url.utils"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

async function runSitemapAudit() {
  console.log("=== Running XINVORA Sitemap & URL Audit ===")

  try {
    const baseUrl = getSiteUrl()
    const sitemapXml = await SEOService.generateEntitySitemapXML({
      baseUrl,
      entityType: "products",
    })
    console.log("Products Sitemap Sample Length:", sitemapXml.length)

    const matches = sitemapXml.match(/<loc>(.*?)<\/loc>/g) || []
    const urls = matches.map((m: string) => m.replace(/<\/?loc>/g, ""))
    console.log(`Discovered ${urls.length} product URLs in sitemap`)
    urls.slice(0, 5).forEach((url: string, idx: number) => {
      console.log(` [${idx + 1}] ${url}`)
    })
  } catch (err: any) {
    console.error("Sitemap audit failed:", err.message)
  }
}

runSitemapAudit()
