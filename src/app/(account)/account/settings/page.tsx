import { SessionService } from "@/services/session.service"
import { ProfileService } from "@/services/profile.service"
import { SettingsForm } from "./SettingsForm"

export const metadata = {
  title: "Account Preferences | XINVORA",
  description: "Configure system preferences and notification settings.",
}

export default async function SettingsPage() {
  const session = await SessionService.requireAuth()
  const profile = await ProfileService.getOrCreateProfile(session.id)

  return (
    <div className="space-y-6">
      <div className="border-b border-border-primary/20 pb-4">
        <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">My Account</span>
        <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mt-1">Preferences</h1>
      </div>

      <SettingsForm initialProfile={profile} />
    </div>
  )
}
