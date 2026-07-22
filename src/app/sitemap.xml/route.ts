import { NextRequest, NextResponse } from "next/server"
import { SEOService } from "@/domains/seo/services/seo.service"
import { getSiteUrl } from "@/lib/seo/url.utils"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const baseUrl = getSiteUrl(req)

    const xml = await SEOService.generateSitemapIndexXML(baseUrl)

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    })
  } catch (error: unknown) {
    console.error("[sitemap.xml] Failed to generate sitemap index:", error)

    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    })
  }
}
