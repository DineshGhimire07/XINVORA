export interface HreflangTag {
  rel: "alternate"
  hreflang: string
  href: string
}

export class SEOLocalSEOEngine {
  public static generateHreflangTags(baseUrl: string, path: string): HreflangTag[] {
    const cleanPath = path.startsWith("/") ? path : `/${path}`

    return [
      { rel: "alternate", hreflang: "en-NP", href: `${baseUrl}${cleanPath}` },
      { rel: "alternate", hreflang: "ne-NP", href: `${baseUrl}/ne${cleanPath}` },
      { rel: "alternate", hreflang: "en-US", href: `${baseUrl}/us${cleanPath}` },
      { rel: "alternate", hreflang: "x-default", href: `${baseUrl}${cleanPath}` },
    ]
  }

  public static generateLocalBusinessSchema(baseUrl: string) {
    return {
      "@context": "https://schema.org",
      "@type": "Store",
      name: "XINVORA Luxury Atelier",
      image: `${baseUrl}/storefront-exterior.jpg`,
      "@id": `${baseUrl}#store`,
      url: baseUrl,
      telephone: "+977-1-4455667",
      priceRange: "NPR 5,000 - 150,000",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Durbar Marg, Fashion District",
        addressLocality: "Kathmandu",
        addressRegion: "Bagmati",
        postalCode: "44600",
        addressCountry: "NP",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 27.712,
        longitude: 85.317,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "10:00",
          closes: "19:30",
        },
      ],
      sameAs: [
        "https://instagram.com/xinvora",
        "https://facebook.com/xinvora",
      ],
    }
  }
}
