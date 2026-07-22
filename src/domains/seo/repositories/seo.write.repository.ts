import { db } from "@/db/client"
import { products, collections, journalPosts, cmsPages, seoIssues, seoRedirects, appSettings } from "@/db/schema"
import { eq } from "drizzle-orm"

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
