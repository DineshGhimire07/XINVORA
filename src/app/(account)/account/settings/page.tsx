import { SessionService } from "@/services/session.service"
import { ProfileService } from "@/services/profile.service"
import { SettingsForm } from "./SettingsForm"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Account Preferences | XINVORA",
  description: "Configure system preferences and notification settings.",
}

export default async function SettingsPage() {
  const session = await SessionService.requireAuth()
  const profile = await ProfileService.getOrCreateProfile(session.id)
  if (!profile) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#B89563] uppercase">
            My Account
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B89563]" />
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#1A110F] font-normal">
          Preferences
        </h1>
        <p className="text-xs text-[#8C7A72] mt-1">
          Customize your browsing language and email communications.
        </p>
      </div>

      <SettingsForm initialProfile={profile} />
    </div>
  )
}
