import { v2 as cloudinary, type UploadApiResponse } from "cloudinary"
import crypto from "crypto"
import { db } from "../db/client"
import { darazSyncedProducts, darazSyncLogs, darazImageCache } from "../db/schema"
import { eq } from "drizzle-orm"

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export interface CloudinaryAssetRecord {
  position: number
  role: "main" | "gallery" | "variant"
  skuId?: string
  originalDarazUrl: string
  sha256: string
  cloudinaryPublicId: string
  cloudinaryAssetId?: string
  secureUrl: string
  width?: number
  height?: number
  format?: string
  bytes?: number
  uploadedAt: string
}

export interface IngestItemMediaInput {
  darazItemId: string | number
  productTitle: string
  sellerSku?: string
  skuId?: string
  images: string[] // Array of Daraz CDN URLs in order
  variantImages?: Array<{ skuId: string; url: string }>
}

export interface IngestItemMediaResult {
  darazItemId: string
  totalImages: number
  uploadedCount: number
  skippedDuplicateCount: number
  failedCount: number
  status: "COMPLETED" | "PARTIAL" | "FAILED"
  assets: CloudinaryAssetRecord[]
  errors: Array<{ url: string; error: string }>
}

/**
 * Validates URLs against an allowed list of Daraz / Alibaba CDN hostnames
 * and prevents SSRF attacks targeting local / private networks.
 */
function validateSafeSourceUrl(rawUrl: string): URL {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error(`Invalid URL structure: ${rawUrl}`)
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`Forbidden protocol: ${parsed.protocol}`)
  }

  const hostname = parsed.hostname.toLowerCase()

  // Prohibit private IP ranges and localhost (SSRF protection)
  const isPrivateOrLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("169.254.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)

  if (isPrivateOrLocal) {
    throw new Error(`Forbidden private or local network destination: ${hostname}`)
  }

  // Validate allowed Daraz / Alibaba CDN domains
  const allowedHostSuffixes = [
    ".daraz.com.np",
    ".slatic.net",
    ".alicdn.com",
    ".daraz.com",
    ".alipayobjects.com",
    ".tbcdn.cn",
  ]

  const isAllowedHost = allowedHostSuffixes.some(
    (suffix) => hostname.endsWith(suffix) || hostname === suffix.slice(1)
  )

  if (!isAllowedHost) {
    throw new Error(`Untrusted source hostname for image download: ${hostname}`)
  }

  return parsed
}

