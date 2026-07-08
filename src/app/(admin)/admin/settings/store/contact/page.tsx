import { AdminSettingsService } from "@/services/admin/settings.service"
import { StoreContactForm } from "./StoreContactForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function StoreContactPage() {
  const settings = await AdminSettingsService.getSetting("store_contact")
  
  if (!settings) return <div>Failed to load settings</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light tracking-tight">Store Contact Information</h2>
        <p className="text-text-secondary">Manage how customers can reach you.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
          <CardDescription>
            This information appears in the footer, contact pages, and order confirmation emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoreContactForm defaultValues={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
