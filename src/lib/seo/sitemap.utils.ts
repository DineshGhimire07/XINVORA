import { NextRequest, NextResponse } from "next/server"
import { SEOService } from "@/domains/seo/services/seo.service"
import { getSiteUrl } from "@/lib/seo/url.utils"

/**
 * Handles incoming HTTP requests for sub-sitemaps (e.g. sitemap-products.xml)
 * and returns standard UTF-8 XML sitemap responses.
 */
export async function handleSubSitemapRequest(req: NextRequest, entityType: string) {
  try {
    const baseUrl = getSiteUrl(req)
    const xml = await SEOService.generateEntitySitemapXML({ baseUrl, entityType })

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    })
  } catch (error: unknown) {
    console.error(`[sitemap-${entityType}.xml] Failed to generate sub-sitemap:`, error)

    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    })
  }
}
