import type { NormalizedSEOEntity } from "../contracts/entity.contract"

export class SEOSchemaEngine {
  public static generateJSONLD(baseUrl: string, entity: NormalizedSEOEntity): any[] {
    const schemas: any[] = []

    // 1. WebSite & SearchAction Schema
    schemas.push(this.generateWebSiteSchema(baseUrl))

    // 2. Organization Schema
    schemas.push(this.generateOrganizationSchema(baseUrl))

    // 3. BreadcrumbList Schema
    schemas.push(this.generateBreadcrumbSchema(baseUrl, entity))

    // 4. Entity Specific Schemas
    if (entity.entityType === "PRODUCT") {
      schemas.push(this.generateProductSchema(baseUrl, entity))
    } else if (entity.entityType === "COLLECTION") {
      schemas.push(this.generateCollectionSchema(baseUrl, entity))
    } else if (entity.entityType === "JOURNAL") {
      schemas.push(this.generateArticleSchema(baseUrl, entity))
    }

    return schemas
  }

  public static generateWebSiteSchema(baseUrl: string) {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${baseUrl}#website`,
      url: baseUrl,
      name: "XINVORA",
      description: "Handcrafted Quiet Luxury Fashion & Apparel",
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    }
  }

  public static generateOrganizationSchema(baseUrl: string) {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${baseUrl}#organization`,
      name: "XINVORA",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
      sameAs: [
        "https://instagram.com/xinvora",
        "https://facebook.com/xinvora",
      ],
    }
  }

  public static generateBreadcrumbSchema(baseUrl: string, entity: NormalizedSEOEntity) {
    const items = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
    ]

    if (entity.entityType === "PRODUCT") {
      items.push({
        "@type": "ListItem",
        position: 2,
        name: entity.categoryName || "Collections",
        item: `${baseUrl}/collections/${(entity.categoryName || "all").toLowerCase()}`,
      })
      items.push({
        "@type": "ListItem",
        position: 3,
        name: entity.name,
        item: `${baseUrl}${entity.path}`,
      })
    } else {
      items.push({
        "@type": "ListItem",
        position: 2,
        name: entity.name,
        item: `${baseUrl}${entity.path}`,
      })
    }

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items,
    }
  }

  public static generateProductSchema(baseUrl: string, entity: NormalizedSEOEntity) {
    const raw = entity.raw || {}
    const isAvailable = raw.status !== "OUT_OF_STOCK" && raw.isArchived !== true
    const availability = isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${baseUrl}${entity.path}#product`,
      name: entity.name,
      image: entity.images && entity.images.length > 0 ? entity.images : [`${baseUrl}/og-default.jpg`],
      description: entity.seoDescription || `Handcrafted ${entity.name} by XINVORA. Quiet luxury apparel.`,
      sku: entity.id,
      brand: {
        "@type": "Brand",
        name: "XINVORA",
      },
      offers: {
        "@type": "Offer",
        url: `${baseUrl}${entity.path}`,
        priceCurrency: entity.currency || "NPR",
        price: (entity.price || 0).toString(),
        availability,
        itemCondition: "https://schema.org/NewCondition",
        // Google Merchant Center Shipping & Return Details
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "NPR",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "NP",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 2,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 3,
              unitCode: "DAY",
            },
          },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "NP",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 7,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
      },
    }
  }

  public static generateCollectionSchema(baseUrl: string, entity: NormalizedSEOEntity) {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${baseUrl}${entity.path}#collection`,
      url: `${baseUrl}${entity.path}`,
      name: entity.name,
      description: entity.seoDescription || `Discover the ${entity.name} collection by XINVORA.`,
    }
  }

  public static generateArticleSchema(baseUrl: string, entity: NormalizedSEOEntity) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: entity.name,
      image: entity.images && entity.images.length > 0 ? entity.images : [`${baseUrl}/og-default.jpg`],
      datePublished: entity.updatedAt || new Date().toISOString(),
      author: {
        "@type": "Person",
        name: entity.authorName || "XINVORA Editorial",
      },
      publisher: {
        "@type": "Organization",
        name: "XINVORA",
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`,
        },
      },
    }
  }
}
