"use server"

import { SessionService } from "@/services/session.service"
import { DarazService } from "@/services/daraz.service"
import { DarazClient } from "@/lib/daraz/client"
import { cookies } from "next/headers"
import { db } from "@/db"
import { darazConnections, darazAuditLogs, darazCategoryTemplates } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
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
