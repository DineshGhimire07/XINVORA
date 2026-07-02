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
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export const metadata = buildMetadata({
  title: "Home",
  description: "XINVORA is a premium lifestyle brand creating considered objects for modern living. Elevate everyday living with thoughtful design, exceptional materials, and timeless craft.",
})

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandStorySection />
      <FeaturedCategoriesSection />
      <FeaturedProductsSection />
      <TrustSection />
      <NewsletterSection />
    </>
  )
}

// ── 1. Hero Section ──────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <Section
      id="hero"
      padding="none"
      className="relative min-h-screen flex items-center bg-background border-b border-border overflow-hidden"
    >
      {/* Immersive background image (Next.js Image for optimization) */}
      <Image
        src="/assets/brand/hero/hero-bg.jpg"
        alt="XINVORA Hero Background"
        fill
        priority
        className="object-cover object-center select-none pointer-events-none z-0"
      />

      {/* Subtle overlay gradient to protect text contrast in light and dark modes */}
      <div className="absolute inset-0 bg-black/[0.03] dark:bg-black/20 z-0 pointer-events-none" />

      <Container className="relative z-raised flex flex-col items-center justify-center text-center h-full py-32 md:py-40">
        <div className="flex flex-col items-center max-w-[40rem] gap-8">
          
          {/* Eyebrow */}
          <span className="text-[11px] font-semibold tracking-[0.25em] text-text-primary uppercase select-none">
            Crafted to Last
          </span>

          {/* Title with optical center adjustments */}
          <h1 className="text-[4rem] sm:text-[6rem] md:text-[8rem] font-display text-text-primary tracking-[0.35em] pl-[0.35em] uppercase font-light leading-none">
            XINVORA
          </h1>

          {/* Horizontal Line Divider */}
          <div className="w-16 h-px bg-text-primary/30 my-2" />

          {/* Description Subtitle */}
          <p className="text-body-md lg:text-body-lg text-text-primary leading-relaxed max-w-[28rem] text-pretty">
            Timeless pieces.
            <br />
            Designed for modern living.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center pt-4">
            <Button variant="primary" size="lg" className="w-[14rem] tracking-widest uppercase text-[11px] font-semibold">
              Explore Collection
            </Button>
            <Button variant="outline" size="lg" className="w-[14rem] tracking-widest uppercase text-[11px] font-semibold">
              Our Philosophy
            </Button>
          </div>

        </div>

        {/* Bottom Left Badge & Scroll indicator */}
        <div className="absolute bottom-8 left-4 sm:left-6 md:left-8 lg:left-12 flex flex-col items-start gap-3 select-none text-left">
          <span className="text-[10px] font-bold tracking-[0.2em] text-text-secondary uppercase">
            New Collection — SS&apos;26
          </span>
          <div className="animate-bounce">
            <svg 
              className="w-4 h-4 text-text-secondary" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

      </Container>
    </Section>
  )
}

// ── 2. Brand Story Section ───────────────────────────────────────────────────
function BrandStorySection() {
  return (
    <Section id="brand-story" padding="2xl" className="bg-background">
      <Container>
        <Grid cols={{ base: 1, md: 2 }} gap={16} className="items-start">
          {/* Left Column: Eyebrow + Statement */}
          <Stack gap={4} className="max-w-[32rem]">
            <span className="text-[11px] font-semibold tracking-widest text-accent uppercase select-none">
              Our Philosophy
            </span>
            <h2 className="text-heading-xl font-display text-text-primary leading-tight">
              Quiet confidence. Intentional design. Lasting value.
            </h2>
          </Stack>

          {/* Right Column: Editorial Details */}
          <Stack
            gap={6}
            className="text-text-secondary text-body-md lg:text-body-lg max-w-[32rem] leading-relaxed pt-2 md:pt-8"
          >
            <p className="text-pretty">
              We believe in the beauty of restraint. XINVORA exists to prove that a digital experience can carry the same weight of quality as the objects it holds. In a world driven by trend-chasing and noise, we choose to design for longevity.
            </p>
            <p className="text-pretty">
              Every curation, design choice, and material is considered with absolute intention—bringing quiet refinement and timeless craft into your daily life.
            </p>
          </Stack>
        </Grid>
      </Container>
    </Section>
  )
}

