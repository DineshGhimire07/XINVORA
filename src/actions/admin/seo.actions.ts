"use server"

import { SEOService } from "@/domains/seo/services/seo.service"
import { SessionService } from "@/services/session.service"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createRedirectSchema = z.object({
  sourceUrl: z.string().min(1, "Source URL is required"),
  targetUrl: z.string().min(1, "Target URL is required"),
  statusCode: z.number().int().default(301),
})

export async function getSEODashboardAction() {
  try {
    await SessionService.requireAdmin()
    const data = await SEOService.getDashboardOverview()
    return { success: true, data }
  } catch (error: any) {
    console.error("[getSEODashboardAction] Error:", error)
    return { success: false, error: error.message || "Failed to load SEO dashboard data" }
  }
}

export async function getSEOContentEntitiesAction(filterType?: string) {
  try {
    await SessionService.requireAdmin()
    const items = await SEOService.getContentEntities(filterType)
    return { success: true, data: items }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load SEO content entities" }
  }
}

export async function getEntitySEOInspectionAction(entityType: string, entityId: string) {
  try {
    await SessionService.requireAdmin()
    const inspection = await SEOService.getEntityInspection(entityType, entityId)
    return { success: true, data: inspection }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load SEO inspection details" }
  }
}

export async function runFullSiteAuditAction() {
  try {
    await SessionService.requireAdmin()
    const result = await SEOService.runFullSiteAudit()
    revalidatePath("/admin/seo")
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message || "Site audit failed" }
  }
}

export async function bulkGenerateMetadataAction(entityType: string, entityIds: string[]) {
  try {
    await SessionService.requireAdmin()
    const result = await SEOService.bulkGenerateMetadata(entityType, entityIds)
    revalidatePath("/admin/seo")
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message || "Bulk metadata generation failed" }
  }
}

export async function getSEORedirectsAction() {
  try {
    await SessionService.requireAdmin()
    const redirects = await SEOService.getRedirects()
    return { success: true, data: redirects }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch redirects" }
  }
}

export async function createSEORedirectAction(input: any) {
  try {
    await SessionService.requireAdmin()
    const parsed = createRedirectSchema.parse(input)
    const created = await SEOService.createRedirect(parsed)
    revalidatePath("/admin/seo")
    return { success: true, data: created }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create redirect rule" }
  }
}

export async function deleteSEORedirectAction(id: string) {
  try {
    await SessionService.requireAdmin()
    await SEOService.deleteRedirect(id)
    revalidatePath("/admin/seo")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete redirect rule" }
  }
}

export async function getSEOSettingsAction() {
  try {
    await SessionService.requireAdmin()
    const settings = await SEOService.getSettings()
    return { success: true, data: settings }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch SEO settings" }
  }
}

export async function saveSEOSettingsAction(input: any) {
  try {
    await SessionService.requireAdmin()
    const saved = await SEOService.saveSettings(input)
    revalidatePath("/admin/seo")
    return { success: true, data: saved }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save SEO settings" }
  }
}

export async function connectGSCPropertyAction(propertyUrl: string) {
  try {
    await SessionService.requireAdmin()
    const result = await SEOService.saveGSCConnection(propertyUrl)
    revalidatePath("/admin/seo")
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to connect GSC property" }
  }
}
