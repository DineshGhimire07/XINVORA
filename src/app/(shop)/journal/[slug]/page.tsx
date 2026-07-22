/**
 * app/journal/[slug]/page.tsx — XINVORA Journal Dynamic Article Page
 *
 * Implements the long-form typography reading experience.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import { notFound } from "next/navigation"
import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import { Breadcrumb } from "@/components/shared/Breadcrumb/Breadcrumb"
import Link from "next/link"
import * as React from "react"
import { JournalRepository } from "@/db/repositories/journal.repository"
import { JournalService } from "@/services/journal.service"
import { findProductsByIds, findCollectionsByIds } from "@/db/queries/cms"
import { Button } from "@/components/ui/button"

interface JournalArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const postsRes = await JournalRepository.searchPosts({ workflowState: "PUBLISHED", limit: 100 })
    return postsRes.items.map((post) => ({ slug: post.slug }))
  } catch (error) {
    console.error("[generateStaticParams] Error:", error)
    return []
  }
}

export async function generateMetadata({ params }: JournalArticlePageProps) {
  const resolvedParams = await params
  const post = await JournalRepository.findPostBySlug(resolvedParams.slug)
  
  return buildMetadata({
    title: post?.seoTitle || post?.title || "Journal Story",
    description: post?.metaDescription || post?.excerpt || "XINVORA Journal publication details",
  })
}

export default async function JournalArticlePage({ params }: JournalArticlePageProps) {
  const resolvedParams = await params
  const post = await JournalRepository.findPostBySlug(resolvedParams.slug) as any

  if (!post) {
    notFound()
  }

  // 1. Asynchronously record the view event
  try {
    // Record view under this article ID
    await JournalService.recordPostView(post.id)
  } catch (err) {
    console.error("[JournalArticlePage] View logging error:", err)
  }

  // 2. Resolve embedded products/collections from block lists
  const embeddedProductIds: string[] = []
  const embeddedCollectionIds: string[] = []
  const blocks = (post.body as any[]) || []

  blocks.forEach(block => {
    if (block.type === "product" && block.data?.productId) {
      embeddedProductIds.push(block.data.productId)
    }
    if (block.type === "collection" && block.data?.collectionId) {
      embeddedCollectionIds.push(block.data.collectionId)
    }
  })

  // Batch query storefront prices and details for embeds
  const [resolvedProducts, resolvedCollections] = await Promise.all([
    embeddedProductIds.length > 0 ? findProductsByIds(embeddedProductIds) : [],
    embeddedCollectionIds.length > 0 ? findCollectionsByIds(embeddedCollectionIds) : [],
  ])

  const productMap = new Map(resolvedProducts.map(p => [p.id, p]))
  const collectionMap = new Map(resolvedCollections.map(c => [c.id, c]))

  // 3. Resolve Related stories
  const relatedRes = await JournalRepository.searchPosts({
    categoryId: post.categoryId || undefined,
    workflowState: "PUBLISHED",
    limit: 4
  })
  const relatedStories = relatedRes.items.filter(item => item.id !== post.id).slice(0, 3) as any[]

  const getReadingTime = () => {
    if (post.readingTimeOverride) return `${post.readingTimeOverride} min read`
    let words = 0
    blocks.forEach(b => {
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

  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      <Container>
        
        {/* Breadcrumbs */}
        <Breadcrumb 
          items={[
            { label: "Journal", href: "/journal" },
            { label: post.title }
          ]} 
        />

        {/* 1. Article Hero */}
        <Section id="article-hero" padding="md" className="bg-background text-left">
          <Stack gap={4} className="max-w-[40rem] mx-auto">
            <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
              {post.category?.name || "Editorial"}
            </span>
            <h1 className="text-display-md md:text-display-lg font-display text-text-primary leading-tight tracking-tight text-balance">
              {post.title}
            </h1>
            <span className="text-[10px] font-semibold tracking-widest text-text-secondary uppercase select-none">
              {getReadingTime()} &bull; {formatDate(post.publishedAt)}
            </span>
          </Stack>
        </Section>

        {/* 2. Intro Paragraph / Excerpt */}
        <Section id="article-intro" padding="none" className="bg-background">
          <div className="max-w-[40rem] mx-auto border-l-2 border-accent pl-6 my-6 text-left">
            <p className="text-body-lg text-text-primary leading-relaxed font-light text-pretty">
              {post.excerpt}
            </p>
          </div>
        </Section>

        {/* 3. Main Reading Blocks Content Renderer */}
        <Section id="article-body" padding="md" className="bg-background text-left">
          <div className="max-w-[40rem] mx-auto text-text-secondary text-body-md leading-relaxed space-y-8 text-pretty font-light">
            {blocks.map((block: any) => {
              switch (block.type) {
                case "paragraph":
                  return <p key={block.id} dangerouslySetInnerHTML={{ __html: block.data?.text || "" }} />

                case "heading":
                  const lvl = block.data?.level || 2
                  if (lvl === 3) {
                    return (
                      <h3 key={block.id} className="font-display font-bold text-text-primary mt-8 leading-snug tracking-tight text-body-lg">
                        {block.data?.text}
                      </h3>
                    )
                  } else if (lvl === 4) {
                    return (
                      <h4 key={block.id} className="font-display font-bold text-text-primary mt-6 leading-snug tracking-tight text-body-md">
                        {block.data?.text}
                      </h4>
                    )
                  } else {
                    return (
                      <h2 key={block.id} className="font-display font-bold text-text-primary mt-8 leading-snug tracking-tight text-display-xs">
                        {block.data?.text}
                      </h2>
                    )
                  }

                case "quote":
                  return (
                    <blockquote 
                      key={block.id} 
                      className="my-10 border-y border-border/40 py-8 text-display-sm font-display italic text-text-primary leading-relaxed select-none pl-4 pr-2"
                    >
                      &ldquo;{block.data?.text}&rdquo;
                      {block.data?.citation && (
                        <cite className="block text-[10px] not-italic tracking-wider uppercase text-text-secondary mt-2">
                          - {block.data.citation}
                        </cite>
                      )}
                    </blockquote>
                  )

                case "divider":
                  return <hr key={block.id} className="border-border/40 my-8" />

                case "image":
                  const imageUrl = block.data?.urls?.[0]
                  if (!imageUrl) return null
                  return (
                    <div key={block.id} className="my-8 select-none">
                      <div className="relative aspect-video w-full border border-border/40 overflow-hidden">
                        <img src={imageUrl} alt={block.data.caption || "Journal Image"} className="w-full h-full object-cover" />
                      </div>
                      {block.data.caption && (
                        <span className="text-[10px] text-text-secondary mt-2 block text-center italic">{block.data.caption}</span>
                      )}
                    </div>
                  )

                case "video":
                  if (!block.data?.url) return null
                  return (
                    <div key={block.id} className="my-8 select-none">
                      <div className="relative aspect-video w-full border border-border/40 overflow-hidden bg-black">
                        <iframe 
                          src={block.data.url} 
                          title={block.data.caption || "Video"}
                          className="w-full h-full" 
                          allowFullScreen 
                        />
                      </div>
                      {block.data.caption && (
                        <span className="text-[10px] text-text-secondary mt-2 block text-center italic">{block.data.caption}</span>
                      )}
                    </div>
                  )

                case "product":
                  const prod = productMap.get(block.data?.productId)
                  if (!prod) return null
                  const prodImage = prod.productImages?.[0]?.url
                  return (
                    <div key={block.id} className="my-8 p-6 bg-surface border border-border/60 flex flex-col sm:flex-row gap-6 items-center justify-between rounded-sm">
                      <div className="flex items-center gap-4 w-full">
                        {prodImage && (
                          <div className="relative w-20 h-24 border border-border/40 overflow-hidden shrink-0 select-none bg-surface-secondary">
                            <img src={prodImage} alt={prod.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <span className="text-[9px] font-semibold tracking-wider text-accent uppercase block select-none">Embedded Product</span>
                          <h4 className="text-body-sm font-semibold text-text-primary leading-tight mt-1">{prod.name}</h4>
                          <div className="flex items-center gap-2 mt-2 font-mono text-body-xs font-semibold">
                            {prod.lowestPrice && (
                              <span className="text-text-primary">Rs. {prod.lowestPrice.toLocaleString()}</span>
                            )}
                            {prod.compareAtPrice && (
                              <span className="text-text-secondary line-through">Rs. {prod.compareAtPrice.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link href={`/products/${prod.slug}`} className="w-full sm:w-auto">
                        <Button className="w-full bg-text-primary text-surface px-6 py-2 h-9 text-[9px] uppercase tracking-widest font-bold hover:bg-accent transition-colors rounded-none">
                          View details
                        </Button>
                      </Link>
                    </div>
                  )

                case "collection":
                  const coll = collectionMap.get(block.data?.collectionId)
                  if (!coll) return null
                  return (
                    <div key={block.id} className="my-8 p-6 bg-surface border border-border/60 flex flex-col sm:flex-row gap-6 items-center justify-between rounded-sm">
                      <div className="flex items-center gap-4 w-full">
                        {coll.imageUrl && (
                          <div className="relative w-24 h-16 border border-border/40 overflow-hidden shrink-0 select-none bg-surface-secondary">
                            <img src={coll.imageUrl} alt={coll.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <span className="text-[9px] font-semibold tracking-wider text-accent uppercase block select-none">Shop Collection</span>
                          <h4 className="text-body-sm font-semibold text-text-primary leading-tight mt-1">{coll.name}</h4>
                          <span className="text-[10px] text-text-secondary block mt-1">Explore all items in this edition</span>
                        </div>
                      </div>
                      <Link href={`/collections/${coll.slug}`} className="w-full sm:w-auto">
                        <Button className="w-full bg-text-primary text-surface px-6 py-2 h-9 text-[9px] uppercase tracking-widest font-bold hover:bg-accent transition-colors rounded-none">
                          View Collection
                        </Button>
                      </Link>
                    </div>
                  )

                case "callout":
                  return (
                    <div 
                      key={block.id} 
                      className={`my-6 p-5 border rounded-sm flex gap-4 ${
                        block.data?.type === "warning" ? "bg-amber-50/20 border-amber-200" : block.data?.type === "success" ? "bg-green-50/20 border-green-200" : "bg-surface-secondary/40 border-border/60"
                      }`}
                    >
                      <div>
                        {block.data?.title && <h5 className="font-semibold text-text-primary text-body-sm mb-1">{block.data.title}</h5>}
                        <p className="text-text-secondary text-body-sm font-light leading-relaxed">{block.data?.text}</p>
                      </div>
                    </div>
                  )

                case "code":
                  return (
                    <pre key={block.id} className="my-6 p-4 bg-surface-secondary/50 border border-border/40 overflow-x-auto rounded-sm text-left">
                      <code className="font-mono text-body-xs text-text-primary">{block.data?.code}</code>
                    </pre>
                  )

                case "faq":
                  return (
                    <div key={block.id} className="my-4 border border-border/40 p-4 bg-surface rounded-sm text-left">
                      <h5 className="font-bold text-text-primary text-body-sm">{block.data?.question}</h5>
                      <p className="text-text-secondary text-body-sm mt-2 font-light leading-relaxed">{block.data?.answer}</p>
                    </div>
                  )

                default:
                  return null
              }
            })}
          </div>
        </Section>

        {/* 4. Related Stories */}
        {relatedStories.length > 0 && (
          <Section id="article-related" padding="lg" className="border-t border-border/20 mt-16 text-left">
            <Stack gap={10}>
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
                        {story.coverImage ? (
                          <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.01]" />
                        )}
                      </div>
                    </Link>
                    {/* Metadata */}
                    <Stack gap={2}>
                      <span className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase select-none">
                        {story.category?.name || "Editorial"}
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
        )}

      </Container>
    </main>
  )
}
