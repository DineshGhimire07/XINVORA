"use server"

import { revalidatePath } from "next/cache"
import { MediaService } from "@/services/media.service"
import { SessionService } from "@/services/session.service"
import { StorageService } from "@/services/storage/client"
import fs from "fs"
import path from "path"

import { processProductImage } from "@/lib/image-processor"
import { v2 as cloudinary } from "cloudinary"
import sharp from "sharp"

export async function generateUploadSignatureAction(folder?: string) {
  // Always return useLocalFallback so that the client sends the file to the server action first,
  // allowing us to run the server-side image processing pipeline before storage routing.
  return { success: true, data: { useLocalFallback: true } }
}

export async function uploadLocalFileAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()
    const file = formData.get("file") as File
    if (!file) throw new Error("No file uploaded")

    // Read the file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Run the automatic trimming and padding pipeline
    const processedBuffer = await processProductImage(buffer)

    // Resolve width and height metadata
    const processedMetadata = await sharp(processedBuffer).metadata()
    const width = processedMetadata.width || undefined
    const height = processedMetadata.height || undefined

    // Check if Cloudinary is configured
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret)

    if (isCloudinaryConfigured) {
      // Configure Cloudinary
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      })

      // Upload processed buffer to Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "xinvora_media" },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        stream.end(processedBuffer)
      })

      const media = await MediaService.createMedia({
        url: uploadResult.secure_url,
        title: file.name,
        mimeType: file.type,
        sizeBytes: uploadResult.bytes,
        width: uploadResult.width,
        height: uploadResult.height,
        provider: 'cloudinary',
        providerId: uploadResult.public_id,
      }, session.id)

      revalidatePath("/admin/cms/media")
      return { success: true, url: media.url }
    } else {
      // Local fallback path
      const uploadsDir = path.join(process.cwd(), "public", "uploads")
      if (!fs.existsSync(uploadsDir)) {
        await fs.promises.mkdir(uploadsDir, { recursive: true })
      }

      // Sanitize and guarantee a unique file name
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const uniqueName = `${Date.now()}_${safeName}`
      const filePath = path.join(uploadsDir, uniqueName)

      await fs.promises.writeFile(filePath, processedBuffer)

      const media = await MediaService.createMedia({
        url: `/uploads/${uniqueName}`,
        title: file.name,
        mimeType: file.type,
        sizeBytes: processedBuffer.length,
        width,
        height,
        provider: 'local',
        providerId: uniqueName,
      }, session.id)

      revalidatePath("/admin/cms/media")
      return { success: true, url: media.url }
    }
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
    const session = await SessionService.requireAdmin()
    
    await MediaService.createMedia({
      ...data,
      provider: 'cloudinary',
    }, session.id)

    revalidatePath("/admin/cms/media")
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
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive media" }
  }
}
