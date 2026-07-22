import { db } from "@/db/client"
import { journalPosts, journalCategories, journalTags, journalPostTags, journalRevisions, journalViews } from "@/db/schema/journal"
import { users } from "@/db/schema/users"
import { userEvents } from "@/db/schema/user-events"
import { products } from "@/db/schema/products"
import { orders } from "@/db/schema/orders"
import { eq, and, desc, sql, count, isNull, inArray, or, ilike, countDistinct } from "drizzle-orm"

export class JournalRepository {
  static async findPostById(id: string) {
    const post = await db.query.journalPosts.findFirst({
      where: and(eq(journalPosts.id, id), isNull(journalPosts.deletedAt)),
      with: {
        author: {
          columns: { id: true, firstName: true, lastName: true, email: true }
        },
        category: true,
        postTags: {
          with: {
            tag: true
          }
        },
        revisions: {
          orderBy: (rev, { desc }) => [desc(rev.createdAt)],
          with: {
            changedBy: {
              columns: { id: true, firstName: true, lastName: true }
            }
          }
        }
      }
    })
    return post || null
  }

  static async findPostBySlug(slug: string) {
    const post = await db.query.journalPosts.findFirst({
      where: and(eq(journalPosts.slug, slug), isNull(journalPosts.deletedAt)),
      with: {
        author: {
          columns: { id: true, firstName: true, lastName: true, email: true }
        },
        category: true,
        postTags: {
          with: {
            tag: true
          }
        }
      }
    })
    return post || null
  }

