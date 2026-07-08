import { z } from "zod"

// ─── Nepal Phone Validation ───────────────────────────────────────────────────
// Supports: 98XXXXXXXX, 97XXXXXXXX, 96XXXXXXXX (10 digits total)
const nepalPhoneRegex = /^(98|97|96)\d{8}$/

export const NepalDeliverySchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name is too long"),

  phone: z
    .string()
    .regex(nepalPhoneRegex, "Enter a valid Nepal mobile number (e.g. 9812345678)"),

  provinceId: z
    .string()
    .uuid("Invalid province")
    .min(1, "Province is required"),

  districtId: z
    .string()
    .uuid("Invalid district")
    .min(1, "District is required"),

  municipalityId: z
    .string()
    .uuid("Invalid municipality")
    .min(1, "Municipality is required"),

  wardNumber: z
    .number()
    .int()
    .min(1, "Ward number must be at least 1")
    .max(35, "Ward number seems too high"),

  tole: z
    .string()
    .min(1, "Tole / Area is required")
    .max(255),

  street: z.string().max(255).optional(),
  landmark: z.string().max(255).optional(),
  deliveryNote: z.string().max(1000).optional(),

  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  saveAddress: z.boolean().default(false),

  paymentMethod: z.enum(["COD", "ESEWA", "KHALTI", "BANK"] as const).optional(),
  paymentProofUrl: z.string().optional(),
  
  // These are passed down from components so we don't have to look them up again
  provinceName: z.string().optional(),
  districtName: z.string().optional(),
  municipalityName: z.string().optional(),
  municipalityType: z.string().optional(),
})

export type NepalDeliveryFormValues = z.infer<typeof NepalDeliverySchema>

// Checkout submission that includes cart context
export const CheckoutSubmissionSchema = NepalDeliverySchema.extend({
  shippingMethodId: z.string().min(1, "Please select a shipping method"),
  couponCode: z.string().optional(),
  idempotencyKey: z.string().min(1, "Internal checkout error: missing key"),
  paymentMethod: z.enum(["COD", "ESEWA"]),
  paymentProofUrl: z.string().optional()
})

export type CheckoutSubmission = z.infer<typeof CheckoutSubmissionSchema>
