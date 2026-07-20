"use server"

import { revalidatePath } from "next/cache"
import { AdminSettingsService } from "@/services/admin/settings.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"
import type { ActionResult } from "@/types/actions"
import type { AppSettings } from "@/types/settings"

import { 
  generalSettingsSchema, 
  maintenanceSettingsSchema,
  storeContactSettingsSchema,
  storeTaxesSettingsSchema,
  storeShippingSettingsSchema,
  storeInvoiceSettingsSchema,
  appearanceThemeSettingsSchema,
  appearanceHomepageSettingsSchema,
  featuresSettingsSchema,
  paymentQRSettingsSchema,
  aboutPageSettingsSchema
} from "@/validations/settings"

// --- Server Actions ---

export async function updateAboutPageSettingsAction(
  data: z.infer<typeof aboutPageSettingsSchema>
): Promise<ActionResult<AppSettings["about_page"]>> {
  try {
    const session = await SessionService.requireAdmin()
    const validated = aboutPageSettingsSchema.parse(data)
    
    await AdminSettingsService.updateSetting("about_page", validated, session.id)
    revalidatePath("/", "layout")
    
    return { success: true, data: validated }
  } catch (error: any) {
    console.error("Failed to update about page settings:", error)
    return { success: false, error: { code: "ERROR", message: error.message || "Failed to update settings" } }
  }
}

export async function updatePaymentQRSettingsAction(
  data: z.infer<typeof paymentQRSettingsSchema>
): Promise<ActionResult<AppSettings["payment_qrs"]>> {
  try {
    const session = await SessionService.requireAdmin()
    const validated = paymentQRSettingsSchema.parse(data)
    
    await AdminSettingsService.updateSetting("payment_qrs", validated, session.id)
    revalidatePath("/", "layout")
    
    return { success: true, data: validated }
  } catch (error: any) {
    console.error("Failed to update payment qr settings:", error)
    return { success: false, error: { code: "ERROR", message: error.message || "Failed to update settings" } }
  }
}

export async function updateGeneralSettingsAction(
  data: z.infer<typeof generalSettingsSchema>
): Promise<ActionResult<AppSettings["general"]>> {
  try {
    const session = await SessionService.requireAdmin()
    const validated = generalSettingsSchema.parse(data)
    
    await AdminSettingsService.updateSetting("general", validated, session.id)
    revalidatePath("/", "layout")
    
    return { success: true, data: validated }
  } catch (error: any) {
    console.error("Failed to update general settings:", error)
    return { success: false, error: { code: "ERROR", message: error.message || "Failed to update settings" } }
  }
}

export async function updateMaintenanceSettingsAction(
  data: z.infer<typeof maintenanceSettingsSchema>
): Promise<ActionResult<AppSettings["maintenance"]>> {
  try {
    const session = await SessionService.requireAdmin()
    const validated = maintenanceSettingsSchema.parse(data)
    
    await AdminSettingsService.updateSetting("maintenance", validated, session.id)
    revalidatePath("/", "layout")
    
    return { success: true, data: validated }
  } catch (error: any) {
    console.error("Failed to update maintenance settings:", error)
    return { success: false, error: { code: "ERROR", message: error.message || "Failed to update settings" } }
  }
}

export async function updateStoreContactSettingsAction(
  data: z.infer<typeof storeContactSettingsSchema>
): Promise<ActionResult<AppSettings["store_contact"]>> {
  try {
    const session = await SessionService.requireAdmin()
    const validated = storeContactSettingsSchema.parse(data)
    await AdminSettingsService.updateSetting("store_contact", validated, session.id)
    revalidatePath("/", "layout")
    return { success: true, data: validated }
  } catch (error: any) {
    return { success: false, error: { code: "ERROR", message: error.message || "Failed to update settings" } }
  }
}

