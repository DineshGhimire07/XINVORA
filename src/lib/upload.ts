import { uploadLocalFileAction } from "@/actions/admin/media.actions"

/**
 * Handles media uploading preserving pristine original master quality for Cloudinary.
 * Delivery optimization (AVIF/WebP, responsive sizing, Retina DPR) is handled dynamically at edge.
 */
export async function uploadImage(file: File, options?: { purpose?: "hero" | "banner" | "product" | "collection" }): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  if (options?.purpose) {
    formData.append("purpose", options.purpose)
  }

  const uploadRes = await uploadLocalFileAction(formData)
  if (!uploadRes.success || !uploadRes.url) {
    throw new Error(uploadRes.error || "Failed to upload file.")
  }

  return uploadRes.url
}
