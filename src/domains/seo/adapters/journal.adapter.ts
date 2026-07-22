import type { SEOEntityAdapter, NormalizedSEOEntity, SEOEntityCapabilities } from "../contracts/entity.contract"

export class JournalSEOAdapter implements SEOEntityAdapter {
  entityType = "JOURNAL" as const
  capabilities: SEOEntityCapabilities = {
    supportsSchema: true,
    supportsCanonical: true,
    supportsPrice: false,
    supportsBreadcrumbs: true,
    supportsImages: true,
    supportsAuthor: true,
  }

  normalize(post: any): NormalizedSEOEntity {
    const imagesList: Array<{ url: string; alt?: string | null }> = []
    if (post.coverImage) {
      imagesList.push({ url: post.coverImage, alt: post.title || null })
    }
    if (post.gallery && Array.isArray(post.gallery)) {
      post.gallery.forEach((url: string) => {
        if (url) imagesList.push({ url, alt: null })
      })
    }

    const authorName = post.author ? `${post.author.firstName || ""} ${post.author.lastName || ""}`.trim() : "Editorial Staff"

    return {
      id: post.id,
      entityType: "JOURNAL",
      name: post.title || "Untitled Article",
      slug: post.slug,
      path: `/journal/${post.slug}`,
      seoTitle: post.seoTitle || post.title || null,
      seoDescription: post.metaDescription || post.excerpt || null,
      canonicalUrl: post.canonicalUrl || `/journal/${post.slug}`,
      ogImage: post.ogImage || post.coverImage || null,
      twitterImage: post.twitterImage || post.coverImage || null,
      isIndexed: post.workflowState === "PUBLISHED" && post.robotsIndex !== false,
      updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
      images: imagesList,
      authorName,
      categoryName: post.category?.name || undefined,
      raw: post,
    }
  }
}

export const journalSEOAdapter = new JournalSEOAdapter()
