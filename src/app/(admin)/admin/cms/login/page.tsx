import { SessionService } from "@/services/session.service"
import { AdminSettingsService } from "@/services/admin/settings.service"
import { LoginManagerClient } from "./LoginManagerClient"
import type { AuthPageSettings } from "@/types/settings"

export const metadata = {
  title: "Login Manager | Admin CMS | XINVORA",
}

const defaultAuthSettings: AuthPageSettings = {
  heroImageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000",
  headline: "Luxury is found in the details.",
  subheading: "SPRING EDITORIAL 2026",
}

export default async function LoginManagerPage() {
  await SessionService.requireAdmin()

  const authSettings = (await AdminSettingsService.getSetting("auth_page")) || defaultAuthSettings

  return <LoginManagerClient initialSettings={authSettings} />
}
