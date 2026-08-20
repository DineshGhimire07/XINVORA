import { uploadLocalFileAction } from "@/actions/admin/media.actions"

/**
 * Handles image uploading with support for Cloudinary direct upload and local storage fallback.
 * Uses server action routing to eliminate browser CORS preflight blocks.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const uploadRes = await uploadLocalFileAction(formData)
  if (!uploadRes.success || !uploadRes.url) {
    throw new Error(uploadRes.error || "Failed to upload file.")
  }

  return uploadRes.url
}
