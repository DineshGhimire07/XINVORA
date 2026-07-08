import { AdminSettingsService } from "@/services/admin/settings.service"
import { MaintenancePage } from "@/components/shop/MaintenancePage"

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const maintenance = await AdminSettingsService.getSetting("maintenance")

  if (maintenance && maintenance.mode === "offline") {
    return <MaintenancePage settings={maintenance} />
  }

  const announcement = await AdminSettingsService.getSetting("announcement")
  
  return (
    <>
      {children}
    </>
  )
}
