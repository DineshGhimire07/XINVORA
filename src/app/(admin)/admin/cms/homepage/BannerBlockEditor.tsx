"use client"

import { useState } from "react"
import { uploadImage } from "@/lib/upload"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Image as ImageIcon, Trash2, Plus } from "lucide-react"
import ImageCropperModal from "../../collections/[id]/ImageCropperModal"

interface BannerItem {
  id: string
  data: {
    imageUrl: string | null
    imageMobileUrl?: string | null
    eyebrow?: string
    title: string
    tagline?: string
    linkText?: string
    linkUrl: string
    isActive?: boolean
    size?: "editorial" | "full" | "half" | "cinematic" | "landscape" | "classic" | "portrait"
  }
}

interface BannerBlockEditorProps {
  banners: BannerItem[]
  onChange: (banners: BannerItem[]) => void
}

export default function BannerBlockEditor({
  banners,
  onChange,
}: BannerBlockEditorProps) {
  const [activeBanners, setActiveBanners] = useState<BannerItem[]>(banners)

  // Cropping states
  const [croppingId, setCroppingId] = useState<string | null>(null)
  const [cropType, setCropType] = useState<"desktop" | "mobile">("desktop")
  const [cropSource, setCropSource] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const updateBannerData = (id: string, updates: Partial<BannerItem["data"]>) => {
    const updated = activeBanners.map((b) => {
      if (b.id === id) {
        return { ...b, data: { ...b.data, ...updates } }
      }
      return b
    })
    setActiveBanners(updated)
    onChange(updated)
  }

  const addBanner = () => {
    const newId = `temp-${Date.now()}`
    const newBanner: BannerItem = {
      id: newId,
      data: {
        imageUrl: null,
        imageMobileUrl: null,
        eyebrow: "NEW EDITORIAL",
        title: "New Banner Title",
        tagline: "Custom description here.",
        linkText: "Explore More",
        linkUrl: "/collections",
        isActive: true,
        size: "editorial",
      },
    }
    const updated = [...activeBanners, newBanner]
    setActiveBanners(updated)
    onChange(updated)
  }

  const deleteBanner = (id: string) => {
    if (confirm("Are you sure you want to delete this banner module?")) {
      const updated = activeBanners.filter((b) => b.id !== id)
      setActiveBanners(updated)
      onChange(updated)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div>
          <h3 className="text-[11px] font-bold tracking-widest uppercase text-text-primary">
            Banner Modules
          </h3>
          <p className="text-body-xs text-text-secondary/70">
            Create, remove, and configure custom banners. Adjust sizes and positions below.
          </p>
        </div>
        <Button
          type="button"
          onClick={addBanner}
          className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs px-4 py-2 flex items-center gap-1.5 rounded-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Custom Banner
        </Button>
      </div>

      {activeBanners.length === 0 ? (
        <div className="p-12 border border-dashed border-border/40 text-center text-text-secondary text-body-sm">
          No custom banners created. Click "Add Custom Banner" above.
        </div>
      ) : (
        <div className="space-y-12">
          {activeBanners.map((banner, index) => {
            const data = banner.data
            return (
              <div
                key={banner.id}
                className="p-6 border border-border bg-surface-secondary/20 rounded-sm relative space-y-6"
              >
                {/* Header / Actions */}
                <div className="flex items-center justify-between pb-3 border-b border-border/30">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
                    Module #{index + 1}: {data.title || "Untitled"}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${banner.id}`} className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                        Active
                      </Label>
                      <Switch
                        id={`active-${banner.id}`}
                        checked={data.isActive ?? true}
                        onCheckedChange={(checked) => updateBannerData(banner.id, { isActive: checked })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteBanner(banner.id)}
                      className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Media & Size */}
                  <div className="space-y-6">
                    {/* Size Select */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Banner Size / Aspect Ratio
                      </Label>
                      <select
                        value={data.size || "editorial"}
                        onChange={(e) => updateBannerData(banner.id, { size: e.target.value as any })}
                        className="w-full h-10 px-3 bg-surface border border-border focus:outline-none focus:ring-1 focus:ring-text-primary text-body-sm"
                      >
                        <option value="full">Full Page Screen Height (100dvh)</option>
                        <option value="half">Half Screen Height (50dvh)</option>
                        <option value="editorial">Wide Editorial Aspect Ratio (32:10)</option>
                        <option value="cinematic">Cinematic Aspect Ratio (21:9)</option>
                        <option value="landscape">Standard Landscape (16:9)</option>
                        <option value="classic">Classic Aspect Ratio (4:3)</option>
                        <option value="portrait">Tall Portrait (3:4)</option>
                      </select>
                    </div>

                    {/* Desktop Image */}
                    <div className="space-y-3">
                      <Label className="text-body-xs font-bold uppercase tracking-wider text-text-secondary">
                        Desktop Background Image
                      </Label>
                      <div className="w-full aspect-[32/10] bg-surface-secondary border border-border rounded-sm overflow-hidden flex items-center justify-center relative">
                        {data.imageUrl ? (
                          <img src={data.imageUrl} alt="Banner Desktop" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-text-secondary/30" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800 text-[10px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-sm transition-colors select-none">
                          {isUploading && croppingId === banner.id && cropType === "desktop" ? "Uploading..." : data.imageUrl ? "Change Image" : "Upload Image"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const url = URL.createObjectURL(file)
                                setCropSource(url)
                                setCropType("desktop")
                                setCroppingId(banner.id)
                                e.target.value = ""
                              }
                            }}
                          />
                        </label>
                        {data.imageUrl && (
                          <button
                            type="button"
                            onClick={() => updateBannerData(banner.id, { imageUrl: null })}
                            className="text-red-500 text-[10px] uppercase font-bold tracking-wider hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mobile Image */}
                    <div className="space-y-3 pt-4 border-t border-border/30">
                      <Label className="text-body-xs font-bold uppercase tracking-wider text-text-secondary">
                        Mobile Background Image (Optional)
                      </Label>
                      <div className="w-full aspect-[3/4] max-w-[120px] bg-surface-secondary border border-border rounded-sm overflow-hidden flex items-center justify-center relative">
                        {data.imageMobileUrl ? (
                          <img src={data.imageMobileUrl} alt="Banner Mobile" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-text-secondary/30" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800 text-[10px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-sm transition-colors select-none">
                          {isUploading && croppingId === banner.id && cropType === "mobile" ? "Uploading..." : data.imageMobileUrl ? "Change Mobile Image" : "Upload Mobile Image"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const url = URL.createObjectURL(file)
                                setCropSource(url)
                                setCropType("mobile")
                                setCroppingId(banner.id)
                                e.target.value = ""
                              }
                            }}
                          />
                        </label>
                        {data.imageMobileUrl && (
                          <button
                            type="button"
                            onClick={() => updateBannerData(banner.id, { imageMobileUrl: null })}
                            className="text-red-500 text-[10px] uppercase font-bold tracking-wider hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Text Information */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Eyebrow</Label>
                      <Input
                        value={data.eyebrow || ""}
                        onChange={(e) => updateBannerData(banner.id, { eyebrow: e.target.value })}
                        placeholder="e.g. EDITORIAL"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Title *</Label>
                      <Input
                        value={data.title}
                        onChange={(e) => updateBannerData(banner.id, { title: e.target.value })}
                        placeholder="e.g. The Linen Edit"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Tagline</Label>
                      <Input
                        value={data.tagline || ""}
                        onChange={(e) => updateBannerData(banner.id, { tagline: e.target.value })}
                        placeholder="e.g. Light. Breathable. Timeless."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Link Text</Label>
                        <Input
                          value={data.linkText || ""}
                          onChange={(e) => updateBannerData(banner.id, { linkText: e.target.value })}
                          placeholder="e.g. Shop the Edit"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Link URL *</Label>
                        <Input
                          value={data.linkUrl}
                          onChange={(e) => updateBannerData(banner.id, { linkUrl: e.target.value })}
                          placeholder="e.g. /collections/linen"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {croppingId && cropSource && (() => {
        const activeBanner = activeBanners.find((b) => b.id === croppingId)
        const getCropAspect = () => {
          if (cropType === "mobile") return 3 / 4
          if (!activeBanner) return 32 / 10
          
          const size = activeBanner.data.size || "editorial"
          switch (size) {
            case "full":
              return 16 / 9 // standard screen crop
            case "half":
              return 16 / 8 // half height screen crop
            case "cinematic":
              return 21 / 9
            case "landscape":
              return 16 / 9
            case "classic":
              return 4 / 3
            case "portrait":
              return 3 / 4
            case "editorial":
            default:
              return 32 / 10
          }
        }

        return (
          <ImageCropperModal
            imageSrc={cropSource}
            aspect={getCropAspect()}
            onCropComplete={async (croppedFile) => {
              const currentId = croppingId
              const currentType = cropType
              setCroppingId(null)
              setCropSource(null)
              setIsUploading(true)
              try {
                const url = await uploadImage(croppedFile)
                if (currentType === "desktop") {
                  updateBannerData(currentId, { imageUrl: url })
                } else {
                  updateBannerData(currentId, { imageMobileUrl: url })
                }
              } catch (err) {
                console.error(err)
                alert("Failed to upload image.")
              } finally {
                setIsUploading(false)
              }
            }}
            onClose={() => {
              setCroppingId(null)
              setCropSource(null)
            }}
          />
        )
      })()}
    </div>
  )
}
