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
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { NewsletterForm } from "@/features/newsletter/components/NewsletterForm"
import { getHomepageCatalog } from "@/db/queries"
import type { ProductSummary } from "@/db/queries/types"
import { Suspense } from "react"

export const metadata = buildMetadata({
  title: "Home",
  description: "XINVORA is a premium lifestyle brand creating considered objects for modern living. Elevate everyday living with thoughtful design, exceptional materials, and timeless craft.",
})

import { homepageSettings } from "@/db/schema/cms"
import { db } from "@/db/client"
import { ParallaxHero } from "@/components/shared/Hero/ParallaxHero"
import { WishlistToggleIcon } from "@/components/shop/WishlistToggleIcon"

export default async function HomePage() {
  const settingsQuery = await db.select().from(homepageSettings).limit(1)
  const settings = settingsQuery.length > 0 ? settingsQuery[0] : null
  
  return (
    <>
      <HeroSection settings={settings} />
      <NewArrivalsSection settings={settings} />
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProductsData />
      </Suspense>
      {(settings?.newsletterToggle ?? true) && <NewsletterSection />}
    </>
  )
}

async function FeaturedProductsData() {
  const catalog = await getHomepageCatalog()
  return <FeaturedProductsSection products={catalog.featuredProducts} />
}

function FeaturedProductsSkeleton() {
  return (
    <Section id="featured-products" padding="2xl" className="bg-background">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[3/4] w-full bg-surface-secondary animate-pulse" />
              <div className="h-3 w-2/3 bg-surface-secondary animate-pulse" />
              <div className="h-3 w-1/3 bg-surface-secondary animate-pulse" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

// ── 1. Hero Section ──────────────────────────────────────────────────────────
function HeroSection({ settings }: { settings?: any }) {
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



// ── 4. Featured Products Section ──────────────────────────────────────────────
function FeaturedProductsSection({ products }: { products: ProductSummary[] }) {
  return (
    <Section id="featured-products" padding="2xl" className="bg-background">
      <Container>
        <Stack gap={12}>
          {/* Section Heading */}
          <Stack gap={3} className="text-center max-w-[32rem] mx-auto mb-4">
            <span className="text-[11px] font-semibold tracking-widest text-accent uppercase select-none">
              Editor&apos;s Selection
            </span>
            <h2 className="text-[2.2rem] md:text-[2.8rem] font-display font-light text-text-primary tracking-[0.2em] uppercase leading-none">
              Selected Pieces
            </h2>
            <p className="text-body-md text-text-secondary font-light font-sans mt-2">
              Timeless silhouettes, curated for effortless elegance.
            </p>
          </Stack>

          {/* Grid Layout */}
          <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={8}>
            {products.length === 0 ? (
               <p className="text-body-sm text-text-secondary text-center col-span-full">No products found.</p>
            ) : (
              products.map((item: any) => (
                <div key={item.id} className="group flex flex-col gap-4 text-left relative">
                  {/* Image Container with Relative Wrapper (Contains PDP link + Wishlist Toggle Icon outside the link) */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-surface-secondary select-none">
                    <Link 
                      href={`/products/${item.slug}`}
                      className="block w-full h-full"
                    >
                      {/* Optional Badge */}
                      {item.badge && (
                        <span className="absolute top-4 left-4 z-10 px-2 py-1 text-[9px] font-bold tracking-widest uppercase bg-background text-text-primary">
                          {item.badge}
                        </span>
                      )}

                      {item.productImages?.length ? (
                        <>
                          {/* Desktop View: Single image with zoom on hover */}
                          <div className="hidden md:block w-full h-full relative">
                            <Image 
                              src={item.productImages[0].url} 
                              alt={item.productImages[0].altText || item.name} 
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>

                          {/* Mobile View: Swipeable horizontal gallery with touch-auto */}
                          <div 
                            className="flex md:hidden w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory touch-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                          >
                            {item.productImages.map((img: any, idx: number) => (
                              <div key={img.url || idx} className="relative w-full h-full shrink-0 snap-center">
                                <Image 
                                  src={img.url} 
                                  alt={img.altText || `${item.name} ${idx + 1}`} 
                                  fill
                                  sizes="(max-width: 640px) 100vw, 50vw"
                                  className="object-cover object-top"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Mobile Slide Indicator dots (only show if multiple images) */}
                          {item.productImages.length > 1 && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex md:hidden gap-1.5 z-10 pointer-events-none">
                              {item.productImages.map((_: any, idx: number) => (
                                <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-sm" />
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-text-secondary uppercase select-none">No Image</div>
                      )}
                    </Link>

                    {/* Wishlist Heart Icon (Functional) - placed outside the Link, positioned relative to image wrapper bottom-right */}
                    <WishlistToggleIcon productId={item.id} />
                  </div>

                  {/* Metadata details */}
                  <Link href={`/products/${item.slug}`} className="flex flex-col gap-1.5 mt-2">
                    <h3 className="text-[13px] font-display font-medium tracking-wide text-text-primary group-hover:text-text-primary/70 transition-colors duration-200">
                      {item.name}
                    </h3>
                    <span className="text-[13px] font-sans text-text-secondary font-light">
                      NPR {item.lowestPrice != null ? (item.lowestPrice / 100).toLocaleString() : (item.basePrice?.toString() || item.price || "3,999")}
                    </span>
                  </Link>
                </div>
              ))
            )}
          </Grid>

          {/* View All Button */}
          <div className="flex justify-center mt-12">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center px-10 py-3.5 border border-border text-[11px] font-display font-semibold tracking-[0.2em] uppercase text-text-primary hover:bg-text-primary hover:text-background transition-all duration-300"
            >
              View All Pieces →
            </Link>
          </div>
        </Stack>
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
