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
