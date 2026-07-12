import { SessionService } from "@/services/session.service"
import { ProfileService } from "@/services/profile.service"
import { ProfileForm } from "./ProfileForm"

export const metadata = {
  title: "My Profile | XINVORA",
  description: "Manage your personal settings and contact info.",
}

export default async function ProfilePage() {
  const session = await SessionService.requireAuth()
  const profile = await ProfileService.getOrCreateProfile(session.id)

  return (
    <div className="space-y-6">
      <div className="border-b border-border-primary/20 pb-4">
        <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">My Account</span>
        <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mt-1">Personal Info</h1>
      </div>

      <ProfileForm initialProfile={profile} />
    </div>
  )
}
