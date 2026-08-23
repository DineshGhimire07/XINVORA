"use client"

import React from "react"
import Image from "next/image"
import { Check, Image as ImageIcon, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MasterReferences } from "@/domains/photography/contracts/identity.contract"

interface MasterReferencePickerProps {
  availableImages: Array<{ url: string; id?: string; position?: number }>
  references: MasterReferences
  isLocked: boolean
  onReferencesChange: (updated: MasterReferences) => void
}

export function MasterReferencePicker({
  availableImages,
  references,
  isLocked,
  onReferencesChange,
}: MasterReferencePickerProps) {
  const handleSelectFront = (url: string, id?: string) => {
    if (isLocked) return
    onReferencesChange({
      ...references,
      masterFrontUrl: references.masterFrontUrl === url ? null : url,
      masterFrontImageId: references.masterFrontUrl === url ? null : id || null,
    })
  }

  const handleSelectBack = (url: string, id?: string) => {
    if (isLocked) return
    onReferencesChange({
      ...references,
      masterBackUrl: references.masterBackUrl === url ? null : url,
      masterBackImageId: references.masterBackUrl === url ? null : id || null,
    })
  }

  const handleToggleDetail = (url: string, id?: string) => {
    if (isLocked) return
    const currentUrls = references.detailUrls || []
    const currentIds = references.detailImageIds || []

    const exists = currentUrls.includes(url)
    const nextUrls = exists ? currentUrls.filter((u) => u !== url) : [...currentUrls, url]
    const nextIds = exists ? currentIds.filter((i) => i !== (id || url)) : [...currentIds, id || url]

    onReferencesChange({
      ...references,
      detailUrls: nextUrls,
      detailImageIds: nextIds,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            1. Master Product References
          </h4>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Designate the authoritative Original Front and Back photographs. These define the exact physical garment.
          </p>
        </div>
      </div>

      {availableImages.length === 0 ? (
        <div className="p-6 border border-dashed border-border rounded-sm text-center bg-surface-secondary/40">
          <ImageIcon className="w-6 h-6 mx-auto text-text-tertiary mb-2 opacity-50" />
          <p className="text-xs text-text-secondary">No product images uploaded yet.</p>
          <p className="text-[11px] text-text-tertiary mt-1">Upload images in the Media section above first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {availableImages.map((img, idx) => {
            const isFront = references.masterFrontUrl === img.url
            const isBack = references.masterBackUrl === img.url
            const isDetail = references.detailUrls?.includes(img.url)

            return (
              <div
                key={idx}
                className={cn(
                  "group relative aspect-[3/4] rounded-sm overflow-hidden border bg-surface transition-all select-none",
                  isFront
                    ? "border-emerald-600 ring-2 ring-emerald-600/30"
                    : isBack
                    ? "border-blue-600 ring-2 ring-blue-600/30"
                    : isDetail
                    ? "border-purple-600 ring-2 ring-purple-600/30"
                    : "border-border hover:border-text-primary/40"
                )}
              >
                <Image
                  src={img.url}
                  alt={`Product Reference ${idx + 1}`}
                  fill
                  sizes="150px"
                  className="object-cover object-top"
                />

                {/* Status Badges */}
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10 pointer-events-none">
                  {isFront && (
                    <span className="px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase bg-emerald-700 text-white rounded-xs shadow-xs">
                      Master Front
                    </span>
                  )}
                  {isBack && (
                    <span className="px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase bg-blue-700 text-white rounded-xs shadow-xs">
                      Master Back
                    </span>
                  )}
                  {isDetail && !isFront && !isBack && (
                    <span className="px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase bg-purple-700 text-white rounded-xs shadow-xs">
                      Detail
                    </span>
                  )}
                </div>

                {/* Action Hover Controls */}
                {!isLocked && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-1 z-20">
                    <button
                      type="button"
                      onClick={() => handleSelectFront(img.url, img.id)}
                      className={cn(
                        "w-full text-[10px] font-medium py-1 px-1.5 rounded-xs transition-colors text-center",
                        isFront ? "bg-emerald-600 text-white" : "bg-white/90 text-black hover:bg-emerald-50 hover:text-emerald-800"
                      )}
                    >
                      {isFront ? "✓ Master Front" : "Set as Front"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectBack(img.url, img.id)}
                      className={cn(
                        "w-full text-[10px] font-medium py-1 px-1.5 rounded-xs transition-colors text-center",
                        isBack ? "bg-blue-600 text-white" : "bg-white/90 text-black hover:bg-blue-50 hover:text-blue-800"
                      )}
                    >
                      {isBack ? "✓ Master Back" : "Set as Back"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleDetail(img.url, img.id)}
                      className={cn(
                        "w-full text-[10px] font-medium py-1 px-1.5 rounded-xs transition-colors text-center",
                        isDetail ? "bg-purple-600 text-white" : "bg-white/80 text-black hover:bg-purple-50"
                      )}
                    >
                      {isDetail ? "✓ Detail Ref" : "+ Detail Ref"}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Authority Summary Banner */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-surface border border-border/80 rounded-sm text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
          <span className="text-text-secondary">Master Front:</span>
          <span className="font-mono text-text-primary font-medium">
            {references.masterFrontUrl ? "Assigned" : "Not Selected"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
          <span className="text-text-secondary">Master Back:</span>
          <span className="font-mono text-text-primary font-medium">
            {references.masterBackUrl ? "Assigned" : "Not Selected"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
          <span className="text-text-secondary">Details:</span>
          <span className="font-mono text-text-primary font-medium">
            {references.detailUrls?.length || 0} attached
          </span>
        </div>
      </div>
    </div>
  )
}
