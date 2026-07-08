import { AdminSettingsService } from "@/services/admin/settings.service"
import { FeaturesSettingsForm } from "./FeaturesSettingsForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function FeaturesSettingsPage() {
  const settings = await AdminSettingsService.getSetting("features")
  
  if (!settings) return <div>Failed to load settings</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light tracking-tight">Feature Toggles</h2>
        <p className="text-text-secondary">Enable or disable major store features.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Capabilities</CardTitle>
          <CardDescription>
            Turn complex systems on or off without redeploying code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeaturesSettingsForm defaultValues={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
