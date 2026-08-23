"use client"

import React, { useState } from "react"
import { Check, Sparkles, Camera } from "lucide-react"
import { PromptStudioTabs } from "@/components/admin/photography/PromptStudioTabs"
import type { PromptRoleSlug, PromptTemplateDefinition } from "@/domains/photography/contracts/prompt.contract"

interface AIPhotographyStudioClientProps {
  templates: Record<PromptRoleSlug, PromptTemplateDefinition>
}

export function AIPhotographyStudioClient({
  templates,
}: AIPhotographyStudioClientProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-text-primary text-surface px-4 py-2.5 rounded-sm shadow-lg text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Studio Card */}
      <div className="bg-surface border border-border rounded-sm p-6 space-y-6 shadow-xs">
        <div className="border-b border-border/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xs bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Camera className="w-4 h-4" />
            </div>
            <h1 className="text-base font-bold font-display text-text-primary tracking-tight">
              AI Photography Studio
            </h1>
            <span className="px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider uppercase bg-text-primary text-surface rounded-xs">
              Phase 1
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Select a photography role to preview and copy the final compiled prompt for your external AI generation workflow.
          </p>
        </div>

        {/* Pure 7-Tab Prompt Studio */}
        <PromptStudioTabs
          productName="XINVORA Fashion Garment"
          productCategory="Apparel"
          identity={null}
          references={{}}
          templates={templates}
          onCopySuccess={showToast}
        />
      </div>
    </div>
  )
}
