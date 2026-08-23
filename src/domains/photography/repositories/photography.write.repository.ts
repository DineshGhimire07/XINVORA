import { db } from "@/db/client"
import { productAiIdentities, aiPromptTemplates, aiPromptVersions } from "@/db/schema"
import { eq, and, isNull } from "drizzle-orm"
import type { GarmentIdentity, IdentityStatus, MasterReferences } from "../contracts/identity.contract"
import type { PromptRoleSlug, PromptTemplateDefinition } from "../contracts/prompt.contract"

export class PhotographyWriteRepository {
  /**
   * Upserts master references for a product identity.
   */
  public static async saveMasterReferences(
    productId: string,
    variantId: string | null | undefined,
    references: MasterReferences
  ) {
    const existing = await db.query.productAiIdentities.findFirst({
      where: variantId
        ? and(eq(productAiIdentities.productId, productId), eq(productAiIdentities.variantId, variantId))
        : and(eq(productAiIdentities.productId, productId), isNull(productAiIdentities.variantId)),
    })

    if (existing) {
      if (existing.status === "LOCKED") {
        throw new Error("Cannot modify master references on a LOCKED product identity. Unlock first.")
      }

      const [updated] = await db
        .update(productAiIdentities)
        .set({
          masterFrontImageId: references.masterFrontImageId || null,
          masterFrontUrl: references.masterFrontUrl || null,
          masterBackImageId: references.masterBackImageId || null,
          masterBackUrl: references.masterBackUrl || null,
          detailImageIds: references.detailImageIds || [],
          detailUrls: references.detailUrls || [],
          updatedAt: new Date(),
        })
        .where(eq(productAiIdentities.id, existing.id))
        .returning()

      return updated
    }

    const [created] = await db
      .insert(productAiIdentities)
      .values({
        productId,
        variantId: variantId || null,
        status: "DRAFT",
        masterFrontImageId: references.masterFrontImageId || null,
        masterFrontUrl: references.masterFrontUrl || null,
        masterBackImageId: references.masterBackImageId || null,
        masterBackUrl: references.masterBackUrl || null,
        detailImageIds: references.detailImageIds || [],
        detailUrls: references.detailUrls || [],
      })
      .returning()

    return created
  }

  /**
   * Saves or updates structured Product Identity.
   */
  public static async saveProductIdentity(
    productId: string,
    variantId: string | null | undefined,
    identity: GarmentIdentity,
    rawOutput?: string
  ) {
    const existing = await db.query.productAiIdentities.findFirst({
      where: variantId
        ? and(eq(productAiIdentities.productId, productId), eq(productAiIdentities.variantId, variantId))
        : and(eq(productAiIdentities.productId, productId), isNull(productAiIdentities.variantId)),
    })

    if (existing) {
      if (existing.status === "LOCKED") {
        throw new Error("Cannot modify a LOCKED product identity. Explicitly unlock it first.")
      }

      const [updated] = await db
        .update(productAiIdentities)
        .set({
          structuredIdentity: identity,
          rawIdentificationOutput: rawOutput || existing.rawIdentificationOutput,
          status: existing.status === "DRAFT" ? "REVIEWED" : existing.status,
          updatedAt: new Date(),
        })
        .where(eq(productAiIdentities.id, existing.id))
        .returning()

      return updated
    }

    const [created] = await db
      .insert(productAiIdentities)
      .values({
        productId,
        variantId: variantId || null,
        status: "REVIEWED",
        structuredIdentity: identity,
        rawIdentificationOutput: rawOutput || null,
      })
      .returning()

    return created
  }

  /**
   * Sets the identity status (DRAFT, REVIEWED, LOCKED).
   */
  public static async setIdentityStatus(
    productId: string,
    variantId: string | null | undefined,
    status: IdentityStatus
  ) {
    const existing = await db.query.productAiIdentities.findFirst({
      where: variantId
        ? and(eq(productAiIdentities.productId, productId), eq(productAiIdentities.variantId, variantId))
        : and(eq(productAiIdentities.productId, productId), isNull(productAiIdentities.variantId)),
    })

    if (!existing) {
      throw new Error("Product AI Identity record not found.")
    }

    const [updated] = await db
      .update(productAiIdentities)
      .set({
        status,
        lockedAt: status === "LOCKED" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(productAiIdentities.id, existing.id))
      .returning()

    return updated
  }

  /**
   * Saves a new version of a prompt template.
   */
  public static async savePromptTemplateVersion(
    roleSlug: PromptRoleSlug,
    name: string,
    newVersion: string,
    templateText: string,
    changelog?: string
  ) {
    let template = await db.query.aiPromptTemplates.findFirst({
      where: eq(aiPromptTemplates.roleSlug, roleSlug),
    })

    if (!template) {
      const [newT] = await db
        .insert(aiPromptTemplates)
        .values({
          roleSlug,
          name,
          activeVersion: newVersion,
          templateText,
        })
        .returning()
      template = newT
    } else {
      await db
        .update(aiPromptTemplates)
        .set({
          activeVersion: newVersion,
          templateText,
          updatedAt: new Date(),
        })
        .where(eq(aiPromptTemplates.id, template.id))
    }

    await db.insert(aiPromptVersions).values({
      templateId: template.id,
      version: newVersion,
      templateText,
      changelog: changelog || null,
    })

    return template
  }
}
