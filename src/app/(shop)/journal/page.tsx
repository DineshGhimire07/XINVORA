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
import { JournalRepository } from "@/db/repositories/journal.repository"

export const metadata = buildMetadata({
  title: "Journal",
  description: "Read XINVORA Stories. A collection of articles on craftsmanship, materials, seasonal editions, and quiet living.",
})

export default async function JournalPage() {
  const postsRes = await JournalRepository.searchPosts({ workflowState: "PUBLISHED", limit: 50 })
  const posts = postsRes.items as any[]

  const getReadingTime = (post: any) => {
    if (post.readingTimeOverride) return `${post.readingTimeOverride} min read`
    let words = 0
    const body = (post.body as any[]) || []
    body.forEach(b => {
      if (b.type === "paragraph" || b.type === "heading" || b.type === "quote") {
        words += (b.data.text || b.data.content || "").split(/\s+/).filter(Boolean).length
      }
    })
    return `${Math.max(1, Math.ceil(words / 200))} min read`
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "July 2026"
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    })
  }

  if (posts.length === 0) {
    return (
      <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
        <Container>
          <Section id="journal-hero" padding="md" className="bg-background">
            <Stack gap={6} className="max-w-[32rem] text-left">
              <span className="text-overline text-accent tracking-overline uppercase select-none">
                Journal
              </span>
              <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
                Stories behind thoughtful living.
              </h1>
              <p className="text-body-md text-text-secondary leading-relaxed mt-4 italic">
                No published articles found. Check back soon for editorial releases.
              </p>
            </Stack>
          </Section>
        </Container>
      </main>
    )
  }

  const featuredStory = posts[0]
  const standardStories = posts.slice(1)

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
                  {featuredStory.coverImage ? (
                    <img src={featuredStory.coverImage} alt={featuredStory.title} className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.01]" />
                  )}
                </div>
              </Link>
            </div>
            {/* Right Details Column (5/12 width) */}
            <div className="lg:col-span-5 flex flex-col items-start text-left max-w-[28rem]">
              <Stack gap={6}>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                    Featured / {featuredStory.category?.name || "Editorial"}
                  </span>
                  <Link href={`/journal/${featuredStory.slug}`} className="group">
                    <h2 className="text-[1.75rem] font-display text-text-primary group-hover:text-accent transition-colors duration-200 leading-tight">
                      {featuredStory.title}
                    </h2>
                  </Link>
                  <span className="text-[10px] font-semibold tracking-widest text-text-secondary uppercase select-none">
                    {getReadingTime(featuredStory)} &bull; {formatDate(featuredStory.publishedAt)}
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
      {standardStories.length > 0 && (
        <Section id="journal-grid" padding="lg" className="bg-background">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {standardStories.map((story) => (
                <div key={story.id} className="group flex flex-col gap-4 text-left">
                  {/* Visual card placeholder */}
                  <Link href={`/journal/${story.slug}`} className="block select-none">
                    <div className="relative w-full aspect-video bg-surface border border-border rounded-sm overflow-hidden">
                      {story.coverImage ? (
                        <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.01]" />
                      )}
                    </div>
                  </Link>
                  
                  {/* Meta details */}
                  <Stack gap={3}>
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase select-none">
                        {story.category?.name || "Editorial"}
                      </span>
                      <Link href={`/journal/${story.slug}`}>
                        <h3 className="text-body-md font-display font-bold text-text-primary group-hover:text-accent transition-colors duration-200 leading-snug">
                          {story.title}
                        </h3>
                      </Link>
                      <span className="text-[10px] font-semibold tracking-widest text-text-secondary uppercase select-none">
                        {getReadingTime(story)} &bull; {formatDate(story.publishedAt)}
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
      )}

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
