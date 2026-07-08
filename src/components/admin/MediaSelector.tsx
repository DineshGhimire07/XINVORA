"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MediaUploader } from "@/components/admin/MediaUploader"
import { useRouter } from "next/navigation"

export function MediaSelector({ mediaItems, selectedImages, onChange }: { mediaItems: any[], selectedImages: string[], onChange: (images: string[]) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

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
    router.refresh() // Refresh to get the new media items in the props
  }

  return (
    <div className="flex flex-col gap-4">
      {selectedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {selectedImages.map((url, i) => (
            <div key={i} className="relative aspect-square border border-border/40 group overflow-hidden bg-surface-secondary/20">
              <Image src={url} alt="Selected" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              <button 
                type="button" 
                onClick={() => onChange(selectedImages.filter(img => img !== url))}
                className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedImages.map((url, i) => (
        <input key={i} type="hidden" name="images" value={url} />
      ))}

      <div className="flex gap-4">
        <Button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="self-start bg-surface-secondary text-text-primary px-6 py-2 text-[10px] uppercase tracking-widest font-bold border border-border/40 hover:bg-border/20 transition-colors"
        >
          {isOpen ? "Close Media Selector" : "+ Select Images"}
        </Button>
        <MediaUploader onUploadComplete={handleUploadComplete} />
      </div>

      {isOpen && (
        <div className="mt-4 p-4 border border-border/40 bg-surface-secondary/20">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 h-[400px] overflow-y-auto">
            {mediaItems.length === 0 ? (
              <p className="col-span-full text-text-secondary text-body-sm p-4">No media available in library. Please upload first.</p>
            ) : (
              mediaItems.map(item => {
                if (!item.mimeType?.startsWith("image")) return null;
                const isSelected = selectedImages.includes(item.url)
                return (
                  <div 
                    key={item.id} 
                    onClick={() => toggleImage(item.url)}
                    className={`relative aspect-square border cursor-pointer hover:border-text-primary transition-colors overflow-hidden ${isSelected ? 'border-accent ring-2 ring-accent' : 'border-border/40'}`}
                  >
                    <Image src={item.url} alt={item.altText || item.title || "Media Item"} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                        <div className="bg-accent text-surface text-[10px] px-2 py-1 uppercase tracking-wider font-bold">Selected</div>
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
