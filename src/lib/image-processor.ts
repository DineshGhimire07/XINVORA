import sharp from "sharp"

/**
 * Automatically trims uniform background margin around a garment in a product image
 * and pads it back to a consistent 3:4 aspect ratio.
 * Falls back to the original buffer on any failure or if trimming is not applicable.
 */
export async function processProductImage(buffer: Buffer): Promise<Buffer> {
  try {
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    // Skip if it's not a supported format or metadata is missing
    if (!metadata.width || !metadata.height) {
      return buffer
    }

    // Try trimming the uniform background
    const trimmed = image.trim()
    const trimmedMetadata = await trimmed.metadata()
    const width = trimmedMetadata.width || 0
    const height = trimmedMetadata.height || 0

    // Safety check: if trimming cut the image to 0 or failed to get dimensions, skip
    if (width === 0 || height === 0) {
      return buffer
    }

    // Check if trimming cut too much (e.g. more than 95% of the image), which could indicate a bad crop
    if (width < metadata.width * 0.05 || height < metadata.height * 0.05) {
      console.log(`[Image Processor] Skipping trim: bounding box too small (${width}x${height} from ${metadata.width}x${metadata.height})`)
      return buffer
    }

    const targetRatio = 0.75 // 3:4 aspect ratio
    let padTop = 0, padBottom = 0, padLeft = 0, padRight = 0
    let newWidth = width
    let newHeight = height

    if (width / height > targetRatio) {
      // Image is too wide: pad height (top and bottom)
      newHeight = Math.round(width / targetRatio)
      const totalPad = newHeight - height
      padTop = Math.floor(totalPad / 2)
      padBottom = totalPad - padTop
    } else {
      // Image is too tall: pad width (left and right)
      newWidth = Math.round(height * targetRatio)
      const totalPad = newWidth - width
      padLeft = Math.floor(totalPad / 2)
      padRight = totalPad - padLeft
    }

    // Pad with white (or transparent if input format has alpha channel)
    const background = trimmedMetadata.hasAlpha
      ? { r: 255, g: 255, b: 255, alpha: 0 }
      : { r: 255, g: 255, b: 255 }

    return await trimmed
      .extend({
        top: padTop,
        bottom: padBottom,
        left: padLeft,
        right: padRight,
        background,
      })
      .toBuffer()
  } catch (error) {
    console.error("[Image Processor Error]:", error)
    return buffer
  }
}
