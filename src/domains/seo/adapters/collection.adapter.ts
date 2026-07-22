import type { SEOEntityAdapter, NormalizedSEOEntity, SEOEntityCapabilities } from "../contracts/entity.contract"

export class CollectionSEOAdapter implements SEOEntityAdapter {
  entityType = "COLLECTION" as const
  capabilities: SEOEntityCapabilities = {
    supportsSchema: true,
    supportsCanonical: true,
    supportsPrice: false,
    supportsBreadcrumbs: true,
    supportsImages: true,
    supportsAuthor: false,
  }

  normalize(collection: any): NormalizedSEOEntity {
    const imagesList: Array<{ url: string; alt?: string | null }> = []
    if (collection.imageUrl) {
      imagesList.push({ url: collection.imageUrl, alt: collection.name || null })
    }

    return {
      id: collection.id,
      entityType: "COLLECTION",
      name: collection.name || "Untitled Collection",
      slug: collection.slug,
      path: `/collections/${collection.slug}`,
      seoTitle: collection.seoTitle || collection.name || null,
      seoDescription: collection.seoDescription || collection.description || null,
      canonicalUrl: collection.canonicalUrl || `/collections/${collection.slug}`,
      ogImage: collection.imageUrl || null,
      twitterImage: collection.imageUrl || null,
      isIndexed: collection.isPublished !== false && !collection.deletedAt,
      updatedAt: collection.updatedAt ? new Date(collection.updatedAt) : new Date(),
      images: imagesList,
      raw: collection,
    }
  }
}

export const collectionSEOAdapter = new CollectionSEOAdapter()
