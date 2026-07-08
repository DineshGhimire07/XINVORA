import { generateUploadSignatureAction, saveMediaMetadataAction, uploadLocalFileAction } from "@/actions/admin/media.actions"

/**
 * Handles image uploading with support for Cloudinary direct upload (via secure signature)
 * and local filesystem fallback (for local development/testing without environment keys).
 */
export async function uploadImage(file: File): Promise<string> {
  // 1. Request upload configuration/signature from Server Action
  const sigRes = await generateUploadSignatureAction()
  if (!sigRes.success || !sigRes.data) {
    throw new Error("Failed to retrieve upload signature configuration.")
  }
  
  const data = sigRes.data as any
  const useLocalFallback = data.useLocalFallback
  
  if (useLocalFallback) {
    // Local filesystem upload fallback
    const formData = new FormData()
    formData.append("file", file)
    const uploadRes = await uploadLocalFileAction(formData)
    if (!uploadRes.success || !uploadRes.url) {
      throw new Error(uploadRes.error || "Failed to upload file locally.")
    }
    return uploadRes.url
  } else {
    // Cloudinary cloud upload path
    const formData = new FormData()
    formData.append("file", file)
    formData.append("api_key", data.apiKey!)
    formData.append("timestamp", data.timestamp.toString())
    formData.append("signature", data.signature)
    formData.append("folder", data.folder)

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    })
    
    if (!uploadRes.ok) {
      const errData = await uploadRes.json().catch(() => ({}))
      throw new Error(errData.error?.message || "Upload request failed on Cloudinary.")
    }
    const uploadData = await uploadRes.json()

    // Register media record inside catalog database
    const saveRes = await saveMediaMetadataAction({
      url: uploadData.secure_url,
      title: file.name,
      mimeType: file.type,
      sizeBytes: uploadData.bytes,
      width: uploadData.width,
      height: uploadData.height,
      providerId: uploadData.public_id,
    })

    if (!saveRes.success) {
      throw new Error(saveRes.error || "Failed to save media metadata to the database.")
    }
    
    return uploadData.secure_url
  }
}
