"use server"

import { SessionService } from "@/services/session.service"
import { DarazService } from "@/services/daraz.service"
import { DarazClient } from "@/lib/daraz/client"
import { cookies } from "next/headers"
import { db } from "@/db"
import { darazConnections, darazAuditLogs, darazCategoryTemplates } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { parseListingMarkdown } from "@/lib/daraz/markdown-parser"
import { buildDarazProductXml, validateProductPayload, type ProductListingInput } from "@/lib/daraz/payload-builder"
import crypto from "crypto"

/**
 * Retrieves store connection status for the admin dashboard
 */
export async function getDarazConnectionStatusAction() {
  await SessionService.requireAdmin()
  const status = await DarazService.getConnectionStatus()
  return { success: true, data: status }
}

/**
 * Initiates OAuth flow: generates state nonce, stores in cookie, returns authorization URL
 */
export async function startDarazAuthAction() {
  await SessionService.requireAdmin()

  if (!DarazService.hasCredentials()) {
    return {
      success: false,
      error: "DARAZ_APP_KEY and DARAZ_APP_SECRET must be configured in environment variables.",
    }
  }

  const state = crypto.randomBytes(24).toString("hex")
  const cookieStore = await cookies()

  // Store state in a secure HTTP-only cookie with 15 min expiry
  cookieStore.set("daraz_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 900,
  })

  const client = new DarazClient()
  try {
    const url = client.getAuthorizationUrl(state)
    return { success: true, url }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to generate Daraz authorization URL." }
  }
}

/**
 * Disconnects active Daraz store
 */
export async function disconnectDarazAction() {
  await SessionService.requireAdmin()

  await db
    .update(darazConnections)
    .set({ isActive: false })
    .where(eq(darazConnections.isActive, true))

  revalidatePath("/admin/daraz")
  return { success: true }
}

/**
 * Read-only category tree test action
 */
export async function fetchCategoryTreeAction() {
  await SessionService.requireAdmin()

  try {
    const categories = await DarazService.getCategoryTree()
    return { success: true, data: categories }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to retrieve category tree from Daraz." }
  }
}

/**
 * Read-only category attributes test action
 */
export async function fetchCategoryAttributesAction(categoryId: string | number) {
  await SessionService.requireAdmin()

  if (!categoryId) {
    return { success: false, error: "Category ID is required." }
  }

  try {
    const result = await DarazService.getCategoryAttributes(categoryId)
    return { success: true, data: result }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to retrieve category attributes from Daraz." }
  }
}

/**
 * Retrieves recent Daraz API audit logs
 */
export async function getDarazAuditLogsAction() {
  await SessionService.requireAdmin()

  try {
    const logs = await db
      .select()
      .from(darazAuditLogs)
      .orderBy(desc(darazAuditLogs.createdAt))
      .limit(50)
    return { success: true, data: logs }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to retrieve audit logs." }
  }
}

/**
 * Retrieves cached category templates
 */
export async function getDarazCategoryTemplatesAction() {
  await SessionService.requireAdmin()

  try {
    const templates = await db
      .select()
      .from(darazCategoryTemplates)
      .orderBy(desc(darazCategoryTemplates.updatedAt))
      .limit(100)
    return { success: true, data: templates }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to retrieve category templates." }
  }
}

/**
 * Exchanges an authorization code or redirect URL for Access & Refresh tokens.
 * Supports direct manual completion during local development when Daraz redirects to production.
 */
export async function exchangeDarazCodeAction(codeOrUrl: string) {
  await SessionService.requireAdmin()

  if (!codeOrUrl || !codeOrUrl.trim()) {
    return { success: false, error: "Please provide the authorization code or full callback URL." }
  }

  let code = codeOrUrl.trim()
  if (code.includes("code=")) {
    try {
      const parsedUrl = new URL(code.startsWith("http") ? code : `https://xinvora.com.np/${code.replace(/^\/?/, "")}`)
      const extractedCode = parsedUrl.searchParams.get("code")
      if (extractedCode) {
        code = extractedCode
      }
    } catch {
      const match = code.match(/code=([^&]+)/)
      if (match && match[1]) {
        code = decodeURIComponent(match[1])
      }
    }
  }

  try {
    const client = new DarazClient()
    const tokenResponse = await client.createToken(code)

    if (!tokenResponse.access_token) {
      return {
        success: false,
        error: tokenResponse.message || "Failed to acquire access token. The authorization code may have expired or already been used.",
      }
    }

    await DarazService.saveOAuthTokens(tokenResponse)
    revalidatePath("/admin/daraz")

    return {
      success: true,
      data: {
        account: tokenResponse.account,
        expiresIn: tokenResponse.expires_in,
      },
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to exchange authorization code with Daraz API.",
    }
  }
}

/**
 * Live Simulation: Parses a sample listing.md, fetches live Daraz category attributes,
 * runs pre-flight validation, and compiles the exact official XML payload.
 */
export async function simulateListingSubmissionAction(data: {
  categoryId: string | number
  markdown: string
  mockImages?: string[]
}) {
  await SessionService.requireAdmin()

  try {
    const parsed = parseListingMarkdown(data.markdown)
    const targetCatId = data.categoryId || parsed.categoryId

    // Fetch live attributes for this category
    const attrResult = await DarazService.getCategoryAttributes(targetCatId)
    const rawAttrs: any[] = (attrResult.attributes as any[]) || []

    const images =
      data.mockImages && data.mockImages.length > 0
        ? data.mockImages
        : [
            "https://sg-live.slatic.net/original/b731a8098df7d606ab2e56efc650afcb.jpg",
            "https://sg-live.slatic.net/original/c832b9098df7d606ab2e56efc650afcc.jpg",
          ]

    // Filter out internal metadata and SKU-level fields from normalAttributes
    const excludedFromNormal = new Set([
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
    ])

    const cleanExtra: Record<string, any> = {}
    for (const [k, v] of Object.entries(parsed.extraAttributes)) {
      if (!excludedFromNormal.has(k.toLowerCase())) {
        cleanExtra[k] = v
      }
    }

    const listingInput: ProductListingInput = {
      primaryCategory: String(targetCatId),
      title: parsed.title,
      highlights: parsed.highlights,
      description: parsed.description,
      brand: parsed.brand || "XINVORA",
      normalAttributes: {
        Fabric_Type: parsed.fabric || "Linen",
        material: parsed.material || "Linen",
        size: parsed.size || "Free Size",
        ...cleanExtra,
      },
      sku: {
        sellerSku: parsed.sellerSku,
        price: parsed.price,
        specialPrice: parsed.specialPrice,
        quantity: parsed.stock,
        colorFamily: parsed.color || "Ivory",
        packageWeight: parsed.package.weight,
        packageLength: parsed.package.length,
        packageWidth: parsed.package.width,
        packageHeight: parsed.package.height,
        packageContent: parsed.package.content,
        images,
      },
    }

    const validation = validateProductPayload(listingInput, rawAttrs)
    const generatedXml = buildDarazProductXml(listingInput)

    return {
      success: true,
      data: {
        categoryId: targetCatId,
        categoryName: attrResult.categoryName,
        totalAttributes: rawAttrs.length,
        parsed,
        validation,
        xml: generatedXml,
      },
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to simulate listing submission.",
    }
  }
}
