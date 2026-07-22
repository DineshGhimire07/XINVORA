export interface RedirectRuleItem {
  id: string
  sourceUrl: string
  targetUrl: string
  statusCode: number
  isActive: boolean
}

export class SEORedirectEngine {
  private static cache: Map<string, RedirectRuleItem> = new Map()
  private static lastUpdated: number = 0
  private static TTL: number = 60 * 1000 // 1 minute in-memory cache

  public static setCache(rules: RedirectRuleItem[]) {
    this.cache.clear()
    rules.forEach((r) => {
      if (r.isActive) {
        this.cache.set(this.normalizeUrl(r.sourceUrl), r)
      }
    })
    this.lastUpdated = Date.now()
  }

  public static matchRedirect(url: string): RedirectRuleItem | null {
    if (this.cache.size === 0) return null
    const normalized = this.normalizeUrl(url)
    return this.cache.get(normalized) || null
  }

  public static isCacheStale(): boolean {
    return Date.now() - this.lastUpdated > this.TTL
  }

  public static normalizeUrl(url: string): string {
    if (!url) return "/"
    let clean = url.toLowerCase().trim()
    if (!clean.startsWith("/")) clean = "/" + clean
    if (clean.length > 1 && clean.endsWith("/")) clean = clean.slice(0, -1)
    return clean
  }
}
