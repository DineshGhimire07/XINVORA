"use client"

import React, { useState } from "react"
import { Save, Settings2, Globe, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface SEOSettingsTabProps {
  settings: any
  onSaveSettings: (settings: any) => void
}

export function SEOSettingsTab({ settings, onSaveSettings }: SEOSettingsTabProps) {
  const [formState, setFormState] = useState({
    globalTitleTemplate: settings?.globalTitleTemplate || "{{title}} | XINVORA",
    globalMetaTemplate: settings?.globalMetaTemplate || "Discover {{name}} handcrafted by XINVORA for quiet luxury living.",
    defaultOgImage: settings?.defaultOgImage || "/og-default.jpg",
    defaultTwitterImage: settings?.defaultTwitterImage || "/og-default.jpg",
    organizationName: settings?.organizationName || "XINVORA",
    organizationLogo: settings?.organizationLogo || "/logo.png",
    websiteName: settings?.websiteName || "XINVORA Storefront",
    robotsDefaults: settings?.robotsDefaults || "User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://xinvora.com.np/sitemap.xml",
    canonicalRules: settings?.canonicalRules || "ENFORCE_HTTPS_LOWERCASE",
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveSettings(formState)
    toast.success("Global SEO configuration saved!")
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <h3 className="text-body-md font-display font-bold text-text-primary">Global SEO Metadata Templates & Interpolation</h3>
            <p className="text-body-xs text-text-secondary mt-0.5">
              Available template variables: <code className="text-accent font-mono text-[11px]">&#123;&#123;product&#125;&#125;</code>, <code className="text-accent font-mono text-[11px]">&#123;&#123;brand&#125;&#125;</code>, <code className="text-accent font-mono text-[11px]">&#123;&#123;category&#125;&#125;</code>, <code className="text-accent font-mono text-[11px]">&#123;&#123;price&#125;&#125;</code>, <code className="text-accent font-mono text-[11px]">&#123;&#123;site_name&#125;&#125;</code>.
            </p>
          </div>

          <Button type="submit" className="bg-text-primary text-surface font-bold text-xs uppercase tracking-wider h-9 px-5">
            <Save size={14} className="mr-1.5" /> Save Global Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block">Title Template</label>
            <Input
              value={formState.globalTitleTemplate}
              onChange={(e) => setFormState({ ...formState, globalTitleTemplate: e.target.value })}
              className="h-10 text-xs font-mono bg-surface border-border/60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block">Meta Description Template</label>
            <Input
              value={formState.globalMetaTemplate}
              onChange={(e) => setFormState({ ...formState, globalMetaTemplate: e.target.value })}
              className="h-10 text-xs font-mono bg-surface border-border/60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block">Default OpenGraph Image URL</label>
            <Input
              value={formState.defaultOgImage}
              onChange={(e) => setFormState({ ...formState, defaultOgImage: e.target.value })}
              className="h-10 text-xs font-mono bg-surface border-border/60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block">Default Twitter Card Image URL</label>
            <Input
              value={formState.defaultTwitterImage}
              onChange={(e) => setFormState({ ...formState, defaultTwitterImage: e.target.value })}
              className="h-10 text-xs font-mono bg-surface border-border/60"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-6">
        <div>
          <h3 className="text-body-md font-display font-bold text-text-primary">Brand Organization & Website Schema Identity</h3>
          <p className="text-body-xs text-text-secondary mt-0.5">Configures organization structured data JSON-LD identity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block">Organization Name</label>
            <Input
              value={formState.organizationName}
              onChange={(e) => setFormState({ ...formState, organizationName: e.target.value })}
              className="h-10 text-xs bg-surface border-border/60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block">Organization Logo Asset URL</label>
            <Input
              value={formState.organizationLogo}
              onChange={(e) => setFormState({ ...formState, organizationLogo: e.target.value })}
              className="h-10 text-xs font-mono bg-surface border-border/60"
            />
          </div>
        </div>
      </Card>
    </form>
  )
}
