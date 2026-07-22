import type { SEOEntityAdapter, NormalizedSEOEntity, SEOEntityCapabilities } from "../contracts/entity.contract"

export class ProductSEOAdapter implements SEOEntityAdapter {
  entityType = "PRODUCT" as const
  capabilities: SEOEntityCapabilities = {
    supportsSchema: true,
    supportsCanonical: true,
    supportsPrice: true,
    supportsBreadcrumbs: true,
    supportsImages: true,
    supportsAuthor: false,
  }

  normalize(product: any): NormalizedSEOEntity {
    const imagesList: Array<{ url: string; alt?: string | null }> = []
    if (product.productImages && Array.isArray(product.productImages)) {
      product.productImages.forEach((img: any) => {
        if (img.url) {
          imagesList.push({ url: img.url, alt: img.altText || img.alt || null })
        }
      })
    }

    let lowestPrice = 0
    if (product.variants && Array.isArray(product.variants)) {
      const prices = product.variants.map((v: any) => v.price).filter((p: any) => typeof p === "number")
      if (prices.length > 0) lowestPrice = Math.min(...prices)
    }

    return {
      id: product.id,
      entityType: "PRODUCT",
      name: product.name || "Untitled Product",
      slug: product.slug,
      path: `/products/${product.slug}`,
      seoTitle: product.seoTitle || product.name || null,
      seoDescription: product.seoDescription || product.description || product.shortDescription || null,
      canonicalUrl: product.canonicalUrl || `/products/${product.slug}`,
      ogImage: imagesList[0]?.url || null,
      twitterImage: imagesList[0]?.url || null,
      isIndexed: product.status === "PUBLISHED",
      updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      images: imagesList,
      price: lowestPrice,
      currency: "NPR",
      categoryName: product.category?.name || undefined,
      raw: product,
    }
  }
}

export const productSEOAdapter = new ProductSEOAdapter()
