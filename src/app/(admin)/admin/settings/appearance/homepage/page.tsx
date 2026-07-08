import { AdminSettingsService } from "@/services/admin/settings.service"
import { AppearanceHomepageForm } from "./AppearanceHomepageForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AppearanceHomepagePage() {
  const settings = await AdminSettingsService.getSetting("appearance_homepage")
  
  if (!settings) return <div>Failed to load settings</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light tracking-tight">Homepage Layout</h2>
        <p className="text-text-secondary">Toggle specific sections and rearrange the homepage.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Management</CardTitle>
          <CardDescription>
            Turn sections on or off instantly without deploying new code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceHomepageForm defaultValues={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
