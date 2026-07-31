import { SessionService } from "@/services/session.service"
import { redirect } from "next/navigation"
import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { Grid } from "@/components/shared/grid"
import { DashboardSidebar } from "./DashboardSidebar"
import { Suspense } from "react"
import { HeaderServer } from "@/components/shared/Header/HeaderServer"
import { Footer } from "@/components/shared/Footer/Footer"
import { HeaderStateProvider } from "@/providers/header-state-provider"
import { CookieScriptLoader } from "@/components/cookies/CookieScriptLoader"
import { CookieBanner } from "@/components/cookies/CookieBanner"
import { CookieModal } from "@/components/cookies/CookieModal"

interface AccountLayoutProps {
  children: React.ReactNode
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const session = await SessionService.optionalAuth()
  if (!session) {
    redirect("/login?callbackUrl=/account")
  }

  return (
    <HeaderStateProvider>
      <CookieScriptLoader />
      <HeaderServer />
      <Section className="pt-[120px] md:pt-32 pb-12 md:pb-20 bg-background min-h-screen">
        <Container size="full" className="px-6 sm:px-12 md:px-16 lg:px-20">
          <Grid cols={{ base: 1, lg: 12 }} gap={8} className="items-start">
            {/* Account Sidebar Navigation */}
            <aside className="lg:col-span-3">
              <DashboardSidebar />
            </aside>

            {/* Main Account View Content */}
            <main className="lg:col-span-9">
              {children}
            </main>
          </Grid>
        </Container>
      </Section>
      <CookieBanner />
      <CookieModal />
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </HeaderStateProvider>
  )
}
