import { SessionService } from "@/services/session.service"
import { MediaLibraryClient } from "@/components/admin/MediaLibraryClient"
import { getMediaLibraryItemsAction } from "@/actions/admin/media.actions"

export const metadata = {
  title: "Media Library | XINVORA Admin",
}

export default async function AdminMediaPage() {
  await SessionService.requireAdmin()

  // Use the action which includes product attachment info (attachedProductId + attachedProductName)
  const result = await getMediaLibraryItemsAction()
  const serialized = result.success ? result.data : []

  return <MediaLibraryClient initialItems={serialized} />
}
