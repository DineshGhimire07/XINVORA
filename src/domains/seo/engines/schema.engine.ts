import type { NormalizedSEOEntity } from "../contracts/entity.contract"

export class SEOSchemaEngine {
  public static generateJSONLD(baseUrl: string, entity: NormalizedSEOEntity): any {
    const fullUrl = `${baseUrl}${entity.canonicalUrl || entity.path}`

    switch (entity.entityType) {
      case "PRODUCT":
        return {
          "@context": "https://schema.org/",
          "@type": "Product",
          name: entity.name,
          image: entity.images.map((img) => img.url),
          description: entity.seoDescription || entity.name,
          sku: entity.id.slice(0, 8).toUpperCase(),
          brand: {
            "@type": "Brand",
            name: "XINVORA",
          },
          offers: {
            "@type": "Offer",
            url: fullUrl,
            priceCurrency: entity.currency || "NPR",
            price: entity.price || 14500,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
          },
        }

      case "JOURNAL":
        return {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: entity.name,
          image: entity.ogImage ? [entity.ogImage] : [],
          datePublished: entity.updatedAt.toISOString(),
          dateModified: entity.updatedAt.toISOString(),
          author: {
            "@type": "Person",
            name: entity.authorName || "Editorial Staff",
          },
          publisher: {
            "@type": "Organization",
            name: "XINVORA",
            logo: {
              "@type": "ImageObject",
              url: `${baseUrl}/logo.png`,
            },
          },
          description: entity.seoDescription || "",
        }

      case "COLLECTION":
        return {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: entity.name,
          url: fullUrl,
          description: entity.seoDescription || "",
        }

      default:
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: entity.name,
          url: fullUrl,
          description: entity.seoDescription || "",
        }
    }
  }

  public static generateOrganizationSchema(baseUrl: string, brandName: string = "XINVORA"): any {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: brandName,
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      sameAs: [
        "https://instagram.com/xinvora",
        "https://facebook.com/xinvora",
        "https://tiktok.com/@xinvora",
      ],
    }
  }

  public static generateWebSiteSchema(baseUrl: string, brandName: string = "XINVORA"): any {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: brandName,
      url: baseUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    }
  }
}
