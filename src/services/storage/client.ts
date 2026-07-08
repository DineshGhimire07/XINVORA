import { v2 as cloudinary } from 'cloudinary'

// Ensure Cloudinary is configured
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export class StorageService {
  /**
   * Generates a secure signature for client-side uploads to Cloudinary.
   * This avoids sending the API secret to the browser.
   */
  static generateUploadSignature(folder: string = 'xinvora_media') {
    const timestamp = Math.round(new Date().getTime() / 1000)
    
    // Cloudinary signature parameters
    const paramsToSign = {
      timestamp,
      folder,
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    )

    return {
      timestamp,
      signature,
      folder,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    }
  }

  /**
   * Deletes an image from Cloudinary using its public ID.
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return result.result === 'ok' || result.result === 'not found'
    } catch (error) {
      console.error("[StorageService] Failed to delete image from Cloudinary:", error)
      return false
    }
  }
}
