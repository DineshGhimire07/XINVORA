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

import { db } from "@/db/client"
import { cmsPages, cmsSections, cmsBlocks } from "@/db/schema/cms"
import { eq, and, isNull } from "drizzle-orm"
import { CMSBlockRenderer } from "@/components/cms/BlockRenderer"
import { AdminSettingsService } from "@/services/admin/settings.service"

export const metadata = buildMetadata({
  title: "Our Story",
  description: "Learn about the XINVORA story, design philosophy, materials, craftsmanship, and sustainability principles.",
})

export default async function AboutPage() {
  const aboutSettings = await AdminSettingsService.getSetting("about_page")

  // Attempt to load from CMS
  const cmsResult = await db.query.cmsPages.findFirst({
    where: and(eq(cmsPages.slug, "about"), eq(cmsPages.status, "PUBLISHED"), isNull(cmsPages.deletedAt)),
    with: {
      sections: {
        with: {
          blocks: true,
        },
      },
    },
  })

  // If CMS page exists, render its dynamic blocks
  if (cmsResult) {
    return (
      <main className="flex-1 bg-background pt-20 md:pt-28">
        {cmsResult.sections.sort((a, b) => a.sortOrder - b.sortOrder).map(section => (
          <div key={section.id}>
            {section.blocks.sort((a, b) => a.sortOrder - b.sortOrder).map(block => (
              <CMSBlockRenderer key={block.id} block={block} />
            ))}
          </div>
        ))}
      </main>
    )
  }

  // Fallback to static layout if CMS page doesn't exist
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28">
      
      {/* 1. Hero Section */}
      <Section id="brand-hero" padding="none" className="bg-background relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Subtle background abstract element */}
        <div className="absolute inset-0 bg-surface-secondary/30">
          <div className="absolute top-0 right-0 w-full md:w-2/3 h-full bg-gradient-to-l from-surface to-transparent" />
        </div>
        <Container className="relative z-10 w-full py-24 md:py-32">
          <Grid cols={{ base: 1, md: 12 }} gap={8} className="items-center">
            <div className="md:col-span-8 lg:col-span-6">
              <Stack gap={8} className="text-left">
                <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none flex items-center gap-4">
                  <span className="w-8 h-[1px] bg-accent" /> About
                </span>
                <h1 className="text-display-xl font-display text-text-primary leading-tight tracking-tight text-balance">
                  Redefining<br className="hidden md:block" /> Everyday Luxury.
                </h1>
                <div className="text-body-lg text-text-secondary leading-relaxed max-w-[32rem] space-y-6 text-pretty font-light">
                  <p>
                    Luxury isn&apos;t defined by a logo or a price tag. It&apos;s found in thoughtful design, timeless style, exceptional quality, and an experience that makes every purchase feel special. That&apos;s the philosophy behind XINVORA.
                  </p>
                </div>
              </Stack>
            </div>
            {/* Hero Editorial Image Placeholder */}
            <div className="md:col-span-4 lg:col-span-6 mt-12 md:mt-0 relative w-full h-[50vh] md:h-[70vh]">
              <div className="absolute inset-0 bg-surface border border-border/50 overflow-hidden rounded-sm shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-1000 ease-out">
                {aboutSettings?.heroImage ? (
                  <img src={aboutSettings.heroImage} alt="About Xinvora" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-full h-full bg-gradient-to-tr from-surface-secondary to-transparent opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <span className="text-display-xl font-display tracking-widest text-text-primary">XINVORA</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Grid>
        </Container>
      </Section>

      {/* Philosophy - The rest of the Hero text */}
      <Section padding="2xl" className="bg-surface-elevated border-y border-border/40">
        <Container>
          <div className="max-w-[48rem] mx-auto text-center space-y-8">
            <h2 className="text-heading-lg font-display text-text-primary italic">
              "We created XINVORA to become more than an online store."
            </h2>
            <div className="text-body-md text-text-secondary leading-relaxed space-y-6 max-w-[40rem] mx-auto text-pretty">
              <p>
                Our vision is to build Nepal&apos;s leading premium lifestyle destination — bringing together carefully curated fashion, home décor, accessories, and everyday essentials that inspire confidence and elevate modern living, without the premium price tag that usually comes with it.
              </p>
              <p>
                Every product on our platform is selected with purpose. We focus on quality, aesthetics, functionality, and value instead of chasing short-lived trends — and we work hard to keep our prices honest, so great design never has to come at a luxury cost.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 2. Curated, Not Crowded (Editorial Split) */}
      <Section id="curated" padding="2xl" className="bg-background">
        <Container>
          <Grid cols={{ base: 1, md: 12 }} gap={16} className="items-center">
            {/* Image Block */}
            <div className="md:col-span-5 relative w-full aspect-[4/5] bg-surface-secondary border border-border/50 rounded-sm overflow-hidden">
               {aboutSettings?.curatedImage ? (
                 <img src={aboutSettings.curatedImage} alt="Curated Xinvora" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface to-surface-elevated opacity-80" />
               )}
            </div>
            
            {/* Text Block */}
            <div className="md:col-span-7 flex flex-col justify-center">
              <Stack gap={6} className="text-left max-w-[32rem] md:ml-auto">
                <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                  Our Standard
                </span>
                <h2 className="text-display-sm font-display text-text-primary leading-tight">
                  Curated, Not Crowded
                </h2>
                <div className="w-12 h-[1px] bg-border my-2" />
                <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
                  The internet is filled with endless products, countless marketplaces, and overwhelming choices. We believe shopping should feel different.
                </p>
                <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
                  Rather than offering thousands of random items, we carefully curate collections that meet our standards for design, quality, and reliability. Every product earns its place before it reaches our customers.
                </p>
                <p className="text-body-lg font-display italic text-text-primary mt-4">
                  Quality over quantity. Always.
                </p>
              </Stack>
            </div>
          </Grid>
        </Container>
      </Section>

      {/* 3. Designed Well. Priced Fairly. (Reverse Editorial Split) */}
      <Section id="pricing" padding="2xl" className="bg-surface-elevated border-y border-border/40">
        <Container>
          <Grid cols={{ base: 1, md: 12 }} gap={16} className="items-center">
            {/* Text Block */}
            <div className="md:col-span-7 flex flex-col justify-center md:order-1 order-2">
              <Stack gap={6} className="text-left max-w-[32rem]">
                <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                  Our Value
                </span>
                <h2 className="text-display-sm font-display text-text-primary leading-tight">
                  Designed Well.<br />Priced Fairly.
                </h2>
                <div className="w-12 h-[1px] bg-border my-2" />
                <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
                  We believe good design and fair pricing aren&apos;t opposites. By working directly with makers and cutting out unnecessary markups, we bring you pieces that look and feel premium — without charging you for a brand name alone.
                </p>
                <p className="text-body-lg font-display italic text-text-primary mt-4">
                  Better quality, better design, better value. That&apos;s the standard we hold every product to.
                </p>
              </Stack>
            </div>

            {/* Image Block */}
            <div className="md:col-span-5 relative w-full aspect-[4/5] bg-background border border-border/50 rounded-sm overflow-hidden md:order-2 order-1">
               {aboutSettings?.pricingImage ? (
                 <img src={aboutSettings.pricingImage} alt="Xinvora Pricing" className="w-full h-full object-cover" />
               ) : (
                 <>
                   <div className="w-full h-full bg-gradient-to-br from-transparent to-surface-secondary" />
                   <div className="absolute inset-0 flex items-center justify-center mix-blend-overlay opacity-20">
                     <div className="w-32 h-32 rounded-full border border-text-primary" />
                   </div>
                 </>
               )}
            </div>
          </Grid>
        </Container>
      </Section>

      {/* 4. Built on Trust */}
      <Section id="trust" padding="2xl" className="bg-background">
        <Container>
          <Stack gap={16}>
            <Stack gap={4} className="max-w-[40rem] text-center mx-auto">
              <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                Our Commitment
              </span>
              <h2 className="text-heading-xl font-display text-text-primary leading-tight">
                Built on Trust
              </h2>
              <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
                Great products mean little without great service. That&apos;s why XINVORA is committed to providing:
              </p>
            </Stack>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 text-left">
              <Stack gap={4} className="border-t border-border pt-6">
                <span className="text-[10px] font-bold tracking-[0.2em] text-accent select-none">01</span>
                <h3 className="text-heading-xs font-display text-text-primary uppercase tracking-wide">
                  Carefully Selected
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Premium products that meet our rigorous standards for quality.
                </p>
              </Stack>
              <Stack gap={4} className="border-t border-border pt-6">
                <span className="text-[10px] font-bold tracking-[0.2em] text-accent select-none">02</span>
                <h3 className="text-heading-xs font-display text-text-primary uppercase tracking-wide">
                  Transparent Pricing
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Honest pricing without hidden fees or excessive markups.
                </p>
              </Stack>
              <Stack gap={4} className="border-t border-border pt-6">
                <span className="text-[10px] font-bold tracking-[0.2em] text-accent select-none">03</span>
                <h3 className="text-heading-xs font-display text-text-primary uppercase tracking-wide">
                  Secure Shopping
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  A safe, reliable, and protected online shopping experience.
                </p>
              </Stack>
              <Stack gap={4} className="border-t border-border pt-6">
                <span className="text-[10px] font-bold tracking-[0.2em] text-accent select-none">04</span>
                <h3 className="text-heading-xs font-display text-text-primary uppercase tracking-wide">
                  Fast & Dependable
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Reliable customer support and fast delivery on every single order.
                </p>
              </Stack>
            </div>
            
            <div className="mt-8 text-center max-w-[40rem] mx-auto">
              <p className="text-heading-md font-display text-text-primary italic text-balance">
                "Trust isn't something we expect. It's something we earn with every order."
              </p>
            </div>
          </Stack>
        </Container>
      </Section>

      {/* 5. Vision and Mission */}
      <Section id="vision-mission" padding="2xl" className="bg-surface border-y border-border/40">
        <Container>
          <Grid cols={{ base: 1, md: 2 }} gap={0} className="items-stretch border border-border">
            <Stack gap={6} className="p-10 md:p-16 text-left border-b md:border-b-0 md:border-r border-border bg-background hover:bg-surface-elevated transition-colors">
              <span className="text-[10px] font-bold tracking-widest text-accent select-none flex items-center gap-3">
                <span className="w-4 h-[1px] bg-accent" /> OUR VISION
              </span>
              <h3 className="text-heading-md font-display text-text-primary leading-snug">
                To become Nepal&apos;s most trusted premium lifestyle platform.
              </h3>
              <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                Expanding globally — creating a destination where customers discover products that combine elegance, quality, and lasting value, at prices that make sense.
              </p>
            </Stack>

            <Stack gap={6} className="p-10 md:p-16 text-left bg-background hover:bg-surface-elevated transition-colors">
              <span className="text-[10px] font-bold tracking-widest text-accent select-none flex items-center gap-3">
                <span className="w-4 h-[1px] bg-accent" /> OUR MISSION
              </span>
              <h3 className="text-heading-md font-display text-text-primary leading-snug">
                To make premium living more accessible.
              </h3>
              <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                By delivering carefully curated products and an exceptional shopping experience — proving that quality design shouldn&apos;t be reserved for those willing to overpay for it.
              </p>
            </Stack>
          </Grid>
        </Container>
      </Section>

      {/* 6. The Future We're Building */}
      <Section id="future" padding="2xl" className="bg-background">
        <Container>
          <Grid cols={{ base: 1, md: 12 }} gap={12} className="items-center">
            <div className="md:col-span-6 flex flex-col items-start text-left max-w-[32rem]">
              <Stack gap={6}>
                <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                  Looking Ahead
                </span>
                <h2 className="text-display-sm font-display text-text-primary leading-tight">
                  The Future We&apos;re Building
                </h2>
                <div className="w-12 h-[1px] bg-border my-2" />
                <p className="text-body-md text-text-primary font-medium leading-relaxed text-pretty">
                  XINVORA is only getting started.
                </p>
                <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
                  As we grow, we&apos;ll continue expanding our collections, introducing trusted brands, partnering with talented creators, and building technology that makes online shopping simpler, smarter, and more enjoyable — all while staying true to our promise: great design, real quality, fair prices.
                </p>
              </Stack>
            </div>
            <div className="md:col-span-6 w-full aspect-[4/3] bg-surface-elevated border border-border rounded-sm overflow-hidden select-none relative group">
              {aboutSettings?.futureImage ? (
                <img src={aboutSettings.futureImage} alt="Xinvora Future" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-secondary to-transparent opacity-80" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity duration-700">
                    <span className="text-[8px] tracking-[0.5em] text-text-primary mb-2">FOUNDATION</span>
                    <div className="w-[1px] h-12 bg-text-primary/20" />
                  </div>
                </>
              )}
            </div>
          </Grid>
        </Container>
      </Section>

      {/* 7. Closing Statement */}
      <Section id="brand-closing" padding="2xl" className="bg-surface border-t border-border/40">
        <Container>
          <div className="text-center py-16">
            <Stack gap={6} align="center">
              <h3 className="text-heading-xs text-text-primary uppercase tracking-[0.3em] font-bold">
                Welcome to XINVORA.
              </h3>
              <blockquote className="text-display-md font-display italic text-text-secondary max-w-[40rem] mx-auto leading-relaxed select-none">
                Curated with purpose.<br />Priced with intention.
              </blockquote>
            </Stack>
          </div>
        </Container>
      </Section>

    </main>
  )
}
