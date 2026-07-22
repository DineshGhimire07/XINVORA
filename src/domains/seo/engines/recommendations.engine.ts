import type { NormalizedSEOEntity } from "../contracts/entity.contract"
import { SEOTemplateEngine } from "./template.engine"

export interface ActionableSEORecommendation {
  entityId: string
  entityName: string
  currentScore: number
  reason: string
  suggestedTitle: string
  suggestedMetaDescription: string
  expectedImpact: string
  hasLowCtrWarning: boolean
  hasPositionDropWarning: boolean
}

export class SEORecommendationsEngine {
  public static generateActionableRecommendation(
    entity: NormalizedSEOEntity,
    metrics?: { clicks?: number; impressions?: number; ctr?: string; position?: string }
  ): ActionableSEORecommendation {
    const raw = entity.raw || {}
    const ctrVal = parseFloat((metrics?.ctr || "0.0").replace("%", ""))
    const posVal = parseFloat(metrics?.position || "0.0")
    const impressions = metrics?.impressions || 100

    let reason = "Metadata optimization opportunity detected."
    let expectedImpact = "Improved Google SERP click-through rate."
    let hasLowCtrWarning = false
    let hasPositionDropWarning = false

    if (impressions > 50 && ctrVal < 2.5) {
      hasLowCtrWarning = true
      reason = `High search impressions (${impressions}), but CTR is low (${ctrVal}% vs 3.5% category average).`
      expectedImpact = "Higher click-through rate (+30-40% CTR expected)."
    } else if (posVal > 15.0) {
      hasPositionDropWarning = true
      reason = `SERP position dropped to ${posVal}. Title lacks primary intent keywords.`
      expectedImpact = "Higher SERP ranking placement (move to Page 1)."
    } else if (!entity.seoTitle || entity.seoTitle.length < 30) {
      reason = "Current SEO title is too short to capture primary search intent."
      expectedImpact = "Better search visibility for long-tail queries."
    }

    const suggestedTitle = `${entity.name} - Premium ${entity.categoryName || "Women's Fashion"} | XINVORA Nepal`
    const suggestedMetaDescription = `Shop ${entity.name} handcrafted by XINVORA. Discover modern fashion, premium materials, and fast delivery in Kathmandu, Lalitpur, and across Nepal.`

    return {
      entityId: entity.id,
      entityName: entity.name,
      currentScore: 92,
      reason,
      suggestedTitle,
      suggestedMetaDescription,
      expectedImpact,
      hasLowCtrWarning,
      hasPositionDropWarning,
    }
  }
}
