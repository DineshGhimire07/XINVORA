import { db } from "@/db/client"
import { products, collections, journalPosts, cmsPages, seoIssues, seoRedirects, appSettings, productImages } from "@/db/schema"
import { eq } from "drizzle-orm"
import { SEOReadRepository } from "./seo.read.repository"
import { SEOTemplateEngine } from "../engines/template.engine"
import type { NormalizedSEOEntity } from "../contracts/entity.contract"

export function extractSmartEntityName(entity?: NormalizedSEOEntity | null): string {
  if (!entity) return "Product Image"

  const raw = entity.raw || {}
  const title = (entity.name || "").trim()
  const seoTitle = (entity.seoTitle || "").trim()
  const description = (raw.description || raw.shortDescription || entity.seoDescription || "").trim()

  // Check if current name is generic or short (e.g. "x", "test", "dress", "product", "item", length < 5)
  const isGenericTitle =
    !title ||
    title.length < 5 ||
    /^(x|test|dress|product|item|sample|untitled|new product|dress 1)$/i.test(title)

  if (isGenericTitle) {
    // 1. Check if SEO title is descriptive
    if (seoTitle && seoTitle.length >= 5 && !/^(x|test|dress|product)$/i.test(seoTitle)) {
      return seoTitle.split("|")[0].trim()
    }

    // 2. Extract first sentence or title phrase from description
    if (description && description.length > 5) {
      const cleanDesc = description.replace(/<[^>]*>?/gm, "").trim()
      const match = cleanDesc.match(/^([^.!\n?]+)/)
      if (match && match[1] && match[1].trim().length >= 5) {
        let extracted = match[1].trim()
        if (extracted.length > 70) extracted = extracted.slice(0, 70).trim()
        return extracted
      }
    }
  }

  return title || "Product Image"
}

export class SEOWriteRepository {
  public static async createRedirect(data: { sourceUrl: string; targetUrl: string; statusCode?: number }) {
    try {
      const [created] = await db
        .insert(seoRedirects)
        .values({
          sourceUrl: data.sourceUrl,
          targetUrl: data.targetUrl,
          statusCode: data.statusCode || 301,
          isActive: true,
        })
        .returning()
      return created
    } catch (err) {
      console.error("[SEOWriteRepository.createRedirect] Error:", err)
      throw err
    }
  }

  public static async deleteRedirect(id: string) {
    try {
      return await db.delete(seoRedirects).where(eq(seoRedirects.id, id))
    } catch (err) {
      console.error("[SEOWriteRepository.deleteRedirect] Error:", err)
      throw err
    }
  }

  public static async updateEntityMetadata(
    entityType: string,
    entityId: string,
    metadata: { seoTitle?: string; seoDescription?: string; canonicalUrl?: string; ogImage?: string }
  ) {
    try {
      switch (entityType) {
        case "PRODUCT":
          return await db
            .update(products)
            .set({
              seoTitle: metadata.seoTitle,
              seoDescription: metadata.seoDescription,
              updatedAt: new Date(),
            })
            .where(eq(products.id, entityId))

        case "COLLECTION":
          return await db
            .update(collections)
            .set({
              seoTitle: metadata.seoTitle,
              seoDescription: metadata.seoDescription,
              updatedAt: new Date(),
            })
            .where(eq(collections.id, entityId))

        case "JOURNAL":
          return await db
            .update(journalPosts)
            .set({
              seoTitle: metadata.seoTitle,
              metaDescription: metadata.seoDescription,
              canonicalUrl: metadata.canonicalUrl,
              ogImage: metadata.ogImage,
              updatedAt: new Date(),
            })
            .where(eq(journalPosts.id, entityId))

        case "CMS_PAGE":
          return await db
            .update(cmsPages)
            .set({
              seoTitle: metadata.seoTitle,
              seoDescription: metadata.seoDescription,
              updatedAt: new Date(),
            })
            .where(eq(cmsPages.id, entityId))
      }
    } catch (err) {
      console.error("[SEOWriteRepository.updateEntityMetadata] Error:", err)
      throw err
    }
  }

