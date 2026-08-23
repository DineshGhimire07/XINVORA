import { db } from "@/db/client"
import { productAiIdentities, aiPromptTemplates } from "@/db/schema"
import { eq, and, isNull } from "drizzle-orm"
import type { GarmentIdentity, IdentityStatus, MasterReferences } from "../contracts/identity.contract"
import type { PromptRoleSlug, PromptTemplateDefinition } from "../contracts/prompt.contract"
import { TemplateRegistryEngine } from "../engines/template-registry.engine"

export class PhotographyReadRepository {
  /**
   * Fetches the AI identity record for a product (and optional variant).
   */
  public static async getProductIdentity(productId: string, variantId?: string | null) {
    try {
      const whereClause = variantId
        ? and(eq(productAiIdentities.productId, productId), eq(productAiIdentities.variantId, variantId))
        : and(eq(productAiIdentities.productId, productId), isNull(productAiIdentities.variantId))

      const record = await db.query.productAiIdentities.findFirst({
        where: whereClause,
      })

      if (!record) return null

      return {
        id: record.id,
        productId: record.productId,
        variantId: record.variantId,
        status: record.status as IdentityStatus,
        masterFrontImageId: record.masterFrontImageId,
        masterFrontUrl: record.masterFrontUrl,
        masterBackImageId: record.masterBackImageId,
        masterBackUrl: record.masterBackUrl,
        detailImageIds: record.detailImageIds || [],
        detailUrls: record.detailUrls || [],
        structuredIdentity: record.structuredIdentity as GarmentIdentity | null,
        rawIdentificationOutput: record.rawIdentificationOutput,
        lockedAt: record.lockedAt,
        updatedAt: record.updatedAt,
      }
    } catch (err) {
      console.error("[PhotographyReadRepository.getProductIdentity] Error:", err)
      return null
    }
  }

  /**
   * Fetches active prompt template definitions, falling back to static canonical registry.
   */
  public static async getPromptTemplate(roleSlug: PromptRoleSlug): Promise<PromptTemplateDefinition> {
    try {
      const dbTemplate = await db.query.aiPromptTemplates.findFirst({
        where: eq(aiPromptTemplates.roleSlug, roleSlug),
      })

      if (dbTemplate) {
        return {
          roleSlug: dbTemplate.roleSlug as PromptRoleSlug,
          name: dbTemplate.name,
          version: dbTemplate.activeVersion,
          description: dbTemplate.name,
          templateText: dbTemplate.templateText,
          defaultPhotographyDirection: dbTemplate.defaultPhotographyDirection || undefined,
          defaultBackgroundDirection: dbTemplate.defaultBackgroundDirection || undefined,
          defaultCameraDirection: dbTemplate.defaultCameraDirection || undefined,
          defaultLightingDirection: dbTemplate.defaultLightingDirection || undefined,
          defaultModelDirection: dbTemplate.defaultModelDirection || undefined,
          defaultPoseDirection: dbTemplate.defaultPoseDirection || undefined,
          defaultEnvironmentDirection: dbTemplate.defaultEnvironmentDirection || undefined,
        }
      }
    } catch (err) {
      console.warn("[PhotographyReadRepository.getPromptTemplate] DB read failed, falling back to static canonical:", err)
    }

    return TemplateRegistryEngine.getTemplate(roleSlug)
  }

  /**
   * Fetches all 7 prompt templates.
   */
  public static async getAllPromptTemplates(): Promise<Record<PromptRoleSlug, PromptTemplateDefinition>> {
    const roles: PromptRoleSlug[] = [
      "garment_identification",
      "product_front",
      "product_back",
      "model_front",
      "model_back",
      "lifestyle",
      "detail_closeup",
      "color_transfer",
    ]

    const result: Partial<Record<PromptRoleSlug, PromptTemplateDefinition>> = {}
    for (const r of roles) {
      result[r] = await this.getPromptTemplate(r)
    }
    return result as Record<PromptRoleSlug, PromptTemplateDefinition>
  }
}
