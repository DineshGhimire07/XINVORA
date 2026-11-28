"use client"

import { useState } from "react"
import { updateProfileAction } from "@/actions/profile.actions"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface SettingsFormProps {
  initialProfile: {
    firstName: string
    lastName: string
    newsletterPreference: boolean
    languagePreference: string
    timezone: string
  }
}

export function SettingsForm({ initialProfile }: SettingsFormProps) {
  const [newsletterPreference, setNewsletterPreference] = useState(initialProfile.newsletterPreference)
  const [languagePreference, setLanguagePreference] = useState(initialProfile.languagePreference)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateProfileAction({
      firstName: initialProfile.firstName,
      lastName: initialProfile.lastName,
      newsletterPreference,
      languagePreference,
    })

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error?.message || "Failed to save settings.")
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
            <span>Preferences saved successfully!</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
            Language Preference
          </label>
          <select
            value={languagePreference}
            onChange={(e) => setLanguagePreference(e.target.value)}
            className="w-full h-11 px-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
          >
            <option value="en">English (Default)</option>
            <option value="ne">नेपाली (Nepali)</option>
          </select>
        </div>

        <div className="pt-2 border-t border-[#F2EFEA]">
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-[#FAF6F2]/60 border border-[#EDE3DB]/60 hover:border-[#EDE3DB] transition-colors">
            <input
              type="checkbox"
              checked={newsletterPreference}
              onChange={(e) => setNewsletterPreference(e.target.checked)}
              className="mt-0.5 accent-[#1A110F] w-4 h-4 rounded cursor-pointer"
            />
            <div>
              <span className="text-xs font-semibold text-[#1A110F] block">
                Seasonal Newsletter &amp; VIP Releases
              </span>
              <span className="text-[11px] text-[#8C7A72] leading-relaxed block mt-0.5">
                Receive priority updates on new collection drops, limited editions, and curated styling guides.
              </span>
            </div>
          </label>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 h-11 bg-[#1A110F] hover:bg-[#33221E] text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{loading ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
