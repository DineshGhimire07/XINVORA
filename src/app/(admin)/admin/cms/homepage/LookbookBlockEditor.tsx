"use client"

import { useState } from "react"
import { uploadImage } from "@/lib/upload"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Trash2, GripVertical, UploadCloud, Plus, ImageIcon } from "lucide-react"
import AdminProductPicker from "@/components/admin/AdminProductPicker"
import Image from "next/image"

/** Compress + resize image client-side to max 1400px longest side, JPEG 85% quality */
async function compressImage(file: File, maxPx = 1400, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img")
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const { naturalWidth: w, naturalHeight: h } = img
      const scale = Math.min(1, maxPx / Math.max(w, h))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(w * scale)
      canvas.height = Math.round(h * scale)
      const ctx = canvas.getContext("2d")
      if (!ctx) return resolve(file)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file)
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }))
        },
        "image/jpeg",
        quality
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

interface LookbookSlide {
  id: string
  imageUrl: string | null
  linkedProductId?: string | null // deprecated fallback
  linkedProductIds: string[]
  altText: string
  isActive: boolean
}

interface LookbookBlockEditorProps {
  allProducts: any[]
  initialSlides?: LookbookSlide[]
  onChange: (slides: LookbookSlide[]) => void
}

export default function LookbookBlockEditor({
  allProducts = [],
  initialSlides = [],
  onChange,
}: LookbookBlockEditorProps) {
  const [slides, setSlides] = useState<LookbookSlide[]>(() => {
    // Map existing single-picker slide database structures into multi-select array structure gracefully
    return initialSlides.map(slide => ({
      ...slide,
      linkedProductIds: slide.linkedProductIds || (slide.linkedProductId ? [slide.linkedProductId] : [])
    }))
  })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  const updateSlides = (newSlides: LookbookSlide[]) => {
    setSlides(newSlides)
    onChange(newSlides)
  }

  const handleAddSlide = () => {
    if (slides.length >= 10) return
    const newSlide: LookbookSlide = {
      id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      imageUrl: null,
      linkedProductIds: [],
      altText: "",
      isActive: true,
    }
    updateSlides([...slides, newSlide])
  }

  const handleDeleteSlide = (index: number) => {
    updateSlides(slides.filter((_, i) => i !== index))
  }

  const handleFieldChange = (index: number, field: keyof LookbookSlide, value: any) => {
    updateSlides(slides.map((slide, i) => (i === index ? { ...slide, [field]: value } : slide)))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingIndex(index)
    try {
      const compressed = await compressImage(file)
      const url = await uploadImage(compressed)
      handleFieldChange(index, "imageUrl", url)
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
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
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
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-3">
        <div>
          <h3 className="text-[11px] font-bold tracking-widest uppercase text-text-primary">
            Shop the Look Editor
          </h3>
          <p className="text-body-xs text-text-secondary/70 mt-1">
            Add up to 10 slides. Tag multiple products per slide to build the outfits.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleAddSlide}
          disabled={slides.length >= 10}
          className="bg-text-primary text-surface text-[10px] uppercase tracking-widest font-bold hover:bg-accent flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" /> Add Look ({slides.length}/10)
        </Button>
      </div>

      {/* Slides */}
      <div className="space-y-5">
        {slides.length === 0 ? (
          <div className="p-14 text-center border-2 border-dashed border-border/40 text-text-secondary text-body-sm bg-surface-secondary/10">
            <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
            No Lookbook slides yet. Click <strong>Add Look</strong> to upload your first portrait photo.
          </div>
        ) : (
          slides.map((slide, idx) => {
            const isDragging = draggedIndex === idx
            const isUploading = uploadingIndex === idx
            const currentSelectedIds = slide.linkedProductIds || (slide.linkedProductId ? [slide.linkedProductId] : [])

            return (
              <div
                key={slide.id}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(idx)}
                className={`flex gap-5 p-5 border bg-admin-surface transition-all duration-150 ${
                  isDragging
                    ? "opacity-30 border-text-primary scale-[0.99]"
                    : "border-admin-border hover:border-admin-border-strong"
                }`}
              >
                {/* Drag Handle */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center justify-center cursor-grab active:cursor-grabbing text-admin-text-secondary/40 hover:text-admin-text-primary transition-colors pt-1"
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Portrait Upload Zone */}
                <div className="shrink-0 w-40">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-admin-text-secondary mb-2">
                    Portrait Photo <span className="opacity-50">(3:4 vertical)</span>
                  </p>

                  <div className="relative aspect-[3/4] w-full bg-admin-surface-secondary border-2 border-dashed border-admin-border/60 hover:border-accent overflow-hidden transition-colors group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, idx)}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait z-10"
                    />

                    {slide.imageUrl ? (
                      <>
                        <Image
                          src={slide.imageUrl}
                          alt="Look preview"
                          fill
                          sizes="160px"
                          className="object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1.5 text-white pointer-events-none">
                            <UploadCloud className="w-6 h-6" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Replace</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 pointer-events-none">
                        {isUploading ? (
                          <>
                            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                            <span className="text-[9px] text-admin-text-secondary uppercase tracking-wider font-bold">Uploading…</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-7 h-7 text-admin-text-secondary/40 group-hover:text-accent transition-colors" />
                            <div className="text-center px-2">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-admin-text-secondary/60 group-hover:text-accent transition-colors">
                                Click to upload
                              </p>
                              <p className="text-[8px] text-admin-text-secondary/40 mt-0.5">Portrait · 3:4 ratio</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-center text-[8px] text-admin-text-secondary/40 mt-1.5 uppercase tracking-wider">
                    Look #{idx + 1}
                  </p>
                </div>

                {/* Right Column: Fields */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                  {/* Tagged products in multi mode */}
                  <div>
                    <AdminProductPicker
                      allProducts={allProducts}
                      selectedIds={currentSelectedIds}
                      onChange={(ids) => handleFieldChange(idx, "linkedProductIds", ids)}
                      mode="multi"
                      label="Tagged Products in this Look"
                    />
                  </div>

                  {/* Alt text */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[9px] uppercase tracking-wider font-bold text-admin-text-secondary">
                      Alt Text <span className="opacity-50 normal-case font-normal">(accessibility)</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. Model wearing ivory linen dress and black boots"
                      value={slide.altText || ""}
                      onChange={(e) => handleFieldChange(idx, "altText", e.target.value)}
                      className="text-body-sm h-9 bg-admin-surface rounded-none border-admin-border/40"
                    />
                  </div>

                  {/* Status & Delete */}
                  <div className="flex items-center justify-between border-t border-admin-border/20 pt-3 mt-auto">
                    <div className="flex items-center gap-3">
                      <Switch
                        id={`slide-active-${slide.id}`}
                        checked={slide.isActive}
                        onCheckedChange={(checked) => handleFieldChange(idx, "isActive", checked)}
                      />
                      <Label
                        htmlFor={`slide-active-${slide.id}`}
                        className="text-[9px] uppercase tracking-wider font-bold text-admin-text-secondary cursor-pointer"
                      >
                        {slide.isActive ? "Live on storefront" : "Hidden"}
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(idx)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
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
