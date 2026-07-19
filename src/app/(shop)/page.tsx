/**
 * app/page.tsx — XINVORA Homepage Foundation Layout
 *
 * Implements the structural framework of the homepage.
 * Composes existing shared layout primitives: Section, Container, Grid, and Stack.
 *
 * All page-specific blocks are arranged here with structural placeholders
 * to keep the markup prepared for content integration in Phase 3B.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { HeroSlider } from "@/components/shop/HeroSlider"
import { Grid } from "@/components/shared/grid"

import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"

import Image from "next/image"
import { NewsletterForm } from "@/features/newsletter/components/NewsletterForm"
import { getHomepageCMS } from "@/db/queries"

export const metadata = buildMetadata({
  title: "Home",
  description: "XINVORA is a premium lifestyle brand creating considered objects for modern living. Elevate everyday living with thoughtful design, exceptional materials, and timeless craft.",
})

import { homepageSettings } from "@/db/schema/cms"
import { db } from "@/db/client"

import { CMSBlockRenderer } from "@/components/cms/BlockRenderer"

import { findProductsByIds, findCollectionsByIds, findLookbookSlides } from "@/db/queries"
import { ShopTheLookCarousel } from "@/components/storefront/ShopTheLookCarousel"

export default async function HomePage() {
  const settingsQuery = await db.select().from(homepageSettings).limit(1)
  const settings = settingsQuery.length > 0 ? settingsQuery[0] : null
  
  const homepageCMS = await getHomepageCMS()
  let heroBlock = null
  let productGridBlock = null
  let collectionGridBlock = null
  let lookbookBlock = null
  const bannerBlocks: any[] = []
  if (homepageCMS?.sections) {
    for (const section of homepageCMS.sections) {
      if (!heroBlock) {
        heroBlock = section.blocks?.find((b: any) => b.type === "HERO")
      }
      if (!productGridBlock) {
        productGridBlock = section.blocks?.find((b: any) => b.type === "PRODUCT_GRID")
      }
      if (!collectionGridBlock) {
        collectionGridBlock = section.blocks?.find((b: any) => b.type === "COLLECTION_GRID")
      }
      if (!lookbookBlock) {
        lookbookBlock = section.blocks?.find((b: any) => b.type === "LOOKBOOK")
      }
      const banners = section.blocks?.filter((b: any) => b.type === "BANNER") || []
      bannerBlocks.push(...banners)
    }
  }

  const layoutConfig = settings?.layoutConfig as any
  const defaultOrder = ["hero", "arrivals", "featured", "banner", "lookbook", "newsletter"]
  let sectionOrder = Array.isArray(layoutConfig?.sectionOrder) ? [...layoutConfig.sectionOrder] : [...defaultOrder]
  
  // If old order layout has legacy generic "banner", replace/expand it or map to dynamic banner keys
  const resolvedSectionOrder: string[] = []
  sectionOrder.forEach((key: string) => {
    if (key === "banner") {
      if (bannerBlocks.length > 0) {
        bannerBlocks.forEach(b => resolvedSectionOrder.push(`banner-${b.id}`))
      } else {
        resolvedSectionOrder.push("banner")
      }
    } else {
      resolvedSectionOrder.push(key)
    }
  })

  // Guarantee any new banners not in resolvedSectionOrder are appended after featured
  bannerBlocks.forEach((b) => {
    const key = `banner-${b.id}`
    if (!resolvedSectionOrder.includes(key)) {
      const featuredIdx = resolvedSectionOrder.indexOf("featured")
      if (featuredIdx >= 0) {
        resolvedSectionOrder.splice(featuredIdx + 1, 0, key)
      } else {
        resolvedSectionOrder.push(key)
      }
    }
  })

  return (
    <>
      {resolvedSectionOrder.map((sectionId: string) => {
        if (sectionId === "hero") {
          return <HeroSection key="hero" heroBlock={heroBlock} settings={settings} />
        }
        if (sectionId === "arrivals") {
          return (
            <ArrivalsSectionWrapper
              key="arrivals"
              productGridBlock={productGridBlock}
              settings={settings}
            />
          )
        }
        if (sectionId === "featured") {
          return (
            <FeaturedSectionWrapper
              key="featured"
              collectionGridBlock={collectionGridBlock}
              settings={settings}
            />
          )
        }
        if (sectionId === "banner") {
          const first = bannerBlocks[0]
          return first ? <CMSBlockRenderer key="banner" block={first} /> : null
        }
        if (sectionId.startsWith("banner-")) {
          const id = sectionId.replace("banner-", "")
          const block = bannerBlocks.find((b) => b.id === id)
          return block ? <CMSBlockRenderer key={sectionId} block={block} /> : null
        }
        if (sectionId === "lookbook") {
          return lookbookBlock ? <LookbookSectionWrapper key="lookbook" lookbookBlock={lookbookBlock} /> : null
        }
        if (sectionId === "newsletter" && (settings?.newsletterToggle ?? true)) {
          return <NewsletterSection key="newsletter" />
        }
        return null
      })}
    </>
  )
}


async function ArrivalsSectionWrapper({ productGridBlock, settings }: { productGridBlock: any; settings?: any }) {
  if (productGridBlock) {
    const items = productGridBlock.data?.items || []
    const productIds = productGridBlock.data?.productIds || []

    if (items.length > 0) {
      const ids = items.map((item: any) => item.productId)
      const liveProducts = await findProductsByIds(ids)
      const productsWithOverrides = items.map((item: any) => {
        const found = liveProducts.find((p) => p.id === item.productId)
        if (!found) return null
        return {
          ...found,
          customImageUrl: item.customImageUrl,
        }
      }).filter(Boolean) as any[]
      return <CMSBlockRenderer block={productGridBlock} products={productsWithOverrides} />
    } else if (productIds.length > 0) {
      const liveProducts = await findProductsByIds(productIds)
      return <CMSBlockRenderer block={productGridBlock} products={liveProducts} />
    }
  }
  return <NewArrivalsSection settings={settings} />
}

async function FeaturedSectionWrapper({ collectionGridBlock, settings }: { collectionGridBlock: any; settings?: any }) {
  if (collectionGridBlock) {
    const collectionIds = collectionGridBlock.data?.collectionIds || []
    if (collectionIds.length > 0) {
      const liveCollections = await findCollectionsByIds(collectionIds)
      return <CMSBlockRenderer block={collectionGridBlock} collections={liveCollections} />
    }
  }
  return null
}

async function LookbookSectionWrapper({ lookbookBlock }: { lookbookBlock: any }) {
  const { slides, products } = await findLookbookSlides()
  if (slides.length === 0) return null
  // ShopTheLookCarousel renders its own section with heading, so render directly
  return <ShopTheLookCarousel slides={slides} products={products} />
}


// ── 1. Hero Section ──────────────────────────────────────────────────────────
function HeroSection({ heroBlock, settings }: { heroBlock: any; settings?: any }) {
  if (heroBlock) {
    return <CMSBlockRenderer block={heroBlock} />
  }
  const layoutConfig = settings?.layoutConfig as any
  const heroLink = layoutConfig?.heroLink || "/products/chatgpt-image-jul-4-2026-11-31-22-am"
  return <HeroSlider heroLink={heroLink} />
}

// ── 2. New Arrivals Section ──────────────────────────────────────────────────
function NewArrivalsSection({ settings }: { settings?: any }) {
  const defaultItems = [
    {
      id: "new-1",
      name: "Lace Trim Cami Top",
      slug: "lace-trim-cami-top",
      price: "NPR 9,500",
      image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "new-2",
      name: "Pleated Linen Gown",
      slug: "pleated-linen-gown",
      price: "NPR 18,500",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "new-3",
      name: "Tie-Shoulder Floral Dress",
      slug: "tie-shoulder-floral-dress",
      price: "NPR 22,000",
      image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "new-4",
      name: "Eyelet Detail Shorts",
      slug: "eyelet-detail-shorts",
      price: "NPR 11,000",
      image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "new-5",
      name: "Scallop Neck Halter Top",
      slug: "scallop-neck-halter-top",
      price: "NPR 12,500",
      image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "new-6",
      name: "Floral Quilted Bralette",
      slug: "floral-quilted-bralette",
      price: "NPR 8,500",
      image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "new-7",
      name: "Tiered A-Line Midi Skirt",
      slug: "tiered-a-line-midi-skirt",
      price: "NPR 15,000",
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "new-8",
      name: "Embroidered Quilt Jacket",
      slug: "embroidered-quilt-jacket",
      price: "NPR 28,000",
      image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "new-9",
      name: "Tiered Cotton Mini Skirt",
      slug: "tiered-cotton-mini-skirt",
      price: "NPR 9,000",
      image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "new-10",
      name: "Floral Drawstring Skort",
      slug: "floral-drawstring-skort",
      price: "NPR 10,500",
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "new-11",
      name: "Cotton Strapless Maxi Dress",
      slug: "cotton-strapless-maxi-dress",
      price: "NPR 24,000",
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop",
    }
  ]

  const layoutConfig = settings?.layoutConfig as any
  const customItems = layoutConfig?.newArrivals
  const items = Array.isArray(customItems) && customItems.length > 0 ? customItems : defaultItems

  return (
    <Section id="new-arrivals" padding="none" className="bg-surface-warm border-b border-border py-24 select-none">
      <Container>
        {/* Title Block Above Grid */}
        <div className="flex flex-col justify-start select-none mb-14">
          <span className="text-[10px] font-bold tracking-[0.4em] text-text-secondary uppercase select-none opacity-80 mb-3 pl-2">
            New Season
          </span>
          <h2 className="text-[2.2rem] md:text-[2.8rem] font-display font-light text-text-primary tracking-[0.2em] uppercase leading-none whitespace-nowrap pl-2">
            New Arrivals
          </h2>
        </div>

        {/* 4-column dynamic grid on desktop, 2-column on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-1.5 gap-y-10 w-full px-0">

          {/* Product Grid Items */}
          {items.map((item) => (
            <Link 
              key={item.id} 
              href={item.slug ? `/products/${item.slug}` : "/collections"} 
              className="group flex flex-col relative pointer-events-auto gap-3.5"
            >
              {/* Aspect Ratio 3:4 container - transparent to match webpage background color exactly */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-transparent flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain p-2 mix-blend-multiply select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>


            </Link>
          ))}

        </div>
      </Container>
    </Section>
  )
}



// ── 6. Newsletter Section ─────────────────────────────────────────────────────
function NewsletterSection() {
  return (
    <Section id="newsletter" padding="2xl" className="bg-background">
      <Container>
        <Stack gap={8} align="center" className="text-center max-w-[32rem] mx-auto">
          {/* Header copy */}
          <Stack gap={3}>
            <span className="text-[11px] font-semibold tracking-widest text-accent uppercase select-none">
              Editorial Updates
            </span>
            <h2 className="text-heading-lg text-text-primary">
              Become part of the XINVORA community
            </h2>
            <p className="text-body-md text-text-secondary text-pretty">
              Subscribe to receive campaign releases, journal essays, and private updates.
            </p>
          </Stack>

          {/* Subscription Form Presentation */}
          <NewsletterForm />
        </Stack>
      </Container>
    </Section>
  )
}