  static async searchPosts(params: {
    query?: string
    categoryId?: string
    tagId?: string
    status?: string
    workflowState?: string
    isFeatured?: boolean
    isPinned?: boolean
    page?: number
    limit?: number
  }) {
    const page = params.page || 1
    const limit = params.limit || 20
    const offset = (page - 1) * limit

    const conditions = [isNull(journalPosts.deletedAt)]

    if (params.categoryId) {
      conditions.push(eq(journalPosts.categoryId, params.categoryId))
    }
    if (params.status) {
      // Allow filtering by simple status or exact workflowState
      conditions.push(eq(journalPosts.workflowState, params.status))
    }
    if (params.workflowState) {
      conditions.push(eq(journalPosts.workflowState, params.workflowState))
    }
    if (params.isFeatured !== undefined) {
      conditions.push(eq(journalPosts.isFeatured, params.isFeatured))
    }
    if (params.isPinned !== undefined) {
      conditions.push(eq(journalPosts.isPinned, params.isPinned))
    }

    if (params.query) {
      const searchPattern = `%${params.query}%`
      const searchFilter = or(
        ilike(journalPosts.title, searchPattern),
        ilike(journalPosts.excerpt, searchPattern),
        // search inside body content JSON string representation
        sql`${journalPosts.body}::text ILIKE ${searchPattern}`
      )
      if (searchFilter) {
        conditions.push(searchFilter)
      }
    }

    // If tagId filter is provided, we filter posts by tag join
    if (params.tagId) {
      const postIdsWithTag = await db
        .select({ postId: journalPostTags.postId })
        .from(journalPostTags)
        .where(eq(journalPostTags.tagId, params.tagId))
      
      const ids = postIdsWithTag.map(x => x.postId)
      if (ids.length === 0) return { items: [], total: 0 }
      conditions.push(inArray(journalPosts.id, ids))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const items = await db.query.journalPosts.findMany({
      where: whereClause,
      with: {
        author: {
          columns: { id: true, firstName: true, lastName: true }
        },
        category: true,
        postTags: {
          with: {
            tag: true
          }
        }
      },
      orderBy: [desc(journalPosts.isPinned), desc(journalPosts.createdAt)],
      limit,
      offset,
    })

    const [totalCountRes] = await db
      .select({ val: count() })
      .from(journalPosts)
      .where(whereClause)

    return {
      items,
      total: totalCountRes?.val || 0
    }
  }

  static async findAllCategories() {
    return await db.select().from(journalCategories).orderBy(journalCategories.name)
  }

  static async findCategoryById(id: string) {
    const list = await db.select().from(journalCategories).where(eq(journalCategories.id, id))
    return list[0] || null
  }

  static async findCategoryBySlug(slug: string) {
    const list = await db.select().from(journalCategories).where(eq(journalCategories.slug, slug))
    return list[0] || null
  }

  static async findAllTags() {
    return await db.select().from(journalTags).orderBy(journalTags.name)
  }

  static async findTagBySlug(slug: string) {
    const list = await db.select().from(journalTags).where(eq(journalTags.slug, slug))
    return list[0] || null
  }

  static async findRevisionsByPostId(postId: string) {
    return await db.query.journalRevisions.findMany({
      where: eq(journalRevisions.postId, postId),
      with: {
        changedBy: {
          columns: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: desc(journalRevisions.createdAt)
    })
  }

  static async getAttributionAnalytics(postId: string) {
    // 1. Fetch Views
    const [viewsRes] = await db
      .select({ val: count() })
      .from(journalViews)
      .where(eq(journalViews.postId, postId))
    const totalViews = viewsRes?.val || 0

    // 2. Fetch Unique Readers (distinct anonymousId or ipHash)
    const [readersRes] = await db
      .select({ val: countDistinct(journalViews.anonymousId) })
      .from(journalViews)
      .where(eq(journalViews.postId, postId))
    const uniqueReaders = readersRes?.val || 0

    // 3. CTR & Purchases via Event Attributions
    const clickEvents = await db
      .select({ val: count() })
      .from(userEvents)
      .where(
        and(
          or(
            eq(userEvents.eventType, "RECOMMENDATION_CLICK"),
            eq(userEvents.eventType, "PRODUCT_CLICK"),
            eq(userEvents.eventType, "JOURNAL_PRODUCT_CLICK")
          ),
          sql`${userEvents.payload}->>'postId' = ${postId}`
        )
      )
    const clicks = clickEvents[0]?.val || 0

    // Orders generated from embeds click attribution
    const purchaseEvents = await db
      .select({
        ordersCount: countDistinct(userEvents.orderId),
      })
      .from(userEvents)
      .where(
        and(
          or(
            eq(userEvents.eventType, "PAYMENT_SUCCESS"),
            eq(userEvents.eventType, "ORDER_COMPLETED")
          ),
          sql`${userEvents.payload}->>'postId' = ${postId}`
        )
      )
    const ordersCount = purchaseEvents[0]?.ordersCount || 0

    let revenueGenerated = 0
    if (ordersCount > 0) {
      const attributedOrders = await db
        .select({ orderId: userEvents.orderId })
        .from(userEvents)
        .where(
          and(
            or(
              eq(userEvents.eventType, "PAYMENT_SUCCESS"),
              eq(userEvents.eventType, "ORDER_COMPLETED")
            ),
            sql`${userEvents.payload}->>'postId' = ${postId}`
          )
        )
      const orderIds = Array.from(new Set(attributedOrders.map((o) => o.orderId).filter(Boolean))) as string[]

      if (orderIds.length > 0) {
        const [revRes] = await db
          .select({ total: sql<number>`coalesce(sum(${orders.total}), 0)` })
          .from(orders)
          .where(and(inArray(orders.id, orderIds), isNull(orders.deletedAt)))
        revenueGenerated = Number(revRes?.total || 0)
      }
    }

    // Calculate CTR
    const ctr = totalViews > 0 ? Number(((clicks / totalViews) * 100).toFixed(1)) : 0
    const conversion = clicks > 0 ? Number(((ordersCount / clicks) * 100).toFixed(1)) : (totalViews > 0 ? Number(((ordersCount / totalViews) * 100).toFixed(1)) : 0)

    return {
      views: totalViews,
      uniqueReaders,
      clicks,
      ordersCount,
      ctr,
      conversion,
      revenueGenerated,
    }
  }
}
