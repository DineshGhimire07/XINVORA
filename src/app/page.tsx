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
      padding="2xl"
      className="flex items-center justify-center min-h-[75vh] bg-surface-elevated border-b border-border"
    >
      <Container size="editorial">
        <Stack gap={8} align="center" className="text-center max-w-content-lg mx-auto">
          {/* Brand Emblem Logo */}
          <Image
            src="/assets/brand/logos/Warm_taupe.png"
            alt="XINVORA Brand Emblem"
            width={48}
            height={48}
            priority
            className="select-none pointer-events-none mb-1 object-contain"
          />

          {/* Eyebrow */}
          <span className="text-[11px] font-semibold tracking-widest text-accent uppercase select-none">
            Crafted to Last
          </span>

          {/* Heading title */}
          <h1 className="text-display-xl md:text-display-2xl font-display text-text-primary text-balance leading-tight tracking-tight">
            XINVORA
          </h1>

          {/* Supporting paragraph */}
          <p className="text-body-md md:text-body-lg text-text-secondary max-w-prose mx-auto text-pretty">
            A curation of objects designed with absolute intention—bringing quiet refinement and lasting quality to modern living.
          </p>

          {/* Primary & Secondary CTA Buttons */}
          <Stack direction="row" gap={4} justify="center" wrap="wrap" className="pt-2">
            <Button variant="primary" size="lg">
              Shop the Collection
            </Button>
            <Button variant="outline" size="lg">
              Our Philosophy
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  )
}

// ── 2. Brand Story Section ───────────────────────────────────────────────────
function BrandStorySection() {
  return (
    <Section id="brand-story" padding="xl" className="bg-background">
      <Container size="editorial">
        <Grid cols={{ base: 1, md: 2 }} gap={12} className="items-start">
          {/* Left Column: Eyebrow + Statement */}
          <Stack gap={4} className="max-w-prose">
            <span className="text-[11px] font-semibold tracking-widest text-accent uppercase select-none">
              Our Philosophy
            </span>
            <h2 className="text-heading-xl font-display text-text-primary text-balance leading-tight">
              Quiet confidence. Intentional design. Lasting value.
            </h2>
          </Stack>

          {/* Right Column: Editorial Details */}
          <Stack
            gap={6}
            className="text-text-secondary text-body-md md:text-body-lg max-w-prose leading-relaxed pt-2 md:pt-8"
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
    <Section id="featured-categories" padding="xl" className="bg-surface-elevated border-b border-border">
      <Container>
        <Stack gap={12}>
          {/* Section Heading */}
          <Stack gap={3} className="text-center max-w-content-md mx-auto">
            <span className="text-[11px] font-semibold tracking-widest text-accent uppercase select-none">
              Curated Spaces
            </span>
            <h2 className="text-heading-lg text-text-primary">
              Featured Collections
            </h2>
          </Stack>

          {/* Grid Layout */}
          <Grid cols={{ base: 1, md: 3 }} gap={6}>
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
    <Section id="featured-products" padding="xl">
      <Container>
        <Stack gap={12}>
          {/* Section Heading */}
          <Stack gap={3} className="text-center max-w-content-md mx-auto">
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
                <div className="bg-surface-elevated border border-border rounded-sm aspect-[3/4] transition-colors duration-200" />

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
    <Section id="trust" padding="xl" className="bg-background border-t border-border">
      <Container>
        <Stack gap={12}>
          {/* Section Heading */}
          <Stack gap={3} className="text-center max-w-content-md mx-auto">
            <span className="text-[11px] font-semibold tracking-widest text-accent uppercase select-none">
              Core Principles
            </span>
            <h2 className="text-heading-lg text-text-primary">
              The Values That Guide Us
            </h2>
          </Stack>

          {/* Pillars Grid */}
          <Grid cols={{ base: 1, md: 3 }} gap={8}>
            {pillars.map((pillar) => (
              <Stack key={pillar.id} gap={4} className="bg-surface border border-border p-8 rounded-sm">
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
    <Section id="newsletter" padding="xl" className="bg-surface-elevated border-t border-border">
      <Container size="sm">
        <Stack gap={4} align="center" className="text-center">
          <h2 className="text-heading-lg text-text-primary">Keep in Touch</h2>
          <p className="text-body-md text-text-secondary">Subscribe to receive campaign releases, journal essays, and private updates.</p>
        </Stack>
      </Container>
    </Section>
  )
}
