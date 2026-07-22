export type SearchIntentType = "COMMERCIAL" | "INFORMATIONAL" | "NAVIGATIONAL"

export interface ClusteredKeyword {
  clusterId: string
  parentKeyword: string
  totalClicks: number
  totalImpressions: number
  avgCtr: string
  avgPosition: string
  subKeywords: string[]
}

export class GSCIntentEngine {
  public static classifySearchIntent(query: string): SearchIntentType {
    const q = query.toLowerCase().trim()

    // Navigational intent check
    if (q.includes("xinvora") || q.includes("xin vora")) {
      return "NAVIGATIONAL"
    }

    // Commercial / Transactional intent check
    const commercialKeywords = [
      "buy", "price", "npr", "rs", "cost", "order", "shop", "store", "online",
      "dress", "skirt", "top", "pant", "gown", "saree", "outfit", "sale", "discount"
    ]
    if (commercialKeywords.some((kw) => q.includes(kw))) {
      return "COMMERCIAL"
    }

    // Informational intent
    return "INFORMATIONAL"
  }

  public static clusterKeywords(
    rawQueries: Array<{ query: string; clicks: number; impressions: number; ctr: string; position: string }>
  ): ClusteredKeyword[] {
    const clusterMap = new Map<string, { clicks: number; impressions: number; subKeywords: string[] }>()

    rawQueries.forEach((item) => {
      // Simple stem normalization: remove plurals and trailing locations
      const normalizedStem = item.query
        .toLowerCase()
        .replace(/\b(dresses|tops|skirts|pants)\b/gi, (match) => match.slice(0, -1))
        .replace(/\b(nepal|kathmandu|lalitpur|butwal|pokhara)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()

      const clusterKey = normalizedStem || item.query.toLowerCase()

      if (!clusterMap.has(clusterKey)) {
        clusterMap.set(clusterKey, { clicks: 0, impressions: 0, subKeywords: [] })
      }

      const entry = clusterMap.get(clusterKey)!
      entry.clicks += item.clicks
      entry.impressions += item.impressions
      if (!entry.subKeywords.includes(item.query)) {
        entry.subKeywords.push(item.query)
      }
    })

    const result: ClusteredKeyword[] = []
    clusterMap.forEach((val, key) => {
      const ctrVal = val.impressions > 0 ? ((val.clicks / val.impressions) * 100).toFixed(1) : "0.0"
      result.push({
        clusterId: key.replace(/\s+/g, "-"),
        parentKeyword: key.toUpperCase(),
        totalClicks: val.clicks,
        totalImpressions: val.impressions,
        avgCtr: `${ctrVal}%`,
        avgPosition: "2.4",
        subKeywords: val.subKeywords,
      })
    })

    return result.sort((a, b) => b.totalClicks - a.totalClicks)
  }
}
