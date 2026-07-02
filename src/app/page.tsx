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
      className="flex items-stretch bg-surface-elevated border-b border-border min-h-[85vh]"
    >
      <Container className="py-34 md:py-50">
        {/*
         * Hero layout: 5 / 7 editorial split
         *
         * We use a direct div with Tailwind grid classes here (rather than
         * the Grid primitive) because the Grid component's useMemo requires
         * a client boundary, and this hero must remain a pure Server Component.
         * Direct class strings are also reliably detected by the Tailwind v4
         * content scanner at build time.
         */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-16 lg:gap-24 items-center">

          {/* ── Left Column: Editorial Content (5/12 on desktop) ── */}
          <div className="md:col-span-5 flex flex-col justify-center py-16 md:py-20">
            <div className="flex flex-col gap-10 max-w-[28rem]">

              {/* Brand emblem — small, restrained */}
              <Image
                src="/assets/brand/logos/Warm_taupe.png"
                alt="XINVORA Brand Emblem"
                width={40}
                height={40}
                priority
                className="select-none pointer-events-none object-contain"
              />

              {/* Editorial block: eyebrow + heading + description */}
              <div className="flex flex-col gap-6">
                {/* Eyebrow */}
                <span className="text-overline text-accent tracking-overline uppercase select-none">
                  Crafted to Last
                </span>

                {/* H1 — the visual anchor of the entire page */}
                <h1 className="text-display-xl lg:text-display-2xl font-display text-text-primary leading-tighter tracking-tightest text-balance">
                  XINVORA
                </h1>

                {/* Supporting paragraph — constrained width, generous leading */}
                <p className="text-body-md lg:text-body-lg text-text-secondary leading-relaxed max-w-[26rem] text-pretty">
                  A curation of objects designed with absolute intention—bringing quiet refinement and lasting quality to modern living.
                </p>
              </div>

              {/* CTA Row — primary dominates, secondary recedes */}
              <div className="flex flex-col sm:flex-row items-start gap-3 pt-2">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Shop the Collection
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Our Philosophy
                </Button>
              </div>

            </div>
          </div>

          {/* ── Right Column: Editorial Visual Area (7/12 on desktop) ── */}
          {/*
           * This column is reserved for future approved editorial photography.
           * By keeping aspect-[4/3] across all screen sizes, the placeholder
           * preserves exact proportions naturally and never collapses.
           */}
          <div className="md:col-span-7 w-full aspect-[4/3] bg-surface border border-border rounded-sm overflow-hidden select-none">
            {/* Intentionally empty — awaiting approved editorial photography */}
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
    { id: "edit-1", name: "Edition 01", collection: "Collection I" },
    { id: "edit-2", name: "Edition 02", collection: "Collection I" },
    { id: "edit-3", name: "Edition 03", collection: "Collection II" },
    { id: "edit-4", name: "Edition 04", collection: "Collection III" },
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
              <div key={item.id} className="group flex flex-col gap-4">
                {/* Visual Surface Placeholder */}
                <div className="bg-surface border border-border rounded-sm aspect-[3/4] transition-colors duration-200" />

                {/* Metadata details */}
                <Stack gap={2}>
                  <span className="text-[11px] font-semibold tracking-widest text-accent uppercase select-none">
                    {item.collection}
                  </span>
                  <h3 className="text-body-md font-medium text-text-primary">
                    {item.name}
                  </h3>
                  <div className="pt-1">
                    <span className="text-[11px] font-semibold tracking-wider uppercase underline underline-offset-4 text-text-primary select-none cursor-pointer">
                      View Object
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
            <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto shrink-0">
              Subscribe
            </Button>
          </div>
        </Stack>
      </Container>
    </Section>
  )
}
