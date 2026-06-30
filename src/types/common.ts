/**
 * types/common.ts — XINVORA Shared Utility Types
 *
 * Generic TypeScript utilities used across the entire codebase.
 * These are domain-agnostic — no ecommerce or brand-specific assumptions.
 * Import from here rather than redefining in individual files.
 */

// ── Nullability ───────────────────────────────────────────────────────────────
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

// ── Object Utilities ──────────────────────────────────────────────────────────
export type Dict<T = unknown> = Record<string, T>
export type StringDict = Record<string, string>
export type AnyObject = Record<string, unknown>

// ── Function Utilities ────────────────────────────────────────────────────────
export type VoidFn = () => void
export type AsyncVoidFn = () => Promise<void>
export type AsyncFn<T = void> = () => Promise<T>
export type Callback<T = void> = (value: T) => void
export type AsyncCallback<T = void, R = void> = (value: T) => Promise<R>

// ── Class Name Utilities ──────────────────────────────────────────────────────
export type ClassName = string | undefined | null | false

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// ── API Response ──────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ── Async State ───────────────────────────────────────────────────────────────
export interface AsyncState<T = unknown> {
  data: Nullable<T>
  isLoading: boolean
  isError: boolean
  error: Nullable<string>
}

// ── Form Utilities ────────────────────────────────────────────────────────────
export interface FormState {
  isSubmitting: boolean
  isSuccess: boolean
  isError: boolean
  message: Nullable<string>
}

// ── UI State ──────────────────────────────────────────────────────────────────
export type Size = "xs" | "sm" | "md" | "lg" | "xl"
export type Variant = "primary" | "secondary" | "outline" | "ghost" | "link"
export type Intent = "default" | "success" | "warning" | "error" | "info"
export type Orientation = "horizontal" | "vertical"
export type Align = "start" | "center" | "end"
export type Side = "top" | "right" | "bottom" | "left"
export type Theme = "light" | "dark" | "system"

// ── Image ─────────────────────────────────────────────────────────────────────
export interface ImageAsset {
  src: string
  alt: string
  width?: number
  height?: number
  blurDataURL?: string
}

// ── SEO / Meta ────────────────────────────────────────────────────────────────
export interface SeoMeta {
  title: string
  description: string
  image?: string
  noIndex?: boolean
  canonical?: string
  keywords?: string[]
}

// ── Address (generic — not ecommerce specific) ────────────────────────────────
export interface Address {
  line1: string
  line2?: string
  city: string
  state?: string
  country: string
  postalCode: string
}

// ── Contact ───────────────────────────────────────────────────────────────────
export interface ContactInfo {
  email?: string
  phone?: string
  address?: Address
}

// ── TypeScript helpers ────────────────────────────────────────────────────────
/** Make all properties in T required and non-nullable */
export type Concrete<T> = { [K in keyof T]-?: NonNullable<T[K]> }

/** Make specific keys optional */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/** Make specific keys required */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/** Extract the props of a React component */
export type ComponentProps<T extends React.ComponentType<unknown>> = T extends React.ComponentType<infer P> ? P : never

/** Children prop utility */
export interface WithChildren {
  children: React.ReactNode
}

/** ClassName prop utility */
export interface WithClassName {
  className?: string
}

/** Combined utility props */
export interface BaseComponentProps extends WithChildren, WithClassName {}

// Ensure React is importable in this types file context
import type React from "react"
