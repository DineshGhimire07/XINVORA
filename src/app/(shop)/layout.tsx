import { Suspense } from "react"
import { AdminSettingsService } from "@/services/admin/settings.service"
import { MaintenancePage } from "@/components/shop/MaintenancePage"
import { HeaderServer } from "@/components/shared/Header/HeaderServer"
import { Footer } from "@/components/shared/Footer/Footer"
import { HeaderStateProvider } from "@/providers/header-state-provider"

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [maintenance, announcement] = await Promise.all([
    AdminSettingsService.getSetting("maintenance"),
    AdminSettingsService.getSetting("announcement"),
  ])

  if (maintenance && maintenance.mode === "offline") {
    return <MaintenancePage settings={maintenance} />
  }

  return (
    <HeaderStateProvider>
      <HeaderServer />
      {children}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </HeaderStateProvider>
  )
}
