import { NextRequest } from "next/server"
import { handleSubSitemapRequest } from "@/lib/seo/sitemap.utils"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  return handleSubSitemapRequest(req, "images")
}
