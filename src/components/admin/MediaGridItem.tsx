"use client"

import { useState } from "react"
import Image from "next/image"
import { archiveMediaAction } from "@/actions/admin/media.actions"
import { Trash2 } from "lucide-react"

interface MediaItem {
  id: string
  url: string
  title: string
  mimeType: string | null
  altText: string | null
  providerId: string | null
}

export function MediaGridItem({ item }: { item: MediaItem }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this image?")) return
    
    setIsDeleting(true)
    try {
      const res = await archiveMediaAction(item.id, item.providerId || undefined)
      if (!res.success) throw new Error(res.error)
    } catch (err: any) {
      alert(err.message || "Failed to delete media")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={`group relative border border-border/40 aspect-square flex flex-col items-center justify-center bg-surface-secondary/20 overflow-hidden cursor-pointer hover:border-text-primary transition-colors ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      {item.mimeType?.startsWith("image") ? (
        <Image src={item.url} alt={item.altText || item.title || "Media Item"} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
      ) : (
        <span className="text-body-xs font-mono text-text-secondary">FILE</span>
      )}
      
      <div className="absolute inset-0 bg-text-primary/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-surface">
        <div className="flex justify-end">
          <button 
            onClick={handleDelete}
            className="p-1 hover:bg-red-500/20 text-red-400 hover:text-red-500 rounded transition-colors"
            title="Delete Image"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div>
          <p className="text-[10px] font-bold truncate">{item.title}</p>
          <p className="text-[10px] text-surface/70 truncate">{item.mimeType}</p>
        </div>
      </div>
    </div>
  )
}
