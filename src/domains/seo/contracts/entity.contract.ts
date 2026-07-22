export type SEOEntityType = "PRODUCT" | "COLLECTION" | "JOURNAL" | "LOOKBOOK" | "CMS_PAGE"

export interface SEOEntityCapabilities {
  supportsSchema: boolean
  supportsCanonical: boolean
  supportsPrice: boolean
  supportsBreadcrumbs: boolean
  supportsImages: boolean
  supportsAuthor: boolean
}

export interface NormalizedSEOEntity {
  id: string
  entityType: SEOEntityType
  name: string
  slug: string
  path: string
  seoTitle: string | null
  seoDescription: string | null
  canonicalUrl: string | null
  ogImage: string | null
  twitterImage: string | null
  isIndexed: boolean
  updatedAt: Date
  images: Array<{ url: string; alt?: string | null }>
  price?: number
  currency?: string
  authorName?: string
  categoryName?: string
  raw: any
}

export interface SEOEntityAdapter {
  entityType: SEOEntityType
  capabilities: SEOEntityCapabilities
  normalize(rawItem: any): NormalizedSEOEntity
}
