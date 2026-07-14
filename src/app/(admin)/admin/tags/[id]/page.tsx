import { SessionService } from "@/services/session.service"
import { notFound } from "next/navigation"
import TagEditor from "./TagEditor"
import { db } from "@/db/client"
import { tags } from "@/db/schema/tags"
import { eq } from "drizzle-orm"

export const metadata = {
  title: "Tag Editor | XINVORA Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminTagEditorPage(props: PageProps) {
  // Gate check
  await SessionService.requireAdmin()

  const { id } = await props.params

  let tag = null

  if (id !== "new") {
    const result = await db.select().from(tags).where(eq(tags.id, id)).limit(1)
    if (result.length === 0) {
      notFound()
    }
    tag = result[0]
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
          {tag ? "Edit Tag" : "New Tag"}
        </h1>
        <p className="text-admin-sm text-admin-text-secondary mt-1">
          Configure tags used to group products, enhance navigation, and assist filters.
        </p>
      </div>

      <TagEditor tag={tag} />
    </div>
  )
}
