"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  smartGroupAndMatchImagesAction,
  attachImagesToExistingProductsAction,
  bulkUploadProductsAction,
  SmartImageGroup
} from "@/actions/admin/bulk-products.actions"

interface SmartAutoGroupModalProps {
  isOpen: boolean
  onClose: () => void
  inputImages: { url: string; title: string }[]
  onImportComplete?: () => void
}

export function SmartAutoGroupModal({
  isOpen,
  onClose,
  inputImages,
  onImportComplete
}: SmartAutoGroupModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [groups, setGroups] = useState<SmartImageGroup[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Run AI auto-grouping when modal opens
  useEffect(() => {
    if (isOpen && inputImages.length > 0) {
      runAutoGroup()
    }
  }, [isOpen])

  const runAutoGroup = async () => {
    setIsAnalyzing(true)
    setErrorMsg(null)
    setStatusMessage("✨ AI analyzing filenames and matching photos to products...")

    const res = await smartGroupAndMatchImagesAction(inputImages)
    if (res.success && res.data) {
      setGroups(res.data)
    } else {
      setErrorMsg(res.error || "Failed to group images.")
    }
    setIsAnalyzing(false)
  }

  if (!isOpen) return null

  const updateGroupField = (idx: number, field: keyof SmartImageGroup, value: any) => {
    setGroups((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const removeImageFromGroup = (groupIdx: number, imgUrl: string) => {
    setGroups((prev) => {
      const next = [...prev]
      const updatedImages = next[groupIdx].images.filter((u) => u !== imgUrl)
      if (updatedImages.length === 0) {
        return prev.filter((_, i) => i !== groupIdx)
      }
      next[groupIdx] = { ...next[groupIdx], images: updatedImages }
      return next
    })
  }

  const removeGroup = (groupIdx: number) => {
    setGroups((prev) => prev.filter((_, i) => i !== groupIdx))
  }

  const handleImportAll = async () => {
    if (groups.length === 0) return
    setIsSubmitting(true)
    setErrorMsg(null)
    setStatusMessage("Processing bulk product creation and photo attachments...")

    try {
      // 1. Separate matched existing products from new products
      const newProductsPayload = groups
        .filter((g) => !g.matchedProductId)
        .map((g) => ({
          name: g.groupName,
          categoryName: g.categoryName || "Dresses",
          basePrice: g.suggestedPrice || 1500,
          sizes: g.suggestedSizes || "Free Size (Fits XS-XL):20",
          images: g.images,
          shortDescription: g.shortDescription,
          description: g.description,
          status: "DRAFT" as const
        }))

      const existingMatchesPayload = groups
        .filter((g) => g.matchedProductId)
        .map((g) => ({
          productId: g.matchedProductId!,
          imageUrls: g.images
        }))

      let createdCount = 0
      let attachedCount = 0

      if (newProductsPayload.length > 0) {
        const res = await bulkUploadProductsAction(newProductsPayload)
        if (!res.success) {
          throw new Error(res.error || "Failed to create new products.")
        }
        createdCount = res.data?.succeeded || 0
      }

      if (existingMatchesPayload.length > 0) {
        const res = await attachImagesToExistingProductsAction(existingMatchesPayload)
        if (!res.success) {
          throw new Error(res.error || "Failed to attach photos to existing products.")
        }
        attachedCount = existingMatchesPayload.length
      }

      setStatusMessage(`✅ Done! ${createdCount} new products created and photos attached to ${attachedCount} existing products.`)
      setTimeout(() => {
        setIsSubmitting(false)
        onClose()
        if (onImportComplete) onImportComplete()
      }, 1200)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to import grouped products.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-admin-surface border border-admin-border w-full max-w-5xl rounded-admin-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-admin-content border-b border-admin-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-admin-lg font-bold text-admin-text-primary flex items-center gap-2">
              <span className="text-xl">✨</span>
              Smart AI Photo Auto-Grouper & Product Importer
            </h2>
            <p className="text-admin-xs text-admin-text-secondary mt-0.5">
              Auto-grouped {inputImages.length} photos into {groups.length} distinct dress products by matching filename patterns & AI analysis.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-admin-md border border-admin-border flex items-center justify-center text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-surface transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-admin-xs rounded-admin-md font-medium">
              {errorMsg}
            </div>
          )}

          {isAnalyzing ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-3 border-admin-primary border-t-transparent animate-spin" />
              <p className="text-admin-sm font-bold text-admin-primary animate-pulse">
                {statusMessage || "Analyzing photo filenames and visual matching..."}
              </p>
              <p className="text-admin-xs text-admin-text-tertiary">
                Grouping front, back, and detail shots into single products...
              </p>
            </div>
          ) : groups.length === 0 ? (
            <div className="py-16 text-center text-admin-text-secondary">
              No photo groups detected. Upload photos with descriptive filenames (e.g. <span className="font-mono text-admin-primary">red_silk_dress_front.jpg</span>).
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-admin-xs">
                <span className="font-bold text-admin-text-secondary uppercase tracking-wider">
                  Review & Customize Auto-Grouped Products ({groups.length})
                </span>
                <button
                  type="button"
                  onClick={runAutoGroup}
                  className="text-admin-primary hover:underline font-semibold flex items-center gap-1"
                >
                  🔄 Re-run AI Grouping
                </button>
              </div>

              {groups.map((group, idx) => (
                <div
                  key={idx}
                  className="border border-admin-border rounded-admin-lg p-5 bg-admin-content/50 space-y-4 relative group/card hover:border-admin-border-strong transition-all"
                >
                  {/* Card Header & Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-admin-border/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-admin-xs font-mono font-bold px-2 py-0.5 bg-admin-primary/10 text-admin-primary rounded-sm">
                        #{idx + 1}
                      </span>

                      {group.matchedProductId ? (
                        <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-600 text-[10px] font-bold uppercase rounded-sm flex items-center gap-1">
                          🔗 Matches Existing Product: {group.matchedProductName}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-[10px] font-bold uppercase rounded-sm flex items-center gap-1">
                          ✨ New Product Draft
                        </span>
                      )}

                      <span className="text-[10px] text-admin-text-tertiary">
                        ({group.images.length} photo{group.images.length > 1 ? "s" : ""})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeGroup(idx)}
                      className="text-admin-text-tertiary hover:text-red-500 text-admin-xs font-semibold transition-colors self-end sm:self-auto"
                    >
                      Remove Group ✕
                    </button>
                  </div>

                  {/* Input Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-admin-text-tertiary">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={group.groupName}
                        onChange={(e) => updateGroupField(idx, "groupName", e.target.value)}
                        className="w-full px-3 py-1.5 bg-admin-surface border border-admin-border text-admin-text-primary text-admin-xs rounded-admin-md font-medium focus:outline-none focus:border-admin-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-admin-text-tertiary">
                        Category *
                      </label>
                      <input
                        type="text"
                        value={group.categoryName}
                        onChange={(e) => updateGroupField(idx, "categoryName", e.target.value)}
                        className="w-full px-3 py-1.5 bg-admin-surface border border-admin-border text-admin-text-primary text-admin-xs rounded-admin-md focus:outline-none focus:border-admin-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-admin-text-tertiary">
                        Price (NPR) *
                      </label>
                      <input
                        type="number"
                        value={group.suggestedPrice}
                        onChange={(e) => updateGroupField(idx, "suggestedPrice", Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-admin-surface border border-admin-border text-admin-text-primary text-admin-xs rounded-admin-md font-mono focus:outline-none focus:border-admin-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-admin-text-tertiary">
                        Sizes & Stock *
                      </label>
                      <input
                        type="text"
                        value={group.suggestedSizes}
                        onChange={(e) => updateGroupField(idx, "suggestedSizes", e.target.value)}
                        placeholder="e.g. Free Size (Fits XS-XL):20 or S:10, M:15"
                        className="w-full px-3 py-1.5 bg-admin-surface border border-admin-border text-admin-text-primary text-[11px] font-mono rounded-admin-md focus:outline-none focus:border-admin-primary"
                      />
                    </div>
                  </div>

                  {/* Attached Photos Gallery */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-admin-text-tertiary">
                      Attached Product Images ({group.images.length})
                    </label>
                    <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                      {group.images.map((imgUrl, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="relative w-16 h-16 rounded-admin-md border border-admin-border overflow-hidden group/img flex-shrink-0 bg-admin-surface"
                        >
                          <Image
                            src={imgUrl}
                            alt="Group item"
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                          <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1 rounded">
                            #{imgIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImageFromGroup(idx, imgUrl)}
                            className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover/img:opacity-100 transition-opacity"
                            title="Remove photo from group"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-admin-content border-t border-admin-border px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-admin-xs font-semibold text-admin-text-secondary hover:text-admin-text-primary transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleImportAll}
            disabled={isSubmitting || isAnalyzing || groups.length === 0}
            className="px-6 py-2.5 bg-emerald-600 text-white text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Importing Products...
              </>
            ) : (
              <>
                <span>🚀</span>
                Import All {groups.length} Products into Store
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
