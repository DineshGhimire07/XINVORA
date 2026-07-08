import { SessionService } from "@/services/session.service"
import { PasswordForm } from "./PasswordForm"

export const metadata = {
  title: "Account Security | XINVORA",
  description: "Update your login credentials and password settings.",
}

export default async function SecurityPage() {
  await SessionService.requireAuth()

  return (
    <div className="space-y-6">
      <div className="border-b border-border-primary/20 pb-4">
        <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">My Account</span>
        <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mt-1">Security Settings</h1>
      </div>

      <PasswordForm />
    </div>
  )
}
