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

    // Create uploads directory in public if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "payment-proofs")
    if (!fs.existsSync(uploadsDir)) {
      await fs.promises.mkdir(uploadsDir, { recursive: true })
    }

    // Sanitize and guarantee a unique file name
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const uniqueName = `${Date.now()}_${safeName}`
    const filePath = path.join(uploadsDir, uniqueName)

    // Save file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.promises.writeFile(filePath, buffer)

    return { success: true, url: `/uploads/payment-proofs/${uniqueName}` }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to upload file locally." }
  }
}
