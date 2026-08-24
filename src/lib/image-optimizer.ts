/**
 * lib/image-optimizer.ts — High-Performance Storefront Image Optimization
 *
 * Provides:
 * 1. Automatic Cloudinary Edge URL transformation (f_auto, q_auto:good, c_limit, responsive widths).
 * 2. Instant Base64 SVG Shimmer placeholder generator for 0-CLS blur effects.
 */

export interface OptimizeImageOptions {
  width?: number
  height?: number
  quality?: "auto" | "auto:good" | "auto:eco" | "auto:best" | number
  format?: "auto" | "webp" | "avif" | "jpg"
  crop?: "limit" | "fill" | "thumb" | "crop"
  dpr?: "auto" | number
}

/**
 * Transforms Cloudinary media URLs on the fly to apply automatic format negotiation
 * (modern AVIF / WebP), perceptual quality compression, and size limiting.
 */
export function optimizeCloudinaryUrl(
  url: string | null | undefined,
  options: OptimizeImageOptions = {}
): string {
  if (!url || typeof url !== "string") return ""
  
  // Only transform Cloudinary URLs
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url
  }

  // Avoid duplicating existing transformation blocks
  if (
    url.includes("/upload/f_auto") ||
    url.includes("/upload/q_auto") ||
    url.includes("/upload/w_")
  ) {
    return url
  }

  const {
    width,
    height,
    quality = "auto:good",
    format = "webp",
    crop = "limit",
    dpr,
  } = options

  const transforms: string[] = [`f_${format}`, `q_${quality}`]

  if (dpr) {
    transforms.push(`dpr_${dpr}`)
  }

  if (width) {
    transforms.push(`w_${width}`)
    transforms.push(`c_${crop}`)
  }

  if (height) {
    transforms.push(`h_${height}`)
    if (!width) transforms.push(`c_${crop}`)
  }

  const transformString = transforms.join(",")
  return url.replace("/upload/", `/upload/${transformString}/`)
}

/**
 * Creates an ultra-lightweight luxury shimmer SVG string for image loading placeholders.
 */
export function createShimmerSvg(width: number = 700, height: number = 933): string {
  return `
<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0eee9" offset="20%" />
      <stop stop-color="#e8e5df" offset="50%" />
      <stop stop-color="#f0eee9" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#f0eee9" />
  <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${width}" to="${width}" dur="1.2s" repeatCount="indefinite" />
</svg>`.trim()
}

/**
 * Converts a string to base64 safely across both server and client environments.
 */
export function toBase64(str: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(str).toString("base64")
  }
  return window.btoa(str)
}

/**
 * Standard base64 data URI shimmer placeholder for Next.js Image blurDataURL prop.
 */
export const SHIMMER_BLUR_DATA_URL = `data:image/svg+xml;base64,${toBase64(
  createShimmerSvg(700, 933)
)}`
