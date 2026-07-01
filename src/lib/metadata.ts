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

  return {
    title,
    description: seo.description,
    keywords: seo.keywords,
    metadataBase: new URL(SITE.url),
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
      url: seo.canonical || SITE.url,
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
      canonical: seo.canonical || SITE.url,
    },
    authors: [{ name: BRAND.name, url: SITE.url }],
    creator: BRAND.name,
    publisher: BRAND.name,
  }
}

/**
 * Build metadata for the root layout.
 * Sets up title templates and default Open Graph.
 */
export function buildRootMetadata(): Metadata {
  return {
    title: {
      default: SITE.title,
      template: SITE.titleTemplate,
    },
    description: SITE.description,
    metadataBase: new URL(SITE.url),
    openGraph: {
      type: "website",
      locale: SITE.locale,
      url: SITE.url,
      siteName: SITE.name,
      title: SITE.title,
      description: SITE.description,
      images: [OG_CONFIG.defaultImage],
    },
    twitter: {
      card: OG_CONFIG.twitterCardType,
      site: OG_CONFIG.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
    },
    // TODO: Enable in Brand Assets phase once assets are supplied in public/favicons/
    // icons: {
    //   icon: [
    //     { url: "/favicons/favicon.ico", sizes: "any" },
    //     { url: "/favicons/icon.svg", type: "image/svg+xml" },
    //   ],
    //   apple: [
    //     { url: "/favicons/apple-touch-icon.png", sizes: "180x180" },
    //   ],
    // },
    // manifest: "/favicons/site.webmanifest",
  }
}
