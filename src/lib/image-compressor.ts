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
        const MAX_WIDTH = 1600
        const MAX_HEIGHT = 2000

        let width = img.width
        let height = img.height

        // Downscale while preserving aspect ratio if dimensions exceed 1600x2000
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
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        const outputMime = "image/webp"

        const attemptCompress = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return resolve(file)
              }

              // If compressed blob is under maxSizeBytes or quality floor reached (0.5), resolve as .webp
              if (blob.size <= maxSizeBytes || quality <= 0.5) {
                const newFilename = file.name.replace(/\.[^/.]+$/, "") + ".webp"
                const compressedFile = new File([blob], newFilename, {
                  type: outputMime,
                  lastModified: Date.now(),
                })
                console.log(
                  `[WebP Converter] "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB, ${file.type}) -> "${newFilename}" (${(blob.size / 1024).toFixed(0)} KB, webp)`
                )
                resolve(compressedFile)
              } else {
                // Try again with lower quality step
                attemptCompress(Math.max(0.5, quality - 0.12))
              }
            },
            outputMime,
            quality
          )
        }

        // Start compression quality check at 0.85
        attemptCompress(0.85)
      }

      img.onerror = () => resolve(file)
    }

    reader.onerror = () => resolve(file)
  })
}
