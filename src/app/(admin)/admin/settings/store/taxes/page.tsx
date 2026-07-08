import { AdminSettingsService } from "@/services/admin/settings.service"
import { StoreTaxesForm } from "./StoreTaxesForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function StoreTaxesPage() {
  const settings = await AdminSettingsService.getSetting("store_taxes")
  
  if (!settings) return <div>Failed to load settings</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light tracking-tight">Taxes & Legal</h2>
        <p className="text-text-secondary">Configure your legal entity details and tax rates.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            This information is used for invoicing and legal compliance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoreTaxesForm defaultValues={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
