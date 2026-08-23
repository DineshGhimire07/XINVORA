"use client"

import React, { useState } from "react"
import { Check } from "lucide-react"
import { PromptStudioTabs } from "./PromptStudioTabs"
import type { PromptRoleSlug, PromptTemplateDefinition } from "@/domains/photography/contracts/prompt.contract"

interface AIPhotographySectionProps {
  productName?: string
  productCategory?: string
  templates?: Record<PromptRoleSlug, PromptTemplateDefinition>
}

export function AIPhotographySection({
  productName = "XINVORA Fashion Garment",
  productCategory = "Apparel",
  templates = {} as Record<PromptRoleSlug, PromptTemplateDefinition>,
}: AIPhotographySectionProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="bg-surface border border-border rounded-sm p-5 space-y-4 shadow-xs">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-text-primary text-surface px-4 py-2.5 rounded-sm shadow-lg text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <PromptStudioTabs
        productName={productName}
        productCategory={productCategory}
        identity={null}
        references={{}}
        templates={templates}
        onCopySuccess={showToast}
      />
    </div>
  )
}
