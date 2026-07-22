import { NextRequest, NextResponse } from "next/server"
import { SEOService } from "@/domains/seo/services/seo.service"
import { getSiteUrl } from "@/lib/seo/url.utils"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export type SitemapEntityType = "products" | "collections" | "journal" | "lookbooks" | "cms" | "images"

const VALID_SITEMAP_TYPES = new Set<string>([
  "products",
  "collections",
  "journal",
  "lookbooks",
  "cms",
  "images",
])

export async function GET(req: NextRequest, props: { params: Promise<{ type?: string }> }) {
  try {
    const params = await props.params
    const rawType = params?.type || ""
    const entityType = rawType.replace(/\.xml$/, "").toLowerCase()

    if (!VALID_SITEMAP_TYPES.has(entityType)) {
      return new NextResponse("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store, max-age=0",
        },
      })
    }

    const baseUrl = getSiteUrl(req)
    const xml = await SEOService.generateEntitySitemapXML({ baseUrl, entityType })

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    })
  } catch (error: unknown) {
    console.error("[sitemap-[type].xml] Failed to generate sub-sitemap:", error)

    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    })
  }
}
