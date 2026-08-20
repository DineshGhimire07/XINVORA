import { db } from "@/db/client"
import { mediaLibrary } from "@/db/schema/media"
import { desc, isNull } from "drizzle-orm"
import { SessionService } from "@/services/session.service"
import { MediaLibraryClient } from "@/components/admin/MediaLibraryClient"

export const metadata = {
  title: "Media Library | XINVORA Admin",
}

export default async function AdminMediaPage() {
  await SessionService.requireAdmin()

  const mediaItems = await db
    .select()
    .from(mediaLibrary)
    .where(isNull(mediaLibrary.deletedAt))
    .orderBy(desc(mediaLibrary.createdAt))

  // Serialize to strip Date objects
  const serialized = JSON.parse(JSON.stringify(mediaItems))

  return <MediaLibraryClient initialItems={serialized} />
}
