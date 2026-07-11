import { AdminSettingsService } from "@/services/admin/settings.service"
import { MaintenancePage } from "@/components/shop/MaintenancePage"

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [maintenance, announcement] = await Promise.all([
    AdminSettingsService.getSetting("maintenance"),
    AdminSettingsService.getSetting("announcement"),
  ])

  if (maintenance && maintenance.mode === "offline") {
    return <MaintenancePage settings={maintenance} />
  }
  
  return (
    <>
      {children}
    </>
  )
}
