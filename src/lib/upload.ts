import { uploadLocalFileAction } from "@/actions/admin/media.actions"
import { compressImageClient } from "@/lib/image-compressor"

/**
 * Handles image uploading with automatic client-side compression (shrinks high-MB photos to ~200-500KB).
 * Supports Cloudinary direct upload and local storage fallback.
 */
export async function uploadImage(file: File): Promise<string> {
  // Compress large photos to under 500KB before uploading
  const compressedFile = await compressImageClient(file, 500 * 1024)

  const formData = new FormData()
  formData.append("file", compressedFile)

  const uploadRes = await uploadLocalFileAction(formData)
  if (!uploadRes.success || !uploadRes.url) {
    throw new Error(uploadRes.error || "Failed to upload file.")
  }

  return uploadRes.url
}
