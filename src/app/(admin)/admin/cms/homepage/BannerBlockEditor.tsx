"use client"

import { useState } from "react"
import { uploadImage } from "@/lib/upload"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Image as ImageIcon, Trash2, Plus, Monitor, Smartphone, Sliders, Move } from "lucide-react"
import ImageCropperModal from "../../collections/[id]/ImageCropperModal"
import type { BannerBlockData } from "@/types/cms.types"

interface BannerItem {
  id: string
  data: BannerBlockData
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

  const updateBannerData = (id: string, updates: Partial<BannerBlockData>) => {
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
        tagline: "Explore handcrafted luxury crafted with timeless precision.",
        linkText: "Shop Collection",
        linkUrl: "/collections",
        isActive: true,

        // Explicit Desktop controls
        desktopSizeMode: "ratio",
        desktopRatio: "32:10",
        desktopCustomSize: "",
        desktopFit: "cover",
        desktopFocalPoint: "center",
        desktopCustomFocalPoint: "",

        // Explicit Mobile controls
        mobileSizeMode: "ratio",
        mobileRatio: "4:5",
        mobileCustomSize: "",
        mobileFit: "cover",
        mobileFocalPoint: "center",
        mobileCustomFocalPoint: "",
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
          <h3 className="text-xs font-bold tracking-widest uppercase text-text-primary">
            Banner Modules
          </h3>
          <p className="text-body-xs text-text-secondary/70">
            Configure full-width editorial banners with explicit Desktop and Mobile dimensions, fit, and focal point alignment.
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
        <div className="p-12 border border-dashed border-border/40 text-center text-text-secondary text-body-sm rounded-sm">
          No custom banners created. Click "Add Custom Banner" above.
        </div>
      ) : (
        <div className="space-y-12">
          {activeBanners.map((banner, index) => {
            const data = banner.data

            // Normalize desktop values
            const desktopSizeMode: "50dvh" | "ratio" | "custom" =
              data.desktopSizeMode || (data.size === "half" ? "50dvh" : data.size === "custom" ? "custom" : "ratio")
            const desktopRatio = data.desktopRatio || (data.size === "cinematic" ? "21:9" : data.size === "landscape" ? "16:9" : data.size === "classic" ? "4:3" : data.size === "square" ? "1:1" : data.size === "portrait" ? "3:4" : "32:10")
            const desktopFit = data.desktopFit || (data.fit === "contain" ? "contain" : data.fit === "fill" ? "fill" : "cover")
            const desktopFocalPoint = data.desktopFocalPoint || (data.position === "object-left" ? "left" : data.position === "object-right" ? "right" : data.position?.startsWith("object-") && data.position !== "object-center" ? "custom" : "center")
            const desktopCustomFocalPoint = data.desktopCustomFocalPoint || (data.position && !["object-center", "object-left", "object-right"].includes(data.position) ? data.position.replace("object-", "") : "top")

            // Normalize mobile values
            const mobileSizeMode: "ratio" | "custom" =
              data.mobileSizeMode || (data.mobileSize === "custom" ? "custom" : "ratio")
            const mobileRatio = data.mobileRatio || (data.mobileSize === "square" ? "1:1" : data.mobileSize === "story" ? "9:16" : data.mobileSize === "portrait" ? "3:4" : "4:5")
            const mobileFit = data.mobileFit || (data.fit === "contain" ? "contain" : data.fit === "fill" ? "fill" : "cover")
            const mobileFocalPoint = data.mobileFocalPoint || "center"
            const mobileCustomFocalPoint = data.mobileCustomFocalPoint || "top"

            // Compute CSS object position for preview
            const getObjectPositionStyle = (focalPoint: string, customPos: string) => {
              if (focalPoint === "left") return "left center"
              if (focalPoint === "right") return "right center"
              if (focalPoint === "custom") {
                if (customPos === "top") return "center top"
                if (customPos === "bottom") return "center bottom"
                if (customPos === "top-left") return "left top"
                if (customPos === "top-right") return "right top"
                if (customPos === "bottom-left") return "left bottom"
                if (customPos === "bottom-right") return "right bottom"
                return customPos
              }
              return "center center"
            }

            const desktopObjectPosition = getObjectPositionStyle(desktopFocalPoint, desktopCustomFocalPoint)
            const mobileObjectPosition = getObjectPositionStyle(mobileFocalPoint, mobileCustomFocalPoint)

            return (
              <div
                key={banner.id}
                className="p-6 border border-border bg-surface-secondary/20 rounded-sm relative space-y-8"
              >
                {/* Header / Actions */}
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-text-primary">
                      Banner #{index + 1}: {data.title || "Untitled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${banner.id}`} className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
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
                      className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* 2-Column Responsive Controls Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* ============================================================ */}
                  {/* DESKTOP CONTROLS PANEL */}
                  {/* ============================================================ */}
                  <div className="p-5 bg-surface border border-border/80 rounded-sm space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-text-primary" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-text-primary">
                          DESKTOP
                        </h4>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-text-secondary/70">
                        Screen ≥ 768px
                      </span>
                    </div>

                    {/* Desktop Size Mode */}
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        Size Mode
                      </Label>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-secondary/50 border border-border rounded-sm">
                        <button
                          type="button"
                          onClick={() => {
                            updateBannerData(banner.id, {
                              desktopSizeMode: "50dvh",
                              size: "half",
                            })
                          }}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            desktopSizeMode === "50dvh"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          50dvh
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateBannerData(banner.id, {
                              desktopSizeMode: "ratio",
                              desktopRatio: desktopRatio || "32:10",
                              size: "editorial",
                            })
                          }}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            desktopSizeMode === "ratio"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Ratio
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateBannerData(banner.id, {
                              desktopSizeMode: "custom",
                              size: "custom",
                            })
                          }}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            desktopSizeMode === "custom"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Custom
                        </button>
                      </div>