  public static async replaceIssues(issues: any[]) {
    try {
      return await db.transaction(async (tx) => {
        await tx
          .update(seoIssues)
          .set({ status: "RESOLVED", resolvedAt: new Date() })
          .where(eq(seoIssues.status, "OPEN"))

        if (issues.length === 0) return

        for (const issue of issues) {
          await tx.insert(seoIssues).values({
            entityType: issue.entityType,
            entityId: issue.entityId,
            ruleId: issue.ruleId,
            category: issue.category,
            severity: issue.severity,
            message: issue.message,
            impact: issue.impact,
            fixStrategies: issue.fixStrategies || [],
            status: "OPEN",
          })
        }
      })
    } catch (err) {
      console.error("[SEOWriteRepository.replaceIssues] Error:", err)
    }
  }

  public static async fixIssue(issueId: string) {
    try {
      const issue = await db.query.seoIssues.findFirst({
        where: eq(seoIssues.id, issueId),
      })

      if (!issue) return { success: false, message: "Issue record not found" }

      const entity = await SEOReadRepository.getEntityById(issue.entityType, issue.entityId)
      const smartName = extractSmartEntityName(entity)

      if (issue.ruleId === "missing_image_alt") {
        if (issue.entityType === "PRODUCT") {
          await db
            .update(productImages)
            .set({ altText: smartName })
            .where(eq(productImages.productId, issue.entityId))
        }
      } else if (issue.ruleId === "missing_title") {
        if (entity) {
          const generatedTitle = `${smartName} | XINVORA`
          await this.updateEntityMetadata(issue.entityType, issue.entityId, { seoTitle: generatedTitle })
        }
      } else if (issue.ruleId === "missing_meta_description") {
        if (entity) {
          const generatedDesc = SEOTemplateEngine.generateDefaultDescription({
            ...entity,
            name: smartName,
          })
          await this.updateEntityMetadata(issue.entityType, issue.entityId, { seoDescription: generatedDesc })
        }
      } else if (issue.ruleId === "missing_canonical") {
        if (entity) {
          await this.updateEntityMetadata(issue.entityType, issue.entityId, { canonicalUrl: entity.canonicalUrl || entity.path })
        }
      }

      // Mark issue as RESOLVED
      await db
        .update(seoIssues)
        .set({ status: "RESOLVED", resolvedAt: new Date() })
        .where(eq(seoIssues.id, issueId))

      return { success: true, message: `Successfully resolved ${issue.message} using '${smartName}'` }
    } catch (err: any) {
      console.error("[SEOWriteRepository.fixIssue] Error:", err)
      return { success: false, message: err.message || "Failed to fix issue" }
    }
  }

  public static async saveSEOSettings(settings: any) {
    try {
      const existing = await db
        .select()
        .from(appSettings)
        .where(eq(appSettings.key, "seo_settings"))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(appSettings)
          .set({ value: settings as any, updatedAt: new Date() })
          .where(eq(appSettings.key, "seo_settings"))
      } else {
        await db.insert(appSettings).values({
          key: "seo_settings",
          value: settings as any,
        })
      }
      return settings
    } catch (err) {
      console.error("[SEOWriteRepository.saveSEOSettings] Error:", err)
      return settings
    }
  }

  public static async recordAuditHistory(overallScore: number, indexedPages: number, issuesSnapshot: any, improvementsLog: any[]) {
    try {
      const [record] = await db
        .insert(seoIssues)
        .values({
          entityType: "SYSTEM",
          entityId: "AUDIT",
          ruleId: "AUDIT_SNAPSHOT",
          category: "MONITORING",
          severity: "LOW",
          message: `Audit completed with overall score ${overallScore}`,
          status: "RESOLVED",
        })
        .returning()
      return record
    } catch (err) {
      console.error("[SEOWriteRepository.recordAuditHistory] Error:", err)
      return null
    }
  }
}
