"use client"

import React, { useState, useMemo } from "react"
import {
  Camera,
  Layers,
  Sparkles,
  User,
  Sun,
  Maximize2,
  Palette,
  Sliders,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PromptRoleSlug, PromptTemplateDefinition, PhotographyVariables } from "@/domains/photography/contracts/prompt.contract"
import type { GarmentIdentity, MasterReferences } from "@/domains/photography/contracts/identity.contract"
import { TemplateRegistryEngine } from "@/domains/photography/engines/template-registry.engine"
import { PromptCompilerEngine } from "@/domains/photography/engines/prompt-compiler.engine"
import { PromptCopyCard } from "./PromptCopyCard"
import { PromptInspector } from "./PromptInspector"

interface PromptStudioTabsProps {
  productName: string
  productCategory: string
  identity: GarmentIdentity | null
  references: MasterReferences
  variantIdentity?: {
    colorName?: string | null
    hexCode?: string | null
    sku?: string | null
    specificMotif?: string | null
  } | null
  templates: Record<PromptRoleSlug, PromptTemplateDefinition>
  onCopySuccess: (msg: string) => void
}

export function PromptStudioTabs({
  productName,
  productCategory,
  identity,
  references,
  variantIdentity,
  templates,
  onCopySuccess,
}: PromptStudioTabsProps) {
  const [activeRole, setActiveRole] = useState<PromptRoleSlug>("product_front")

  // Photography override inputs state per role
  const [photoOverrides, setPhotoOverrides] = useState<Record<PromptRoleSlug, Partial<PhotographyVariables>>>({
    garment_identification: {},
    product_front: {},
    product_back: {},
    model_front: {},
    model_back: {},
    lifestyle: {},
    detail_closeup: {},
    color_transfer: {},
  })

  const [isCustomizing, setIsCustomizing] = useState(false)

  const rolesList: Array<{ slug: PromptRoleSlug; label: string; number: string; icon: any }> = [
    { slug: "garment_identification", label: "Identification", number: "01", icon: Sparkles },
    { slug: "product_front", label: "Product Front", number: "02", icon: Camera },
    { slug: "product_back", label: "Product Back", number: "03", icon: Camera },
    { slug: "model_front", label: "Model Front", number: "04", icon: User },
    { slug: "model_back", label: "Model Back", number: "05", icon: User },
    { slug: "lifestyle", label: "Lifestyle", number: "06", icon: Sun },
    { slug: "detail_closeup", label: "Detail Close-Up", number: "07", icon: Maximize2 },
    { slug: "color_transfer", label: "Color Reference Front", number: "08", icon: Palette },
  ]

  const activeTemplate = templates[activeRole] || TemplateRegistryEngine.getTemplate(activeRole)
  const currentOverrides = photoOverrides[activeRole] || {}

  // Compile active prompt live
  const compiledResult = useMemo(() => {
    const vars: PhotographyVariables = {
      productName,
      productCategory,
      garmentIdentity: identity,
      variantIdentity,
      references,
      imageRoleSlug: activeRole,
      photographyDirection: currentOverrides.photographyDirection,
      backgroundDirection: currentOverrides.backgroundDirection,
      cameraDirection: currentOverrides.cameraDirection,
      lightingDirection: currentOverrides.lightingDirection,
      modelDirection: currentOverrides.modelDirection,
      poseDirection: currentOverrides.poseDirection,
      environmentDirection: currentOverrides.environmentDirection,
    }
    return PromptCompilerEngine.compile(vars, activeTemplate)
  }, [
    productName,
    productCategory,
    identity,
    variantIdentity,
    references,
    activeRole,
    currentOverrides,
    activeTemplate,
  ])

  const handleUpdateOverride = (field: keyof PhotographyVariables, value: string) => {
    setPhotoOverrides((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [field]: value,
      },
    }))
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-border/80">
        {rolesList.map((item) => {
          const Icon = item.icon
          const isActive = activeRole === item.slug
          const isColorRole = item.slug === "color_transfer"

          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => setActiveRole(item.slug)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-xs rounded-sm transition-all border",
                isActive
                  ? isColorRole
                    ? "bg-purple-900 text-white border-purple-950 font-bold shadow-xs"
                    : "bg-text-primary text-surface border-text-primary font-semibold shadow-xs"
                  : isColorRole
                  ? "bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100 font-semibold"
                  : "bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70"
              )}
            >
              <span className={cn("font-mono text-[10px] px-1 py-0.2 rounded-xs", isActive ? "bg-white/20 text-white" : isColorRole ? "bg-purple-200/80 text-purple-900 font-bold" : "bg-surface-secondary text-text-tertiary")}>
                {item.number}
              </span>
              <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : isColorRole ? "text-purple-700" : "text-text-secondary")} />
              <span>{item.label}</span>
              {isColorRole && !isActive && (
                <span className="text-[8px] font-bold uppercase tracking-wider bg-purple-200 text-purple-900 px-1 py-0.5 rounded-xs">
                  Recolor
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Role Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-surface border border-border rounded-sm">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              {activeTemplate.name}
            </h4>
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-text-primary text-surface rounded-xs">
              {activeTemplate.version}
            </span>
          </div>
          <p className="text-[11px] text-text-secondary mt-0.5">
            {activeTemplate.description}
          </p>
        </div>

        {activeRole !== "garment_identification" && (
          <button
            type="button"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-xs hover:bg-surface-secondary transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isCustomizing ? "Hide Parameters" : "Customize Parameters"}</span>
          </button>
        )}
      </div>

      {/* Optional Photography Overrides Panel */}
      {isCustomizing && activeRole !== "garment_identification" && (
        <div className="p-4 bg-surface-secondary/40 border border-border/80 rounded-sm space-y-3">
          <h5 className="text-[11px] font-semibold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
            <Sliders className="w-3 luxury text-accent" />
            Photography Parameters for {activeTemplate.name}
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">
                Photography Direction
              </label>
              <input
                type="text"
                value={currentOverrides.photographyDirection ?? activeTemplate.defaultPhotographyDirection ?? ""}
                onChange={(e) => handleUpdateOverride("photographyDirection", e.target.value)}
                className="w-full text-xs p-2 bg-surface border border-border rounded-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">
                Camera & Framing (3:4 Portrait Aspect Ratio)
              </label>
              <input
                type="text"
                value={currentOverrides.cameraDirection ?? activeTemplate.defaultCameraDirection ?? ""}
                onChange={(e) => handleUpdateOverride("cameraDirection", e.target.value)}
                className="w-full text-xs p-2 bg-surface border border-border rounded-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">
                Lighting Setup
              </label>
              <input
                type="text"
                value={currentOverrides.lightingDirection ?? activeTemplate.defaultLightingDirection ?? ""}
                onChange={(e) => handleUpdateOverride("lightingDirection", e.target.value)}
                className="w-full text-xs p-2 bg-surface border border-border rounded-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">
                Background Direction
              </label>
              <input
                type="text"
                value={currentOverrides.backgroundDirection ?? activeTemplate.defaultBackgroundDirection ?? ""}
                onChange={(e) => handleUpdateOverride("backgroundDirection", e.target.value)}
                className="w-full text-xs p-2 bg-surface border border-border rounded-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Final Prompt Output Card */}
      <PromptCopyCard
        promptText={compiledResult.compiledText}
        roleName={activeTemplate.name}
        version={activeTemplate.version}
        onCopySuccess={onCopySuccess}
      />

      {/* Developer/Admin Prompt Compilation Inspector */}
      <PromptInspector
        layers={compiledResult.layers}
        activeRoleName={activeTemplate.name}
      />
    </div>
  )
}
