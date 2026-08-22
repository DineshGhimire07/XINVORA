"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import getCroppedImg, { createImage } from "@/lib/cropImage"
import { Maximize2, Move, Crop, Check } from "lucide-react"

interface ImageCropperModalProps {
  imageSrc: string
  aspect: number // initial aspect ratio e.g. 3/4 or 32/10
  onCropComplete: (croppedFile: File) => void
  onClose: () => void
}

const PRESETS = [
  { label: "1:2 (Editorial 4-Box)", value: 1 / 2 },
  { label: "9:16 (Phone Story)", value: 9 / 16 },
  { label: "32:10 (Banner)", value: 32 / 10 },
  { label: "3:4 (Portrait)", value: 3 / 4 },
  { label: "1:1 (Square)", value: 1 / 1 },
  { label: "16:9 (Landscape)", value: 16 / 9 },
]

export default function ImageCropperModal({
  imageSrc,
  aspect: initialAspect,
  onCropComplete,
  onClose,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [currentAspect, setCurrentAspect] = useState<number>(initialAspect)
  const [objectFit, setObjectFit] = useState<"contain" | "cover">("cover")
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    setIsSaving(true)
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(croppedFile)
    } catch (e) {
      console.error("Error cropping image:", e)
      alert("Failed to crop image.")
    } finally {
      setIsSaving(false)
    }
  }

  // Bypass cropping completely and use full uncropped original image
  const handleUseOriginal = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(imageSrc)
      const blob = await res.blob()
      const filename = `original_${Date.now()}.${blob.type.split("/")[1] || "jpeg"}`
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" })
      onCropComplete(file)
    } catch (e) {
      console.error("Error fetching original image:", e)
      alert("Failed to use original image.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 md:p-6">
      <div className="bg-admin-surface border border-admin-border rounded-admin-lg w-full max-w-3xl h-[620px] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-admin-border flex flex-wrap items-center justify-between gap-3 bg-admin-surface">
          <div>
            <h3 className="text-admin-sm font-bold text-admin-text-primary uppercase tracking-wider flex items-center gap-2">
              <Crop className="w-4 h-4 text-admin-primary" />
              Adjust Image & Aspect Ratio
            </h3>
            <p className="text-[10px] text-admin-text-secondary mt-0.5">
              Select ratio, zoom/fit photo, or click "Use Full Original" to skip cropping.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUseOriginal}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-admin-primary text-admin-primary-on rounded-admin-md hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            Use Full Original (Zero Crop)
          </button>
        </div>

        {/* Toolbar: Aspect Ratios & Fit Mode */}
        <div className="px-4 py-2.5 bg-admin-content border-b border-admin-border flex flex-wrap items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[10px] uppercase font-bold text-admin-text-tertiary mr-1">Ratio:</span>
            {PRESETS.map((preset) => {
              const isActive = Math.abs(currentAspect - preset.value) < 0.05
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setCurrentAspect(preset.value)}
                  className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-admin-md transition-colors cursor-pointer border ${
                    isActive
                      ? "bg-admin-primary text-admin-primary-on border-admin-primary"
                      : "bg-admin-surface text-admin-text-secondary border-admin-border hover:border-admin-border-strong"
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>

          {/* Fit Mode Toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-admin-text-tertiary">Fit:</span>
            <button
              type="button"
              onClick={() => setObjectFit("contain")}
              className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-admin-md transition-colors cursor-pointer border ${
                objectFit === "contain"
                  ? "bg-admin-primary text-admin-primary-on border-admin-primary"
                  : "bg-admin-surface text-admin-text-secondary border-admin-border hover:border-admin-border-strong"
              }`}
            >
              Fit Entire Image
            </button>
            <button
              type="button"
              onClick={() => setObjectFit("cover")}
              className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-admin-md transition-colors cursor-pointer border ${
                objectFit === "cover"
                  ? "bg-admin-primary text-admin-primary-on border-admin-primary"
                  : "bg-admin-surface text-admin-text-secondary border-admin-border hover:border-admin-border-strong"
              }`}
            >
              Fill Box
            </button>
          </div>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={currentAspect}
            objectFit={objectFit}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls and Footer */}
        <div className="p-4 border-t border-admin-border bg-admin-surface flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <span className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider w-12">
              Zoom
            </span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              aria-label="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-admin-border rounded-lg appearance-none cursor-pointer accent-admin-primary"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-admin-text-secondary hover:text-admin-text-primary text-admin-xs font-semibold px-3 py-1.5 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleUseOriginal}
                disabled={isSaving}
                className="text-admin-text-secondary hover:text-admin-text-primary text-admin-xs font-semibold uppercase tracking-wider px-3 py-1.5 transition-colors underline cursor-pointer disabled:opacity-50"
              >
                Skip Crop
              </button>
              <button
                type="button"
                disabled={isSaving || !croppedAreaPixels}
                onClick={handleSave}
                className="bg-admin-primary text-admin-primary-on hover:bg-admin-primary/95 text-admin-xs font-bold uppercase tracking-wider px-5 py-2 rounded-admin-md transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Crop"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
