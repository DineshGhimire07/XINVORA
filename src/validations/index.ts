/**
 * lib/validations.ts — XINVORA Shared Zod Schemas
 *
 * Reusable validation schemas for forms and API inputs.
 * Import these schemas into React Hook Form via zodResolver.
 *
 * Usage:
 *   const form = useForm({ resolver: zodResolver(emailSchema) })
 */

import { z } from "zod"

// ── Primitives ────────────────────────────────────────────────────────────────
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .toLowerCase()
  .trim()

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name is too long")
  .trim()

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, "Please enter a valid phone number")
  .optional()

export const urlSchema = z
  .string()
  .url("Please enter a valid URL")
  .optional()

// ── Newsletter Subscription ───────────────────────────────────────────────────
export const newsletterSchema = z.object({
  email: emailSchema,
})
export type NewsletterFormData = z.infer<typeof newsletterSchema>

// ── Contact Form ──────────────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().min(1, "Subject is required").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long"),
})
export type ContactFormData = z.infer<typeof contactSchema>

// ── Search ────────────────────────────────────────────────────────────────────
export const searchSchema = z.object({
  query: z.string().min(1, "Please enter a search term").max(200),
})
export type SearchFormData = z.infer<typeof searchSchema>

// ── Address ───────────────────────────────────────────────────────────────────
export const addressSchema = z.object({
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
})
export type AddressFormData = z.infer<typeof addressSchema>

// ── Slug ──────────────────────────────────────────────────────────────────────
export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(255, "Slug is too long")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only")

// ── Product (Admin write) ─────────────────────────────────────────────────────
export const createProductSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().max(5000).optional(),
  categoryId: z.string().uuid("Category is required"),
  brandId: z.string().uuid().optional(),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  initialSku: z.string().min(1, "SKU is required").max(255),
  initialQuantity: z.coerce.number().int().min(0).default(0),
})
export type CreateProductFormData = z.infer<typeof createProductSchema>

// ── Category (Admin write) ────────────────────────────────────────────────────
export const createCategorySchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, "Category name is required").max(255),
  description: z.string().max(2000).optional(),
  imageUrl: urlSchema,
  parentId: z.string().uuid().optional(),
})
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>

// ── Collection (Admin write) ──────────────────────────────────────────────────
export const createCollectionSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, "Collection name is required").max(255),
  description: z.string().max(2000).optional(),
  imageUrl: urlSchema,
})
export type CreateCollectionFormData = z.infer<typeof createCollectionSchema>

// ── Inventory Adjustment (Admin/System write) ──────────────────────────────────
export const adjustInventorySchema = z.object({
  variantId: z.string().uuid("Variant ID is required"),
  type: z.enum(["RESTOCK", "RESERVE", "RELEASE", "FULFILL", "CORRECTION"]),
  delta: z.coerce.number().int().positive("Quantity must be a positive integer"),
})
export type AdjustInventoryFormData = z.infer<typeof adjustInventorySchema>
export * from "./auth"
