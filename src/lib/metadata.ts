/**
 * lib/metadata.ts — XINVORA SEO Metadata Builder
 *
 * Generates Next.js Metadata objects for each page.
 * Uses SITE defaults as fallback — pages only override what they need.
 *
 * Usage:
 *   export const metadata = buildMetadata({
 *     title: "About Us",
 *     description: "Our story...",
 *   })
 */

import type { Metadata } from "next"
import type { SeoMeta } from "@/types/common"
import { SITE, DEFAULT_SEO, OG_CONFIG } from "@/constants/site"
import { BRAND } from "@/constants/brand"

/**
 * Build a complete Next.js Metadata object.
 * Merges provided values with SITE defaults.
 */
export function buildMetadata(overrides: Partial<SeoMeta> = {}): Metadata {
  const seo = { ...DEFAULT_SEO, ...overrides }

  const title = overrides.title
    ? { default: overrides.title, template: SITE.titleTemplate }
    : { default: SITE.title, template: SITE.titleTemplate }

  const ogImage = seo.image || OG_CONFIG.defaultImage.url
  const baseUrl = SITE.url.replace(/\/$/, "")
  const rawCanonical = seo.canonical || baseUrl
  const canonicalUrl = rawCanonical === baseUrl ? `${baseUrl}/` : rawCanonical

  return {
    title,
    description: seo.description,
    keywords: seo.keywords,
    metadataBase: new URL(baseUrl),
    robots: {
      index: !seo.noIndex,
      follow: !seo.noIndex,
      googleBot: {
        index: !seo.noIndex,
        follow: !seo.noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: seo.title || SITE.title,
      description: seo.description,
      url: canonicalUrl,
      siteName: SITE.name,
      locale: SITE.locale,
      type: "website",
      images: [
        {
          url: ogImage,
          width: OG_CONFIG.defaultImage.width,
          height: OG_CONFIG.defaultImage.height,
          alt: OG_CONFIG.defaultImage.alt,
        },
      ],
    },
    twitter: {
      card: OG_CONFIG.twitterCardType,
      site: OG_CONFIG.twitterHandle,
      creator: OG_CONFIG.twitterHandle,
      title: seo.title || SITE.title,
      description: seo.description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    authors: [{ name: BRAND.name, url: baseUrl }],
    creator: BRAND.name,
    publisher: BRAND.name,
  }
}

/**
 * Build metadata for the root layout.
 * Sets up title templates and default Open Graph.
 */
export function buildRootMetadata(): Metadata {
  const baseUrl = SITE.url.replace(/\/$/, "")
  const rootUrl = `${baseUrl}/`

  return {
    title: {
      default: SITE.title,
      template: SITE.titleTemplate,
    },
    description: SITE.description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      type: "website",
      locale: SITE.locale,
      url: rootUrl,
      siteName: SITE.name,
      title: SITE.title,
      description: SITE.description,
      images: [OG_CONFIG.defaultImage],
    },
    alternates: {
      canonical: rootUrl,
    },
    twitter: {
      card: OG_CONFIG.twitterCardType,
      site: OG_CONFIG.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [
        { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
  }
}
