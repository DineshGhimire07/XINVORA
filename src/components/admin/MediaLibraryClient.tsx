"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { uploadImage } from "@/lib/upload"
import { archiveMediaAction, bulkDeleteMediaAction } from "@/actions/admin/media.actions"

interface MediaItem {
  id: string
  url: string
  title: string
  mimeType: string | null
  altText: string | null
  providerId: string | null
  sizeBytes: number | null
  width: number | null
  height: number | null
  createdAt: string
}

interface UploadingFile {
  id: string
  name: string
  progress: number
  status: "uploading" | "done" | "error"
  url?: string
  error?: string
  preview: string
}

export function MediaLibraryClient({ initialItems }: { initialItems: MediaItem[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<MediaItem[]>(initialItems)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"))
    if (files.length > 0) processFiles(files)
  }, [])

  const processFiles = async (files: File[]) => {
    const newUploads: UploadingFile[] = files.map(f => ({
      id: `${Date.now()}-${Math.random()}`,
      name: f.name,
      progress: 0,
      status: "uploading" as const,
      preview: URL.createObjectURL(f),
    }))
    setUploadingFiles(prev => [...newUploads, ...prev])

    const results = await Promise.allSettled(
      files.map(async (file, i) => {
        const uid = newUploads[i].id
        const interval = setInterval(() => {
          setUploadingFiles(prev =>
            prev.map(u =>
              u.id === uid && u.progress < 80
                ? { ...u, progress: Math.min(u.progress + Math.random() * 12 + 3, 80) }
                : u
            )
          )
        }, 180)
        try {
          const url = await uploadImage(file)
          clearInterval(interval)
          setUploadingFiles(prev =>
            prev.map(u => u.id === uid ? { ...u, progress: 100, status: "done", url } : u)
          )
          return url
        } catch (err: any) {
          clearInterval(interval)
          setUploadingFiles(prev =>
            prev.map(u => u.id === uid ? { ...u, progress: 0, status: "error", error: err.message } : u)
          )
          throw err
        }
      })
    )

    const succeeded = results.filter(r => r.status === "fulfilled").length
    showToast(`${succeeded}/${files.length} images uploaded`)
    setTimeout(() => {
      router.refresh()
      setUploadingFiles(prev => prev.filter(u => u.status !== "done"))
    }, 1500)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"))
    if (files.length > 0) processFiles(files)
    e.target.value = ""
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === filteredItems.length) setSelected(new Set())
    else setSelected(new Set(filteredItems.map(i => i.id)))
  }

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch {}
  }

  const handleBulkDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} image${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) return
    setIsDeleting(true)
    const toDelete = items.filter(i => selected.has(i.id)).map(i => ({ id: i.id, providerId: i.providerId }))
    const res = await bulkDeleteMediaAction(toDelete)
    if (res.success) {
      setItems(prev => prev.filter(i => !selected.has(i.id)))
      setSelected(new Set())
      setSelectionMode(false)
      showToast(`${toDelete.length - (res.failed?.length ?? 0)} images deleted`)
    } else {
      showToast(res.error || "Delete failed", "error")
    }
    setIsDeleting(false)
  }

  const handleSingleDelete = async (item: MediaItem) => {
    if (!confirm("Delete this image? This cannot be undone.")) return
    const res = await archiveMediaAction(item.id, item.providerId || undefined)
    if (res.success) {
      setItems(prev => prev.filter(i => i.id !== item.id))
      showToast("Image deleted")
    } else {
      showToast(res.error || "Failed to delete", "error")
    }
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—"
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  useEffect(() => { setItems(initialItems) }, [initialItems])

  return (
    <div className="flex flex-col min-h-screen bg-admin-content">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-admin-lg shadow-lg text-sm font-semibold flex items-center gap-2 ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success"
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {toast.msg}
        </div>
      )}

      <div className="bg-admin-surface border-b border-admin-border px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-admin-xl font-bold text-admin-text-primary">Media Library</h1>
          <p className="text-admin-xs text-admin-text-secondary mt-0.5">{items.length} assets · Drag & drop to upload · Click image to copy URL</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectionMode && selected.size > 0 && (
            <button onClick={handleBulkDelete} disabled={isDeleting}
              className="flex items-center gap-1.5 px-4 py-2 text-admin-xs font-bold uppercase tracking-wider bg-red-600 text-white rounded-admin-md hover:bg-red-700 transition-colors disabled:opacity-50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              {isDeleting ? "Deleting..." : `Delete ${selected.size}`}
            </button>
          )}
          <button onClick={() => { setSelectionMode(v => !v); setSelected(new Set()) }}
            className={`px-4 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md border transition-colors ${selectionMode ? "bg-admin-primary text-white border-admin-primary" : "bg-admin-surface text-admin-text-secondary border-admin-border hover:border-admin-border-strong"}`}>
            {selectionMode ? `✓ ${selected.size} Selected` : "Select"}
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 text-admin-xs font-bold uppercase tracking-wider bg-admin-primary text-white rounded-admin-md hover:bg-admin-primary/90 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Upload Photos
          </button>
          <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>
      </div>

      <div className="bg-admin-surface border-b border-admin-border px-6 py-2.5 flex items-center gap-3">
        <div className="flex-1 relative max-w-xs">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-admin-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search by filename..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-admin-xs bg-admin-content border border-admin-border rounded-admin-md text-admin-text-primary placeholder:text-admin-text-tertiary focus:outline-none focus:ring-1 focus:ring-admin-primary transition" />
        </div>
        {selectionMode && (
          <button onClick={selectAll} className="text-admin-xs font-semibold text-admin-primary hover:underline">
            {selected.size === filteredItems.length ? "Deselect All" : "Select All"}
          </button>
        )}
        <div className="ml-auto flex items-center gap-1 border border-admin-border rounded-admin-md overflow-hidden">
          <button onClick={() => setViewMode("grid")} className={`px-2.5 py-1.5 transition-colors ${viewMode === "grid" ? "bg-admin-primary text-white" : "text-admin-text-secondary hover:bg-admin-border/40"}`}>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" /></svg>
          </button>
          <button onClick={() => setViewMode("list")} className={`px-2.5 py-1.5 transition-colors ${viewMode === "list" ? "bg-admin-primary text-white" : "text-admin-text-secondary hover:bg-admin-border/40"}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
        </div>
        <span className="text-admin-xs text-admin-text-tertiary">{filteredItems.length} items</span>
      </div>

      <div className={`flex-1 p-6 relative transition-colors ${isDragging ? "bg-admin-primary/5 ring-2 ring-inset ring-admin-primary/40" : ""}`}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>

        {isDragging && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-admin-primary/10 backdrop-blur-sm pointer-events-none">
            <svg className="w-16 h-16 text-admin-primary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <p className="text-admin-xl font-bold text-admin-primary">Drop photos here</p>
            <p className="text-admin-sm text-admin-primary/70 mt-1">Release to start uploading</p>
          </div>
        )}

        {uploadingFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-admin-xs font-bold uppercase tracking-wider text-admin-text-secondary mb-3">
              Uploading ({uploadingFiles.filter(f => f.status === "uploading").length} remaining)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {uploadingFiles.map(f => (
                <div key={f.id} className="relative aspect-square bg-admin-border/20 rounded-admin-md overflow-hidden border border-admin-border">
                  {f.preview && <img src={f.preview} alt={f.name} className="w-full h-full object-cover opacity-60" />}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-admin-surface/70 backdrop-blur-[2px]">
                    {f.status === "uploading" ? (
                      <>
                        <div className="w-10 h-10 rounded-full border-2 border-admin-border flex items-center justify-center mb-2">
                          <span className="text-[10px] font-bold text-admin-primary">{Math.round(f.progress)}%</span>
                        </div>
                        <div className="w-full px-3">
                          <div className="h-1 bg-admin-border rounded-full overflow-hidden">
                            <div className="h-full bg-admin-primary transition-all duration-200" style={{ width: `${f.progress}%` }} />
                          </div>
                        </div>
                      </>
                    ) : f.status === "done" ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-admin-surface/90 px-1.5 py-1">
                    <p className="text-[9px] font-medium text-admin-text-primary truncate">{f.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredItems.length === 0 && uploadingFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-admin-border/30 flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-admin-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-admin-lg font-bold text-admin-text-primary mb-2">No images yet</h3>
            <p className="text-admin-sm text-admin-text-secondary max-w-xs mb-6">
              {searchTerm ? "No images match your search." : "Drag & drop images here or click Upload to get started."}
            </p>
            {!searchTerm && (
              <button onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 text-admin-xs font-bold uppercase tracking-wider bg-admin-primary text-white rounded-admin-md hover:bg-admin-primary/90 transition-colors">
                Upload First Images
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
            {filteredItems.map(item => {
              const isSelected = selected.has(item.id)
              const isCopied = copiedUrl === item.url
              return (
                <div key={item.id}
                  className={`group relative aspect-square rounded-admin-md overflow-hidden border transition-all cursor-pointer ${isSelected ? "border-admin-primary ring-2 ring-admin-primary/40" : "border-admin-border hover:border-admin-border-strong"}`}
                  onClick={() => selectionMode ? toggleSelect(item.id) : copyUrl(item.url)}>
                  <Image src={item.url} alt={item.altText || item.title || "Media"} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 14vw" />
                  {selectionMode && (
                    <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center z-10 ${isSelected ? "bg-admin-primary border-admin-primary" : "bg-white/80 border-admin-border"}`}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  )}
                  {!selectionMode && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end">
                        <button onClick={e => { e.stopPropagation(); handleSingleDelete(item) }}
                          className="w-7 h-7 rounded bg-red-600/80 hover:bg-red-600 flex items-center justify-center transition-colors">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      <div className="bg-black/50 rounded px-2 py-1.5">
                        <p className="text-[10px] font-semibold text-white truncate">{item.title}</p>
                        <p className="text-[9px] text-white/60">{formatSize(item.sizeBytes)}</p>
                      </div>
                    </div>
                  )}
                  {isCopied && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-600/80 z-20">
                      <div className="flex flex-col items-center gap-1">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        <p className="text-[10px] text-white font-bold">URL Copied!</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="border border-admin-border rounded-admin-lg overflow-hidden">
            <table className="w-full text-admin-xs">
              <thead>
                <tr className="bg-admin-surface border-b border-admin-border">
                  {selectionMode && (
                    <th className="w-10 px-3 py-2.5">
                      <input type="checkbox" checked={selected.size === filteredItems.length && filteredItems.length > 0} onChange={selectAll} className="rounded border-admin-border text-admin-primary focus:ring-admin-primary" />
                    </th>
                  )}
                  <th className="px-3 py-2.5 text-left font-semibold text-admin-text-secondary uppercase tracking-wider w-16">Preview</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-admin-text-secondary uppercase tracking-wider">Filename</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-admin-text-secondary uppercase tracking-wider">Size</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-admin-text-secondary uppercase tracking-wider">Dimensions</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-admin-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {filteredItems.map(item => {
                  const isSelected = selected.has(item.id)
                  const isCopied = copiedUrl === item.url
                  return (
                    <tr key={item.id} className={`hover:bg-admin-surface/50 transition-colors ${isSelected ? "bg-admin-primary/5" : ""}`}>
                      {selectionMode && (
                        <td className="px-3 py-2"><input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item.id)} className="rounded border-admin-border text-admin-primary focus:ring-admin-primary" /></td>
                      )}
                      <td className="px-3 py-2">
                        <div className="w-12 h-12 relative rounded border border-admin-border overflow-hidden bg-admin-border/20">
                          <Image src={item.url} alt={item.title} fill className="object-cover" sizes="48px" />
                        </div>
                      </td>
                      <td className="px-3 py-2 max-w-xs">
                        <p className="font-medium text-admin-text-primary truncate">{item.title}</p>
                        <p className="text-admin-text-tertiary truncate text-[10px] mt-0.5">{item.url.slice(0, 60)}...</p>
                      </td>
                      <td className="px-3 py-2 text-admin-text-secondary whitespace-nowrap">{formatSize(item.sizeBytes)}</td>
                      <td className="px-3 py-2 text-admin-text-secondary whitespace-nowrap">{item.width && item.height ? `${item.width}×${item.height}` : "—"}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => copyUrl(item.url)}
                            className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded transition-colors ${isCopied ? "bg-green-600 text-white" : "bg-admin-surface border border-admin-border text-admin-text-secondary hover:border-admin-primary hover:text-admin-primary"}`}>
                            {isCopied ? "✓ Copied" : "Copy URL"}
                          </button>
                          <button onClick={() => handleSingleDelete(item)}
                            className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredItems.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-2 text-admin-text-tertiary text-admin-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Drag & drop more photos anywhere on this page to upload
          </div>
        )}
      </div>
    </div>
  )
}
