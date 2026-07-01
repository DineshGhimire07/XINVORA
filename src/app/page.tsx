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
          <div className="relative h-12 w-12 select-none pointer-events-none mb-1">
            <Image
              src="/assets/brand/logos/Warm_taupe.png"
              alt="XINVORA Brand Emblem"
              fill
              sizes="48px"
              priority
              className="object-contain"
            />
          </div>

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
  return (
    <Section id="featured-categories" padding="lg" className="bg-surface-elevated">
      <Container>
        <Stack gap={10}>
          <div className="text-center">
            <h2 className="text-heading-lg text-text-primary">
              Shop by Category
            </h2>
          </div>
          <Grid cols={{ base: 1, md: 3 }} gap={6}>
            <div className="bg-surface border border-border p-8 rounded-sm h-64 flex items-end">
              <h3 className="text-heading-md text-text-primary">Fashion</h3>
            </div>
            <div className="bg-surface border border-border p-8 rounded-sm h-64 flex items-end">
              <h3 className="text-heading-md text-text-primary">Home</h3>
            </div>
            <div className="bg-surface border border-border p-8 rounded-sm h-64 flex items-end">
              <h3 className="text-heading-md text-text-primary">Accessories</h3>
            </div>
          </Grid>
        </Stack>
      </Container>
    </Section>
  )
}

// ── 4. Featured Products Section ──────────────────────────────────────────────
function FeaturedProductsSection() {
  return (
    <Section id="featured-products" padding="xl">
      <Container>
        <Stack gap={10}>
          <div className="text-center">
            <h2 className="text-heading-lg text-text-primary">
              Featured Pieces
            </h2>
          </div>
          <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={6}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface border border-border aspect-product p-6 rounded-sm flex flex-col justify-end">
                <h3 className="text-label-lg text-text-primary">Object {i}</h3>
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
  return (
    <Section id="trust" padding="lg" className="border-t border-border">
      <Container>
        <Grid cols={{ base: 1, md: 3 }} gap={8}>
          <Stack gap={3} align="center" className="text-center">
            <h3 className="text-label-lg text-text-primary">Thoughtful Sourcing</h3>
            <p className="text-body-sm text-text-secondary">Exceptional materials sourced with integrity and respect for detail.</p>
          </Stack>
          <Stack gap={3} align="center" className="text-center">
            <h3 className="text-label-lg text-text-primary">Meticulous Craft</h3>
            <p className="text-body-sm text-text-secondary">Objects built by partners who share our commitment to longevity.</p>
          </Stack>
          <Stack gap={3} align="center" className="text-center">
            <h3 className="text-label-lg text-text-primary">Global Compliance</h3>
            <p className="text-body-sm text-text-secondary">Delivering premium standard services to our global audience.</p>
          </Stack>
        </Grid>
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
