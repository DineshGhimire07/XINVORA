/**
 * app/journal/[slug]/page.tsx — XINVORA Journal Dynamic Article Page
 *
 * Implements the long-form typography reading experience.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import { Breadcrumb } from "@/components/shared/Breadcrumb/Breadcrumb"
import Link from "next/link"
import * as React from "react"
import { JOURNAL_DATA } from "../page"

interface ArticleContent {
  intro: string
  body1: string
  body2: string
  quote: string
  body3: string
}

const ARTICLES_CONTENT: Record<string, ArticleContent> = {
  "belgian-flax-sourcing-pure-linen": {
    intro: "Linen is one of the oldest cultivated fibers in human history, valued for its extraordinary strength, cooling touch, and natural luster. At XINVORA, we source our flax exclusively from certified Belgian fields to build garments that endure.",
    body1: "The journey of Belgian flax begins in the mild climate of Western Europe, where sea breezes and rich soil generate ideal growing conditions. Unlike industrial cotton, flax requires no artificial irrigation and far fewer fertilizers. The plant is pulled, not cut, to preserve the full length of the fiber, which yields a finished thread of unique density and strength.",
    body2: "Once harvested, the fibers undergo retting—a natural decomposition process using dew and moisture—to separate the flax from the woody stem. This raw material is then combed, spun, and woven on historical looms. The resulting fabric carries organic variations in its texture, giving each drape a distinct personality that softens and gains character with every wash.",
    quote: "Linen is not just a seasonal fabric; it is a canvas of patience. It breathes when the air is warm, holds warmth when the breeze cools, and behaves as a living second skin.",
    body3: "By choosing belgian flax, we commit to a cycle of slow production. Because the long-staple fiber does not break down or pill like short-staple cotton, it achieves structural permanence, remaining in use for generations rather than seasons. It is an honest material designed to last.",
  },
  "the-art-of-slow-tailoring": {
    intro: "Unstructured tailoring shifts the focus of a garment from its internal padding to the natural drape of the textile itself. By removing stiff interlinings, we create clothes that move in complete alignment with the body.",
    body1: "Traditional tailoring relies on canvas chest pieces, shoulder pads, and synthetic glues to force fabric into a rigid shape. Slow tailoring, however, trusts the raw characteristics of the fiber. We cut our garments with loose drop shoulders and floating seams, allowing unstructured Belgian linen and raw canvases to establish their own organic silhouette.",
    body2: "An essential component of slow tailoring is interior finishing. Since there are no linings to hide construction shortcuts, every interior seam is bound with silk or fine cotton piping. This double-seam structure reinforces the garment's stress points, preventing fraying and ensuring the piece is just as beautiful on the inside as it is on the outside.",
    quote: "A garment should never restrict or define you. It should sit comfortably on the shoulder, flow naturally with your gait, and provide a quiet layer of reassurance.",
    body3: "This patient assembly requires double the sewing hours of standard commercial manufacturing. But the result is a piece that feels weightless, folds flat for travel, and ages with soft creases that reflect your daily movements.",
  },
  "edition-01-behind-the-shapes": {
    intro: "The creation of Edition 01 was a study in restraint. We spent six months drafting three simple silhouettes, stripping away everything that did not serve a primary function.",
    body1: "We began by selecting a single neutral tone—Warm Taupe—and exploring how light casts shadows across different fabric weights. Our design team focused entirely on the collar geometry and sleeve drapes. The goal was to establish patterns that look considered whether buttoned to the neck or left floating open.",
    body2: "Every button hole, seam angle, and hem depth was iterated across multiple prototypes. We adjusted the drop shoulder of the Draped Coat by millimeters to prevent it from feeling bulky on smaller frames, while maintaining its spacious presence on larger viewports.",
    quote: "True simplicity is not the absence of design; it is the absolute distillation of purpose. When nothing can be added or removed, the form is complete.",
    body3: "Edition 01 represents our core belief: that luxury is found in the background. By choosing neutral palettes and classic proportions, these garments become silent backdrops for your everyday life.",
  },
  "kyoto-wood-kilns-stoneware": {
    intro: "High-temperature wood-firing kilns allow natural ash and flames to paint surfaces dynamically. No two hand-thrown stoneware vessels are ever identical.",
    body1: "In Toyama and Kyoto, our ceramics are formed from local iron-rich clays. Once hand-thrown on the wheel, they are dried slowly before entering the multi-chamber anagama kiln. The kiln is fueled exclusively with split pinewood, which burns at temperatures exceeding 1,200 degrees Celsius over a continuous 36-hour cycle.",
    body2: "During this intense firing, fly-ash from the wood melts onto the raw stoneware clay, creating a natural green-to-brown glaze. The path of the flames leaves unique scorch markings and color gradations. This completely bypasses industrial chemical glazes, allowing the vessel to emerge with a raw, earthy exterior.",
    quote: "The wood kiln forces the potter to surrender control. We shape the clay and stack the chambers, but the fire decides the final surface.",
    body3: "When the kiln cools after several days, we inspect each piece. Those that survive the firing carry a depth of color and surface texture that cannot be replicated. They are quiet testaments to patience and natural heat.",
  },
  "restructuring-domestic-spacing": {
    intro: "Our domestic environments are active extensions of our mental states. By removing clutter and organizing spaces with intent, we create a quiet buffer against external noise.",
    body1: "Modern living is often defined by visual density—an accumulation of temporary items and mismatched textures. Restructuring space begins with reduction. We advise focusing on clean, horizontal surfaces, ensuring that the console tables and desks we work on remain largely blank, allowing the mind room to breathe.",
    body2: "Choosing furniture should follow the same principles of restraint. A console table or lounge chair should be positioned to respect the negative space around it. When an object is allowed room to breathe, its visual weight is elevated, and it becomes a source of calm rather than distraction.",
    quote: "Clutter is not just physical; it is an aesthetic weight. An organized, quiet corner provides immediate reassurance and mental space.",
    body3: "We encourage surrounding ourselves with honest materials—solid oak, heavy linen, raw pottery. These surfaces do not demand attention, but offer tactile satisfaction, grounding us in the physical space of everyday life.",
  },
  "patina-of-solid-timber": {
    intro: "Unlike engineered composites or plastic veneers, solid timber is a living, breathing material. As it absorbs light, humidity, and daily handling, it matures into a deep golden patina.",
    body1: "We construct our furniture using European White Oak. Every timber plank is dried slowly to prevent warping, then joined using traditional mortise-and-tenon joints. Rather than sealing the wood under thick, yellowing polyurethane lacquers, we treat the oak with a thin coating of dry matte wax-oil.",
    body2: "This open-pore finish protects the timber from stains while letting the natural grain patterns breathe. When you touch the console table, you feel the raw texture of the oak fibers, not a layer of plastic. Over months and years, exposure to sunlight oxidizes the timber, deepening its character.",
    quote: "An object should not look its best the day it is purchased. It should grow more beautiful, more intimate, and more unique with age and use.",
    body3: "The scratches, water marks, and daily wear are not defects; they are the narrative of your home. Choosing solid oak is a commitment to a material that coexists with you and ages with quiet grace.",
  },
}

const DEFAULT_CONTENT: ArticleContent = {
  intro: "Editorial stories tracing design processes, material sourcing notes, and private collection releases at XINVORA. Designed to communicate craftsmanship and quiet confidence.",
  body1: "We believe that behind every finished object is a long sequence of decisions—from selecting the raw fiber to working with specialized family-owned workshops. In this publication, we document these stories to share the patient work that defines XINVORA.",
  body2: "Longevity is not just a physical trait; it is a visual and emotional one. An object that is well-made but quickly discarded due to changing trends fails the sustainability test. By writing about materials and craftsmanship, we build a deeper connection between the user and the object.",
  quote: "Luxury is not about excess or decoration. It is the absolute distillation of quality, utility, and timeless design.",
  body3: "Our journal entries are published in limited editions, reflecting the controlled pace of our product releases. We invite you to read, reflect, and live with considered intention.",
}

export async function generateStaticParams() {
  return JOURNAL_DATA.map((story) => ({ slug: story.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const story = JOURNAL_DATA.find((s) => s.slug === resolvedParams.slug)
  return buildMetadata({
    title: story ? story.title : "Editorial",
    description: story ? story.excerpt : "XINVORA Journal Entry",
  })
}

export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const story = JOURNAL_DATA.find((s) => s.slug === resolvedParams.slug)

  // Default fallback if story slug is not matched
  const articleMeta = story || {
    title: "Editorial Story",
    category: "Journal",
    readTime: "5 min read",
    date: "July 2026",
    slug: "editorial-story",
  }
  const content = ARTICLES_CONTENT[resolvedParams.slug] || DEFAULT_CONTENT

  // Curate related stories (exclude current slug, take first 3)
  const relatedStories = JOURNAL_DATA
    .filter((s) => s.slug !== resolvedParams.slug)
    .slice(0, 3)

  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      <Container>
        
        {/* Breadcrumbs */}
        <Breadcrumb 
          items={[
            { label: "Journal", href: "/journal" },
            { label: articleMeta.title }
          ]} 
        />

        {/* 1. Article Hero */}
        <Section id="article-hero" padding="md" className="bg-background text-left">
          <Stack gap={4} className="max-w-[40rem] mx-auto">
            <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
              {articleMeta.category}
            </span>
            <h1 className="text-display-md md:text-display-lg font-display text-text-primary leading-tight tracking-tight text-balance">
              {articleMeta.title}
            </h1>
            <span className="text-[10px] font-semibold tracking-widest text-text-secondary uppercase select-none">
              {articleMeta.readTime} &bull; {articleMeta.date}
            </span>
          </Stack>
        </Section>

        {/* 2. Intro Paragraph (Large Lead-in) */}
        <Section id="article-intro" padding="none" className="bg-background">
          <div className="max-w-[40rem] mx-auto border-l-2 border-accent pl-6 my-6 text-left">
            <p className="text-body-lg text-text-primary leading-relaxed font-light text-pretty">
              {content.intro}
            </p>
          </div>
        </Section>

        {/* 3. Reading Layout (Spacious Long-form Typography) */}
        <Section id="article-body" padding="md" className="bg-background text-left">
          <div className="max-w-[40rem] mx-auto text-text-secondary text-body-md leading-relaxed space-y-6 text-pretty font-light">
            <p>{content.body1}</p>
            <p>{content.body2}</p>
            
            {/* 4. Pull Quote */}
            <blockquote className="my-12 border-y border-border/40 py-8 text-display-sm font-display italic text-text-primary leading-relaxed select-none pl-4 pr-2">
              &ldquo;{content.quote}&rdquo;
            </blockquote>

            <p>{content.body3}</p>
          </div>
        </Section>

        {/* 5. Large Editorial Image Placeholder */}
        <Section id="article-media" padding="md" className="bg-background">
          <div className="w-full aspect-[21/9] bg-surface border border-border rounded-sm overflow-hidden select-none">
            <div className="w-full h-full bg-gradient-to-b from-transparent to-black/[0.01]" />
          </div>
        </Section>

        {/* 6. Related Stories */}
        <Section id="article-related" padding="lg" className="border-t border-border/20 mt-16">
          <Stack gap={10} className="text-left">
            {/* Header */}
            <div className="flex items-center justify-between select-none border-b border-border/40 pb-4">
              <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                Publications
              </span>
              <h2 className="text-heading-sm text-text-primary">
                Related Stories
              </h2>
            </div>

            {/* Grid layout (Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {relatedStories.map((story) => (
                <div key={story.id} className="group flex flex-col gap-4 text-left">
                  {/* Card placeholder */}
                  <Link href={`/journal/${story.slug}`} className="block select-none">
                    <div className="relative w-full aspect-video bg-surface border border-border rounded-sm overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.01]" />
                    </div>
                  </Link>
                  {/* Metadata */}
                  <Stack gap={2}>
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase select-none">
                      {story.category}
                    </span>
                    <Link href={`/journal/${story.slug}`}>
                      <h3 className="text-body-sm font-display font-bold text-text-primary group-hover:text-accent transition-colors duration-200 leading-snug">
                        {story.title}
                      </h3>
                    </Link>
                    <div className="pt-1">
                      <Link 
                        href={`/journal/${story.slug}`}
                        className="text-[11px] font-semibold tracking-widest uppercase border-b border-text-primary/30 pb-0.5 hover:border-text-primary text-text-primary select-none cursor-pointer transition-colors duration-200"
                      >
                        Read Story &rarr;
                      </Link>
                    </div>
                  </Stack>
                </div>
              ))}
            </div>
          </Stack>
        </Section>

      </Container>
    </main>
  )
}
