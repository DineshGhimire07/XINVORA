"use client"

import React, { useState } from "react"
import {
  Copy,
  Lock,
  Unlock,
  Sparkles,
  FileCode,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  Palette,
  Scissors,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { GarmentIdentity, IdentityStatus } from "@/domains/photography/contracts/identity.contract"
import { TemplateRegistryEngine } from "@/domains/photography/engines/template-registry.engine"
import { IdentityParserEngine } from "@/domains/photography/engines/identity-parser.engine"

interface ProductIdentityEditorProps {
  identity: GarmentIdentity | null
  rawOutput?: string | null
  status: IdentityStatus
  hasMasterReferences: boolean
  onSaveIdentity: (identity: GarmentIdentity, rawOutput?: string) => Promise<void>
  onStatusChange: (status: IdentityStatus) => Promise<void>
  onCopySuccess: (msg: string) => void
}

export function ProductIdentityEditor({
  identity,
  rawOutput,
  status,
  hasMasterReferences,
  onSaveIdentity,
  onStatusChange,
  onCopySuccess,
}: ProductIdentityEditorProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [pasteText, setPasteText] = useState(rawOutput || "")
  const [parseError, setParseError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const isLocked = status === "LOCKED"

  const handleCopyPrompt01 = () => {
    const template = TemplateRegistryEngine.getTemplate("garment_identification")
    navigator.clipboard.writeText(template.templateText)
    onCopySuccess("Prompt 01 (Garment Identification) copied to clipboard!")
  }

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setParseError(null)

    const result = IdentityParserEngine.parse(pasteText)
    if (!result.success || !result.data) {
      setParseError(result.error || "Failed to parse structured JSON.")
      return
    }

    setIsSaving(true)
    try {
      await onSaveIdentity(result.data, pasteText)
      setIsImportModalOpen(false)
      onCopySuccess("Garment Identity imported & saved successfully!")
    } catch (err: any) {
      setParseError(err.message || "Failed to save identity")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleLock = async () => {
    setIsSaving(true)
    try {
      if (isLocked) {
        await onStatusChange("REVIEWED")
        onCopySuccess("Product Identity unlocked for editing.")
      } else {
        await onStatusChange("LOCKED")
        onCopySuccess("Product Identity LOCKED. Prompts now use this authoritative definition.")
      }
    } catch (err: any) {
      alert(err.message || "Failed to update lock status")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="border border-border rounded-sm bg-surface overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 bg-surface-secondary/40 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-accent" />
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              2. Authoritative Product Identity
            </h4>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Defines WHAT the garment is (color, silhouette, seams, closures, fabric appearance).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className={cn(
              "px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-xs border",
              status === "LOCKED"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : status === "REVIEWED"
                ? "bg-blue-50 text-blue-800 border-blue-300"
                : "bg-amber-50 text-amber-800 border-amber-300"
            )}
          >
            {status === "LOCKED" ? "🔒 LOCKED" : status === "REVIEWED" ? "✓ REVIEWED" : "✎ DRAFT"}
          </span>

          {/* Prompt 01 Copy Button */}
          <button
            type="button"
            onClick={handleCopyPrompt01}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-text-primary text-surface rounded-xs hover:opacity-90 transition-opacity"
            title={hasMasterReferences ? "Copy Garment Identification Prompt" : "Assign Master Front & Back references first for best results"}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Prompt 01</span>
          </button>

          {/* Import / Paste JSON Button */}
          <button
            type="button"
            disabled={isLocked}
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border bg-surface text-text-primary rounded-xs hover:bg-surface-secondary transition-colors disabled:opacity-50"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Paste/Import Identity</span>
          </button>

          {/* Lock / Unlock Toggle */}
          {identity && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleToggleLock}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xs transition-colors",
                isLocked
                  ? "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              )}
            >
              {isLocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Identity</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-text-tertiary hover:text-text-primary transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Identity Body */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {!identity ? (
            <div className="p-8 text-center bg-surface-secondary/20 rounded-sm border border-dashed border-border/80">
              <Sparkles className="w-8 h-8 text-text-tertiary mx-auto mb-2 opacity-40" />
              <h5 className="text-xs font-medium text-text-primary">No Product Identity Extracted Yet</h5>
              <p className="text-[11px] text-text-secondary max-w-md mx-auto mt-1">
                1. Click <strong>"Copy Prompt 01"</strong> above.
                <br />
                2. Paste it into your Vision AI (ChatGPT/Claude) alongside the Master Front & Back images.
                <br />
                3. Click <strong>"Paste/Import Identity"</strong> to save the authoritative specification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* Basic Garment */}
              <div className="p-3 bg-surface-secondary/40 border border-border/60 rounded-sm space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-text-primary text-[11px] uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-accent" />
                  Basic Garment
                </div>
                <div className="text-[11px] space-y-1 text-text-secondary">
                  <p><strong className="text-text-primary">Category:</strong> {identity.basic.category} ({identity.basic.subtype})</p>
                  <p><strong className="text-text-primary">Gender / Target:</strong> {identity.basic.gender}</p>
                  <p><strong className="text-text-primary">Silhouette:</strong> {identity.basic.silhouette}</p>
                  <p><strong className="text-text-primary">Length:</strong> {identity.basic.length}</p>
                </div>
              </div>

              {/* Color & Pattern */}
              <div className="p-3 bg-surface-secondary/40 border border-border/60 rounded-sm space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-text-primary text-[11px] uppercase tracking-wider">
                  <Palette className="w-3.5 h-3.5 text-accent" />
                  Color & Pattern
                </div>
                <div className="text-[11px] space-y-1 text-text-secondary">
                  <p><strong className="text-text-primary">Primary Color:</strong> {identity.color.primaryColor}</p>
                  {identity.color.secondaryColor && (
                    <p><strong className="text-text-primary">Secondary:</strong> {identity.color.secondaryColor}</p>
                  )}
                  <p><strong className="text-text-primary">Distribution:</strong> {identity.color.colorDistribution}</p>
                  <p><strong className="text-text-primary">Pattern:</strong> {identity.pattern.hasPattern ? `${identity.pattern.patternType || "Yes"} (${identity.pattern.patternScale || "Scale: N/A"})` : "Solid / None"}</p>
                </div>
              </div>

              {/* Construction */}
              <div className="p-3 bg-surface-secondary/40 border border-border/60 rounded-sm space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-text-primary text-[11px] uppercase tracking-wider">
                  <Scissors className="w-3.5 h-3.5 text-accent" />
                  Construction Details
                </div>
                <div className="text-[11px] space-y-1 text-text-secondary">
                  <p><strong className="text-text-primary">Neckline:</strong> {identity.construction.neckline}</p>
                  <p><strong className="text-text-primary">Sleeves:</strong> {identity.construction.sleeves}</p>
                  {identity.construction.straps && (
                    <p><strong className="text-text-primary">Straps:</strong> {identity.construction.straps}</p>
                  )}
                  {identity.construction.closures && (
                    <p><strong className="text-text-primary">Closures:</strong> {identity.construction.closures}</p>
                  )}
                  {identity.construction.seams && (
                    <p><strong className="text-text-primary">Seams/Stitching:</strong> {identity.construction.seams}</p>
                  )}
                </div>
              </div>

              {/* Fabric Appearance */}
              <div className="p-3 bg-surface-secondary/40 border border-border/60 rounded-sm space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-text-primary text-[11px] uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-accent" />
                  Fabric Appearance (Visual Only)
                </div>
                <div className="text-[11px] space-y-1 text-text-secondary">
                  <p><strong className="text-text-primary">Appearance:</strong> {identity.fabric.visibleAppearance}</p>
                  <p><strong className="text-text-primary">Finish:</strong> {identity.fabric.surfaceFinish}</p>
                  <p><strong className="text-text-primary">Opacity:</strong> {identity.fabric.opacity}</p>
                  <p><strong className="text-text-primary">Texture/Stretch:</strong> {identity.fabric.visibleTexture} | {identity.fabric.apparentStretch}</p>
                </div>
              </div>

              {/* Identity-Defining Elements */}
              <div className="p-3 bg-surface-secondary/40 border border-border/60 rounded-sm space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800 text-[11px] uppercase tracking-wider">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Must-Preserve Elements ({identity.identityDefiningDetails?.length || 0})
                </div>
                <ul className="text-[11px] text-text-secondary space-y-0.5 list-disc list-inside">
                  {identity.identityDefiningDetails?.map((d, i) => (
                    <li key={i} className="truncate">{d}</li>
                  )) || <li>None recorded</li>}
                </ul>
              </div>

              {/* Undetermined Features */}
              <div className="p-3 bg-surface-secondary/40 border border-border/60 rounded-sm space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-amber-800 text-[11px] uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Undetermined Features ({identity.undeterminedFeatures?.length || 0})
                </div>
                <ul className="text-[11px] text-text-secondary space-y-0.5 list-disc list-inside">
                  {identity.undeterminedFeatures?.map((u, i) => (
                    <li key={i} className="truncate">{u}</li>
                  )) || <li>None (All features determinable)</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paste / Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-sm max-w-2xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <FileCode className="w-4 h-4 text-accent" />
                Paste Vision AI Output (Prompt 01)
              </h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-text-tertiary hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-text-secondary">
              Paste the JSON response or markdown text returned by your Vision AI model. The system will extract, validate, and normalize the Garment Identity.
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={12}
                placeholder={`{\n  "basic": {\n    "category": "Dress",\n    "subtype": "Corset Midi Dress",\n    "gender": "WOMEN",\n    "silhouette": "Fitted bodice with tiered skirt",\n    "length": "Midi"\n  },\n  "color": {\n    "primaryColor": "Dusty Rose Pink",\n    "colorDistribution": "Solid tonal"\n  },\n  ...\n}`}
                className="w-full font-mono text-xs p-3 bg-surface-secondary border border-border rounded-xs focus:outline-none focus:ring-1 focus:ring-text-primary"
              />

              {parseError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium border border-border rounded-xs hover:bg-surface-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !pasteText.trim()}
                  className="px-4 py-2 text-xs font-medium bg-text-primary text-surface rounded-xs hover:opacity-90 disabled:opacity-50"
                >
                  {isSaving ? "Validating & Saving..." : "Import Identity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
