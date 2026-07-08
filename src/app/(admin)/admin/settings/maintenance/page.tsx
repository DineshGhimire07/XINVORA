import { AdminSettingsService } from "@/services/admin/settings.service"
import { MaintenanceSettingsForm } from "./MaintenanceSettingsForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default async function MaintenanceSettingsPage() {
  const settings = await AdminSettingsService.getSetting("maintenance")
  
  if (!settings) {
    return <div>Failed to load maintenance settings</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light tracking-tight">Maintenance Mode</h2>
        <p className="text-text-secondary">Control store access and offline messages.</p>
      </div>

      {settings.mode === "offline" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-500">Store is currently Offline</h4>
            <p className="text-sm text-red-500/80 mt-1">Customers cannot access the storefront. Only authenticated administrators can browse the site.</p>
          </div>
        </div>
      )}

      {settings.mode === "store_closed" && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-500">Store is currently Closed</h4>
            <p className="text-sm text-yellow-500/80 mt-1">Customers can browse products, but the checkout process is completely disabled.</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Access Controls</CardTitle>
          <CardDescription>
            Instantly take your store offline for upgrades, or restrict checkout during busy periods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaintenanceSettingsForm defaultValues={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
