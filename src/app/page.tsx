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
    <Section id="hero" padding="2xl" className="flex items-center justify-center min-h-[60vh] bg-surface-elevated">
      <Container size="editorial">
        <Stack gap={6} align="center" className="text-center">
          <h1 className="text-display-xl font-display text-text-primary text-balance">
            XINVORA
          </h1>
          <p className="text-body-lg text-text-secondary max-w-prose text-pretty">
            Crafted for the way you live. Discover objects of lasting quality.
          </p>
        </Stack>
      </Container>
    </Section>
  )
}

// ── 2. Brand Story Section ───────────────────────────────────────────────────
function BrandStorySection() {
  return (
    <Section id="brand-story" padding="xl">
      <Container size="lg">
        <Stack gap={4} className="max-w-content-md mx-auto text-center">
          <h2 className="text-heading-lg text-text-primary">
            Our Philosophy
          </h2>
          <p className="text-body-md text-text-secondary text-pretty">
            We believe in things that transcend the moment in which they were purchased. No trends, no noise — just considered materials, meticulous craftsmanship, and quiet confidence.
          </p>
        </Stack>
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
