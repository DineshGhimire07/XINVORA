import { AdminSettingsService } from "@/services/admin/settings.service"
import { GeneralSettingsForm } from "./GeneralSettingsForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function GeneralSettingsPage() {
  const settings = await AdminSettingsService.getSetting("general")
  
  if (!settings) {
    return <div>Failed to load settings</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light tracking-tight">General Settings</h2>
        <p className="text-text-secondary">Configure your store's primary information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
          <CardDescription>
            This information is used across your store for SEO and customer communication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GeneralSettingsForm defaultValues={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
