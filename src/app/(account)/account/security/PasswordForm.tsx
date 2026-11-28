"use client"

import { useState } from "react"
import { changePasswordAction } from "@/actions/security.actions"
import { CheckCircle2, AlertCircle, Loader2, Lock } from "lucide-react"

export function PasswordForm() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    const result = await changePasswordAction({ newPassword, confirmPassword })

    if (result.success) {
      setSuccess(true)
      setNewPassword("")
      setConfirmPassword("")
    } else {
      setError(result.error?.message || "Failed to change password.")
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        {error && (
          <div className="p-4 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Password updated successfully!</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
            New Password *
          </label>
          <div className="relative">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="w-full h-11 px-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
            Confirm New Password *
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
            minLength={8}
            className="w-full h-11 px-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 h-11 bg-[#1A110F] hover:bg-[#33221E] text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <Lock className="w-3.5 h-3.5 text-[#E6D5C3]" />
            <span>{loading ? "Updating..." : "Update Password"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
