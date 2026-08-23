"use server"

import { SessionService } from "@/services/session.service"
import { PhotographyService } from "@/domains/photography/services/photography.service"
import { revalidatePath } from "next/cache"
import type { GarmentIdentity, IdentityStatus, MasterReferences } from "@/domains/photography/contracts/identity.contract"
import type { PhotographyVariables } from "@/domains/photography/contracts/prompt.contract"

/**
 * Server action to fetch prompt studio state for a product.
 */
export async function getPhotographyStudioStateAction(productId: string, variantId?: string | null) {
  try {
    await SessionService.requireAdmin()
    const state = await PhotographyService.getStudioState(productId, variantId)
    return { success: true, data: state }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to load photography studio state" }
  }
}

/**
 * Server action to save Master References.
 */
export async function saveMasterReferencesAction(
  productId: string,
  variantId: string | null | undefined,
  references: MasterReferences
) {
  try {
    await SessionService.requireAdmin()
    const updated = await PhotographyService.saveMasterReferences(productId, variantId, references)
    revalidatePath(`/admin/products/${productId}`)
    return { success: true, data: updated }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save master references" }
  }
}

/**
 * Server action to parse raw Prompt 01 output.
 */
export async function parseRawIdentityAction(rawText: string) {
  try {
    await SessionService.requireAdmin()
    const result = PhotographyService.parseRawIdentity(rawText)
    return result
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to parse identity" }
  }
}

/**
 * Server action to save structured Product Identity.
 */
export async function saveProductIdentityAction(
  productId: string,
  variantId: string | null | undefined,
  identity: GarmentIdentity,
  rawOutput?: string
) {
  try {
    await SessionService.requireAdmin()
    const updated = await PhotographyService.saveProductIdentity(productId, variantId, identity, rawOutput)
    revalidatePath(`/admin/products/${productId}`)
    return { success: true, data: updated }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save product identity" }
  }
}

/**
 * Server action to set identity status (DRAFT, REVIEWED, LOCKED).
 */
export async function setIdentityStatusAction(
  productId: string,
  variantId: string | null | undefined,
  status: IdentityStatus
) {
  try {
    await SessionService.requireAdmin()
    const updated = await PhotographyService.setIdentityStatus(productId, variantId, status)
    revalidatePath(`/admin/products/${productId}`)
    return { success: true, data: updated }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update identity status" }
  }
}

/**
 * Server action to compile prompt deterministically.
 */
export async function compilePhotographyPromptAction(variables: PhotographyVariables) {
  try {
    await SessionService.requireAdmin()
    const compiled = await PhotographyService.compilePrompt(variables)
    return { success: true, data: compiled }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to compile photography prompt" }
  }
}
