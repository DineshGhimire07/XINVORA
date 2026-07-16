"use client"

import { useState } from "react"
import { uploadImage } from "@/lib/upload"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { BannerBlockData } from "@/types/cms.types"
import { Image as ImageIcon } from "lucide-react"
import ImageCropperModal from "../../collections/[id]/ImageCropperModal"

interface BannerBlockEditorProps {
  initialData?: BannerBlockData
  onChange: (data: BannerBlockData) => void
}

export default function BannerBlockEditor({
  initialData,
  onChange,
}: BannerBlockEditorProps) {
  const [data, setData] = useState<BannerBlockData>(initialData || {
    imageUrl: null,
    imageMobileUrl: null,
    title: "The Linen Edit",
    eyebrow: "EDITORIAL",
    tagline: "Light. Breathable. Timeless.",
    linkText: "Shop the Edit",
    linkUrl: "/collections",
    isActive: true,
  })

  const [coverSource, setCoverSource] = useState<string | null>(null)
  const [isCroppingCover, setIsCroppingCover] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [mobileSource, setMobileSource] = useState<string | null>(null)
  const [isCroppingMobile, setIsCroppingMobile] = useState(false)
  const [isUploadingMobile, setIsUploadingMobile] = useState(false)

  const updateData = (updates: Partial<BannerBlockData>) => {
    const newData = { ...data, ...updates }
    setData(newData)
    onChange(newData)
  }

  return (
    <div className="space-y-8">
      {/* Active Toggle */}
      <div className="flex items-center justify-between p-4 bg-surface-secondary border border-border rounded-lg">
        <div className="flex flex-col gap-1">
          <Label className="text-body-sm font-semibold uppercase tracking-wider">Banner Active</Label>
          <span className="text-[11px] text-text-secondary">Toggle visibility of this banner on the homepage</span>
        </div>
        <Switch
          checked={data.isActive ?? true}
          onCheckedChange={(checked) => updateData({ isActive: checked })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Images */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-body-sm font-semibold uppercase tracking-wider">Desktop Background Image</Label>
            <div className="w-full aspect-[32/10] bg-surface-secondary border border-border rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 relative">
              {data.imageUrl ? (
                <img src={data.imageUrl} alt="Banner Desktop" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-text-secondary/40" />
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold px-4 py-2 rounded transition-colors select-none">
                {isUploading ? "Uploading..." : data.imageUrl ? "Change Image" : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = URL.createObjectURL(file)
                      setCoverSource(url)
                      setIsCroppingCover(true)
                      e.target.value = ""
                    }
                  }}
                />
              </label>
              {data.imageUrl && (
                <button
                  type="button"
                  onClick={() => updateData({ imageUrl: null })}
                  className="text-red-500 text-xs font-semibold hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-[10px] text-text-secondary">Recommended aspect ratio: 32:10 (e.g. 1600x500)</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <Label className="text-body-sm font-semibold uppercase tracking-wider">Mobile Background Image (Optional)</Label>
            <div className="w-full aspect-[3/4] max-w-[200px] bg-surface-secondary border border-border rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 relative">
              {data.imageMobileUrl ? (
                <img src={data.imageMobileUrl} alt="Banner Mobile" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-text-secondary/40" />
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold px-4 py-2 rounded transition-colors select-none">
                {isUploadingMobile ? "Uploading..." : data.imageMobileUrl ? "Change Mobile Image" : "Upload Mobile Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingMobile}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = URL.createObjectURL(file)
                      setMobileSource(url)
                      setIsCroppingMobile(true)
                      e.target.value = ""
                    }
                  }}
                />
              </label>
              {data.imageMobileUrl && (
                <button
                  type="button"
                  onClick={() => updateData({ imageMobileUrl: null })}
                  className="text-red-500 text-xs font-semibold hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-[10px] text-text-secondary">Recommended aspect ratio: 3:4 (e.g. 900x1200)</p>
          </div>
        </div>

        {/* Right Column: Text content */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="eyebrow" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Eyebrow (Optional)</Label>
            <Input
              id="eyebrow"
              value={data.eyebrow || ""}
              onChange={(e) => updateData({ eyebrow: e.target.value })}
              placeholder="e.g. EDITORIAL"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Title *</Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => updateData({ title: e.target.value })}
              placeholder="e.g. The Linen Edit"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagline" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Tagline (Optional)</Label>
            <Input
              id="tagline"
              value={data.tagline || ""}
              onChange={(e) => updateData({ tagline: e.target.value })}
              placeholder="e.g. Light. Breathable. Timeless."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="linkText" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Link Text</Label>
              <Input
                id="linkText"
                value={data.linkText || ""}
                onChange={(e) => updateData({ linkText: e.target.value })}
                placeholder="e.g. Shop the Edit"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="linkUrl" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Link URL *</Label>
              <Input
                id="linkUrl"
                value={data.linkUrl}
                onChange={(e) => updateData({ linkUrl: e.target.value })}
                placeholder="e.g. /collections/linen"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {isCroppingCover && coverSource && (
        <ImageCropperModal
          imageSrc={coverSource}
          aspect={32 / 10}
          onCropComplete={async (croppedFile) => {
            setIsCroppingCover(false)
            if (coverSource.startsWith("blob:")) URL.revokeObjectURL(coverSource)
            setCoverSource(null)
            setIsUploading(true)
            try {
              const url = await uploadImage(croppedFile)
              updateData({ imageUrl: url })
            } catch (err) {
              console.error(err)
              alert("Failed to upload desktop banner image.")
            } finally {
              setIsUploading(false)
            }
          }}
          onClose={() => {
            setIsCroppingCover(false)
            if (coverSource.startsWith("blob:")) URL.revokeObjectURL(coverSource)
            setCoverSource(null)
          }}
        />
      )}

      {isCroppingMobile && mobileSource && (
        <ImageCropperModal
          imageSrc={mobileSource}
          aspect={3 / 4}
          onCropComplete={async (croppedFile) => {
            setIsCroppingMobile(false)
            if (mobileSource.startsWith("blob:")) URL.revokeObjectURL(mobileSource)
            setMobileSource(null)
            setIsUploadingMobile(true)
            try {
              const url = await uploadImage(croppedFile)
              updateData({ imageMobileUrl: url })
            } catch (err) {
              console.error(err)
              alert("Failed to upload mobile banner image.")
            } finally {
              setIsUploadingMobile(false)
            }
          }}
          onClose={() => {
            setIsCroppingMobile(false)
            if (mobileSource.startsWith("blob:")) URL.revokeObjectURL(mobileSource)
            setMobileSource(null)
          }}
        />
      )}
    </div>
  )
}
