"use client"

import { useState } from "react"
import { updateProfileAction } from "@/actions/profile.actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Stack } from "@/components/shared/stack"

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
    <Card className="rounded-none border-border-primary/40 shadow-sm">
      <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50">
        <CardTitle className="text-xs font-light tracking-widest uppercase">Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              Profile details updated successfully!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">First Name</label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="rounded-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Last Name</label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="rounded-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Email (Read Only)</label>
              <Input
                name="email"
                value={formData.email}
                disabled
                className="rounded-none bg-surface-secondary/20 cursor-not-allowed opacity-80"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Phone Number</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="rounded-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Date of Birth</label>
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth ? formData.dateOfBirth.split("T")[0] : ""}
                onChange={handleChange}
                className="rounded-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Timezone</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input bg-surface text-text-primary rounded-none focus:outline-none focus:ring-1 focus:ring-accent text-body-sm h-10"
              >
                <option value="UTC">UTC (GMT+0)</option>
                <option value="EST">EST (GMT-5)</option>
                <option value="PST">PST (GMT-8)</option>
                <option value="NPT">NPT (GMT+5:45)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-border/40 pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="newsletterPreference"
                checked={formData.newsletterPreference}
                onChange={handleChange}
                className="mt-1 text-accent focus:ring-accent"
              />
              <span className="text-body-sm text-text-secondary">
                Yes, I wish to subscribe to the XINVORA Newsletter for exclusive updates, curated launches, and runway schedules.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 rounded-none uppercase tracking-widest text-[11px] font-semibold"
          >
            {loading ? "Saving Changes..." : "Save Preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
