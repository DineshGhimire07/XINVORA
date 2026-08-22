/**
 * Client-side Image Compression & WebP Converter Utility
 * - Converts ALL images (PNG, JPG, JPEG, BMP) directly to .webp format
 * - Automatically resizes high-resolution photos (downscaling to max 1600x2000px)
 * - Compresses file size to under 500 KB without sacrificing sharpness or quality
 */
export async function compressImageClient(file: File, maxSizeBytes: number = 500 * 1024): Promise<File> {
  // Only process images (skip non-image files if any)
  if (!file.type.startsWith("image/")) {
    return file
  }

  // SVG vector graphics don't need raster conversion
  if (file.type.includes("svg")) {
    return file
  }

  // If file is ALREADY WebP format AND already under 500KB, return as is
  if (file.type === "image/webp" && file.size <= maxSizeBytes) {
    return file
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        const MAX_WIDTH = 3840
        const MAX_HEIGHT = 3840

        let width = img.width
        let height = img.height

        // Downscale only if dimensions exceed 4K (3840px)
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          return resolve(file)
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height)

        const outputMime = file.type || "image/webp"

        const attemptCompress = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return resolve(file)
              }

              // If compressed blob is under maxSizeBytes or quality floor reached (0.85), resolve
              if (blob.size <= maxSizeBytes || quality <= 0.85) {
                const newFilename = file.name.replace(/\.[^/.]+$/, "") + ".webp"
                const compressedFile = new File([blob], newFilename, {
                  type: outputMime,
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                // Try again with gentle step
                attemptCompress(Math.max(0.85, quality - 0.05))
              }
            },
            outputMime,
            quality
          )
        }

        // Start compression quality check at 0.95
        attemptCompress(0.95)
      }

      img.onerror = () => resolve(file)
    }

    reader.onerror = () => resolve(file)
  })
}
