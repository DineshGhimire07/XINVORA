import { SessionService } from "@/services/session.service"
import { db } from "@/db/client"
import { tags } from "@/db/schema/tags"
import { productTags } from "@/db/schema/product-tags"
import { eq, sql } from "drizzle-orm"
import { TagsClient } from "./TagsClient"

export const metadata = {
  title: "Tags | XINVORA Admin",
}

export default async function AdminTagsPage() {
  // Gate check
  await SessionService.requireAdmin()

  const allTags = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      usageCount: sql<number>`count(${productTags.productId})::int`,
    })
    .from(tags)
    .leftJoin(productTags, eq(tags.id, productTags.tagId))
    .groupBy(tags.id, tags.name, tags.slug)
    .orderBy(tags.name)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
            Tags
          </h1>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Manage tags used to group products, enhance navigation, and assist filters.
          </p>
        </div>
        <div>
          <a
            href="/admin/tags/new"
            className="inline-flex items-center justify-center bg-admin-primary text-admin-primary-on hover:bg-admin-primary/95 px-4 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md transition-colors"
          >
            + Add Tag
          </a>
        </div>
      </div>

      <TagsClient tags={allTags} />
    </div>
  )
}
