/**
 * app/journal/page.tsx — XINVORA Journal & Editorial Landing Page
 *
 * Implements the premium Journal index listing.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"

export const metadata = buildMetadata({
  title: "Journal",
  description: "Read XINVORA Stories. A collection of articles on craftsmanship, materials, seasonal editions, and quiet living.",
})

export interface JournalArticle {
  id: string
  title: string
  slug: string
  category: string
  readTime: string
  date: string
  excerpt: string
}

export const JOURNAL_DATA: JournalArticle[] = [
  {
    id: "story-1",
    title: "Belgian Flax: Sourcing Pure Linen",
    slug: "belgian-flax-sourcing-pure-linen",
    category: "Materials",
    readTime: "8 min read",
    date: "May 24, 2026",
    excerpt: "From wild fields to historical looms. Why long-staple linen remains the foundation of XINVORA's textile philosophy and quiet luxury drape.",
  },
  {
    id: "story-2",
    title: "The Art of Slow Tailoring",
    slug: "the-art-of-slow-tailoring",
    category: "Craft",
    readTime: "6 min read",
    date: "July 02, 2026",
    excerpt: "How unstructured flax patterns and bound seams create clothing that moves naturally with the body, prioritizing ease and structural longevity.",
  },
  {
    id: "story-3",
    title: "Edition 01: Behind the Shapes",
    slug: "edition-01-behind-the-shapes",
    category: "Collections",
    readTime: "4 min read",
    date: "June 15, 2026",
    excerpt: "A deep dive into the design studies, drape tests, and neutral palette selections that formed our first garments.",
  },
  {
    id: "story-4",
    title: "Kyoto Wood Kilns & Stoneware",
    slug: "kyoto-wood-kilns-stoneware",
    category: "Craft",
    readTime: "7 min read",
    date: "April 18, 2026",
    excerpt: "An exploration of historical multi-chamber kilns in Kyoto where hand-thrown stoneware clays absorb natural ash glazes and surface markings.",
  },
  {
    id: "story-5",
    title: "Restructuring Domestic Spacing",
    slug: "restructuring-domestic-spacing",
    category: "Lifestyle",
    readTime: "5 min read",
    date: "March 10, 2026",
    excerpt: "A quiet study on designing simple home layouts and corners to encourage daily focus, order, and physical calm.",
  },
  {
    id: "story-6",
    title: "The Patina of Solid Timber",
    slug: "patina-of-solid-timber",
    category: "Materials",
    readTime: "4 min read",
    date: "February 28, 2026",
    excerpt: "Understanding wood oxidation and why we finish our oak console tables with dry matte oils to let natural timber breathe and age beautifully.",
  },
]

export default function JournalPage() {
  const featuredStory = JOURNAL_DATA[0] // Belgian Flax is the Featured Story
  const standardStories = JOURNAL_DATA.slice(1) // Remaining 5 standard stories

  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      
      {/* 1. Editorial Landing Hero */}
      <Section id="journal-hero" padding="md" className="bg-background">
        <Container>
          <Stack gap={6} className="max-w-[32rem] text-left">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Journal
            </span>
            <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
              Stories behind thoughtful living.
            </h1>
            <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
              An editorial publication exploring craftsmanship, design philosophy, materials provenance, and the principles of quiet luxury.
            </p>
          </Stack>
        </Container>
      </Section>

      {/* 2. Story Categories */}
      <Section id="journal-categories" padding="none" className="bg-background">
        <Container>
          <nav 
            className="flex items-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-none border-b border-border/40 pb-4"
            aria-label="Journal category navigation"
          >
            <span className="text-[11px] font-bold tracking-widest text-text-primary uppercase border-b-2 border-text-primary pb-3 -mb-[18px] select-none cursor-default">
              All
            </span>
            {["Craft", "Collections", "Materials", "Inspiration", "Lifestyle"].map((cat) => (
              <span 
                key={cat}
                className="text-[11px] font-semibold tracking-widest text-text-secondary hover:text-text-primary uppercase pb-3 transition-colors select-none cursor-pointer"
              >
                {cat}
              </span>
            ))}
          </nav>
        </Container>
      </Section>

      {/* 3. Featured Story Section */}
      <Section id="journal-featured" padding="lg" className="bg-background">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Left Image Column (7/12 width) */}
            <div className="lg:col-span-7 select-none">
              <Link href={`/journal/${featuredStory.slug}`} className="block group">
                <div className="relative w-full aspect-video bg-surface border border-border rounded-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.01]" />
                </div>
              </Link>
            </div>
            {/* Right Details Column (5/12 width) */}
            <div className="lg:col-span-5 flex flex-col items-start text-left max-w-[28rem]">
              <Stack gap={6}>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                    Featured / {featuredStory.category}
                  </span>
                  <Link href={`/journal/${featuredStory.slug}`} className="group">
                    <h2 className="text-[1.75rem] font-display text-text-primary group-hover:text-accent transition-colors duration-200 leading-tight">
                      {featuredStory.title}
                    </h2>
                  </Link>
                  <span className="text-[10px] font-semibold tracking-widest text-text-secondary uppercase select-none">
                    {featuredStory.readTime} &bull; {featuredStory.date}
                  </span>
                </div>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  {featuredStory.excerpt}
                </p>
                <div>
                  <Link 
                    href={`/journal/${featuredStory.slug}`}
                    className="text-[11px] font-semibold tracking-widest uppercase border-b border-text-primary/30 pb-0.5 hover:border-text-primary text-text-primary select-none cursor-pointer transition-colors duration-200"
                  >
                    Read Story &rarr;
                  </Link>
                </div>
              </Stack>
            </div>
          </div>
        </Container>
      </Section>

      <hr className="max-w-site mx-auto border-border/40 my-4" />

      {/* 4. Editorial Grid */}
      <Section id="journal-grid" padding="lg" className="bg-background">
        <Container>
          {/* Grid layout (Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {standardStories.map((story) => (
              <div key={story.id} className="group flex flex-col gap-4 text-left">
                {/* Visual card placeholder */}
                <Link href={`/journal/${story.slug}`} className="block select-none">
                  <div className="relative w-full aspect-video bg-surface border border-border rounded-sm overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.01]" />
                  </div>
                </Link>
                
                {/* Meta details */}
                <Stack gap={3}>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase select-none">
                      {story.category}
                    </span>
                    <Link href={`/journal/${story.slug}`}>
                      <h3 className="text-body-md font-display font-bold text-text-primary group-hover:text-accent transition-colors duration-200 leading-snug">
                        {story.title}
                      </h3>
                    </Link>
                    <span className="text-[10px] font-semibold tracking-widest text-text-secondary uppercase select-none">
                      {story.readTime}
                    </span>
                  </div>
                  <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                    {story.excerpt}
                  </p>
                  <div>
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
        </Container>
      </Section>

      {/* 5. Understated Newsletter signature block */}
      <Section id="journal-newsletter" padding="xl" className="border-t border-border/20 bg-surface-elevated mt-12">
        <Container>
          <div className="text-center py-8 max-w-[28rem] mx-auto select-none">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-text-secondary mb-2">
              The XINVORA Dispatch
            </p>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              We send occasional publications tracing research notes, process documentation, and private collections releases. Join us by visiting the homepage.
            </p>
          </div>
        </Container>
      </Section>

    </main>
  )
}
