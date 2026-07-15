"use client"

import { useState, useRef } from "react"
import { uploadImage } from "@/lib/upload"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { HeroSlide } from "@/types/cms.types"
import { Trash2, GripVertical, UploadCloud, Plus } from "lucide-react"

interface HeroBlockEditorProps {
  initialSlides?: HeroSlide[]
  onChange: (slides: HeroSlide[]) => void
}

export default function HeroBlockEditor({
  initialSlides = [],
  onChange,
}: HeroBlockEditorProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [uploadingIndex, setUploadingIndex] = useState<{ index: number; field: "desktop" | "mobile" } | null>(null)

  const updateSlides = (newSlides: HeroSlide[]) => {
    setSlides(newSlides)
    onChange(newSlides)
  }

  const handleAddSlide = () => {
    if (slides.length >= 5) return
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      imageDesktopUrl: null,
      imageMobileUrl: null,
      redirectUrl: "",
      altText: "",
      isActive: true,
    }
    updateSlides([...slides, newSlide])
  }

  const handleDeleteSlide = (index: number) => {
    const newSlides = slides.filter((_, i) => i !== index)
    updateSlides(newSlides)
  }

  const handleFieldChange = (index: number, field: keyof HeroSlide, value: any) => {
    const newSlides = slides.map((slide, i) => {
      if (i === index) {
        return { ...slide, [field]: value }
      }
      return slide
    })
    updateSlides(newSlides)
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: "desktop" | "mobile"
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingIndex({ index, field })
    try {
      const url = await uploadImage(file)
      handleFieldChange(
        index,
        field === "desktop" ? "imageDesktopUrl" : "imageMobileUrl",
        url
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setUploadingIndex(null)
      e.target.value = ""
    }
  }

  // --- Drag and Drop ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return
    const newSlides = [...slides]
    const [draggedItem] = newSlides.splice(draggedIndex, 1)
    newSlides.splice(index, 0, draggedItem)
    setDraggedIndex(index)
    setSlides(newSlides)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    onChange(slides)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-3">
        <div>
          <h3 className="text-[11px] font-bold tracking-widest uppercase text-text-primary">
            Hero Carousel Editor
          </h3>
          <p className="text-body-xs text-text-secondary/70 mt-1">
            Configure up to 5 rotating slides. Drag cards using the handle to reorder.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleAddSlide}
          disabled={slides.length >= 5}
          className="bg-text-primary text-surface text-[10px] uppercase tracking-widest font-bold hover:bg-accent flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" /> Add Slide ({slides.length}/5)
        </Button>
      </div>

      <div className="space-y-4">
        {slides.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border/40 text-text-secondary italic text-body-sm bg-surface-secondary/10">
            No slides configured. Add a slide to begin.
          </div>
        ) : (
          slides.map((slide, idx) => {
            const isDragging = draggedIndex === idx
            const isUploadingDesktop =
              uploadingIndex?.index === idx && uploadingIndex?.field === "desktop"
            const isUploadingMobile =
              uploadingIndex?.index === idx && uploadingIndex?.field === "mobile"

            return (
              <div
                key={slide.id}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(idx)}
                className={`flex gap-4 p-5 border bg-surface transition-all select-none duration-150 ${
                  isDragging
                    ? "opacity-30 border-text-primary scale-[0.99]"
                    : "border-border/30 hover:border-border-primary/60"
                }`}
              >
                {/* Drag Handle */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center justify-center cursor-grab active:cursor-grabbing text-text-secondary/50 hover:text-text-primary transition-colors"
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Thumbnail Previews */}
                <div className="flex flex-col gap-3 w-32 shrink-0">
                  {/* Desktop Preview */}
                  <div className="relative aspect-[16/9] w-full bg-surface-secondary border border-border/20 flex items-center justify-center overflow-hidden">
                    {slide.imageDesktopUrl ? (
                      <img
                        src={slide.imageDesktopUrl}
                        alt="Desktop preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-[8px] uppercase tracking-wider text-text-secondary/70">
                        No Desktop
                      </span>
                    )}
                  </div>
                  {/* Mobile Preview */}
                  <div className="relative aspect-[9/16] w-14 mx-auto bg-surface-secondary border border-border/20 flex items-center justify-center overflow-hidden">
                    {slide.imageMobileUrl ? (
                      <img
                        src={slide.imageMobileUrl}
                        alt="Mobile preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-[8px] uppercase tracking-wider text-text-secondary/70">
                        No Mobile
                      </span>
                    )}
                  </div>
                </div>

                {/* Editor Inputs */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Row 1: Image Uploads */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                      Desktop Image (16:9 recommended)
                    </Label>
                    <div className="relative border border-dashed border-border/50 bg-surface-secondary/10 hover:bg-surface-secondary/20 transition-colors py-2.5 px-3 flex items-center justify-center text-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, idx, "desktop")}
                        disabled={isUploadingDesktop}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                      />
                      <div className="flex items-center gap-2 pointer-events-none text-text-secondary hover:text-text-primary transition-colors">
                        <UploadCloud className="w-4 h-4" />
                        <span className="text-[9px] uppercase tracking-wider font-bold">
                          {isUploadingDesktop ? "Uploading..." : "Upload Desktop"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                      Mobile Image (9:16 recommended)
                    </Label>
                    <div className="relative border border-dashed border-border/50 bg-surface-secondary/10 hover:bg-surface-secondary/20 transition-colors py-2.5 px-3 flex items-center justify-center text-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, idx, "mobile")}
                        disabled={isUploadingMobile}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                      />
                      <div className="flex items-center gap-2 pointer-events-none text-text-secondary hover:text-text-primary transition-colors">
                        <UploadCloud className="w-4 h-4" />
                        <span className="text-[9px] uppercase tracking-wider font-bold">
                          {isUploadingMobile ? "Uploading..." : "Upload Mobile"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Redirect URL & Alt Text */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                      Redirect URL (Optional)
                    </Label>
                    <Input
                      type="text"
                      placeholder="/collections/new"
                      value={slide.redirectUrl || ""}
                      onChange={(e) => handleFieldChange(idx, "redirectUrl", e.target.value)}
                      className="text-body-sm h-9 bg-surface rounded-none border-border/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                      Alt Text / Accessibility Description
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. Summer collection banner"
                      value={slide.altText || ""}
                      onChange={(e) => handleFieldChange(idx, "altText", e.target.value)}
                      className="text-body-sm h-9 bg-surface rounded-none border-border/30"
                    />
                  </div>

                  {/* Row 3: Status & Delete */}
                  <div className="md:col-span-2 flex items-center justify-between border-t border-border/20 pt-3 mt-1">
                    <div className="flex items-center gap-3">
                      <Switch
                        id={`slide-active-${slide.id}`}
                        checked={slide.isActive}
                        onCheckedChange={(checked) =>
                          handleFieldChange(idx, "isActive", checked)
                        }
                      />
                      <Label
                        htmlFor={`slide-active-${slide.id}`}
                        className="text-[9px] uppercase tracking-wider font-bold text-text-secondary cursor-pointer"
                      >
                        Slide Active (renders on storefront)
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(idx)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
