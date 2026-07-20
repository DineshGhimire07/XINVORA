import { Suspense } from "react"
import { AdminSettingsService } from "@/services/admin/settings.service"
import { MaintenancePage } from "@/components/shop/MaintenancePage"
import { HeaderServer } from "@/components/shared/Header/HeaderServer"
import { Footer } from "@/components/shared/Footer/Footer"
import { HeaderStateProvider } from "@/providers/header-state-provider"
import { ScrollToTop } from "@/components/storefront/ScrollToTop"

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await AdminSettingsService.getAllSettings()
  const maintenance = settings.maintenance

  if (maintenance && maintenance.mode === "offline") {
    return <MaintenancePage settings={maintenance} />
  }

  return (
    <HeaderStateProvider>
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
      <HeaderServer />
      {children}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </HeaderStateProvider>
  )
}
