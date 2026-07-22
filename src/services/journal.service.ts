import "server-only"
import { db } from "@/db/client"
import { insertJournalPost, updateJournalPost, softDeleteJournalPost, insertJournalRevision, deleteJournalPostTags, insertJournalPostTag, insertJournalTag, insertJournalView } from "@/db/mutations/journal"
import { journalTags, journalRevisions } from "@/db/schema/journal"
import { JournalRepository } from "@/db/repositories/journal.repository"
import { AdminAuditService } from "./admin.audit.service"
import { eq, isNull } from "drizzle-orm"
import sanitizeHtml from "sanitize-html"

export class JournalService {
  // Helper to extract word count from blocks
  private static calculateReadingTimeAndWords(body: any[]) {
    let wordCount = 0
    body.forEach(block => {
      if (block.type === "paragraph" || block.type === "heading" || block.type === "quote") {
        const text = block.data?.text || block.data?.content || ""
        wordCount += text.split(/\s+/).filter(Boolean).length
      }
    })
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))
    return { wordCount, readingTime }
  }

  // Dynamic SEO Audit Check Score (0 to 100)
  public static calculateSEOScore(postData: {
    title: string
    slug: string
    excerpt: string
    focusKeyword?: string
    body: any[]
    metaDescription?: string
  }) {
    let score = 30 // base baseline
    const keyword = postData.focusKeyword?.trim().toLowerCase()
    
    if (!keyword) {
      // Deduct for no focus keyword
      return 20
    }

    // Rule 1: Focus keyword in Title
    if (postData.title.toLowerCase().includes(keyword)) score += 15
    
    // Rule 2: Focus keyword in Slug
    if (postData.slug.toLowerCase().includes(keyword)) score += 15
    
    // Rule 3: Focus keyword in Excerpt
    if (postData.excerpt.toLowerCase().includes(keyword)) score += 15

    // Rule 4: Focus keyword in Meta Description
    if (postData.metaDescription?.toLowerCase().includes(keyword)) score += 15

    // Rule 5: Density check in body blocks
    let bodyText = ""
    let hasAltImages = true
    let totalImages = 0

    postData.body.forEach(block => {
      if (block.type === "paragraph" || block.type === "heading" || block.type === "quote") {
        bodyText += " " + (block.data?.text || block.data?.content || "")
      }
      if (block.type === "image") {
        totalImages++
        if (!block.data?.altText && !block.data?.alt) {
          hasAltImages = false
        }
      }
    })

    const keywordOccurrences = (bodyText.toLowerCase().split(keyword).length - 1)
    if (keywordOccurrences > 0) score += 10
    if (keywordOccurrences >= 3) score += 10 // healthy density

    // Rule 6: Image ALTs
    if (totalImages > 0 && hasAltImages) score += 5

    return Math.min(100, score)
  }

  private static sanitizeBlocks(body: any[]) {
    return body.map(block => {
      const sanitizedData = { ...block.data }
      
      // Sanitize rich text parameters to prevent XSS
      if (typeof sanitizedData.text === "string") {
        sanitizedData.text = sanitizeHtml(sanitizedData.text, {
          allowedTags: ["b", "i", "em", "strong", "a", "code", "br"],
          allowedAttributes: {
            a: ["href", "target", "rel"]
          }
        })
      }
      if (typeof sanitizedData.content === "string") {
        sanitizedData.content = sanitizeHtml(sanitizedData.content, {
          allowedTags: ["b", "i", "em", "strong", "a", "code", "br"],
          allowedAttributes: {
            a: ["href", "target", "rel"]
          }
        })
      }

      return {
        id: block.id || `block_${crypto.randomUUID().replace(/-/g, "")}`,
        type: block.type,
        data: sanitizedData,
        metadata: block.metadata || {},
      }
    })
  }

  // --- Category & Tag helpers inside transaction ---
  private static async syncPostTags(postId: string, tagNames: string[], tx: any) {
    // 1. Delete existing tag associations
    await deleteJournalPostTags(postId, tx)

    if (!tagNames || tagNames.length === 0) return

    for (const name of tagNames) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      if (!slug) continue

      // Find or create tag
      let tagRecord = await tx.select().from(journalTags).where(eq(journalTags.slug, slug))
      let tagId: string

      if (tagRecord.length > 0) {
        tagId = tagRecord[0].id
      } else {
        const newTag = await insertJournalTag({ name, slug }, tx)
        tagId = newTag.id
      }

      await insertJournalPostTag({ postId, tagId }, tx)
    }
  }

  // --- Public CRUD Methods ---
  public static async createPost(data: {
    title: string
    slug?: string
    excerpt: string
    body: any[]
    coverImage?: string
    gallery?: string[]
    categoryId?: string
    tags?: string[]
    visibility?: "PUBLIC" | "PRIVATE" | "PASSWORD"
    isFeatured?: boolean
    isPinned?: boolean
    allowComments?: boolean
    readingTimeOverride?: number
    workflowState?: string
    focusKeyword?: string
    metaDescription?: string
    seoTitle?: string
    canonicalUrl?: string
  }, adminUserId: string) {
    const rawSlug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const slug = rawSlug || `post-${Date.now()}`

    const sanitizedBody = this.sanitizeBlocks(data.body)
    const { readingTime } = this.calculateReadingTimeAndWords(sanitizedBody)
    const computedScore = this.calculateSEOScore({
      title: data.title,
      slug,
      excerpt: data.excerpt,
      focusKeyword: data.focusKeyword,
      body: sanitizedBody,
      metaDescription: data.metaDescription,
    })

    return await db.transaction(async (tx) => {
      // 1. Create Post
      const post = await insertJournalPost({
        title: data.title,
        slug,
        excerpt: data.excerpt,
        body: sanitizedBody,
        coverImage: data.coverImage || null,
        gallery: data.gallery || [],
        authorId: adminUserId,
        categoryId: data.categoryId || null,
        workflowState: data.workflowState || "DRAFT",
        visibility: data.visibility || "PUBLIC",
        isFeatured: data.isFeatured || false,
        isPinned: data.isPinned || false,
        allowComments: data.allowComments !== false,
        readingTimeOverride: data.readingTimeOverride || readingTime,
        focusKeyword: data.focusKeyword || null,
        metaDescription: data.metaDescription || null,
        seoTitle: data.seoTitle || null,
        canonicalUrl: data.canonicalUrl || null,
        publishedAt: data.workflowState === "PUBLISHED" ? new Date() : null,
      }, tx)

      // 2. Sync Tags
      if (data.tags) {
        await this.syncPostTags(post.id, data.tags, tx)
      }

      // 3. Create Revision Snapshot
      await insertJournalRevision({
        postId: post.id,
        revisionData: {
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          gallery: post.gallery,
          coverImage: post.coverImage,
          seoData: {
            seoTitle: post.seoTitle,
            metaDescription: post.metaDescription,
            focusKeyword: post.focusKeyword,
          }
        },
        changedById: adminUserId,
      }, tx)

      // 4. Audit Log
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "JOURNAL",
        entityId: post.id,
        newValue: post,
      }, tx)

      return post
    })
  }

  public static async updatePost(id: string, data: {
    title: string
    slug?: string
    excerpt: string
    body: any[]
    coverImage?: string
    gallery?: string[]
    categoryId?: string
    tags?: string[]
    visibility?: "PUBLIC" | "PRIVATE" | "PASSWORD"
    isFeatured?: boolean
    isPinned?: boolean
    allowComments?: boolean
    readingTimeOverride?: number
    workflowState?: string
    focusKeyword?: string
    metaDescription?: string
    seoTitle?: string
    canonicalUrl?: string
    publishedAt?: Date
  }, adminUserId: string) {
    const rawSlug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const slug = rawSlug || `post-${Date.now()}`

    const sanitizedBody = this.sanitizeBlocks(data.body)
    const { readingTime } = this.calculateReadingTimeAndWords(sanitizedBody)
    const computedScore = this.calculateSEOScore({
      title: data.title,
      slug,
      excerpt: data.excerpt,
      focusKeyword: data.focusKeyword,
      body: sanitizedBody,
      metaDescription: data.metaDescription,
    })

    return await db.transaction(async (tx) => {
      // 1. Update Post
      const post = await updateJournalPost(id, {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        body: sanitizedBody,
        coverImage: data.coverImage || null,
        gallery: data.gallery || [],
        categoryId: data.categoryId || null,
        workflowState: data.workflowState || "DRAFT",
        visibility: data.visibility || "PUBLIC",
        isFeatured: data.isFeatured || false,
        isPinned: data.isPinned || false,
        allowComments: data.allowComments !== false,
        readingTimeOverride: data.readingTimeOverride || readingTime,
        focusKeyword: data.focusKeyword || null,
        metaDescription: data.metaDescription || null,
        seoTitle: data.seoTitle || null,
        canonicalUrl: data.canonicalUrl || null,
        publishedAt: data.workflowState === "PUBLISHED" ? (data.publishedAt || new Date()) : null,
      }, tx)

      // 2. Sync Tags
      if (data.tags) {
        await this.syncPostTags(id, data.tags, tx)
      }

      // 3. Save Git-style snapshot revision
      await insertJournalRevision({
        postId: id,
        revisionData: {
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          gallery: post.gallery,
          coverImage: post.coverImage,
          seoData: {
            seoTitle: post.seoTitle,
            metaDescription: post.metaDescription,
            focusKeyword: post.focusKeyword,
          }
        },
        changedById: adminUserId,
      }, tx)

      // 4. Audit Log
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "JOURNAL",
        entityId: id,
        newValue: post,
      }, tx)

      return post
    })
  }

  public static async duplicatePost(id: string, adminUserId: string) {
    const post = await JournalRepository.findPostById(id)
    const p = post as any
    if (!p) throw new Error("Article not found")
    const tagsList = p.postTags?.map((pt: any) => pt.tag?.name).filter(Boolean) as string[] || []

    return await this.createPost({
      title: `${p.title} (Copy)`,
      slug: `${p.slug}-copy-${Date.now().toString().slice(-4)}`,
      excerpt: p.excerpt,
      body: p.body as any[],
      coverImage: p.coverImage || undefined,
      gallery: p.gallery as string[] || undefined,
      categoryId: p.categoryId || undefined,
      tags: tagsList,
      visibility: p.visibility as any,
      isFeatured: p.isFeatured,
      isPinned: p.isPinned,
      allowComments: p.allowComments,
      readingTimeOverride: p.readingTimeOverride || undefined,
      workflowState: "DRAFT",
      focusKeyword: p.focusKeyword || undefined,
      metaDescription: p.metaDescription || undefined,
      seoTitle: p.seoTitle || undefined,
      canonicalUrl: p.canonicalUrl || undefined,
    }, adminUserId)
  }

  public static async restoreRevision(revisionId: string, adminUserId: string) {
    const [revision] = await db.select().from(journalRevisions).where(eq(journalRevisions.id, revisionId))
    if (!revision) throw new Error("Revision snapshot not found")

    const snapshot = revision.revisionData as any

    return await db.transaction(async (tx) => {
      const post = await updateJournalPost(revision.postId, {
        title: snapshot.title,
        excerpt: snapshot.excerpt,
        body: snapshot.body,
        coverImage: snapshot.coverImage || null,
        gallery: snapshot.gallery || [],
        seoTitle: snapshot.seoData?.seoTitle || null,
        metaDescription: snapshot.seoData?.metaDescription || null,
        focusKeyword: snapshot.seoData?.focusKeyword || null,
      }, tx)

      // Log action
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "JOURNAL",
        entityId: revision.postId,
        newValue: post,
      }, tx)

      return post
    })
  }

  public static async deletePost(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const post = await softDeleteJournalPost(id, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "JOURNAL",
        entityId: id,
      }, tx)
      return post
    })
  }

  public static async recordPostView(postId: string, anonymousId?: string, ipHash?: string) {
    await insertJournalView({
      postId,
      anonymousId: anonymousId || "anonymous",
      ipHash: ipHash || "hashed_ip",
    }, db)
  }
}