// ── 3. Featured Categories Section ───────────────────────────────────────────
function FeaturedCategoriesSection() {
  const collections = [
    { id: "coll-1", title: "Collection I", description: "Essential garments defined by clean tailoring and structural drapes." },
    { id: "coll-2", title: "Collection II", description: "Considered objects and materials that refine the home." },
    { id: "coll-3", title: "Collection III", description: "Meticulous accessories focused on utility and craft." },
  ]

  return (
    <Section id="featured-categories" padding="2xl" className="bg-surface-elevated border-b border-border">
      <Container>
        <Stack gap={12}>
          {/* Section Heading */}
          <Stack gap={3} className="text-center max-w-[32rem] mx-auto">
            <span className="text-[11px] font-semibold tracking-widest text-accent uppercase select-none">
              Curated Spaces
            </span>
            <h2 className="text-heading-lg text-text-primary">
              Featured Collections
            </h2>
          </Stack>

          {/* Grid Layout */}
          <Grid cols={{ base: 1, md: 3 }} gap={8}>
            {collections.map((col, idx) => (
              <div
                key={col.id}
                className="bg-surface border border-border rounded-sm aspect-[4/5] p-8 flex flex-col justify-end transition-colors duration-200"
              >
                <Stack gap={4}>
                  <Stack gap={2}>
                    <span className="text-[11px] font-semibold tracking-widest text-accent uppercase select-none">
                      {`0${idx + 1}`}
                    </span>
                    <h3 className="text-heading-md font-display text-text-primary">
                      {col.title}
                    </h3>
                    <p className="text-body-sm text-text-secondary text-pretty">
                      {col.description}
                    </p>
                  </Stack>
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold tracking-wider uppercase underline underline-offset-4 text-text-primary select-none cursor-pointer">
                      Explore
                    </span>
                  </div>
                </Stack>
              </div>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  )
}

// ── 4. Featured Products Section ──────────────────────────────────────────────
function FeaturedProductsSection() {
  const items = [
    { id: "edit-1", name: "Linen Draped Coat", collection: "Collection I", slug: "linen-draped-coat" },
    { id: "edit-2", name: "Tailored Cropped Jacket", collection: "Collection I", slug: "tailored-cropped-jacket" },
    { id: "edit-3", name: "Stoneware Vessel", collection: "Collection II", slug: "stoneware-vessel" },
    { id: "edit-4", name: "Oak Lounge Chair", collection: "Collection III", slug: "oak-lounge-chair" },
  ]

  return (
    <Section id="featured-products" padding="2xl" className="bg-background">
      <Container>
        <Stack gap={12}>
          {/* Section Heading */}
          <Stack gap={3} className="text-center max-w-[32rem] mx-auto">
            <span className="text-[11px] font-semibold tracking-widest text-accent uppercase select-none">
              Editor&apos;s Selection
            </span>
            <h2 className="text-heading-lg text-text-primary">
              Selected Pieces
            </h2>
          </Stack>

          {/* Grid Layout */}
          <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={6}>
            {items.map((item) => (
              <Link 
                key={item.id} 
                href={`/products/${item.slug}`}
                className="group flex flex-col gap-4 text-left"
              >
                {/* Visual Surface Placeholder */}
                <div className="bg-surface border border-border rounded-sm aspect-[3/4] transition-colors duration-200" />

                {/* Metadata details */}
                <Stack gap={2}>
                  <span className="text-[11px] font-semibold tracking-widest text-accent uppercase select-none">
                    {item.collection}
                  </span>
                  <h3 className="text-body-md font-medium text-text-primary group-hover:text-accent transition-colors duration-200">
                    {item.name}
                  </h3>
                  <div className="pt-1">
                    <span className="text-[11px] font-semibold tracking-wider uppercase underline underline-offset-4 text-text-primary transition-colors duration-200">
                      View Object
                    </span>
                  </div>
                </Stack>
              </Link>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  )
}

// ── 5. Trust Section ──────────────────────────────────────────────────────────
function TrustSection() {
  const pillars = [
    {
      id: "trust-1",
      title: "Thoughtful Craftsmanship",
      description: "Every object is formed with patience and meticulous attention. We work alongside small ateliers to protect traditional skill and ensure structural integrity.",
    },
    {
      id: "trust-2",
      title: "Exceptional Materials",
      description: "We select materials that mature beautifully with age. Organic linen, raw timbers, and stoneware are chosen for their tactile quality and durability.",
    },
    {
      id: "trust-3",
      title: "Restrained Aesthetic",
      description: "By focusing on shape, texture, and proportion rather than passing trends, our pieces blend quietly into modern living spaces.",
    },
  ]

  return (
    <Section id="trust" padding="2xl" className="bg-surface-elevated border-b border-border">
      <Container>
        <Stack gap={12}>
          {/* Section Heading */}
          <Stack gap={3} className="text-center max-w-[32rem] mx-auto">
            <span className="text-[11px] font-semibold tracking-widest text-accent uppercase select-none">
              Core Principles
            </span>
            <h2 className="text-heading-lg text-text-primary">
              The Values That Guide Us
            </h2>
          </Stack>

          {/* Pillars Grid */}
          <Grid cols={{ base: 1, md: 3 }} gap={12}>
            {pillars.map((pillar) => (
              <Stack key={pillar.id} gap={4} className="p-2 text-left">
                <h3 className="text-heading-sm font-display text-text-primary">
                  {pillar.title}
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  {pillar.description}
                </p>
              </Stack>
            ))}
          </Grid>
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
          <div className="flex flex-col sm:flex-row gap-4 w-full items-start">
            <div className="flex-1 w-full text-left">
              <label htmlFor="email-input" className="sr-only">
                Email address
              </label>
              <Input
                id="email-input"
                type="email"
                placeholder="Email address"
                variant="ghost"
                size="lg"
                className="w-full"
                required
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto shrink-0 tracking-widest uppercase text-[11px] font-semibold">
              Subscribe
            </Button>
          </div>
        </Stack>
      </Container>
    </Section>
  )
}
