"use client"

import { useState } from "react"
import { updateProfileAction } from "@/actions/profile.actions"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Stack } from "@/components/shared/stack"

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
    <div className="space-y-6">
      <Card className="rounded-none border-border-primary/40 shadow-sm">
        <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50">
          <CardTitle className="text-xs font-light tracking-widest uppercase">System Options</CardTitle>
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
                Preferences saved successfully!
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Language Preference</label>
              <select
                value={languagePreference}
                onChange={(e) => setLanguagePreference(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-surface text-text-primary rounded-none focus:outline-none focus:ring-1 focus:ring-accent text-body-sm h-10"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ne">नेपाली</option>
              </select>
            </div>

            <div className="border-t border-border/40 pt-4 flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsletterPreference}
                  onChange={(e) => setNewsletterPreference(e.target.checked)}
                  className="mt-1 text-accent focus:ring-accent"
                />
                <div>
                  <span className="text-body-sm text-text-primary font-medium block">Subscribe to newsletters</span>
                  <span className="text-caption text-text-secondary">Receive updates on new collection drops, editorials, and season styling tips.</span>
                </div>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 rounded-none uppercase tracking-widest text-[11px] font-semibold"
            >
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-none border-red-100 shadow-sm bg-red-50/10">
        <CardHeader className="border-b border-red-100 bg-red-50/20 py-3">
          <CardTitle className="text-xs font-semibold tracking-widest uppercase text-red-700">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-body-sm text-text-secondary">
            Permanently delete your XINVORA account and all associated customer history. This action is irreversible.
          </p>
          <Button
            variant="outline"
            disabled
            className="rounded-none border-red-200 text-red-700 hover:bg-red-50 uppercase tracking-widest text-[10px] font-semibold opacity-70 cursor-not-allowed"
          >
            Delete Account (Contact Support)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
