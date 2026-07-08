import { AdminSettingsService } from "@/services/admin/settings.service"
import { StoreInvoiceForm } from "./StoreInvoiceForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function StoreInvoicePage() {
  const settings = await AdminSettingsService.getSetting("store_invoice")
  
  if (!settings) return <div>Failed to load settings</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light tracking-tight">Invoice Configuration</h2>
        <p className="text-text-secondary">Set up invoice formatting and prefixes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Templates</CardTitle>
          <CardDescription>
            These settings affect how invoices are generated and displayed to customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoreInvoiceForm defaultValues={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