                      {/* Desktop Ratio Selector */}
                      {desktopSizeMode === "ratio" && (
                        <div className="space-y-1 pt-1">
                          <Label className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80">
                            Desktop Aspect Ratio
                          </Label>
                          <select
                            value={desktopRatio}
                            onChange={(e) => updateBannerData(banner.id, { desktopRatio: e.target.value as any })}
                            className="w-full h-9 px-3 bg-surface border border-border rounded-sm text-xs focus:ring-1 focus:ring-text-primary"
                          >
                            <option value="32:10">32:10 — Wide Editorial Banner (Recommended)</option>
                            <option value="21:9">21:9 — Cinematic Ultrawide</option>
                            <option value="16:9">16:9 — Standard Landscape</option>
                            <option value="4:3">4:3 — Classic Landscape</option>
                            <option value="1:1">1:1 — Square</option>
                            <option value="3:4">3:4 — Tall Portrait</option>
                          </select>
                        </div>
                      )}

                      {/* Desktop Custom Input */}
                      {desktopSizeMode === "custom" && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80">
                              Custom Height or Ratio
                            </Label>
                            <span className="text-[9px] text-text-secondary/70">
                              e.g. 550px, 70vh, 21/9
                            </span>
                          </div>
                          <Input
                            value={data.desktopCustomSize || data.customDesktopHeight || ""}
                            onChange={(e) =>
                              updateBannerData(banner.id, {
                                desktopCustomSize: e.target.value,
                                customDesktopHeight: e.target.value,
                              })
                            }
                            placeholder="e.g. 550px or 70vh or 21/9"
                            className="h-9 text-xs font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Desktop Image Fit */}
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        Image Fit
                      </Label>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-secondary/50 border border-border rounded-sm">
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { desktopFit: "cover", fit: "cover" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            desktopFit === "cover"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Cover
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { desktopFit: "contain", fit: "contain" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            desktopFit === "contain"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Contain
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { desktopFit: "fill", fit: "fill" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            desktopFit === "fill"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Fill
                        </button>
                      </div>
                    </div>

                    {/* Desktop Focal Point */}
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        Focal Point
                      </Label>
                      <div className="grid grid-cols-4 gap-1.5 p-1 bg-surface-secondary/50 border border-border rounded-sm">
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { desktopFocalPoint: "center", position: "object-center" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            desktopFocalPoint === "center"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Center
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { desktopFocalPoint: "left", position: "object-left" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            desktopFocalPoint === "left"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Left
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { desktopFocalPoint: "right", position: "object-right" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            desktopFocalPoint === "right"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Right
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { desktopFocalPoint: "custom" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            desktopFocalPoint === "custom"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Custom
                        </button>
                      </div>

                      {/* Desktop Custom Focal Alignment Buttons & Input */}
                      {desktopFocalPoint === "custom" && (
                        <div className="p-3 bg-surface-secondary/30 border border-dashed border-border rounded-sm space-y-2.5 pt-2">
                          <Label className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                            Custom Focus Alignment
                          </Label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { label: "Top Left", value: "top-left" },
                              { label: "Top", value: "top" },
                              { label: "Top Right", value: "top-right" },
                              { label: "Bottom Left", value: "bottom-left" },
                              { label: "Bottom", value: "bottom" },
                              { label: "Bottom Right", value: "bottom-right" },
                            ].map((dir) => (
                              <button
                                key={dir.value}
                                type="button"
                                onClick={() =>
                                  updateBannerData(banner.id, {
                                    desktopCustomFocalPoint: dir.value,
                                    position: `object-${dir.value}` as any,
                                  })
                                }
                                className={`py-1 text-[10px] font-medium rounded-sm border ${
                                  desktopCustomFocalPoint === dir.value
                                    ? "bg-neutral-900 text-white border-neutral-900"
                                    : "bg-surface text-text-secondary border-border hover:text-text-primary"
                                }`}
                              >
                                {dir.label}
                              </button>
                            ))}
                          </div>
                          <Input
                            value={data.desktopCustomFocalPoint || ""}
                            onChange={(e) =>
                              updateBannerData(banner.id, {
                                desktopCustomFocalPoint: e.target.value,
                                position: e.target.value as any,
                              })
                            }
                            placeholder="or custom percentage e.g. 30% 70%"
                            className="h-7 text-[11px] font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Desktop Image Upload & Live Preview */}
                    <div className="space-y-3 pt-3 border-t border-border/40">
                      <div className="flex justify-between items-center">
                        <Label className="text-body-xs font-bold uppercase tracking-wider text-text-secondary">
                          Desktop Background Image
                        </Label>
                        <span className="text-[10px] text-text-secondary/70 italic">
                          Recommended: 2560×1080 px or 1920×1080 px
                        </span>
                      </div>

                      {/* Live Desktop Preview Box */}
                      <div
                        className="w-full aspect-[32/10] bg-neutral-950 border border-border rounded-sm overflow-hidden flex items-center justify-center relative shadow-inner"
                      >
                        {data.imageUrl ? (
                          <img
                            src={data.imageUrl}
                            alt="Banner Desktop Preview"
                            style={{
                              objectFit: desktopFit as any,
                              objectPosition: desktopObjectPosition,
                            }}
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-text-secondary/40">
                            <ImageIcon className="w-7 h-7" />
                            <span className="text-[10px] uppercase tracking-wider font-semibold">
                              No Desktop Image Uploaded
                            </span>
                          </div>
                        )}

                        {/* Overlay Tag */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-mono text-white/90">
                          {desktopSizeMode === "50dvh"
                            ? "50dvh"
                            : desktopSizeMode === "custom"
                            ? data.desktopCustomSize || "Custom"
                            : desktopRatio} • {desktopFit} • {desktopFocalPoint}
                        </div>
                      </div>

                      {/* Desktop Upload Actions */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <label className="cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800 text-[10px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-sm transition-colors select-none">
                          {isUploading ? "Uploading..." : "Upload Original (Zero Crop)"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setIsUploading(true)
                                try {
                                  const url = await uploadImage(file)
                                  updateBannerData(banner.id, { imageUrl: url })
                                } catch (err) {
                                  alert("Failed to upload image")
                                } finally {
                                  setIsUploading(false)
                                  e.target.value = ""
                                }
                              }
                            }}
                          />
                        </label>

                        <label className="cursor-pointer bg-surface border border-border hover:bg-surface-secondary/40 text-text-primary text-[10px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-sm transition-colors select-none">
                          Crop & Upload
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
                            className="text-red-500 text-[10px] uppercase font-bold tracking-wider hover:underline ml-auto cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ============================================================ */}
                  {/* MOBILE CONTROLS PANEL */}
                  {/* ============================================================ */}
                  <div className="p-5 bg-surface border border-border/80 rounded-sm space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-text-primary" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-text-primary">
                          MOBILE
                        </h4>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-text-secondary/70">
                        Screen &lt; 768px
                      </span>
                    </div>

                    {/* Mobile Size Mode */}
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        Size Mode
                      </Label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-secondary/50 border border-border rounded-sm">
                        <button
                          type="button"
                          onClick={() => {
                            updateBannerData(banner.id, {
                              mobileSizeMode: "ratio",
                              mobileRatio: mobileRatio || "4:5",
                              mobileSize: "standard-portrait",
                            })
                          }}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            mobileSizeMode === "ratio"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Ratio
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateBannerData(banner.id, {
                              mobileSizeMode: "custom",
                              mobileSize: "custom",
                            })
                          }}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            mobileSizeMode === "custom"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Custom
                        </button>
                      </div>

                      {/* Mobile Ratio Selector */}
                      {mobileSizeMode === "ratio" && (
                        <div className="space-y-1 pt-1">
                          <Label className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80">
                            Mobile Aspect Ratio
                          </Label>
                          <select
                            value={mobileRatio}
                            onChange={(e) => updateBannerData(banner.id, { mobileRatio: e.target.value as any })}
                            className="w-full h-9 px-3 bg-surface border border-border rounded-sm text-xs focus:ring-1 focus:ring-text-primary"
                          >
                            <option value="4:5">4:5 — Standard Mobile Portrait (Recommended)</option>
                            <option value="3:4">3:4 — Tall Portrait</option>
                            <option value="1:1">1:1 — Square</option>
                            <option value="9:16">9:16 — Full Story / Reel Ratio</option>
                            <option value="16:9">16:9 — Compact Landscape</option>
                          </select>
                        </div>
                      )}

                      {/* Mobile Custom Input */}
                      {mobileSizeMode === "custom" && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80">
                              Custom Height or Ratio
                            </Label>
                            <span className="text-[9px] text-text-secondary/70">
                              e.g. 380px, 60vh, 4/5
                            </span>
                          </div>
                          <Input
                            value={data.mobileCustomSize || data.customMobileHeight || ""}
                            onChange={(e) =>
                              updateBannerData(banner.id, {
                                mobileCustomSize: e.target.value,
                                customMobileHeight: e.target.value,
                              })
                            }
                            placeholder="e.g. 380px or 60vh or 4/5"
                            className="h-9 text-xs font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Mobile Image Fit */}
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        Image Fit
                      </Label>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-secondary/50 border border-border rounded-sm">
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { mobileFit: "cover" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            mobileFit === "cover"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Cover
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { mobileFit: "contain" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            mobileFit === "contain"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Contain
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { mobileFit: "fill" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            mobileFit === "fill"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Fill
                        </button>
                      </div>
                    </div>

                    {/* Mobile Focal Point */}
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        Focal Point
                      </Label>
                      <div className="grid grid-cols-4 gap-1.5 p-1 bg-surface-secondary/50 border border-border rounded-sm">
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { mobileFocalPoint: "center" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            mobileFocalPoint === "center"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Center
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { mobileFocalPoint: "left" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            mobileFocalPoint === "left"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Left
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { mobileFocalPoint: "right" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            mobileFocalPoint === "right"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Right
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBannerData(banner.id, { mobileFocalPoint: "custom" })}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all ${
                            mobileFocalPoint === "custom"
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          Custom
                        </button>
                      </div>

                      {/* Mobile Custom Focal Alignment Buttons & Input */}
                      {mobileFocalPoint === "custom" && (
                        <div className="p-3 bg-surface-secondary/30 border border-dashed border-border rounded-sm space-y-2.5 pt-2">
                          <Label className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                            Custom Focus Alignment
                          </Label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { label: "Top Left", value: "top-left" },
                              { label: "Top", value: "top" },
                              { label: "Top Right", value: "top-right" },
                              { label: "Bottom Left", value: "bottom-left" },
                              { label: "Bottom", value: "bottom" },
                              { label: "Bottom Right", value: "bottom-right" },
                            ].map((dir) => (
                              <button
                                key={dir.value}
                                type="button"
                                onClick={() =>
                                  updateBannerData(banner.id, {
                                    mobileCustomFocalPoint: dir.value,
                                  })
                                }
                                className={`py-1 text-[10px] font-medium rounded-sm border ${
                                  mobileCustomFocalPoint === dir.value
                                    ? "bg-neutral-900 text-white border-neutral-900"
                                    : "bg-surface text-text-secondary border-border hover:text-text-primary"
                                }`}
                              >
                                {dir.label}
                              </button>
                            ))}
                          </div>
                          <Input
                            value={data.mobileCustomFocalPoint || ""}
                            onChange={(e) =>
                              updateBannerData(banner.id, {
                                mobileCustomFocalPoint: e.target.value,
                              })
                            }
                            placeholder="or custom percentage e.g. 50% 20%"
                            className="h-7 text-[11px] font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Mobile Image Upload & Live Preview */}
                    <div className="space-y-3 pt-3 border-t border-border/40">
                      <div className="flex justify-between items-center">
                        <Label className="text-body-xs font-bold uppercase tracking-wider text-text-secondary">
                          Mobile Background Image (Optional)
                        </Label>
                        <span className="text-[10px] text-text-secondary/70 italic">
                          Fallback: Uses Desktop Image
                        </span>
                      </div>

                      {/* Live Mobile Preview Box */}
                      <div className="flex items-center gap-4">
                        <div
                          className="w-[120px] aspect-[3/4] bg-neutral-950 border border-border rounded-sm overflow-hidden flex items-center justify-center relative shadow-inner shrink-0"
                        >
                          {data.imageMobileUrl || data.imageUrl ? (
                            <img
                              src={data.imageMobileUrl || data.imageUrl || ""}
                              alt="Banner Mobile Preview"
                              style={{
                                objectFit: mobileFit as any,
                                objectPosition: mobileObjectPosition,
                              }}
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-text-secondary/40 text-center p-2">
                              <ImageIcon className="w-5 h-5" />
                              <span className="text-[8px] uppercase tracking-wider font-semibold">
                                No Image
                              </span>
                            </div>
                          )}

                          {/* Overlay Tag */}
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[8px] font-mono text-white/90">
                            {mobileSizeMode === "custom"
                              ? data.mobileCustomSize || "Custom"
                              : mobileRatio}
                          </div>
                        </div>

                        <div className="space-y-2 flex-1">
                          <p className="text-[11px] text-text-secondary">
                            {data.imageMobileUrl
                              ? "Custom mobile portrait image active."
                              : "No mobile override uploaded — automatically adapts desktop image for mobile screens."}
                          </p>

                          {/* Mobile Upload Actions */}
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-sm transition-colors select-none">
                              {isUploading ? "Uploading..." : "Upload Original"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploading}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    setIsUploading(true)
                                    try {
                                      const url = await uploadImage(file)
                                      updateBannerData(banner.id, { imageMobileUrl: url })
                                    } catch (err) {
                                      alert("Failed to upload image")
                                    } finally {
                                      setIsUploading(false)
                                      e.target.value = ""
                                    }
                                  }
                                }}
                              />
                            </label>

                            <label className="cursor-pointer bg-surface border border-border hover:bg-surface-secondary/40 text-text-primary text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-sm transition-colors select-none">
                              Crop & Upload
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
                                className="text-red-500 text-[10px] uppercase font-bold tracking-wider hover:underline ml-auto cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* BANNER CONTENT & EDITORIAL TEXT */}
                {/* ============================================================ */}
                <div className="p-5 bg-surface border border-border/80 rounded-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-primary pb-2 border-b border-border/40">
                    Content & Editorial Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        Eyebrow
                      </Label>
                      <Input
                        value={data.eyebrow || ""}
                        onChange={(e) => updateBannerData(banner.id, { eyebrow: e.target.value })}
                        placeholder="e.g. THE WEDDING ATELIER"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        Title *
                      </Label>
                      <Input
                        value={data.title}
                        onChange={(e) => updateBannerData(banner.id, { title: e.target.value })}
                        placeholder="e.g. Heritage Raw Silk Ensemble"
                        required
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        Tagline / Description
                      </Label>
                      <Input
                        value={data.tagline || ""}
                        onChange={(e) => updateBannerData(banner.id, { tagline: e.target.value })}
                        placeholder="e.g. Immerse yourself in refined silhouette architecture and hand-embroidered perfection."
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        Call to Action Button Text
                      </Label>
                      <Input
                        value={data.linkText || ""}
                        onChange={(e) => updateBannerData(banner.id, { linkText: e.target.value })}
                        placeholder="e.g. Discover Collection"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        Link URL *
                      </Label>
                      <Input
                        value={data.linkUrl}
                        onChange={(e) => updateBannerData(banner.id, { linkUrl: e.target.value })}
                        placeholder="e.g. /collections/heritage"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Cropper Modal Integration */}
      {croppingId && cropSource && (() => {
        const activeBanner = activeBanners.find((b) => b.id === croppingId)
        const getCropAspect = () => {
          if (cropType === "mobile") {
            const mRatio = activeBanner?.data.mobileRatio || "4:5"
            if (mRatio === "1:1") return 1 / 1
            if (mRatio === "9:16") return 9 / 16
            if (mRatio === "3:4") return 3 / 4
            if (mRatio === "16:9") return 16 / 9
            return 4 / 5
          }

          const dSizeMode = activeBanner?.data.desktopSizeMode || "ratio"
          if (dSizeMode === "50dvh") return 16 / 8
          const dRatio = activeBanner?.data.desktopRatio || "32:10"
          if (dRatio === "21:9") return 21 / 9
          if (dRatio === "16:9") return 16 / 9
          if (dRatio === "4:3") return 4 / 3
          if (dRatio === "1:1") return 1 / 1
          if (dRatio === "3:4") return 3 / 4
          return 32 / 10
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
