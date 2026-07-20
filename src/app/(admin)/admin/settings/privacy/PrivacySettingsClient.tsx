"use client"

import React, { useState, useTransition } from "react"
import { PrivacyCMPSettings } from "@/types/cookies"
import { updatePrivacyCMPSettingsAction, publishPolicyVersionAction } from "@/actions/cookie-consent.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, History, Download, RefreshCw, FileText, CheckCircle2 } from "lucide-react"

interface PrivacySettingsClientProps {
  initialSettings: PrivacyCMPSettings
  initialAuditLogs: any[]
  initialPolicyVersions: any[]
}

export function PrivacySettingsClient({
  initialSettings,
  initialAuditLogs,
  initialPolicyVersions,
}: PrivacySettingsClientProps) {
  const [settings, setSettings] = useState<PrivacyCMPSettings>(initialSettings)
  const [auditLogs] = useState<any[]>(initialAuditLogs)
  const [policyVersions, setPolicyVersions] = useState<any[]>(initialPolicyVersions)
  const [isPending, startTransition] = useTransition()
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const [newVersion, setNewVersion] = useState("")
  const [versionDesc, setVersionDesc] = useState("")

  const handleSaveSettings = () => {
    setSavedMessage(null)
    startTransition(async () => {
      const res = await updatePrivacyCMPSettingsAction(settings)
      if (res.success) {
        setSavedMessage("Privacy & Cookie CMP settings saved successfully.")
      }
    })
  }

  const handlePublishVersion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVersion || !versionDesc) return

    startTransition(async () => {
      const res = await publishPolicyVersionAction({
        version: newVersion,
        description: versionDesc,
        requiresReconsent: true,
        policySnapshot: {
          necessaryDesc: "Essential for authentication and security",
          analyticsDesc: "Aggregate usage metrics",
          marketingDesc: "Targeted advertising pixels",
          personalizationDesc: "AI recommendations and wishlist signals",
          dataRetentionDays: 365,
          legalJurisdiction: "EU GDPR & International Standard",
        },
      })

      if (res.success && res.data) {
        setPolicyVersions((prev) => [res.data, ...prev])
        setSettings((prev) => ({ ...prev, currentPolicyVersion: newVersion }))
        setNewVersion("")
        setVersionDesc("")
        setSavedMessage(`Published Policy Version ${newVersion}! All users will be prompted for reconsent.`)
      }
    })
  }

  const exportAuditLogsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2))
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `xinvora_consent_audit_logs_${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto animate-fade-in text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-neutral-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-7 w-7 text-[#8C6D58]" />
            Privacy & Cookie Consent Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Enterprise CMP Control Center: Policy Versioning, Script Registry Flags, Audit Logs & Compliance Export.
          </p>
        </div>

        <Button
          type="button"
          disabled={isPending}
          onClick={handleSaveSettings}
          className="bg-[#8C6D58] hover:bg-[#775B47] text-white font-bold text-xs uppercase tracking-widest px-6 h-11"
        >
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {savedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General & Script Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Settings */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b pb-3">
              Banner & Policy Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-neutral-600">Banner Enabled</Label>
                <select
                  value={settings.enabled ? "true" : "false"}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.value === "true" })}
                  className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-md text-xs px-3"
                >
                  <option value="true">Enabled (Show to Visitors)</option>
                  <option value="false">Disabled (Hide Banner)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-neutral-600">Active Policy Version</Label>
                <Input
                  value={settings.currentPolicyVersion}
                  disabled
                  className="h-10 bg-neutral-100 border border-neutral-200 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-neutral-600">Banner Title</Label>
              <Input
                value={settings.bannerTitle}
                onChange={(e) => setSettings({ ...settings, bannerTitle: e.target.value })}
                className="h-10 bg-neutral-50 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-neutral-600">Banner Description</Label>
              <textarea
                value={settings.bannerDescription}
                onChange={(e) => setSettings({ ...settings, bannerDescription: e.target.value })}
                rows={3}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-md text-xs p-3 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          {/* Script Registry Feature Flags */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b pb-3">
              Script Registry Feature Flags (No Redeploy Required)
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border">
                <div>
                  <span className="text-xs font-bold text-neutral-900 uppercase">Google Analytics (GA4)</span>
                  <p className="text-[11px] text-neutral-500">Category: Analytics | Priority: 10</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.scriptFlags.googleAnalytics}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      scriptFlags: { ...settings.scriptFlags, googleAnalytics: e.target.checked },
                    })
                  }
                  className="h-4 w-4 text-[#8C6D58] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border">
                <div>
                  <span className="text-xs font-bold text-neutral-900 uppercase">Meta / Facebook Pixel</span>
                  <p className="text-[11px] text-neutral-500">Category: Marketing | Priority: 15</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.scriptFlags.metaPixel}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      scriptFlags: { ...settings.scriptFlags, metaPixel: e.target.checked },
                    })
                  }
                  className="h-4 w-4 text-[#8C6D58] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border">
                <div>
                  <span className="text-xs font-bold text-neutral-900 uppercase">Microsoft Clarity</span>
                  <p className="text-[11px] text-neutral-500">Category: Analytics | Priority: 20</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.scriptFlags.clarity}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      scriptFlags: { ...settings.scriptFlags, clarity: e.target.checked },
                    })
                  }
                  className="h-4 w-4 text-[#8C6D58] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border">
                <div>
                  <span className="text-xs font-bold text-neutral-900 uppercase">TikTok Pixel</span>
                  <p className="text-[11px] text-neutral-500">Category: Marketing | Priority: 30</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.scriptFlags.tiktokPixel}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      scriptFlags: { ...settings.scriptFlags, tiktokPixel: e.target.checked },
                    })
                  }
                  className="h-4 w-4 text-[#8C6D58] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Version Publisher & Audit Export */}
        <div className="space-y-6">
          {/* Publish Policy Version */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b pb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#8C6D58]" />
              Publish Policy Version
            </h2>

            <form onSubmit={handlePublishVersion} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold uppercase text-neutral-600">New Version (e.g. 1.1)</Label>
                <Input
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  placeholder="1.1"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold uppercase text-neutral-600">Version Change Description</Label>
                <textarea
                  value={versionDesc}
                  onChange={(e) => setVersionDesc(e.target.value)}
                  placeholder="Added TikTok Pixel & expanded AI personalization scope"
                  rows={2}
                  required
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-md text-xs p-2"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-9 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider"
              >
                Publish & Trigger Reconsent
              </Button>
            </form>
          </div>

          {/* Audit Log Export */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <History className="h-4 w-4 text-[#8C6D58]" />
                Audit Logs ({auditLogs.length})
              </h2>

              <Button
                type="button"
                variant="outline"
                onClick={exportAuditLogsJSON}
                className="h-8 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Export JSON
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-[11px]">
              {auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="p-2 bg-neutral-50 rounded border text-neutral-700">
                  <div className="flex justify-between font-bold">
                    <span className="text-neutral-900">{log.action}</span>
                    <span className="text-neutral-400 font-mono">{new Date(log.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-neutral-500 font-mono text-[10px] truncate mt-0.5">Hash: {log.ipHash?.substring(0, 16)}...</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
