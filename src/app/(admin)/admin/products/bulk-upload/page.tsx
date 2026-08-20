import { SessionService } from "@/services/session.service"
import BulkUploadClient from "./BulkUploadClient"

export const metadata = {
  title: "Bulk Product Import | XINVORA Admin",
}

export default async function BulkUploadPage() {
  await SessionService.requireAdmin()

  return <BulkUploadClient />
}
