import { SEOIndexingApiEngine } from "./indexing-api.engine"
import { SEOWriteRepository } from "../repositories/seo.write.repository"
import { SEOTemplateEngine } from "./template.engine"

export class SEOWorkflowEngine {
  public static async onEntityPublished(payload: { entityType: string; entityId: string; path: string }) {
    console.log(`[SEOWorkflowEngine] Entity published: ${payload.entityType} ${payload.path}`)

    // 1. Notify Search Engine Indexing API
    const fullUrl = `https://xinvora.com.np${payload.path}`
    const indexingResult = await SEOIndexingApiEngine.notifyAllSearchEngines({
      url: fullUrl,
      action: "URL_UPDATED",
    })

    return {
      success: true,
      action: "ENTITY_PUBLISHED_WORKFLOW",
      indexingResult,
    }
  }

  public static async onEntityDeleted(payload: { entityType: string; entityId: string; oldPath: string; redirectTargetUrl?: string }) {
    console.log(`[SEOWorkflowEngine] Entity deleted: ${payload.entityType} ${payload.oldPath}`)

    const targetUrl = payload.redirectTargetUrl || (payload.entityType === "PRODUCT" ? "/collections/all" : "/")

    // 1. Auto-create 301 Redirect Rule to prevent 404 broken links
    const redirectRule = await SEOWriteRepository.createRedirect({
      sourceUrl: payload.oldPath,
      targetUrl,
      statusCode: 301,
    }).catch(() => null)

    // 2. Notify Google Indexing API of URL removal
    const fullUrl = `https://xinvora.com.np${payload.oldPath}`
    const indexingResult = await SEOIndexingApiEngine.notifyAllSearchEngines({
      url: fullUrl,
      action: "URL_DELETED",
    })

    return {
      success: true,
      action: "ENTITY_DELETED_WORKFLOW",
      redirectRule,
      indexingResult,
    }
  }

  public static generateAutoImageAlt(entityName: string): string {
    return `${entityName} | Handcrafted Quiet Luxury | XINVORA`
  }
}
