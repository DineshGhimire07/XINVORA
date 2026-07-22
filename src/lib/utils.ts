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
