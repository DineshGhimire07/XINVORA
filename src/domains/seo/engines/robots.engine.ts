export interface RobotsOptions {
  baseUrl: string
  environment?: string
  customRules?: string
}

export class SEORobotsEngine {
  public static generateRobotsTxt(options: RobotsOptions): string {
    const { baseUrl, environment = process.env.NODE_ENV || "development", customRules } = options

    if (customRules && customRules.trim().length > 0) {
      return customRules.trim()
    }

    const isStaging = environment === "staging" || environment === "preview"

    if (isStaging) {
      return `# XINVORA Staging Environment - Disallow Indexing
User-agent: *
Disallow: /
`
    }

    return `# XINVORA Enterprise SEO Robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /account/
Disallow: /cart

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
`
  }
}
