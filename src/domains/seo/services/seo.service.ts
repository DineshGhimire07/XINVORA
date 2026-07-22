import { SEOReadRepository } from "../repositories/seo.read.repository"
import { SEOWriteRepository } from "../repositories/seo.write.repository"
import { SEOScoreEngine } from "../engines/score.engine"
import { SEOTemplateEngine } from "../engines/template.engine"
import { SEOSitemapEngine } from "../engines/sitemap.engine"
import { SEORobotsEngine } from "../engines/robots.engine"
import { SEOSchemaEngine } from "../engines/schema.engine"
import { SEORedirectEngine } from "../engines/redirect.engine"
import { SEOAuditEngine } from "../engines/audit.engine"

export class SEOService {
  public static async getDashboardOverview() {
    const [entities, issues, redirects, auditHistory, settings, gscData] = await Promise.all([
      SEOReadRepository.getAllEntities(),
      SEOReadRepository.getIssues("OPEN"),
      SEOReadRepository.getRedirects(),
      SEOReadRepository.getAuditHistory(10),
      SEOReadRepository.getSEOSettings(),
      SEOReadRepository.getSearchConsoleAnalytics(),
    ])

    // Update redirect cache
    SEORedirectEngine.setCache(redirects)

    // Calculate score report for each entity
    const scoreReports = entities.map((e) => ({
      entity: e,
      report: SEOScoreEngine.calculateEntityScore(e),
    }))

    const totalScoreSum = scoreReports.reduce((acc, curr) => acc + curr.report.score, 0)
    const overallScore = entities.length > 0 ? Math.round(totalScoreSum / entities.length) : 100

    const indexedCount = entities.filter((e) => e.isIndexed).length
    const productsCount = entities.filter((e) => e.entityType === "PRODUCT").length
    const collectionsCount = entities.filter((e) => e.entityType === "COLLECTION").length
    const journalCount = entities.filter((e) => e.entityType === "JOURNAL").length
    const cmsCount = entities.filter((e) => e.entityType === "CMS_PAGE").length

    const highIssuesCount = issues.filter((i) => i.severity === "HIGH").length
    const mediumIssuesCount = issues.filter((i) => i.severity === "MEDIUM").length
    const lowIssuesCount = issues.filter((i) => i.severity === "LOW").length

    return {
      overallScore,
      indexedCount,
      totalCount: entities.length,
      entityCounts: {
        products: productsCount,
        collections: collectionsCount,
        journal: journalCount,
        cmsPages: cmsCount,
      },
      issues: {
        open: issues,
        high: highIssuesCount,
        medium: mediumIssuesCount,
        low: lowIssuesCount,
      },
      redirectsCount: redirects.length,
      recentAuditHistory: auditHistory,
      settings,
      searchConsole: gscData,
    }
  }

  public static async getContentEntities(filterType?: string) {
    const entities = await SEOReadRepository.getAllEntities()
    let filtered = entities
    if (filterType && filterType !== "ALL") {
      filtered = entities.filter((e) => e.entityType === filterType)
    }

    return filtered.map((e) => {
      const scoreReport = SEOScoreEngine.calculateEntityScore(e)
      return {
        ...e,
        seoScore: scoreReport.score,
        scoreGrade: scoreReport.grade,
        scoreBreakdown: scoreReport.breakdown,
      }
    })
  }

  public static async getEntityInspection(entityType: string, entityId: string) {
    const entity = await SEOReadRepository.getEntityById(entityType, entityId)
    if (!entity) return null

    const report = SEOScoreEngine.calculateEntityScore(entity)
    const schema = SEOSchemaEngine.generateJSONLD("https://xinvora.com", entity)

    return {
      entity,
      report,
      schema,
    }
  }

