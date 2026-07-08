import { z } from "zod"

export const generalSettingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeTagline: z.string().optional(),
  storeDescription: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  defaultLanguage: z.string().min(1, "Default language is required"),
  currency: z.string().min(1, "Currency is required"),
})

export const storeContactSettingsSchema = z.object({
  supportEmail: z.string().email("Invalid email"),
  salesEmail: z.string().email("Invalid email").or(z.literal("")),
  returnsEmail: z.string().email("Invalid email").or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  whatsapp: z.string().optional(),
  officeHours: z.string().optional(),
  socialLinks: z.object({
    instagram: z.string().url("Must be a valid URL").or(z.literal("")),
    facebook: z.string().url("Must be a valid URL").or(z.literal("")),
    tiktok: z.string().url("Must be a valid URL").or(z.literal("")),
    linkedin: z.string().url("Must be a valid URL").or(z.literal("")),
    youtube: z.string().url("Must be a valid URL").or(z.literal("")),
  })
})

export const maintenanceSettingsSchema = z.object({
  mode: z.enum(["online", "store_closed", "offline"]),
  message: z.string().min(1, "Message is required"),
  expectedReturnTime: z.string().optional(),
  countdownEnabled: z.boolean(),
})

export const storeTaxesSettingsSchema = z.object({
  businessName: z.string().min(1, "Business Name is required"),
  businessRegistrationNo: z.string().optional(),
  pan: z.string().optional(),
  vat: z.string().optional(),
  taxRate: z.number().min(0).max(100),
  currencySymbol: z.string().min(1, "Currency symbol is required"),
  currencyCode: z.string().min(1, "Currency code is required"),
})

export const storeShippingSettingsSchema = z.object({
  defaultDeliveryCharge: z.number().min(0),
  freeDeliveryThreshold: z.number().min(0).optional(),
  estimatedDeliveryTime: z.string().optional(),
  courierName: z.string().optional(),
})

export const announcementSettingsSchema = z.object({
  enabled: z.boolean(),
  text: z.string().min(1, "Text is required"),
  backgroundColor: z.string(),
  textColor: z.string(),
  buttonText: z.string(),
  link: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
})

export const paymentQRSettingsSchema = z.object({
  esewaUrl: z.string(),
  khaltiUrl: z.string(),
  bankUrl: z.string(),
  bankDetails: z.string(),
})

export const storeInvoiceSettingsSchema = z.object({
  invoicePrefix: z.string().min(1, "Prefix is required"),
  orderPrefix: z.string().min(1, "Prefix is required"),
  invoiceFooter: z.string().optional(),
  invoiceNotes: z.string().optional(),
  invoiceSize: z.string().optional(),
})

export const appearanceThemeSettingsSchema = z.object({
  mode: z.string().min(1, "Mode is required"),
  primaryColor: z.string().min(1, "Primary color is required"),
  secondaryColor: z.string().min(1, "Secondary color is required"),
  accentColor: z.string().min(1, "Accent color is required"),
  borderRadius: z.string().min(1, "Border radius is required"),
})

export const appearanceHomepageSettingsSchema = z.object({
  heroEnabled: z.boolean(),
  collectionsEnabled: z.boolean(),
  testimonialsEnabled: z.boolean(),
  newsletterEnabled: z.boolean(),
  sectionOrder: z.array(z.string()),
})

export const featuresSettingsSchema = z.object({
  analytics: z.boolean(),
  marketing: z.boolean(),
  wishlist: z.boolean(),
  reviews: z.boolean(),
  guestCheckout: z.boolean(),
  blog: z.boolean(),
  coupons: z.boolean(),
  liveChat: z.boolean(),
})

export const aboutPageSettingsSchema = z.object({
  heroImage: z.string(),
  curatedImage: z.string(),
  pricingImage: z.string(),
  futureImage: z.string(),
})

