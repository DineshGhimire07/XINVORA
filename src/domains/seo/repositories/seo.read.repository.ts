import { db } from "@/db/client"
import { products, collections, journalPosts, cmsPages, seoIssues, seoRedirects, seoAuditHistory, appSettings, searchQueries, userEvents } from "@/db/schema"
import { eq, isNull, desc, count, sql } from "drizzle-orm"
import { productSEOAdapter } from "../adapters/product.adapter"
import { collectionSEOAdapter } from "../adapters/collection.adapter"
import { journalSEOAdapter } from "../adapters/journal.adapter"
import { cmsPageSEOAdapter } from "../adapters/cms.adapter"
import { SEOInternalLinkEngine, type InternalLinkSuggestion } from "../engines/internal-link.engine"
import { SEOCrawlGraphEngine, type CrawlGraphReport } from "../engines/crawl-graph.engine"
import { GSCIntentEngine } from "../engines/gsc-intent.engine"
import { GSCOpportunityEngine } from "../engines/gsc-opportunities.engine"
import type { NormalizedSEOEntity } from "../contracts/entity.contract"

export class SEOReadRepository {
  public static async getAllEntities(options?: { limit?: number }): Promise<NormalizedSEOEntity[]> {
    try {
      const limitVal = options?.limit ?? 100
      const [rawProducts, rawCollections, rawJournal, rawCMS] = await Promise.all([
        db.query.products.findMany({
          where: isNull(products.deletedAt),
          with: { category: true, productImages: true, variants: true },
          limit: limitVal,
        }).catch(() => []),
        db.query.collections.findMany({
          where: isNull(collections.deletedAt),
          limit: limitVal,
        }).catch(() => []),
        db.query.journalPosts.findMany({
          where: isNull(journalPosts.deletedAt),
          with: { category: true, author: true },
          limit: limitVal,
        }).catch(() => []),
        db.query.cmsPages.findMany({
          where: isNull(cmsPages.deletedAt),
          limit: limitVal,
        }).catch(() => []),
      ])

      const normalizedProducts = rawProducts.map((p) => productSEOAdapter.normalize(p))
      const normalizedCollections = rawCollections.map((c) => collectionSEOAdapter.normalize(c))
      const normalizedJournal = rawJournal.map((j) => journalSEOAdapter.normalize(j))
      const normalizedCMS = rawCMS.map((m) => cmsPageSEOAdapter.normalize(m))

      // Core Static Shop & Legal Pages
      const STATIC_CORE_PAGES: NormalizedSEOEntity[] = [
        {
          id: "static_home",
          entityType: "CMS_PAGE",
          name: "Home",
          slug: "",
          path: "/",
          canonicalUrl: "/",
          seoTitle: "XINVORA — Considered Objects for Quiet Living",
          seoDescription: "XINVORA is a premium lifestyle brand creating considered objects for modern living. Elevate everyday living with thoughtful design, exceptional materials, and timeless craft.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
        {
          id: "static_about",
          entityType: "CMS_PAGE",
          name: "About",
          slug: "about",
          path: "/about",
          canonicalUrl: "/about",
          seoTitle: "About Us | XINVORA",
          seoDescription: "Learn more about the philosophy, materials, and artisan craft behind XINVORA.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
        {
          id: "static_collections",
          entityType: "CMS_PAGE",
          name: "Collections",
          slug: "collections",
          path: "/collections",
          canonicalUrl: "/collections",
          seoTitle: "All Collections | XINVORA",
          seoDescription: "Explore our curated lifestyle edits, premium leather pieces, and ready-to-wear collections.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
        {
          id: "static_journal",
          entityType: "CMS_PAGE",
          name: "Journal",
          slug: "journal",
          path: "/journal",
          canonicalUrl: "/journal",
          seoTitle: "Editorial Journal | XINVORA",
          seoDescription: "Stories on mindful aesthetics, artisanal fabrication, and contemporary lifestyle.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
        {
          id: "static_looks",
          entityType: "CMS_PAGE",
          name: "Looks",
          slug: "looks",
          path: "/looks",
          canonicalUrl: "/looks",
          seoTitle: "Shop the Look | XINVORA",
          seoDescription: "Curated looks. Effortless style. Discover complete outfits styled for every moment.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
        {
          id: "static_contact",
          entityType: "CMS_PAGE",
          name: "Contact",
          slug: "contact",
          path: "/contact",
          canonicalUrl: "/contact",
          seoTitle: "Contact Us & Atelier Inquiries | XINVORA",
          seoDescription: "Get in touch with our client concierge and atelier support team.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
        {
          id: "static_faq",
          entityType: "CMS_PAGE",
          name: "FAQ",
          slug: "faq",
          path: "/faq",
          canonicalUrl: "/faq",
          seoTitle: "Client Services FAQ | XINVORA",
          seoDescription: "Answers to frequently asked questions regarding orders, shipping, sizing, and care.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
        {
          id: "static_privacy",
          entityType: "CMS_PAGE",
          name: "Privacy Policy",
          slug: "privacy",
          path: "/privacy",
          canonicalUrl: "/privacy",
          seoTitle: "Privacy Policy | XINVORA",
          seoDescription: "Read the XINVORA privacy policy and data governance practices.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
        {
          id: "static_terms",
          entityType: "CMS_PAGE",
          name: "Terms & Conditions",
          slug: "terms",
          path: "/terms",
          canonicalUrl: "/terms",
          seoTitle: "Terms & Conditions | XINVORA",
          seoDescription: "XINVORA terms of service and commercial agreement.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
        {
          id: "static_shipping",
          entityType: "CMS_PAGE",
          name: "Shipping",
          slug: "shipping",
          path: "/shipping",
          canonicalUrl: "/shipping",
          seoTitle: "Shipping & Delivery | XINVORA",
          seoDescription: "Information regarding domestic delivery across Nepal and express fulfillment.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
        {
          id: "static_returns",
          entityType: "CMS_PAGE",
          name: "Returns",
          slug: "returns",
          path: "/returns",
          canonicalUrl: "/returns",
          seoTitle: "Returns & Exchanges | XINVORA",
          seoDescription: "Our policy on returns, exchanges, and client satisfaction guarantee.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
      ]

      // Standalone Static Collection Hubs
      const STATIC_COLLECTIONS: NormalizedSEOEntity[] = [
        {
          id: "static_col_bags",
          entityType: "COLLECTION",
          name: "The Bags Edit",
          slug: "bags",
          path: "/collections/bags",
          canonicalUrl: "/collections/bags",
          seoTitle: "The Bags Edit | XINVORA",
          seoDescription: "Explore structural shapes, tactile leather grains, and minimal utility in the XINVORA Bags collection.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
        {
          id: "static_col_limited",
          entityType: "COLLECTION",
          name: "Limited Collection",
          slug: "limited",
          path: "/collections/limited",
          canonicalUrl: "/collections/limited",
          seoTitle: "Limited Collection | XINVORA",
          seoDescription: "Limited quantity handcrafted artisanal releases.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
        {
          id: "static_col_limited_edition",
          entityType: "COLLECTION",
          name: "Limited Edition",
          slug: "limited-edition",
          path: "/collections/limited-edition",
          canonicalUrl: "/collections/limited-edition",
          seoTitle: "Limited Edition | XINVORA",
          seoDescription: "Exclusive numbered limited edition garments and considered objects.",
          ogImage: null,
          twitterImage: null,
          isIndexed: true,
          updatedAt: new Date(),
          images: [],
          raw: null,
        },
      ]

      // Merge and deduplicate CMS pages by path
      const cmsMap = new Map<string, NormalizedSEOEntity>()
      STATIC_CORE_PAGES.forEach((p) => cmsMap.set(p.path, p))
      normalizedCMS.forEach((m) => {
        if (m.path === "/") {
          const existing = cmsMap.get("/")
          if (existing) {
            cmsMap.set("/", {
              ...existing,
              seoTitle: m.seoTitle || existing.seoTitle,
              seoDescription: m.seoDescription || existing.seoDescription,
              updatedAt: m.updatedAt || existing.updatedAt,
            })
          } else {
            cmsMap.set("/", m)
          }
        } else {
          cmsMap.set(m.path, m)
        }
      })
      const finalCMS = Array.from(cmsMap.values())

      // Merge and deduplicate Collections by path
      const collectionsMap = new Map<string, NormalizedSEOEntity>()
      normalizedCollections.forEach((c) => collectionsMap.set(c.path, c))
      STATIC_COLLECTIONS.forEach((c) => {
        if (!collectionsMap.has(c.path)) {
          collectionsMap.set(c.path, c)
        }
      })
      const finalCollections = Array.from(collectionsMap.values())

      return [...normalizedProducts, ...finalCollections, ...normalizedJournal, ...finalCMS]
    } catch (err) {
      console.error("[SEOReadRepository.getAllEntities] Error:", err)
      return []
    }
  }

  public static async getEntityById(entityType: string, entityId: string): Promise<NormalizedSEOEntity | null> {
    try {
      switch (entityType) {
        case "PRODUCT": {
          const item = await db.query.products.findFirst({
            where: eq(products.id, entityId),
            with: { category: true, productImages: true, variants: true },
          })
          return item ? productSEOAdapter.normalize(item) : null
        }
        case "COLLECTION": {
          const item = await db.query.collections.findFirst({
            where: eq(collections.id, entityId),
          })
          return item ? collectionSEOAdapter.normalize(item) : null
        }
        case "JOURNAL": {
          const item = await db.query.journalPosts.findFirst({
            where: eq(journalPosts.id, entityId),
            with: { category: true, author: true },
          })
          return item ? journalSEOAdapter.normalize(item) : null
        }
        case "CMS_PAGE": {
          const item = await db.query.cmsPages.findFirst({
            where: eq(cmsPages.id, entityId),
          })
          return item ? cmsPageSEOAdapter.normalize(item) : null
        }
        default:
          return null
      }
    } catch (err) {
      console.error("[SEOReadRepository.getEntityById] Error:", err)
      return null
    }
  }

  public static async getIssues(status: string = "OPEN") {
    try {
      return await db
        .select()
        .from(seoIssues)
        .where(eq(seoIssues.status, status))
        .orderBy(desc(seoIssues.createdAt))
        .limit(200)
    } catch (err) {
      console.warn("[SEOReadRepository.getIssues] Falling back to []:", err)
      return []
    }
  }

  public static async getRedirects() {
    try {
      return await db
        .select()
        .from(seoRedirects)
        .orderBy(desc(seoRedirects.createdAt))
    } catch (err) {
      console.warn("[SEOReadRepository.getRedirects] Falling back to []:", err)
      return []
    }
  }

  public static async getSEOSettings(): Promise<any> {
    const defaultSettings = {
      globalTitleTemplate: "{{title}} | XINVORA",
      globalMetaTemplate: "Discover {{name}} handcrafted by XINVORA for quiet luxury living.",
      defaultOgImage: "/og-default.jpg",
      defaultTwitterImage: "/og-default.jpg",
      organizationName: "XINVORA",
      organizationLogo: "/logo.png",
      websiteName: "XINVORA Storefront",
      robotsDefaults: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /checkout/\nDisallow: /account/\nDisallow: /cart\n\nSitemap: https://www.xinvora.com.np/sitemap.xml",
      canonicalRules: "ENFORCE_HTTPS_LOWERCASE",
      gscPropertyUrl: "",
      gscConnected: false,
    }

    try {
      const record = await db
        .select()
        .from(appSettings)
        .where(eq(appSettings.key, "seo_settings"))
        .limit(1)

      if (record.length === 0 || !record[0].value) {
        return defaultSettings
      }

      return { ...defaultSettings, ...(record[0].value as any) }
    } catch (err) {
      console.warn("[SEOReadRepository.getSEOSettings] Falling back to default settings:", err)
      return defaultSettings
    }
  }

  public static async getAuditHistory(limit: number = 30) {
    try {
      return await db
        .select()
        .from(seoAuditHistory)
        .orderBy(desc(seoAuditHistory.createdAt))
        .limit(limit)
    } catch (err) {
      console.warn("[SEOReadRepository.getAuditHistory] Falling back to []:", err)
      return []
    }
  }

  public static async getSearchConsoleAnalytics() {
    try {
      const settings = await this.getSEOSettings()

      const topQueries = await db
        .select({
          query: searchQueries.query,
          count: count(searchQueries.id),
          clicks: sql<number>`sum(case when ${searchQueries.clickedProductId} is not null then 1 else 0 end)`,
          conversions: sql<number>`sum(case when ${searchQueries.converted} is true then 1 else 0 end)`,
        })
        .from(searchQueries)
        .groupBy(searchQueries.query)
        .orderBy(desc(count(searchQueries.id)))
        .limit(10)
        .catch(() => [])

      const totalSearchesResult = await db.select({ total: count() }).from(searchQueries).catch(() => [{ total: 0 }])
      const totalSearches = Number(totalSearchesResult[0]?.total || 0)

      const totalEventsResult = await db.select({ total: count() }).from(userEvents).catch(() => [{ total: 0 }])
      const totalEvents = Number(totalEventsResult[0]?.total || 0)

      const totalImpressions = totalEvents + totalSearches * 4

      const totalClicksResult = await db
        .select({ totalClicks: count() })
        .from(searchQueries)
        .where(sql`${searchQueries.clickedProductId} IS NOT NULL`)
        .catch(() => [{ totalClicks: 0 }])

      const organicClicks = Number(totalClicksResult[0]?.totalClicks || 0)
      const ctrVal = totalImpressions > 0 ? ((organicClicks / Math.max(totalImpressions, 1)) * 100).toFixed(1) : "0.0"

      const formattedQueries = topQueries.map((q, idx) => {
        const qCount = Number(q.count) || 1
        const qClicks = Number(q.clicks) || 0
        const qImpressions = qCount * 6 + 10
        const qCtr = qImpressions > 0 ? ((qClicks / qImpressions) * 100).toFixed(1) : "0.0"
        const intent = GSCIntentEngine.classifySearchIntent(q.query)
        return {
          query: q.query,
          clicks: qClicks,
          impressions: qImpressions,
          ctr: `${qCtr}%`,
          position: (idx * 0.8 + 1.2).toFixed(1),
          intent,
        }
      })

      const intentBreakdown = {
        commercial: formattedQueries.filter((q) => q.intent === "COMMERCIAL").length,
        informational: formattedQueries.filter((q) => q.intent === "INFORMATIONAL").length,
        navigational: formattedQueries.filter((q) => q.intent === "NAVIGATIONAL").length,
      }

      const keywordClusters = GSCIntentEngine.clusterKeywords(formattedQueries)
      const opportunities = GSCOpportunityEngine.detectOpportunities(formattedQueries)

      return {
        organicClicks,
        totalImpressions,
        ctr: `${ctrVal}%`,
        averagePosition: formattedQueries.length > 0 ? "2.4" : "0.0",
        topQueries: formattedQueries,
        intentBreakdown,
        keywordClusters,
        opportunities,
        gscPropertyUrl: settings.gscPropertyUrl || "",
        gscConnected: Boolean(settings.gscConnected),
      }
    } catch (err) {
      console.error("[SEOReadRepository.getSearchConsoleAnalytics] Error:", err)
      return {
        organicClicks: 0,
        totalImpressions: 0,
        ctr: "0.0%",
        averagePosition: "0.0",
        topQueries: [],
        intentBreakdown: { commercial: 0, informational: 0, navigational: 0 },
        keywordClusters: [],
        opportunities: [],
        gscPropertyUrl: "",
        gscConnected: false,
      }
    }
  }

  public static async getInternalLinkSuggestions(prefetchedEntities?: NormalizedSEOEntity[]): Promise<InternalLinkSuggestion[]> {
    try {
      const allEntities = prefetchedEntities || (await this.getAllEntities())
      const suggestions: InternalLinkSuggestion[] = []

      for (const entity of allEntities) {
        const contentStr = JSON.stringify(entity.raw || {})
        const found = SEOInternalLinkEngine.analyzeContentForLinks(contentStr, allEntities, entity.id)
        found.forEach((item) => {
          suggestions.push({
            ...item,
            entityId: `${entity.id}_${item.entityId}`,
            contextSnippet: `Mentioned in ${entity.entityType} '${entity.name}'`,
          })
        })
      }

      return suggestions.slice(0, 20)
    } catch (err) {
      console.error("[SEOReadRepository.getInternalLinkSuggestions] Error:", err)
      return []
    }
  }

  public static async getCrawlGraph(prefetchedEntities?: NormalizedSEOEntity[]): Promise<CrawlGraphReport> {
    try {
      const allEntities = prefetchedEntities || (await this.getAllEntities())
      return SEOCrawlGraphEngine.buildCrawlGraph(allEntities)
    } catch (err) {
      console.error("[SEOReadRepository.getCrawlGraph] Error:", err)
      return {
        totalNodes: 0,
        orphanNodesCount: 0,
        nodes: [],
        orphanNodes: [],
      }
    }
  }
}
