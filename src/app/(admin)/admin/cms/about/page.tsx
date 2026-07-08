import { Metadata } from "next"
import { SessionService } from "@/services/session.service"
import { AdminSettingsService } from "@/services/admin/settings.service"
import { Stack } from "@/components/shared/stack"
import { AboutSettingsForm } from "./AboutSettingsForm"

export const metadata: Metadata = {
  title: "About Page Settings | Admin",
}

export default async function AboutSettingsPage() {
  await SessionService.requireAdmin()

  const aboutSettings = await AdminSettingsService.getSetting("about_page")

  return (
    <Stack gap={8} className="p-8">
      <Stack gap={2}>
        <h1 className="text-2xl font-bold tracking-tight">About Page Configuration</h1>
        <p className="text-sm text-text-secondary">
          Manage the images displayed on the storefront's About page fallback layout.
        </p>
      </Stack>

      <AboutSettingsForm defaultValues={aboutSettings} />
    </Stack>
  )
}
