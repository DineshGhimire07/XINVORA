import { buildMetadata } from "@/lib/metadata"
import { AdminSettingsService } from "@/services/admin/settings.service"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { LoginForm } from "./LoginForm"
import type { AuthPageSettings } from "@/types/settings"

export const metadata = buildMetadata({
  title: "Login",
  description: "Sign in to your XINVORA account.",
})

const defaultAuthSettings: AuthPageSettings = {
  heroImageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000",
  headline: "Luxury is found in the details.",
  subheading: "SPRING EDITORIAL 2026",
}

export default async function LoginPage() {
  const authSettings = (await AdminSettingsService.getSetting("auth_page")) || defaultAuthSettings

  return (
    <AuthLayout settings={authSettings}>
      <LoginForm />
    </AuthLayout>
  )
}
