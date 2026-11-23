import { db } from "@/db"
import {
  darazConnections,
  darazCategoryTemplates,
  darazAuditLogs,
  darazImageCache,
  darazProductSubmissions,
} from "@/db/schema"
import { eq, desc, inArray } from "drizzle-orm"
import { DarazClient, type DarazTokenResponse } from "@/lib/daraz/client"
import { encryptDarazToken, decryptDarazToken } from "@/lib/daraz/crypto"
import { buildDarazProductXml, validateProductPayload, type ProductListingInput } from "@/lib/daraz/payload-builder"
import crypto from "crypto"

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

  /**
   * Uploads an image to Daraz CDN with SHA-256 deduplication and sharp optimization
   */
  public static async uploadAndCacheImage(
    fileBuffer: Buffer,
    filename: string
  ): Promise<{ url: string; cached: boolean }> {
    const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex")

    // 1. Check local DB cache
    const [cached] = await db
      .select()
      .from(darazImageCache)
      .where(eq(darazImageCache.fileHash, fileHash))
      .limit(1)

    if (cached) {
      return { url: cached.darazUrl, cached: true }
    }

    // 2. Normalize and ensure image meets Daraz requirements (min 330x330, max 3MB, JPEG)
    // Use dynamic import so the native sharp binary is loaded on-demand and
    // doesn't crash the module on Vercel serverless if the .so is unavailable.
    let readyBuffer = fileBuffer
    try {
      const sharpMod = await import("sharp").catch(() => null)
      if (sharpMod) {
        const sharp = sharpMod.default || sharpMod
        const metadata = await sharp(fileBuffer).metadata()
        if (!metadata.width || !metadata.height || metadata.width < 330 || metadata.height < 330) {
          readyBuffer = await sharp(fileBuffer)
            .resize(1000, 1000, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
            .jpeg({ quality: 90 })
            .toBuffer()
        } else if (fileBuffer.length > 3 * 1024 * 1024) {
          readyBuffer = await sharp(fileBuffer).jpeg({ quality: 85 }).toBuffer()
        }
      }
    } catch (sharpErr: unknown) {
      console.warn("[DarazService] sharp unavailable, using original buffer:", (sharpErr as Error).message)
    }

    // 3. Acquire valid token and upload to Daraz
    const accessToken = await this.getValidAccessToken()
    const uploadRes = await this.client.uploadImage(readyBuffer, filename, accessToken)

    if (!uploadRes.url) {
      throw new Error(`Daraz /image/upload failed to return an image URL for ${filename}.`)
    }

    // 4. Save into database cache
    await db.insert(darazImageCache).values({
      fileHash,
      originalFilename: filename,
      darazUrl: uploadRes.url,
      fileSize: readyBuffer.length,
    })

    // 5. Audit log
    await db.insert(darazAuditLogs).values({
      action: "/image/upload",
      status: "SUCCESS",
      statusCode: 200,
      requestParams: { filename, fileHash },
      responseBody: { url: uploadRes.url, hash_code: uploadRes.hash_code },
    })

    return { url: uploadRes.url, cached: false }
  }

  /**
   * Submits a new product to Daraz Open Platform with pre-flight schema validation and duplicate SKU guard
   */
  public static async submitProduct(
    input: ProductListingInput,
    localProductId?: string
  ): Promise<{ itemId: string | number; sellerSku: string }> {
    const sku = input.sku.sellerSku.trim()

    // 1. Guard against duplicate submission
    const [existing] = await db
      .select()
      .from(darazProductSubmissions)
      .where(eq(darazProductSubmissions.sellerSku, sku))
      .limit(1)

    if (existing && ["SUBMITTED", "PENDING_QC", "QC_APPROVED"].includes(existing.status)) {
      throw new Error(
        `Duplicate submission blocked: SKU '${sku}' is already listed on Daraz (Item ID: ${existing.darazItemId}, Status: ${existing.status}).`
      )
    }

    // 2. Retrieve category attributes for validation
    const attrResult = await this.getCategoryAttributes(input.primaryCategory)
    const rawAttrs: any[] = (attrResult.attributes as any[]) || []

    const validation = validateProductPayload(input, rawAttrs)
    if (!validation.valid) {
      throw new Error(`Daraz schema validation failed: ${validation.errors.join("; ")}`)
    }

    // 3. Compile official XML payload
    const xmlPayload = buildDarazProductXml(input)

    // 4. Execute /product/create
    const accessToken = await this.getValidAccessToken()
    let createRes: any
    try {
      createRes = await this.client.createProduct(xmlPayload, accessToken)
    } catch (err: any) {
      // Record failure audit log
      await db.insert(darazAuditLogs).values({
        action: "/product/create",
        status: "ERROR",
        statusCode: 400,
        requestParams: { sellerSku: sku, categoryId: input.primaryCategory },
        errorMessage: err.message,
      })

      // Update or insert failed submission record
      if (existing) {
        await db
          .update(darazProductSubmissions)
          .set({
            status: "FAILED",
            errorLog: err.message,
            retryCount: existing.retryCount + 1,
            updatedAt: new Date(),
          })
          .where(eq(darazProductSubmissions.id, existing.id))
      } else {
        await db.insert(darazProductSubmissions).values({
          localProductId: localProductId || sku,
          sellerSku: sku,
          title: input.title,
          darazCategoryId: String(input.primaryCategory),
          status: "FAILED",
          errorLog: err.message,
          submittedPayload: xmlPayload,
        })
      }

      throw err
    }

    const itemId = createRes?.item_id || createRes?.itemId || "SUCCESS"

    // 5. Save successful submission
    if (existing) {
      await db
        .update(darazProductSubmissions)
        .set({
          darazItemId: String(itemId),
          status: "SUBMITTED",
          qcStatus: "pending",
          errorLog: null,
          darazResponse: createRes,
          submittedPayload: xmlPayload,
          updatedAt: new Date(),
        })
        .where(eq(darazProductSubmissions.id, existing.id))
    } else {
      await db.insert(darazProductSubmissions).values({
        localProductId: localProductId || sku,
        sellerSku: sku,
        darazItemId: String(itemId),
        title: input.title,
        darazCategoryId: String(input.primaryCategory),
        status: "SUBMITTED",
        qcStatus: "pending",
        darazResponse: createRes,
        submittedPayload: xmlPayload,
      })
    }

    // 6. Record success audit log
    await db.insert(darazAuditLogs).values({
      action: "/product/create",
      status: "SUCCESS",
      statusCode: 200,
      requestParams: { sellerSku: sku, categoryId: input.primaryCategory },
      responseBody: createRes,
    })

    return { itemId, sellerSku: sku }
  }

  /**
   * Refreshes QC review status for submitted products
   */
  public static async refreshQcStatuses(sellerSkus: string[]): Promise<any[]> {
    if (sellerSkus.length === 0) return []
    const accessToken = await this.getValidAccessToken()
    const res = await this.client.getQcStatus(sellerSkus, accessToken)
    const qcList = res.data || []

    for (const item of qcList) {
      const sku = item.seller_sku
      const qcStatus = item.status?.toLowerCase() || "pending"
      const qcReason = item.reason || null

      let listingStatus: any = "PENDING_QC"
      if (qcStatus === "approved") listingStatus = "QC_APPROVED"
      else if (qcStatus === "rejected") listingStatus = "QC_REJECTED"

      await db
        .update(darazProductSubmissions)
        .set({
          status: listingStatus,
          qcStatus,
          qcReason,
          updatedAt: new Date(),
        })
        .where(eq(darazProductSubmissions.sellerSku, sku))
    }

    return qcList
  }

  /**
   * Gets recent product submissions for dashboard
   */
  public static async getRecentSubmissions(limitCount = 50) {
    return db
      .select()
      .from(darazProductSubmissions)
      .orderBy(desc(darazProductSubmissions.updatedAt))
      .limit(limitCount)
  }
}
