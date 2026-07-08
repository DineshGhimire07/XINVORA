import { notFound } from "next/navigation"
import { db } from "@/db/client"
import { cmsPages } from "@/db/schema/cms"
import { eq, and, isNull } from "drizzle-orm"
import CMSPageEditor from "./CMSPageEditor"

export default async function AdminCMSPageEditorRoute(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  let page = null

  if (slug !== "new") {
    // Treat slug as ID for the editor route
    const result = await db.select().from(cmsPages).where(and(eq(cmsPages.id, slug), isNull(cmsPages.deletedAt))).limit(1)
    if (result.length === 0) {
      notFound()
    }
    page = result[0]
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mb-8">
        {page ? "Edit CMS Page" : "New CMS Page"}
      </h1>
      
      <CMSPageEditor page={page} />
    </div>
  )
}
