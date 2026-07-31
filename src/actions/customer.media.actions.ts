"use server"

import { StorageService } from "@/services/storage/client"
import fs from "fs"
import path from "path"

export async function generateCustomerUploadSignatureAction() {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret)

    if (!isCloudinaryConfigured) {
      return { success: true, data: { useLocalFallback: true } }
    }

    const signatureData = StorageService.generateUploadSignature("payment-proofs")
    return { success: true, data: { ...signatureData, useLocalFallback: false } }
  } catch (error: any) {
    return { success: true, data: { useLocalFallback: true } }
  }
}

export async function uploadCustomerLocalFileAction(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) throw new Error("No file uploaded")
    if (file.size > 5 * 1024 * 1024) throw new Error("File too large. Maximum size is 5MB.")

    // Attempt local disk write (works on environments with writable public directory)
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "payment-proofs")
      if (!fs.existsSync(uploadsDir)) {
        await fs.promises.mkdir(uploadsDir, { recursive: true })
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const uniqueName = `${Date.now()}_${safeName}`
      const filePath = path.join(uploadsDir, uniqueName)

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      await fs.promises.writeFile(filePath, buffer)

      return { success: true, url: `/uploads/payment-proofs/${uniqueName}` }
    } catch (fsError: any) {
      // EROFS / Read-only filesystem fallback (e.g. Vercel, AWS Lambda, Docker serverless)
      console.warn("[uploadCustomerLocalFileAction] Read-only filesystem encountered. Falling back to Data URL:", fsError.message)
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const mimeType = file.type || "image/png"
      const base64Data = buffer.toString("base64")
      const dataUrl = `data:${mimeType};base64,${base64Data}`

      return { success: true, url: dataUrl }
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to upload file." }
  }
}
