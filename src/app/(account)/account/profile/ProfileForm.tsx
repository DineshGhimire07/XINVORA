"use client"

import { useState } from "react"
import { updateProfileAction } from "@/actions/profile.actions"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface ProfileFormProps {
  initialProfile: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    newsletterPreference: boolean
    languagePreference: string
    timezone: string
  }
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [formData, setFormData] = useState(initialProfile)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateProfileAction({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || undefined,
      dateOfBirth: formData.dateOfBirth || null,
      newsletterPreference: formData.newsletterPreference,
      languagePreference: formData.languagePreference,
      timezone: formData.timezone,
    })

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error?.message || "Failed to update profile settings.")
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
              First Name *
            </label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full h-11 px-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
              Last Name *
            </label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full h-11 px-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full h-11 px-4 bg-[#F2EFEA]/60 border border-[#EDE3DB] rounded-xl text-xs text-[#8C7A72] cursor-not-allowed"
            />
            <p className="text-[10px] text-[#8C7A72]">
              Email address is linked to your account authentication.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
              Contact Phone (Nepal)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="e.g. 9812345678"
              className="w-full h-11 px-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#F2EFEA] flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 h-11 bg-[#1A110F] hover:bg-[#33221E] text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
