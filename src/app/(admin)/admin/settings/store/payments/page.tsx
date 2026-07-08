import { AdminSettingsService } from "@/services/admin/settings.service"
import { PaymentSettingsForm } from "./PaymentSettingsForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/db/client"
import { mediaLibrary } from "@/db/schema/media"
import { desc, isNull } from "drizzle-orm"

export default async function PaymentSettingsPage() {
  const settings = await AdminSettingsService.getSetting("payment_qrs")
  const mediaItems = await db.select().from(mediaLibrary).where(isNull(mediaLibrary.deletedAt)).orderBy(desc(mediaLibrary.createdAt))
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light tracking-tight">Payment QR Settings</h2>
        <p className="text-text-secondary">Manage manual payment instructions and QR codes for checkout.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Codes & Manual Payments</CardTitle>
          <CardDescription>
            These details will be displayed to customers when they select the respective payment method at checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentSettingsForm defaultValues={settings || {}} mediaItems={mediaItems} />
        </CardContent>
      </Card>
    </div>
  )
}
