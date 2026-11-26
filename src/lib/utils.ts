/**
 * lib/utils.ts — XINVORA Core Utilities
 *
 * The cn() utility is the most-used helper in the codebase.
 * It merges Tailwind classes intelligently (handling conflicts)
 * using clsx for conditional logic and tailwind-merge for deduplication.
 *
 * Usage:
 *   cn("px-4 py-2", isActive && "bg-accent", className)
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Accepts any combination of strings, arrays, and conditionals.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  // Amount is stored in paisa/cents. Convert to whole NPR.
  const npr = amount / 100
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(npr)
}
/**
 * Format a number as a price string.
 * Defaults to USD. Replace with locale-aware formatting in production.
 *
 * @example formatPrice(49.99) → "$49.99"
 * @example formatPrice(49.99, "GBP") → "£49.99"
 */
export function formatPrice(
  amount: number,
  currency: string = "NPR",
  locale: string = "en-NP"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formats long marketplace/SEO-stuffed product titles into concise, elegant
 * luxury display titles for the PDP and visual storefront elements, while
 * keeping the full title untouched in SEO metadata and database records.
 *
 * @example
 * "XINVORA Paisley Print Midi Dress for Women – Ivory Sleeveless A-Line..."
 * -> "XINVORA Paisley Print Midi Dress for Women"
 *
 * "Women’s Faux Leather Rexine Corset Top with Lace Up Front... | Fitted..."
 * -> "Women’s Faux Leather Rexine Corset Top"
 */
export function formatPdpDisplayTitle(rawTitle?: string | null): string {
  if (!rawTitle) return ""
  const title = rawTitle.trim()

  // 1. Check for primary delimiter pairs with spaces (' – ', ' — ', ' | ', ' // ', ' - ')
  const separators = [" – ", " — ", " | ", " // ", " - "]
  for (const sep of separators) {
    if (title.includes(sep)) {
      const candidate = title.split(sep)[0].trim()
      if (candidate.length >= 15 && candidate.length <= 65) {
        return candidate
      }
    }
  }

  // 2. If title has ' with ' and is longer than 45 chars, cut at ' with '
  if (title.length > 45 && /\s+with\s+/i.test(title)) {
    const candidate = title.split(/\s+with\s+/i)[0].trim()
    if (candidate.length >= 15) {
      return candidate
    }
  }

  // 3. Fallback: if still > 60 chars, find natural word break around 45-55 chars
  if (title.length > 60) {
    const sub = title.slice(0, 55)
    const lastSpace = sub.lastIndexOf(" ")
    if (lastSpace > 25) {
      return title.slice(0, lastSpace).trim()
    }
  }

  return title
}

/**
 * Formats product titles specifically for product grid cards,
 * creating clean, concise editorial titles matching luxury fashion standards.
 *
 * @example
 * "XINVORA Pink Leaf Print Midi Dress for Women – Sleeveless A-Line..."
 * -> "Pink Leaf Print Midi Dress"
 */
export function formatCardDisplayTitle(rawTitle?: string | null): string {
  if (!rawTitle) return ""
  let clean = rawTitle.trim()

  // Strip leading brand name if present
  clean = clean.replace(/^XINVORA\s+/i, "")

  // Primary delimiters
  const separators = [" – ", " — ", " | ", " // ", " - "]
  for (const sep of separators) {
    if (clean.includes(sep)) {
      clean = clean.split(sep)[0].trim()
      break
    }
  }

  // Strip 'for Women' or 'for Girls' if title is still long
  if (clean.length > 25) {
    clean = clean.replace(/\s+(for\s+women|for\s+girls|for\s+ladies)\b/i, "").trim()
  }

  // If has ' with ' and is still long (> 30 chars), cut before ' with '
  if (clean.length > 30 && /\s+with\s+/i.test(clean)) {
    clean = clean.split(/\s+with\s+/i)[0].trim()
  }

  // Fallback: if still > 38 chars, truncate at word boundary
  if (clean.length > 38) {
    const sub = clean.slice(0, 36)
    const lastSpace = sub.lastIndexOf(" ")
    if (lastSpace > 15) {
      clean = clean.slice(0, lastSpace).trim()
    }
  }

  return clean
}

/**
 * Truncate a string to a maximum length, appending ellipsis.
 *
 * @example truncate("A very long title", 10) → "A very lon..."
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + "..."
}

/**
 * Generate a URL-safe slug from a string.
 *
 * @example slugify("Premium Home Decor") → "premium-home-decor"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Capitalize the first letter of each word.
 *
 * @example titleCase("premium lifestyle brand") → "Premium Lifestyle Brand"
 */
export function titleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  )
}

/**
 * Check if a value is defined (not null or undefined).
 * Useful as a type guard in .filter() chains.
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Delay execution for a given number of milliseconds.
 * Useful in animations, testing, and retry logic.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Clamp a number between min and max.
 *
 * @example clamp(150, 0, 100) → 100
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Map a value from one range to another.
 * Useful for scroll-based animations.
 *
 * @example mapRange(0.5, 0, 1, 0, 100) → 50
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin
}
