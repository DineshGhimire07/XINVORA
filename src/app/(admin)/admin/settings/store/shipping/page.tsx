import { AdminSettingsService } from "@/services/admin/settings.service"
import { StoreShippingForm } from "./StoreShippingForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function StoreShippingPage() {
  const settings = await AdminSettingsService.getSetting("store_shipping")
  
  if (!settings) return <div>Failed to load settings</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light tracking-tight">Shipping Configuration</h2>
        <p className="text-text-secondary">Set up default delivery parameters.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Settings</CardTitle>
          <CardDescription>
            These values are used during the checkout process to calculate totals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoreShippingForm defaultValues={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
