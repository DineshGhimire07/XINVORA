"use client"

import { useState, useTransition } from "react"
import { updateAuthPageSettingsAction } from "@/actions/admin/settings.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MediaUploader } from "@/components/admin/MediaUploader"
import type { AuthPageSettings } from "@/types/settings"
import { ImageIcon, Trash2, Save, Sparkles } from "lucide-react"

interface LoginManagerClientProps {
  initialSettings: AuthPageSettings
}

export function LoginManagerClient({ initialSettings }: LoginManagerClientProps) {
  const [settings, setSettings] = useState<AuthPageSettings>(initialSettings)
  const [showUploader, setShowUploader] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      const res = await updateAuthPageSettingsAction(settings)
      if (res.success) {
        setMessage({ type: "success", text: "Login & Registration hero settings updated successfully." })
      } else {
        setMessage({ type: "error", text: res.error?.message || "Failed to update settings." })
      }
    })
  }

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
          Login & Register Hero Manager
        </h1>
        <p className="text-admin-sm text-admin-text-secondary mt-1">
          Customize the editorial hero image and overlay copy displayed on the login and account registration pages.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-admin-md border text-admin-sm font-medium ${
            message.type === "success"
              ? "bg-admin-status-success-bg text-admin-status-success-text border-admin-status-success-border"
              : "bg-admin-status-danger-bg text-admin-status-danger-text border-admin-status-danger-border"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Settings Form */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card space-y-6">
          <h2 className="text-admin-base font-bold text-admin-text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-admin-accent-purple-icon" />
            Hero Configuration
          </h2>

          {/* Image Selection / Input */}
          <div className="space-y-3">
            <Label className="text-admin-xs uppercase tracking-wider text-admin-text-secondary font-semibold">
              Editorial Hero Image
            </Label>
            {settings.heroImageUrl ? (
              <div className="relative group rounded-admin-md overflow-hidden border border-admin-border aspect-[3/4] bg-admin-content max-w-xs">
                <img
                  src={settings.heroImageUrl}
                  alt="Auth Hero Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-white/90 text-black border-none hover:bg-white text-admin-xs"
                    onClick={() => setShowUploader(!showUploader)}
                  >
                    Change Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-red-500/90 text-white border-none hover:bg-red-600 p-2"
                    onClick={() => setSettings((prev) => ({ ...prev, heroImageUrl: "" }))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-xs">
                <div
                  onClick={() => setShowUploader(!showUploader)}
                  className="border-2 border-dashed border-admin-border rounded-admin-md p-8 text-center cursor-pointer hover:border-admin-text-secondary transition-colors aspect-[3/4] flex flex-col items-center justify-center gap-3"
                >
                  <div className="h-10 w-10 rounded-full bg-admin-content flex items-center justify-center text-admin-text-secondary">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-admin-sm font-semibold text-admin-text-primary">Upload Hero Image</p>
                    <p className="text-admin-xs text-admin-text-secondary mt-0.5">Click to upload new image</p>
                  </div>
                </div>
              </div>
            )}

            {showUploader && (
              <div className="p-4 bg-admin-content border border-admin-border rounded-admin-md">
                <MediaUploader
                  onUploadComplete={(urls: string[]) => {
                    if (urls.length > 0) {
                      setSettings((prev) => ({ ...prev, heroImageUrl: urls[0] }))
                      setShowUploader(false)
                    }
                  }}
                />
              </div>
            )}

            {/* Direct Image URL input */}
            <div className="space-y-1 pt-2">
              <Label htmlFor="heroImageUrl" className="text-admin-xs text-admin-text-secondary">
                Or enter Image URL directly:
              </Label>
              <Input
                id="heroImageUrl"
                value={settings.heroImageUrl}
                onChange={(e) => setSettings((prev) => ({ ...prev, heroImageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <Label htmlFor="headline">Headline Overlay Text</Label>
            <Input
              id="headline"
              value={settings.headline}
              onChange={(e) => setSettings((prev) => ({ ...prev, headline: e.target.value }))}
              placeholder="e.g. Luxury is found in the details."
            />
          </div>

          {/* Subheading */}
          <div className="space-y-2">
            <Label htmlFor="subheading">Subheading / Collection Tag</Label>
            <Input
              id="subheading"
              value={settings.subheading}
              onChange={(e) => setSettings((prev) => ({ ...prev, subheading: e.target.value }))}
              placeholder="e.g. SPRING EDITORIAL 2026"
            />
          </div>

          {/* Save Action */}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Saving changes..." : "Save Auth Hero Settings"}
          </Button>
        </div>

        {/* Storefront Live Preview Card */}
        <div className="space-y-3">
          <Label className="text-admin-xs uppercase tracking-wider text-admin-text-secondary font-semibold">
            Live Preview Card
          </Label>
          <div className="relative rounded-admin-lg overflow-hidden border border-admin-border aspect-[3/4] shadow-xl bg-neutral-900">
            {settings.heroImageUrl ? (
              <img
                src={settings.heroImageUrl}
                alt="Auth Hero Preview"
                className="w-full h-full object-cover object-top opacity-90"
              />
            ) : (
              <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-500 text-admin-sm">
                No Image Selected
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-10 left-8 right-8 text-white space-y-3">
              <h3 className="font-display text-2xl md:text-3xl leading-snug tracking-tight font-serif italic text-pretty">
                &ldquo;{settings.headline || "Luxury is found in the details."}&rdquo;
              </h3>
              <div className="w-8 h-[1px] bg-white/40" />
              <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-white/80">
                {settings.subheading || "SPRING EDITORIAL 2026"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