export class CloudinaryMediaSyncService {
  /**
   * Downloads an image from Daraz CDN with SSRF checks, timeout, and size validation
   */
  public static async downloadImage(
    url: string,
    timeoutMs = 12000
  ): Promise<{ buffer: Buffer; contentType: string; sha256: string }> {
    validateSafeSourceUrl(url)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "XINVORA-Media-Worker/1.0",
          Accept: "image/webp,image/png,image/jpeg,image/*",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP download failed (${response.status} ${response.statusText})`)
      }

      const contentType = response.headers.get("content-type") || "image/jpeg"
      const contentLength = response.headers.get("content-length")
      if (contentLength && parseInt(contentLength, 10) > 15 * 1024 * 1024) {
        throw new Error(`Image size exceeds maximum limit of 15MB: ${contentLength} bytes`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      if (buffer.length < 100) {
        throw new Error(`Downloaded image file is too small or corrupt: ${buffer.length} bytes`)
      }

      const sha256 = crypto.createHash("sha256").update(buffer).digest("hex")

      return { buffer, contentType, sha256 }
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Uploads a validated buffer directly to Cloudinary using upload_stream
   */
  public static async uploadToCloudinary(
    buffer: Buffer,
    options: {
      folder: string
      publicId: string
      tags: string[]
      context: Record<string, string>
    }
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          public_id: options.publicId,
          tags: options.tags,
          context: options.context,
          overwrite: true,
          resource_type: "image",
          format: "webp", // Normalize images to high-efficiency WebP format
          quality: "auto:good",
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload returned empty response"))
          }
          resolve(result)
        }
      )

      stream.end(buffer)
    })
  }

  /**
   * Processes all images for a Daraz product item (Hero, Gallery, Variations)
   * with duplicate avoidance, controlled concurrency, and persistent logging.
   */
  public static async ingestProductMedia(
    input: IngestItemMediaInput,
    options: { maxRetries?: number } = {}
  ): Promise<IngestItemMediaResult> {
    const darazItemId = String(input.darazItemId)
    const maxRetries = options.maxRetries ?? 2
    const folder = `xinvora/products/${darazItemId}`

    const results: CloudinaryAssetRecord[] = []
    const errors: Array<{ url: string; error: string }> = []
    let uploadedCount = 0
    let skippedDuplicateCount = 0

    // Deduplicate and filter input URLs
    const rawUrls = Array.from(new Set(input.images.filter(Boolean)))
    const variantItems = input.variantImages || []

    const totalToProcess = rawUrls.length + variantItems.length

    // 0. Fetch existing product sync record to check for previously uploaded Cloudinary assets
    const [existingProduct] = await db
      .select({ cloudinaryImages: darazSyncedProducts.cloudinaryImages })
      .from(darazSyncedProducts)
      .where(eq(darazSyncedProducts.darazItemId, darazItemId))
      .limit(1)

    const existingAssets: CloudinaryAssetRecord[] =
      (existingProduct?.cloudinaryImages as CloudinaryAssetRecord[]) || []

    // 1. Process Product Gallery Images
    for (let i = 0; i < rawUrls.length; i++) {
      const url = rawUrls[i]
      const position = i + 1
      const role: "main" | "gallery" = i === 0 ? "main" : "gallery"
      const publicId =
        i === 0
          ? `XINVORA-${darazItemId}-MAIN-01`
          : `XINVORA-${darazItemId}-GALLERY-${String(position).padStart(2, "0")}`

      // Check if already synced by original URL first (fast path avoiding re-download)
      const existingByUrl = existingAssets.find(
        (a) => a.originalDarazUrl === url && a.role === role && a.position === position && a.secureUrl?.includes("res.cloudinary.com")
      )

      if (existingByUrl) {
        results.push(existingByUrl)
        skippedDuplicateCount++
        continue
      }

      let success = false
      let lastError = ""

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // A. Download & hash
          const { buffer, sha256 } = await this.downloadImage(url)

          // B. Duplicate Detection: Check if existing asset matches content SHA-256
          const existingByHash = existingAssets.find(
            (a) => a.sha256 === sha256 && a.secureUrl?.includes("res.cloudinary.com")
          )

          if (existingByHash) {
            results.push({
              ...existingByHash,
              position,
              role,
              originalDarazUrl: url,
            })
            skippedDuplicateCount++
            success = true
            break
          }

          // C. Upload to Cloudinary
          const uploadRes = await this.uploadToCloudinary(buffer, {
            folder,
            publicId,
            tags: [
              "brand:xinvora",
              "source:daraz",
              `item:${darazItemId}`,
              ...(input.sellerSku ? [`sku:${input.sellerSku}`] : []),
            ],
            context: {
              alt: `${input.productTitle} - XINVORA Official Collection`,
              daraz_item_id: darazItemId,
              seller_sku: input.sellerSku || "",
              image_position: String(position),
              image_role: role,
              sha256,
              source_url: url,
            },
          })

          const record: CloudinaryAssetRecord = {
            position,
            role,
            skuId: input.skuId,
            originalDarazUrl: url,
            sha256,
            cloudinaryPublicId: uploadRes.public_id,
            cloudinaryAssetId: uploadRes.asset_id,
            secureUrl: uploadRes.secure_url,
            width: uploadRes.width,
            height: uploadRes.height,
            format: uploadRes.format,
            bytes: uploadRes.bytes,
            uploadedAt: new Date().toISOString(),
          }

          results.push(record)
          uploadedCount++

          // Save hash in cache table for instant future duplicate detection
          await db
            .insert(darazImageCache)
            .values({
              fileHash: sha256,
              originalFilename: `${publicId}.webp`,
              darazUrl: uploadRes.secure_url,
              fileSize: uploadRes.bytes,
            })
            .onConflictDoNothing()

          success = true
          break
        } catch (err: any) {
          lastError = err.message || "Unknown download/upload error"
          if (attempt < maxRetries) {
            await new Promise((res) => setTimeout(res, 500 * attempt))
          }
        }
      }

      if (!success) {
        errors.push({ url, error: lastError })
      }
    }

    // 2. Process Variant-Specific Images (if any)
    for (let v = 0; v < variantItems.length; v++) {
      const vItem = variantItems[v]
      const position = rawUrls.length + v + 1
      const publicId = `XINVORA-${darazItemId}-${vItem.skuId}-VARIANT-${String(v + 1).padStart(2, "0")}`

      // Check if already synced
      const existingVariant = existingAssets.find(
        (a) => a.originalDarazUrl === vItem.url && a.skuId === vItem.skuId && a.secureUrl?.includes("res.cloudinary.com")
      )

      if (existingVariant) {
        results.push(existingVariant)
        skippedDuplicateCount++
        continue
      }

      try {
        const { buffer, sha256 } = await this.downloadImage(vItem.url)

        const uploadRes = await this.uploadToCloudinary(buffer, {
          folder,
          publicId,
          tags: ["brand:xinvora", "source:daraz", `item:${darazItemId}`, `sku:${vItem.skuId}`],
          context: {
            alt: `${input.productTitle} Variant - XINVORA`,
            daraz_item_id: darazItemId,
            sku_id: vItem.skuId,
            image_position: String(position),
            image_role: "variant",
            sha256,
            source_url: vItem.url,
          },
        })

        results.push({
          position,
          role: "variant",
          skuId: vItem.skuId,
          originalDarazUrl: vItem.url,
          sha256,
          cloudinaryPublicId: uploadRes.public_id,
          cloudinaryAssetId: uploadRes.asset_id,
          secureUrl: uploadRes.secure_url,
          width: uploadRes.width,
          height: uploadRes.height,
          format: uploadRes.format,
          bytes: uploadRes.bytes,
          uploadedAt: new Date().toISOString(),
        })
        uploadedCount++
      } catch (err: any) {
        errors.push({ url: vItem.url, error: err.message })
      }
    }

    // Determine overall media status
    let status: "COMPLETED" | "PARTIAL" | "FAILED" = "COMPLETED"
    if (errors.length > 0) {
      status = results.length > 0 ? "PARTIAL" : "FAILED"
    }

    // Update daraz_synced_products if record exists
    await db
      .update(darazSyncedProducts)
      .set({
        mediaSyncStatus: status,
        cloudinaryImages: results,
        syncError: errors.length > 0 ? JSON.stringify(errors) : null,
        updatedAt: new Date(),
      })
      .where(eq(darazSyncedProducts.darazItemId, darazItemId))

    return {
      darazItemId,
      totalImages: totalToProcess,
      uploadedCount,
      skippedDuplicateCount,
      failedCount: errors.length,
      status,
      assets: results,
      errors,
    }
  }
}
