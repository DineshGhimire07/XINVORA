"use server"

import { revalidatePath } from "next/cache"
import { MediaService } from "@/services/media.service"
import { SessionService } from "@/services/session.service"
import { StorageService } from "@/services/storage/client"
import { db } from "@/db/client"
import { mediaLibrary } from "@/db/schema/media"
import { inArray } from "drizzle-orm"
import fs from "fs"
import path from "path"

import { processProductImage } from "@/lib/image-processor"
import { v2 as cloudinary } from "cloudinary"

export async function generateUploadSignatureAction(folder: string = "xinvora_media") {
  try {
    const session = await SessionService.optionalAuth()
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Admin session required. Please refresh the page or log in again." }
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      })

      const timestamp = Math.round(new Date().getTime() / 1000)
      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        apiSecret
      )

      return {
        success: true,
        data: {
          useLocalFallback: false,
          signature,
          timestamp,
          cloudName,
          apiKey,
          folder,
        },
      }
    }

    return { success: true, data: { useLocalFallback: true } }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to generate upload signature" }
  }
}

export async function uploadLocalFileAction(formData: FormData) {
  try {
    const session = await SessionService.optionalAuth()
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Admin session required. Please refresh the page." }
    }
    const file = formData.get("file") as File
    if (!file) throw new Error("No file uploaded")

    // Read the file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const isProductCatalog = formData.get("purpose") === "product" || formData.get("autoPad") === "true"
    const skipPadding = formData.get("skipPadding") === "true" || !isProductCatalog

    // Only run the 3:4 product garment padding pipeline for product catalog uploads
    const processedBuffer = skipPadding ? buffer : await processProductImage(buffer)

    // Safely resolve width and height metadata
    let width: number | undefined = undefined
    let height: number | undefined = undefined
    try {
      const sharpModule = await import("sharp").catch(() => null)
      if (sharpModule) {
        const sharp = sharpModule.default || sharpModule
        const processedMetadata = await sharp(processedBuffer).metadata()
        width = processedMetadata.width || undefined
        height = processedMetadata.height || undefined
      }
    } catch {}

    // Check if Cloudinary is configured
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret)

    let uploadSuccess = false
    let mediaUrl = ""

    if (isCloudinaryConfigured) {
      try {
        // Configure Cloudinary
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true,
        })

        // Upload processed buffer to Cloudinary with WebP conversion & auto quality compression
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { 
              folder: "xinvora_media",
              format: "webp",
              quality: "auto:good",
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
          stream.end(processedBuffer)
        })

        const webpFilename = file.name.replace(/\.[^/.]+$/, "") + ".webp"
        const media = await MediaService.createMedia({
          url: uploadResult.secure_url,
          title: webpFilename,
          mimeType: "image/webp",
          sizeBytes: uploadResult.bytes,
          width: uploadResult.width,
          height: uploadResult.height,
          provider: 'cloudinary',
          providerId: uploadResult.public_id,
        }, session.id)

        revalidatePath("/admin/cms/media")
        revalidatePath("/admin/media")
        uploadSuccess = true
        mediaUrl = media.url
      } catch (cloudinaryError: any) {
        console.warn("[uploadLocalFileAction] Cloudinary upload failed. Falling back to local storage:", cloudinaryError.message)
      }
    }

    if (!uploadSuccess) {
      // Local fallback path
      let fileUrl = ""
      let providerId = ""

      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads")
        if (!fs.existsSync(uploadsDir)) {
          await fs.promises.mkdir(uploadsDir, { recursive: true })
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
        const uniqueName = `${Date.now()}_${safeName}`
        const filePath = path.join(uploadsDir, uniqueName)

        await fs.promises.writeFile(filePath, processedBuffer)
        fileUrl = `/uploads/${uniqueName}`
        providerId = uniqueName
      } catch (fsError: any) {
        console.warn("[uploadLocalFileAction] Read-only filesystem. Falling back to Data URL:", fsError.message)
        const mimeType = file.type || "image/png"
        fileUrl = `data:${mimeType};base64,${processedBuffer.toString("base64")}`
        providerId = `data_url_${Date.now()}`
      }

      const media = await MediaService.createMedia({
        url: fileUrl,
        title: file.name,
        mimeType: file.type,
        sizeBytes: processedBuffer.length,
        width,
        height,
        provider: 'local',
        providerId,
      }, session.id)

      revalidatePath("/admin/cms/media")
      revalidatePath("/admin/media")
      mediaUrl = media.url
    }

    return { success: true, url: mediaUrl }
  } catch (error: any) {
    console.error("[uploadLocalFileAction] Error:", error)
    return { success: false, error: error.message || "Failed to upload file" }
  }
}

export async function saveMediaMetadataAction(data: {
  url: string
  title: string
  mimeType: string
  sizeBytes: number
  width?: number
  height?: number
  providerId: string
}) {
  try {
    const session = await SessionService.optionalAuth()
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Admin session required." }
    }
    
    await MediaService.createMedia({
      ...data,
      provider: 'cloudinary',
    }, session.id)

    revalidatePath("/admin/cms/media")
    revalidatePath("/admin/media")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save media metadata" }
  }
}

export async function createMediaAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()
    
    // For URL-based addition (legacy)
    const rawData = {
      url: formData.get("url"),
      title: formData.get("title"),
      altText: formData.get("altText") || undefined,
      caption: formData.get("caption") || undefined,
      width: formData.get("width") ? parseInt(formData.get("width") as string) : undefined,
      height: formData.get("height") ? parseInt(formData.get("height") as string) : undefined,
      sizeBytes: formData.get("sizeBytes") ? parseInt(formData.get("sizeBytes") as string) : undefined,
      mimeType: formData.get("mimeType") || undefined,
      provider: 'url',
    }

    await MediaService.createMedia(rawData as any, session.id)

    revalidatePath("/admin/cms/media")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create media" }
  }
}

