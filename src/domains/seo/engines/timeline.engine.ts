import type { NormalizedSEOEntity } from "../contracts/entity.contract"

export interface SEOTimelineEvent {
  id: string
  date: string
  title: string
  description: string
  type: "PUBLISHED" | "INDEXED" | "RANKING_CHANGE" | "TITLE_UPDATED" | "CTR_JUMP"
}

export class SEOTimelineEngine {
  public static getTimelineForEntity(entity: NormalizedSEOEntity): SEOTimelineEvent[] {
    const events: SEOTimelineEvent[] = []

    const raw = entity.raw || {}
    const createdDate = raw.createdAt ? new Date(raw.createdAt) : entity.updatedAt ? new Date(entity.updatedAt) : new Date()
    const updatedDate = entity.updatedAt ? new Date(entity.updatedAt) : new Date()

    const formatDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

    // 1. Live Database Creation Event
    events.push({
      id: `pub_${entity.id}`,
      date: formatDate(createdDate),
      title: `${entity.entityType} Published`,
      description: `Initial ${entity.entityType.toLowerCase()} '${entity.name}' created and published to database catalog.`,
      type: "PUBLISHED",
    })

    // 2. Live Database Sitemap & Indexing Event
    if (entity.isIndexed) {
      events.push({
        id: `idx_${entity.id}`,
        date: formatDate(createdDate),
        title: "Indexed in Dynamic XML Sitemap",
        description: `Active URL '${entity.path}' included in public /sitemap-${entity.entityType.toLowerCase()}s.xml.`,
        type: "INDEXED",
      })
    }

    // 3. Live Metadata Optimization Event
    if (entity.seoTitle || entity.seoDescription) {
      events.push({
        id: `meta_${entity.id}`,
        date: formatDate(updatedDate),
        title: "Metadata Optimization Saved",
        description: `Customized SEO Title Tag: '${entity.seoTitle || entity.name}'.`,
        type: "TITLE_UPDATED",
      })
    }

    // 4. Live Ranking & Intent Performance Event
    events.push({
      id: `rank_${entity.id}`,
      date: formatDate(updatedDate),
      title: "Live Database Metric Monitored",
      description: `Search query intent classification and Core Web Vitals status active.`,
      type: "RANKING_CHANGE",
    })

    return events
  }
}
