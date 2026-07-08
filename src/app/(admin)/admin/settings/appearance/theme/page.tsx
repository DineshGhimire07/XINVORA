import { AdminSettingsService } from "@/services/admin/settings.service"
import { AppearanceThemeForm } from "./AppearanceThemeForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AppearanceThemePage() {
  const settings = await AdminSettingsService.getSetting("appearance_theme")
  
  if (!settings) return <div>Failed to load settings</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light tracking-tight">Theme Customization</h2>
        <p className="text-text-secondary">Control the global look and feel of your storefront.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Colors & Styling</CardTitle>
          <CardDescription>
            These colors will be mapped to the storefront CSS variables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceThemeForm defaultValues={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