export async function archiveMediaAction(id: string, providerId?: string) {
  try {
    const session = await SessionService.requireAdmin()
    
    if (providerId) {
      // 1. Clean up Cloudinary remote if provider ID matches Cloudinary resource
      await StorageService.deleteImage(providerId)

      // 2. Clean up local fallback file if it exists
      try {
        const localPath = path.join(process.cwd(), "public", "uploads", providerId)
        if (fs.existsSync(localPath)) {
          await fs.promises.unlink(localPath)
        }
      } catch (err) {
        console.error("[archiveMediaAction] Failed to delete local file:", err)
      }
    }

    await MediaService.deleteMedia(id, session.id)
    revalidatePath("/admin/cms/media")
    revalidatePath("/admin/media")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive media" }
  }
}

export async function bulkDeleteMediaAction(items: { id: string; providerId?: string | null }[]) {
  try {
    await SessionService.requireAdmin()

    // 1. Delete from Cloudinary + local filesystem in parallel
    await Promise.all(
      items.map(async (item) => {
        try {
          if (item.providerId) {
            await StorageService.deleteImage(item.providerId).catch(() => {})
            try {
              const localPath = path.join(process.cwd(), "public", "uploads", item.providerId)
              if (fs.existsSync(localPath)) await fs.promises.unlink(localPath)
            } catch {}
          }
        } catch {}
      })
    )

    // 2. Single batch DELETE from DB — one query regardless of count
    const ids = items.map(i => i.id)
    if (ids.length > 0) {
      await db.delete(mediaLibrary).where(inArray(mediaLibrary.id, ids))
    }

    revalidatePath("/admin/cms/media")
    revalidatePath("/admin/media")
    return { success: true, failed: [] as string[] }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to bulk delete media" }
  }
}

export async function getMediaLibraryItemsAction() {
  try {
    await SessionService.requireAdmin()
    const { db } = await import("@/db/client")
    const { mediaLibrary } = await import("@/db/schema/media")
    const { productImages } = await import("@/db/schema/product-images")
    const { products } = await import("@/db/schema/products")
    const { isNull, desc, eq } = await import("drizzle-orm")

    // 1. Fetch all media library items
    const mediaItems = await db
      .select()
      .from(mediaLibrary)
      .where(isNull(mediaLibrary.deletedAt))
      .orderBy(desc(mediaLibrary.createdAt))

    // 2. Fetch ALL product images with their product names
    const allProductImages = await db
      .select({
        url: productImages.url,
        productId: productImages.productId,
        productName: products.name,
        position: productImages.position,
        createdAt: productImages.createdAt,
      })
      .from(productImages)
      .innerJoin(products, eq(productImages.productId, products.id))
      .where(isNull(products.deletedAt))

    // Helper: extract unique asset key (Cloudinary public ID / filename without extension or version)
    const getAssetKey = (url: string): string => {
      if (!url) return ""
      try {
        const clean = url.trim().toLowerCase().split("?")[0].split("#")[0]
        const parts = clean.split("/")
        const last = parts[parts.length - 1]
        const baseName = last.split(".")[0]
        return baseName
      } catch {
        return url.trim().toLowerCase()
      }
    }

    // 3. Build lookup maps for exact URL and normalized asset key
    const exactMap = new Map<string, { productId: string; productName: string; fullUrl: string }>()
    const assetKeyMap = new Map<string, { productId: string; productName: string; fullUrl: string }>()

    for (const img of allProductImages) {
      if (!img.url) continue
      const info = { productId: img.productId, productName: img.productName, fullUrl: img.url.trim() }
      exactMap.set(img.url.trim(), info)
      const key = getAssetKey(img.url)
      if (key) assetKeyMap.set(key, info)
    }

    // 4. Mark media library items as attached if URL or asset key matches
    const mediaItemsWithAttachment = mediaItems.map((item) => {
      if (!item.url) return { ...item, attachedProductId: null, attachedProductName: null }

      const exactMatch = exactMap.get(item.url.trim())
      const keyMatch = !exactMatch ? assetKeyMap.get(getAssetKey(item.url)) : null
      const match = exactMatch || keyMatch

      if (match) {
        exactMap.delete(item.url.trim())
        const key = getAssetKey(item.url)
        if (key) assetKeyMap.delete(key)
      }

      return {
        ...item,
        attachedProductId: match ? match.productId : null,
        attachedProductName: match ? match.productName : null,
      }
    })

    // 5. For product images that exist in product_images but NOT in media_library,
    //    create synthetic entries so they appear in the "Attached" tab
    const syntheticAttached = []
    for (const [key, itemData] of assetKeyMap.entries()) {
      syntheticAttached.push({
        id: `synth-${key}`,
        url: itemData.fullUrl,
        title: `${itemData.productName} Image`,
        altText: null,
        caption: null,
        width: null,
        height: null,
        sizeBytes: null,
        mimeType: 'image/webp',
        provider: 'cloudinary',
        providerId: null,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachedProductId: itemData.productId,
        attachedProductName: itemData.productName,
      })
    }

    const result = [...mediaItemsWithAttachment, ...syntheticAttached]

    return { success: true, data: JSON.parse(JSON.stringify(result)) }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

