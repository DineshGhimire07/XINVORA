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
      <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#B89563] uppercase">
            My Account
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B89563]" />
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#1A110F] font-normal">
          Security &amp; Passwords
        </h1>
        <p className="text-xs text-[#8C7A72] mt-1">
          Keep your XINVORA customer account secure with a strong password.
        </p>
      </div>

      <PasswordForm />
    </div>
  )
}
