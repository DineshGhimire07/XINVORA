"use client"

import { useState, useRef } from "react"
import { uploadImage } from "@/lib/upload"
import { Button } from "@/components/ui/button"

export function MediaUploader({ onUploadComplete }: { onUploadComplete?: (urls: string[]) => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setIsUploading(true)

    try {
      const uploadedUrls: string[] = []

      // Upload each file using the shared upload utility
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i]
        const url = await uploadImage(file)
        uploadedUrls.push(url)
      }

      if (onUploadComplete && uploadedUrls.length > 0) {
        onUploadComplete(uploadedUrls)
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload files.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="bg-text-primary text-surface px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "+ Upload Media"}
      </Button>
    </div>
  )
}
