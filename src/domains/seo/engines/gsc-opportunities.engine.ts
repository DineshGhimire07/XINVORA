export interface KeywordOpportunity {
  query: string
  clicks: number
  impressions: number
  ctr: string
  position: number
  type: "STRIKING_DISTANCE" | "HIGH_IMPRESSION_LOW_CTR" | "TOP_CONVERTER"
  recommendation: string
}

export class GSCOpportunityEngine {
  public static detectOpportunities(
    queries: Array<{ query: string; clicks: number; impressions: number; ctr: string; position: string }>
  ): KeywordOpportunity[] {
    const opportunities: KeywordOpportunity[] = []

    queries.forEach((q) => {
      const pos = parseFloat(q.position) || 0
      const ctrVal = parseFloat(q.ctr.replace("%", "")) || 0

      // 1. Striking Distance Opportunities (Positions 8.0 to 15.0)
      if (pos >= 8.0 && pos <= 15.0) {
        opportunities.push({
          query: q.query,
          clicks: q.clicks,
          impressions: q.impressions,
          ctr: q.ctr,
          position: pos,
          type: "STRIKING_DISTANCE",
          recommendation: `Currently on Page 2 (Pos ${pos}). Add 2 internal links and include in H2 title to move to Page 1.`,
        })
      }

      // 2. High Impression + Low CTR Opportunities (Impressions > 50, CTR < 2%)
      else if (q.impressions >= 50 && ctrVal < 2.0) {
        opportunities.push({
          query: q.query,
          clicks: q.clicks,
          impressions: q.impressions,
          ctr: q.ctr,
          position: pos,
          type: "HIGH_IMPRESSION_LOW_CTR",
          recommendation: `High impressions (${q.impressions}) but low CTR (${q.ctr}). Rewrite title tag to add action word.`,
        })
      }
    })

    return opportunities
  }
}
