"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import getCroppedImg from "@/lib/cropImage"

interface ImageCropperModalProps {
  imageSrc: string
  aspect: number // e.g. 3/4 or 32/10
  onCropComplete: (croppedFile: File) => void
  onClose: () => void
}

export default function ImageCropperModal({
  imageSrc,
  aspect,
  onCropComplete,
  onClose,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-admin-surface border border-admin-border rounded-admin-lg w-full max-w-2xl h-[550px] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-admin-border flex justify-between items-center bg-admin-surface">
          <h3 className="text-admin-sm font-bold text-admin-text-primary uppercase tracking-wider">
            Crop Collection Image
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-admin-text-secondary hover:text-admin-text-primary text-admin-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls and Footer */}
        <div className="p-5 border-t border-admin-border bg-admin-surface flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
              Zoom
            </span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-label="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-admin-border rounded-lg appearance-none cursor-pointer accent-admin-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-admin-text-secondary hover:text-admin-text-primary text-admin-xs font-semibold px-4 py-2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving || !croppedAreaPixels}
              onClick={handleSave}
              className="bg-admin-primary text-admin-primary-on hover:bg-admin-primary/95 text-admin-xs font-bold uppercase tracking-wider px-6 py-2 rounded-admin-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