  public static async runFullSiteAudit() {
    const entities = await SEOReadRepository.getAllEntities()
    const allIssues: any[] = []

    for (const entity of entities) {
      const results = SEOAuditEngine.evaluateEntity(entity)
      allIssues.push(...results)
    }

    await SEOWriteRepository.replaceIssues(allIssues)

    const totalScoreSum = entities.reduce((acc, curr) => acc + SEOScoreEngine.calculateEntityScore(curr).score, 0)
    const overallScore = entities.length > 0 ? Math.round(totalScoreSum / entities.length) : 100
    const indexedCount = entities.filter((e) => e.isIndexed).length

    await SEOWriteRepository.recordAuditHistory(overallScore, indexedCount, { issuesCount: allIssues.length }, [
      { timestamp: new Date().toISOString(), message: `Full site audit completed. Discovered ${allIssues.length} issues.` },
    ])

    return {
      totalEntitiesScanned: entities.length,
      totalIssuesDiscovered: allIssues.length,
      overallScore,
    }
  }

  public static async bulkGenerateMetadata(entityType: string, entityIds: string[]) {
    let count = 0
    for (const id of entityIds) {
      const entity = await SEOReadRepository.getEntityById(entityType, id)
      if (entity) {
        const generatedTitle = SEOTemplateEngine.generateDefaultTitle(entity)
        const generatedDesc = SEOTemplateEngine.generateDefaultDescription(entity)
        await SEOWriteRepository.updateEntityMetadata(entityType, id, {
          seoTitle: generatedTitle,
          seoDescription: generatedDesc,
          canonicalUrl: entity.canonicalUrl || entity.path,
        })
        count++
      }
    }
    return { updatedCount: count }
  }

  public static async getRedirects() {
    return await SEOReadRepository.getRedirects()
  }

  public static async createRedirect(data: { sourceUrl: string; targetUrl: string; statusCode?: number }) {
    const created = await SEOWriteRepository.createRedirect(data)
    const all = await SEOReadRepository.getRedirects()
    SEORedirectEngine.setCache(all)
    return created
  }

  public static async deleteRedirect(id: string) {
    await SEOWriteRepository.deleteRedirect(id)
    const all = await SEOReadRepository.getRedirects()
    SEORedirectEngine.setCache(all)
    return { success: true }
  }

  public static async getSettings() {
    return await SEOReadRepository.getSEOSettings()
  }

  public static async saveSettings(settings: any) {
    return await SEOWriteRepository.saveSEOSettings(settings)
  }

  public static async getSearchConsoleAnalytics() {
    return await SEOReadRepository.getSearchConsoleAnalytics()
  }

  public static async saveGSCConnection(propertyUrl: string) {
    const currentSettings = await SEOReadRepository.getSEOSettings()
    const updated = {
      ...currentSettings,
      gscPropertyUrl: propertyUrl,
      gscConnected: true,
    }
    await SEOWriteRepository.saveSEOSettings(updated)
    return { success: true, propertyUrl }
  }

  public static async generateSitemapIndexXML(baseUrl: string) {
    return SEOSitemapEngine.generateSitemapIndexXML(baseUrl)
  }

  public static async generateEntitySitemapXML(options: { baseUrl: string; entityType: string }) {
    const { baseUrl, entityType } = options
    const all = await SEOReadRepository.getAllEntities()
    let filtered = all.filter((e) => e.isIndexed)

    if (entityType === "products") filtered = filtered.filter((e) => e.entityType === "PRODUCT")
    else if (entityType === "collections") filtered = filtered.filter((e) => e.entityType === "COLLECTION")
    else if (entityType === "journal") filtered = filtered.filter((e) => e.entityType === "JOURNAL")
    else if (entityType === "cms") filtered = filtered.filter((e) => e.entityType === "CMS_PAGE")

    return SEOSitemapEngine.generateEntitySitemapXML(baseUrl, filtered)
  }

  public static async generateRobotsTxt(options: { baseUrl: string; environment?: string }) {
    const settings = await SEOReadRepository.getSEOSettings()
    return SEORobotsEngine.generateRobotsTxt({
      baseUrl: options.baseUrl,
      environment: options.environment,
      customRules: settings.robotsDefaults,
    })
  }
}