export async function updateStoreTaxesSettingsAction(
  data: z.infer<typeof storeTaxesSettingsSchema>
): Promise<ActionResult<AppSettings["store_taxes"]>> {
  try {
    const session = await SessionService.requireAdmin()
    const validated = storeTaxesSettingsSchema.parse(data)
    await AdminSettingsService.updateSetting("store_taxes", validated, session.id)
    revalidatePath("/", "layout")
    return { success: true, data: validated }
  } catch (error: any) {
    return { success: false, error: { code: "ERROR", message: error.message || "Failed to update settings" } }
  }
}

export async function updateStoreShippingSettingsAction(
  data: z.infer<typeof storeShippingSettingsSchema>
): Promise<ActionResult<AppSettings["store_shipping"]>> {
  try {
    const session = await SessionService.requireAdmin()
    const validated = storeShippingSettingsSchema.parse(data)
    await AdminSettingsService.updateSetting("store_shipping", validated, session.id)
    revalidatePath("/", "layout")
    return { success: true, data: validated }
  } catch (error: any) {
    return { success: false, error: { code: "ERROR", message: error.message || "Failed to update settings" } }
  }
}

export async function updateStoreInvoiceSettingsAction(
  data: z.infer<typeof storeInvoiceSettingsSchema>
): Promise<ActionResult<AppSettings["store_invoice"]>> {
  try {
    const session = await SessionService.requireAdmin()
    const validated = storeInvoiceSettingsSchema.parse(data)
    await AdminSettingsService.updateSetting("store_invoice", validated, session.id)
    revalidatePath("/", "layout")
    return { success: true, data: validated }
  } catch (error: any) {
    return { success: false, error: { code: "ERROR", message: error.message || "Failed to update settings" } }
  }
}

export async function updateAppearanceThemeSettingsAction(
  data: z.infer<typeof appearanceThemeSettingsSchema>
): Promise<ActionResult<AppSettings["appearance_theme"]>> {
  try {
    const session = await SessionService.requireAdmin()
    const validated = appearanceThemeSettingsSchema.parse(data)
    await AdminSettingsService.updateSetting("appearance_theme", validated, session.id)
    revalidatePath("/", "layout")
    return { success: true, data: validated }
  } catch (error: any) {
    return { success: false, error: { code: "ERROR", message: error.message || "Failed to update settings" } }
  }
}

export async function updateAppearanceHomepageSettingsAction(
  data: z.infer<typeof appearanceHomepageSettingsSchema>
): Promise<ActionResult<AppSettings["appearance_homepage"]>> {
  try {
    const session = await SessionService.requireAdmin()
    const validated = appearanceHomepageSettingsSchema.parse(data)
    await AdminSettingsService.updateSetting("appearance_homepage", validated, session.id)
    revalidatePath("/", "layout")
    return { success: true, data: validated }
  } catch (error: any) {
    return { success: false, error: { code: "ERROR", message: error.message || "Failed to update settings" } }
  }
}

export async function updateFeaturesSettingsAction(
  data: z.infer<typeof featuresSettingsSchema>
): Promise<ActionResult<AppSettings["features"]>> {
  try {
    const session = await SessionService.requireAdmin()
    const validated = featuresSettingsSchema.parse(data)
    await AdminSettingsService.updateSetting("features", validated, session.id)
    revalidatePath("/", "layout")
    return { success: true, data: validated }
  } catch (error: any) {
    return { success: false, error: { code: "ERROR", message: error.message || "Failed to update settings" } }
  }
}

export const authPageSettingsSchema = z.object({
  heroImageUrl: z.string().min(1, "Hero image is required"),
  headline: z.string().default("Luxury is found in the details."),
  subheading: z.string().default("SPRING EDITORIAL 2026"),
})

export async function updateAuthPageSettingsAction(
  data: z.infer<typeof authPageSettingsSchema>
): Promise<ActionResult<AppSettings["auth_page"]>> {
  try {
    const session = await SessionService.requireAdmin()
    const validated = authPageSettingsSchema.parse(data)
    await AdminSettingsService.updateSetting("auth_page", validated, session.id)
    revalidatePath("/login")
    revalidatePath("/register")
    return { success: true, data: validated }
  } catch (error: any) {
    return { success: false, error: { code: "ERROR", message: error.message || "Failed to update auth page settings" } }
  }
}

