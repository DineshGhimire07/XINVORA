import { db } from "@/db"
import { darazConnections, darazCategoryTemplates, darazAuditLogs } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { DarazClient, type DarazTokenResponse } from "@/lib/daraz/client"
import { encryptDarazToken, decryptDarazToken } from "@/lib/daraz/crypto"

export interface DarazConnectionStatus {
  isConnected: boolean
  account?: string | null
  sellerId?: string | null
  country?: string | null
  expiresAt?: string | null
  isExpired?: boolean
  refreshExpiresAt?: string | null
  lastUpdated?: string | null
  hasAppCredentials: boolean
}

export class DarazService {
  private static client = new DarazClient()

  /**
   * Checks if required environment variables are set
   */
  public static hasCredentials(): boolean {
    return !!(process.env.DARAZ_APP_KEY && process.env.DARAZ_APP_SECRET)
  }

  /**
   * Gets clean connection status without leaking credentials
   */
  public static async getConnectionStatus(): Promise<DarazConnectionStatus> {
    const hasAppCredentials = this.hasCredentials()

    const [conn] = await db
      .select()
      .from(darazConnections)
      .where(eq(darazConnections.isActive, true))
      .orderBy(desc(darazConnections.updatedAt))
      .limit(1)

    if (!conn) {
      return {
        isConnected: false,
        hasAppCredentials,
      }
    }

    const now = new Date()
    const isExpired = conn.accessTokenExpiresAt < now

    return {
      isConnected: true,
      account: conn.account,
      sellerId: conn.sellerId,
      country: conn.country,
      expiresAt: conn.accessTokenExpiresAt.toISOString(),
      isExpired,
      refreshExpiresAt: conn.refreshTokenExpiresAt.toISOString(),
      lastUpdated: conn.updatedAt.toISOString(),
      hasAppCredentials,
    }
  }

  /**
   * Securely saves or updates OAuth tokens after authorization code exchange
   */
  public static async saveOAuthTokens(tokenData: DarazTokenResponse): Promise<void> {
    const now = Date.now()
    const accessExpiresAt = new Date(now + tokenData.expires_in * 1000)
    const refreshExpiresAt = new Date(now + tokenData.refresh_expires_in * 1000)

    const encryptedAccessToken = encryptDarazToken(tokenData.access_token)
    const encryptedRefreshToken = encryptDarazToken(tokenData.refresh_token)

    const sellerInfo = tokenData.country_user_info?.[0]
    const sellerId = sellerInfo ? String(sellerInfo.seller_id) : null
    const country = tokenData.country || sellerInfo?.country || "np"

    // Mark previous connections as inactive
    await db
      .update(darazConnections)
      .set({ isActive: false })
      .where(eq(darazConnections.isActive, true))

    // Insert new active connection
    await db.insert(darazConnections).values({
      sellerId,
      account: tokenData.account || null,
      name: tokenData.account || "XINVORA Daraz Store",
      country,
      encryptedAccessToken,
      encryptedRefreshToken,
      accessTokenExpiresAt: accessExpiresAt,
      refreshTokenExpiresAt: refreshExpiresAt,
      isActive: true,
    })

    // Log the successful OAuth exchange
    await db.insert(darazAuditLogs).values({
      action: "/auth/token/create",
      status: "SUCCESS",
      statusCode: 200,
      responseBody: {
        account: tokenData.account,
        country,
        sellerId,
        expires_in: tokenData.expires_in,
      },
    })
  }

  /**
   * Retrieves a valid Access Token, automatically refreshing if close to expiry
   */
  public static async getValidAccessToken(): Promise<string> {
    const [conn] = await db
      .select()
      .from(darazConnections)
      .where(eq(darazConnections.isActive, true))
      .orderBy(desc(darazConnections.updatedAt))
      .limit(1)

    if (!conn) {
      throw new Error("No active Daraz connection found. Please connect your Daraz store first.")
    }

    const now = new Date()
    // If token expires within 12 hours, refresh it automatically
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000)

    if (conn.accessTokenExpiresAt < twelveHoursFromNow) {
      // Check if refresh token is also expired
      if (conn.refreshTokenExpiresAt < now) {
        throw new Error("Daraz authorization has completely expired. Please re-authorize in Daraz Studio.")
      }

      // Perform refresh
      const rawRefreshToken = decryptDarazToken(conn.encryptedRefreshToken)
      const refreshed = await this.client.refreshToken(rawRefreshToken)
      await this.saveOAuthTokens(refreshed)
      return refreshed.access_token
    }

    return decryptDarazToken(conn.encryptedAccessToken)
  }

  /**
   * Fetches the category tree from Daraz
   */
  public static async getCategoryTree() {
    let accessToken: string | undefined
    try {
      accessToken = await this.getValidAccessToken()
    } catch {
      // Some endpoints might allow category tree without access_token, but let client try
    }
    const res = await this.client.getCategoryTree(accessToken)
    return res.data || []
  }

  /**
   * Fetches category attributes schema for a leaf category, caching in daraz_category_templates
   */
  public static async getCategoryAttributes(categoryId: string | number) {
    const catIdStr = String(categoryId)

    // Check cached template first
    const [cached] = await db
      .select()
      .from(darazCategoryTemplates)
      .where(eq(darazCategoryTemplates.darazCategoryId, catIdStr))
      .limit(1)

    if (cached) {
      return {
        categoryId: catIdStr,
        categoryName: cached.categoryName,
        attributes: cached.attributesSchema,
        cached: true,
      }
    }

    let accessToken: string | undefined
    try {
      accessToken = await this.getValidAccessToken()
    } catch {
      // Continue if public
    }

    const res = await this.client.getCategoryAttributes(catIdStr, accessToken)
    const rawAttrs = res.data || []

    // Cache the template for fast local re-use
    await db
      .insert(darazCategoryTemplates)
      .values({
        darazCategoryId: catIdStr,
        categoryName: `Category ${catIdStr}`,
        attributesSchema: rawAttrs as any,
        isLeaf: true,
      })
      .onConflictDoUpdate({
        target: darazCategoryTemplates.darazCategoryId,
        set: {
          attributesSchema: rawAttrs as any,
          updatedAt: new Date(),
        },
      })

    return {
      categoryId: catIdStr,
      categoryName: `Category ${catIdStr}`,
      attributes: rawAttrs,
      cached: false,
    }
  }
}
