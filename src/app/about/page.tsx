/**
 * app/about/page.tsx — XINVORA Brand Experience Foundation
 *
 * Implements the premium About XINVORA brand experience.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import * as React from "react"

export const metadata = buildMetadata({
  title: "Our Story",
  description: "Learn about the XINVORA story, design philosophy, materials, craftsmanship, and sustainability principles.",
})

export default function AboutPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28">
      
      {/* 1. Editorial Hero */}
      <Section id="brand-hero" padding="xl" className="bg-background">
        <Container>
          <Stack gap={8} className="max-w-[40rem] text-left">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              About XINVORA
            </span>
            <h1 className="text-display-xl font-display text-text-primary leading-tight tracking-tight text-balance">
              Designed with intention.
              <br />
              Made to endure.
            </h1>
            <p className="text-body-lg text-text-secondary leading-relaxed max-w-[32rem] text-pretty">
              XINVORA exists to prove that digital commerce can carry the same weight of quality as the objects it holds. We design for longevity, restraint, and quiet confidence.
            </p>
          </Stack>
        </Container>
      </Section>

      {/* 2. Our Story */}
      <Section id="brand-story" padding="2xl" className="bg-surface-elevated border-y border-border/40">
        <Container>
          <Grid cols={{ base: 1, md: 2 }} gap={16} className="items-start">
            {/* Left Column */}
            <Stack gap={4} className="max-w-[32rem] text-left">
              <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                Our Beginnings
              </span>
              <h2 className="text-heading-xl font-display text-text-primary leading-tight">
                A reaction against noise.
              </h2>
            </Stack>
            {/* Right Column */}
            <Stack gap={6} className="text-text-secondary text-body-md leading-relaxed max-w-[32rem] text-left">
              <p className="text-pretty">
                XINVORA was born out of a desire to create space for silence. In a world defined by fast-paced consumption and temporary trends, we chose the path of restraint. We believe that the environment you curate around yourself directly shapes your focus and calm.
              </p>
              <p className="text-pretty">
                We set out to create objects that hold weight. Not through physical bulk or visual decoration, but through the density of thought, premium materials, and traditional workmanship behind them.
              </p>
            </Stack>
          </Grid>
        </Container>
      </Section>

      {/* 3. Design Philosophy */}
      <Section id="brand-principles" padding="2xl" className="bg-background">
        <Container>
          <Stack gap={16}>
            {/* Header */}
            <Stack gap={3} className="text-left max-w-[32rem]">
              <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                Design Philosophy
              </span>
              <h2 className="text-heading-xl font-display text-text-primary">
                The Guidelines of Restraint
              </h2>
            </Stack>

            {/* Principles Cards Grid */}
            <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={6}>
              <Stack gap={4} className="p-4 bg-surface border border-border rounded-sm text-left">
                <span className="text-[11px] font-bold tracking-widest text-accent select-none">01</span>
                <h3 className="text-heading-xs font-display text-text-primary uppercase tracking-wide">
                  Timeless over Trend
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  We design for years, not seasons. If a design detail does not stand a five-year aesthetic test, it is removed.
                </p>
              </Stack>

              <Stack gap={4} className="p-4 bg-surface border border-border rounded-sm text-left">
                <span className="text-[11px] font-bold tracking-widest text-accent select-none">02</span>
                <h3 className="text-heading-xs font-display text-text-primary uppercase tracking-wide">
                  Quality over Quantity
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Fewer objects of exceptional quality carry more value than a catalogue of compromises. Curation is the product.
                </p>
              </Stack>

              <Stack gap={4} className="p-4 bg-surface border border-border rounded-sm text-left">
                <span className="text-[11px] font-bold tracking-widest text-accent select-none">03</span>
                <h3 className="text-heading-xs font-display text-text-primary uppercase tracking-wide">
                  Quiet Confidence
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Our objects do not shout for attention. They speak through shape, material weight, and natural surface textures.
                </p>
              </Stack>

              <Stack gap={4} className="p-4 bg-surface border border-border rounded-sm text-left">
                <span className="text-[11px] font-bold tracking-widest text-accent select-none">04</span>
                <h3 className="text-heading-xs font-display text-text-primary uppercase tracking-wide">
                  Function with Elegance
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  An object must serve a purpose. True elegance is the complete alignment of utility and aesthetic form.
                </p>
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* 4. Materials */}
      <Section id="brand-materials" padding="2xl" className="bg-surface-elevated border-y border-border/40">
        <Container>
          <Grid cols={{ base: 1, md: 2 }} gap={16} className="items-start">
            {/* Left Column */}
            <Stack gap={4} className="max-w-[32rem] text-left">
              <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                The Raw Elements
              </span>
              <h2 className="text-heading-xl font-display text-text-primary">
                Honest Materials
              </h2>
              <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
                We select materials that mature beautifully with age. Tonal linen, organic canvas, and raw timbers are chosen for tactile quality and environmental integrity.
              </p>
            </Stack>

            {/* Right Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 text-left">
              <Stack gap={2}>
                <h3 className="text-body-md font-bold text-text-primary uppercase tracking-wide">
                  Organic Cotton
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Heavy weight canvas and soft jersey, selected for skin comfort and durability.
                </p>
              </Stack>
              <Stack gap={2}>
                <h3 className="text-body-md font-bold text-text-primary uppercase tracking-wide">
                  Belgian Linen
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Grown with minimal water, mature flax fibres chosen for breathability and structural drape.
                </p>
              </Stack>
              <Stack gap={2}>
                <h3 className="text-body-md font-bold text-text-primary uppercase tracking-wide">
                  FSC Oak Timber
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Sourced from sustainably managed forests, chosen for density and natural grain maturation.
                </p>
              </Stack>
              <Stack gap={2}>
                <h3 className="text-body-md font-bold text-text-primary uppercase tracking-wide">
                  Raw Ceramics
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Locally sourced clays wood-fired in high-temperature kilns, retaining earth textures.
                </p>
              </Stack>
            </div>
          </Grid>
        </Container>
      </Section>

      {/* 5. Craftsmanship */}
      <Section id="brand-craftsmanship" padding="2xl" className="bg-background">
        <Container>
          <Grid cols={{ base: 1, md: 12 }} gap={12} className="items-center">
            {/* Left Column: Visual Placeholder */}
            <div className="md:col-span-6 w-full aspect-product bg-surface border border-border rounded-sm overflow-hidden select-none">
              <div className="w-full h-full bg-gradient-to-b from-transparent to-black/[0.01]" />
            </div>
            {/* Right Column: Editorial Typography */}
            <div className="md:col-span-6 flex flex-col items-start text-left max-w-[32rem] md:pl-8">
              <Stack gap={6}>
                <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                  Production Philosophy
                </span>
                <h2 className="text-heading-xl font-display text-text-primary leading-tight">
                  Patient Manufacture
                </h2>
                <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
                  We collaborate exclusively with small, family-owned workshops in Portugal, Italy, and Japan. These relationships are built on shared respect for traditional trades and fair workspace environments.
                </p>
                <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
                  Every seam is bound, every joint is fitted, and every ceramic vessel is hand-thrown. This slow pace allows us to inspect every detail before it leaves the workshop, ensuring structural permanence.
                </p>
              </Stack>
            </div>
          </Grid>
        </Container>
      </Section>

      {/* 6. Sustainability */}
      <Section id="brand-sustainability" padding="2xl" className="bg-surface-elevated border-y border-border/40">
        <Container>
          <Grid cols={{ base: 1, md: 2 }} gap={16} className="items-start">
            {/* Left Column */}
            <Stack gap={4} className="max-w-[32rem] text-left">
              <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                Our Responsibility
              </span>
              <h2 className="text-heading-xl font-display text-text-primary">
                Authentic Sustainability
              </h2>
            </Stack>
            {/* Right Column */}
            <Stack gap={6} className="text-text-secondary text-body-md leading-relaxed max-w-[32rem] text-left">
              <p className="text-pretty">
                We do not believe in greenwashed marketing labels or carbon offset metrics. We believe in transparency and longevity. Our primary sustainability contribution is creating objects that do not need to be replaced.
              </p>
              <p className="text-pretty">
                We produce in limited, controlled editions to prevent overproduction and deadstock. All items are shipped in 100% recyclable, paper-based packaging with zero plastic inserts.
              </p>
            </Stack>
          </Grid>
        </Container>
      </Section>

      {/* 7. Timeline */}
      <Section id="brand-timeline" padding="2xl" className="bg-background">
        <Container>
          <Stack gap={12} align="center" className="text-center">
            <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
              The Journey
            </span>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full max-w-[60rem] pt-6 select-none">
              
              <Stack gap={1} align="center">
                <span className="text-[10px] font-semibold text-accent uppercase">01</span>
                <span className="text-body-md font-bold text-text-primary uppercase tracking-wider">Vision</span>
              </Stack>
              
              <span className="text-text-secondary text-heading-md font-light rotate-90 md:rotate-0">&rarr;</span>
              
              <Stack gap={1} align="center">
                <span className="text-[10px] font-semibold text-accent uppercase">02</span>
                <span className="text-body-md font-bold text-text-primary uppercase tracking-wider">Design</span>
              </Stack>
              
              <span className="text-text-secondary text-heading-md font-light rotate-90 md:rotate-0">&rarr;</span>
              
              <Stack gap={1} align="center">
                <span className="text-[10px] font-semibold text-accent uppercase">03</span>
                <span className="text-body-md font-bold text-text-primary uppercase tracking-wider">Craft</span>
              </Stack>
              
              <span className="text-text-secondary text-heading-md font-light rotate-90 md:rotate-0">&rarr;</span>
              
              <Stack gap={1} align="center">
                <span className="text-[10px] font-semibold text-accent uppercase">04</span>
                <span className="text-body-md font-bold text-text-primary uppercase tracking-wider">Collection</span>
              </Stack>
              
              <span className="text-text-secondary text-heading-md font-light rotate-90 md:rotate-0">&rarr;</span>
              
              <Stack gap={1} align="center">
                <span className="text-[10px] font-semibold text-accent uppercase">05</span>
                <span className="text-body-md font-bold text-text-primary uppercase tracking-wider">Everyday Life</span>
              </Stack>

            </div>
          </Stack>
        </Container>
      </Section>

      {/* 8. Closing Statement */}
      <Section id="brand-closing" padding="xl" className="bg-surface-elevated border-t border-border/40">
        <Container>
          <div className="text-center py-12">
            <blockquote className="text-display-sm font-display italic text-text-primary max-w-[40rem] mx-auto leading-relaxed select-none">
              &ldquo;Luxury isn&apos;t excess. It&apos;s choosing better.&rdquo;
            </blockquote>
          </div>
        </Container>
      </Section>

    </main>
  )
}
