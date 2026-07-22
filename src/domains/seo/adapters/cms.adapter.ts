import type { SEOEntityAdapter, NormalizedSEOEntity, SEOEntityCapabilities } from "../contracts/entity.contract"

export class CMSPageSEOAdapter implements SEOEntityAdapter {
  entityType = "CMS_PAGE" as const
  capabilities: SEOEntityCapabilities = {
    supportsSchema: true,
    supportsCanonical: true,
    supportsPrice: false,
    supportsBreadcrumbs: true,
    supportsImages: true,
    supportsAuthor: false,
  }

  normalize(page: any): NormalizedSEOEntity {
    const imagesList: Array<{ url: string; alt?: string | null }> = []
    if (page.ogImage) {
      imagesList.push({ url: page.ogImage, alt: page.title || null })
    }

    return {
      id: page.id,
      entityType: "CMS_PAGE",
      name: page.title || page.name || "Untitled Page",
      slug: page.slug,
      path: `/${page.slug.replace(/^\//, "")}`,
      seoTitle: page.seoTitle || page.title || null,
      seoDescription: page.seoDescription || page.metaDescription || null,
      canonicalUrl: page.canonicalUrl || `/${page.slug.replace(/^\//, "")}`,
      ogImage: page.ogImage || null,
      twitterImage: page.ogImage || null,
      isIndexed: page.isPublished !== false && page.robotsIndex !== false,
      updatedAt: page.updatedAt ? new Date(page.updatedAt) : new Date(),
      images: imagesList,
      raw: page,
    }
  }
}

export const cmsPageSEOAdapter = new CMSPageSEOAdapter()
