"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MediaUploader } from "@/components/admin/MediaUploader"

const SUPPORTED_ROLES = [
  { value: "auto", label: "✨ Auto (Template Sequence)" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "front_closeup", label: "Front Close-Up" },
  { value: "front", label: "Front" },
  { value: "back", label: "Back" },
  { value: "detail", label: "Detail" },
  { value: "side", label: "Side" },
  { value: "model", label: "Model" },
  { value: "full_view", label: "Full View" },
  { value: "product_view", label: "Product View" },
  { value: "editorial", label: "Editorial" },
  { value: "campaign", label: "Campaign" },
]

export function MediaSelector({
  mediaItems,
  selectedImages,
  onChange,
  roleLabels,
  initialRoles,
}: {
  mediaItems: any[]
  selectedImages: string[]
  onChange: (images: string[]) => void
  roleLabels?: string[]
  initialRoles?: Record<string, string>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>(initialRoles || {})

  const handleRoleChange = (identifier: string, role: string) => {
    setSelectedRoles(prev => ({
      ...prev,
      [identifier]: role,
    }))
  }

  const toggleImage = (url: string) => {
    if (selectedImages.includes(url)) {
      onChange(selectedImages.filter(i => i !== url))
    } else {
      onChange([...selectedImages, url])
    }
  }

  const handleUploadComplete = (urls: string[]) => {
    // Automatically select newly uploaded images
    onChange([...selectedImages, ...urls])
  }

  const moveImage = (index: number, direction: "left" | "right") => {
    const newImages = [...selectedImages]
    const targetIndex = direction === "left" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newImages.length) return
    const temp = newImages[index]
    newImages[index] = newImages[targetIndex]
    newImages[targetIndex] = temp
    onChange(newImages)
  }

  return (
    <div className="flex flex-col gap-4">
      {selectedImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-admin-xs">
            <span className="font-bold text-admin-text-secondary uppercase tracking-wider">
              Selected Product Photos ({selectedImages.length})
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              ★ Roles auto-align with position, or choose custom role (Front, Back, Lifestyle) per photo below.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 mb-4">
            {selectedImages.map((url, i) => {
              const explicitRole = selectedRoles[url] || selectedRoles[String(i)] || "auto"
              const defaultRoleLabel = roleLabels?.[i]
              const displayLabel = explicitRole !== "auto" 
                ? (SUPPORTED_ROLES.find(r => r.value === explicitRole)?.label || explicitRole)
                : defaultRoleLabel

              const badgeText = i === 0
                ? `★ #1 ${displayLabel || "Cover"}`
                : `#${i + 1} ${displayLabel || `Photo ${i + 1}`}`

              return (
                <div key={i} className="flex flex-col gap-1.5 p-2 bg-admin-content/20 border border-admin-border rounded-admin-md shadow-xs">
                  <div className={`relative aspect-square border-2 group overflow-hidden bg-admin-content/40 rounded-admin-sm ${i === 0 ? "border-amber-500 ring-2 ring-amber-500/20" : "border-admin-border"}`}>
                    <Image src={url} alt="Selected" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                    
                    <span className={`absolute top-1.5 left-1.5 px-2 py-0.5 text-[9px] font-black uppercase rounded shadow-xs truncate max-w-[85%] ${i === 0 ? "bg-amber-500 text-white" : "bg-black/75 text-white"}`}>
                      {badgeText}
                    </span>

                    <button 
                      type="button" 
                      onClick={() => onChange(selectedImages.filter(img => img !== url))}
                      className="absolute top-1.5 right-1.5 bg-red-600/90 text-white w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold cursor-pointer"
                      title="Remove photo"
                    >
                      ×
                    </button>
                  </div>

                  {/* Explicit Role Selector per Photo */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-bold text-admin-text-secondary uppercase tracking-wider">
                      Role / View
                    </label>
                    <select
                      value={explicitRole}
                      onChange={(e) => handleRoleChange(url, e.target.value)}
                      className="w-full text-[11px] font-medium py-1 px-2 bg-admin-surface border border-admin-border text-admin-text-primary rounded focus:outline-none focus:ring-1 focus:ring-admin-primary"
                    >
                      {SUPPORTED_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.value === "auto" && defaultRoleLabel ? `✨ Auto (${defaultRoleLabel})` : r.label}
                        </option>
                      ))}
                    </select>
                    <input type="hidden" name={`imageRole_${url}`} value={explicitRole} />
                    <input type="hidden" name={`imageRole_${i}`} value={explicitRole} />
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-0.5">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => moveImage(i, "left")}
                      className="flex-1 py-1 bg-admin-surface border border-admin-border text-admin-text-primary text-[10px] font-semibold rounded hover:bg-admin-content disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      ◀ Left
                    </button>
                    <button
                      type="button"
                      disabled={i === selectedImages.length - 1}
                      onClick={() => moveImage(i, "right")}
                      className="flex-1 py-1 bg-admin-surface border border-admin-border text-admin-text-primary text-[10px] font-semibold rounded hover:bg-admin-content disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Right ▶
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {selectedImages.map((url, i) => (
        <input key={i} type="hidden" name="images" value={url} />
      ))}

      <div className="flex gap-4">
        <Button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="self-start bg-admin-surface text-admin-text-primary px-5 py-2 text-admin-xs uppercase tracking-wider font-bold border border-admin-border hover:bg-admin-content transition-colors"
        >
          {isOpen ? "Close Media Selector" : "+ Select From Media Library"}
        </Button>
        <MediaUploader onUploadComplete={handleUploadComplete} />
      </div>

      {isOpen && (
        <div className="mt-2 p-4 border border-admin-border rounded-admin-lg bg-admin-content/30 space-y-3">
          <p className="text-admin-xs text-admin-text-secondary font-medium">
            Click images below to toggle selection into this product gallery:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto pr-1">
            {mediaItems.length === 0 ? (
              <p className="col-span-full text-admin-text-tertiary text-admin-xs p-4 text-center">No media available in library. Upload photos above.</p>
            ) : (
              mediaItems.map(item => {
                if (!item.mimeType?.startsWith("image")) return null;
                const isSelected = selectedImages.includes(item.url)
                return (
                  <div 
                    key={item.id} 
                    onClick={() => toggleImage(item.url)}
                    className={`relative aspect-square border-2 rounded-admin-md cursor-pointer hover:border-admin-primary transition-colors overflow-hidden ${isSelected ? 'border-admin-primary ring-2 ring-admin-primary/30' : 'border-admin-border'}`}
                  >
                    <Image src={item.url} alt={item.altText || item.title || "Media Item"} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-admin-primary/20 flex items-center justify-center">
                        <div className="bg-admin-primary text-white text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold rounded">Selected</div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
