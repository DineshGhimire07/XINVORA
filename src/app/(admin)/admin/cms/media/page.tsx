import { db } from "@/db/client"
import { mediaLibrary } from "@/db/schema/media"
import { Stack } from "@/components/shared/stack"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { MediaUploader } from "@/components/admin/MediaUploader"
import { MediaGridItem } from "@/components/admin/MediaGridItem"
import { desc, isNull } from "drizzle-orm"

export default async function CMSMediaRoute() {
  const mediaItems = await db
    .select()
    .from(mediaLibrary)
    .where(isNull(mediaLibrary.deletedAt))
    .orderBy(desc(mediaLibrary.createdAt))

  return (
    <Stack gap={8}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide">
            Media Library
          </h1>
          <p className="text-body-sm text-text-secondary mt-2">
            Manage images and assets for your content.
          </p>
        </div>
        <div>
          <MediaUploader />
        </div>
      </div>

      <Card className="rounded-none border-border-primary/40 shadow-sm bg-surface">
        <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
          <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
            All Files ({mediaItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {mediaItems.length === 0 ? (
            <div className="text-center text-text-secondary py-12">
              No media files found. Upload some assets to get started.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaItems.map((item) => (
                <MediaGridItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}
