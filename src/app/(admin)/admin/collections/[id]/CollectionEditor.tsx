"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  createCollectionAction, 
  updateCollectionAction, 
  archiveCollectionAction, 
  hardDeleteCollectionAction,
  saveCollectionTemplateAction 
} from "@/actions/admin/collections.actions"
import { SUPPORTED_IMAGE_ROLES } from "@/db/schema/collection-image-templates"
import { Search, Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Camera } from "lucide-react"
import { uploadImage } from "@/lib/upload"
import ImageCropperModal from "./ImageCropperModal"

export default function CollectionEditor({
  collection,
  collections,
  allProducts = [],
  initialProductIds = [],
  initialTemplate,
}: {
  collection?: any
  collections?: any[]
  allProducts?: any[]
  initialProductIds?: string[]
  initialTemplate?: any
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialProductIds)
  const [searchQuery, setSearchQuery] = useState("")

  // Photography Sequence Template State
  const [templateName, setTemplateName] = useState(
    initialTemplate?.name || (collection?.name ? `${collection.name} Photography Template` : "Standard Photography Template")
  )
  const [templateActive, setTemplateActive] = useState<boolean>(initialTemplate?.isActive ?? true)
  const [templateRoles, setTemplateRoles] = useState<{ position: number; role: string; label: string }[]>(
    initialTemplate?.roles && initialTemplate.roles.length > 0
      ? initialTemplate.roles
      : [
          { position: 1, role: "lifestyle", label: "Lifestyle" },
          { position: 2, role: "front_closeup", label: "Front Close-Up" },
          { position: 3, role: "front", label: "Front" },
          { position: 4, role: "back", label: "Back" },
        ]
  )
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [templateMessage, setTemplateMessage] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(collection?.imageUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragDesktop, setDragDesktop] = useState(false)
  const [imageMobileUrl, setImageMobileUrl] = useState<string | null>(collection?.imageMobileUrl || null)
  const [isUploadingMobile, setIsUploadingMobile] = useState(false)
  const [dragMobile, setDragMobile] = useState(false)
  const [bannerUrl, setBannerUrl] = useState<string | null>(collection?.bannerUrl || null)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [dragBanner, setDragBanner] = useState(false)

  // Cropping states
  const [coverSource, setCoverSource] = useState<string | null>(null)
  const [isCroppingCover, setIsCroppingCover] = useState(false)
  const [mobileSource, setMobileSource] = useState<string | null>(null)
  const [isCroppingMobile, setIsCroppingMobile] = useState(false)
  const [bannerSource, setBannerSource] = useState<string | null>(null)
  const [isCroppingBanner, setIsCroppingBanner] = useState(false)

  const desktopFileRef = useRef<HTMLInputElement>(null)
  const mobileFileRef = useRef<HTMLInputElement>(null)
  const bannerFileRef = useRef<HTMLInputElement>(null)

  const handleAddRole = () => {
    const nextPos = templateRoles.length + 1
    const defaultRole = SUPPORTED_IMAGE_ROLES[0]
    setTemplateRoles([
      ...templateRoles,
      { position: nextPos, role: defaultRole.role, label: defaultRole.label }
    ])
  }

  const handleRemoveRole = (index: number) => {
    const next = templateRoles.filter((_, idx) => idx !== index)
    setTemplateRoles(next.map((r, i) => ({ ...r, position: i + 1 })))
  }

  const handleMoveRole = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= templateRoles.length) return
    const next = [...templateRoles]
    const temp = next[index]
    next[index] = next[targetIndex]
    next[targetIndex] = temp
    setTemplateRoles(next.map((r, i) => ({ ...r, position: i + 1 })))
  }

  const handleRoleChange = (index: number, newRoleKey: string) => {
    const found = SUPPORTED_IMAGE_ROLES.find(r => r.role === newRoleKey)
    const label = found ? found.label : newRoleKey
    const next = [...templateRoles]
    next[index] = { ...next[index], role: newRoleKey, label }
    setTemplateRoles(next)
  }

  const handleSaveTemplateExplicit = async () => {
    if (!collection?.id) {
      alert("Please save the collection first before saving the photography template.")
      return
    }
    setIsSavingTemplate(true)
    setTemplateMessage(null)
    try {
      const res = await saveCollectionTemplateAction(collection.id, {
        name: templateName,
        isActive: templateActive,
        roles: templateRoles.map((r, i) => ({ position: i + 1, role: r.role, label: r.label })),
      })
      if (res.success) {
        setTemplateMessage("✓ Photography template saved & product image roles resynchronized!")
        setTimeout(() => setTemplateMessage(null), 4000)
      } else {
        alert(res.error || "Failed to save template")
      }
    } catch (err: any) {
      alert(err.message || "Failed to save template")
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    // Add productIds to formData explicitly
    formData.delete("productIds") // clear any default inputs
    selectedProductIds.forEach((id) => formData.append("productIds", id))

    let result
    if (collection) {
      result = await updateCollectionAction(collection.id, formData)
      if (result.success) {
        // Also save template configuration
        await saveCollectionTemplateAction(collection.id, {
          name: templateName,
          isActive: templateActive,
          roles: templateRoles.map((r, i) => ({ position: i + 1, role: r.role, label: r.label })),
        }).catch(console.error)
      }
    } else {
      result = await createCollectionAction(formData)
    }

    if (result.success) {
      router.push("/admin/collections")
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  const handleArchive = async () => {
    if (!collection) return
    if (!confirm("Are you sure you want to archive this collection?")) return

    setIsLoading(true)
    const result = await archiveCollectionAction(collection.id)
    if (result.success) {
      router.push("/admin/collections")
    } else {
      setError(result.error)
      setIsLoading(false)
    }
  }

  const handleHardDelete = async () => {
    if (!collection) return
    if (!confirm(`Are you sure you want to PERMANENTLY delete collection "${collection.name}"? This action cannot be undone.`)) return

    setIsLoading(true)
    const result = await hardDeleteCollectionAction(collection.id)
    if (result.success) {
      router.push("/admin/collections")
    } else {
      setError(result.error)
      setIsLoading(false)
    }
  }

  const handleToggleProduct = (pId: string) => {
    if (selectedProductIds.includes(pId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== pId))
    } else {
      setSelectedProductIds([...selectedProductIds, pId])
    }
  }

  const filteredProducts = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-admin-border pb-5">
        <div>
          <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
            {collection ? `Edit Collection: ${collection.name}` : "Create New Collection"}
          </h1>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Configure collection metadata, upload responsive editorial imagery, and assign products.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {collection && (
            <>
              <button
                type="button"
                onClick={handleArchive}
                disabled={isLoading}
                className="px-4 py-2 border border-admin-border bg-admin-surface text-admin-text-secondary hover:text-admin-text-primary hover:border-admin-border-strong text-admin-xs font-semibold rounded-admin-md transition-colors disabled:opacity-50"
              >
                Archive
              </button>
              <button
                type="button"
                onClick={handleHardDelete}
                disabled={isLoading}
                className="px-4 py-2 border border-admin-status-danger-border bg-admin-status-danger-bg text-admin-status-danger-text hover:bg-admin-status-danger-border/20 text-admin-xs font-semibold rounded-admin-md transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </>
          )}
          <button
            type="submit"
            form="collection-form"
            disabled={isLoading || isUploading || isUploadingMobile || isUploadingBanner}
            className="bg-admin-primary text-admin-primary-on hover:bg-admin-primary/95 px-5 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md transition-colors disabled:opacity-50"
          >
            {isLoading ? "Saving..." : collection ? "Save Changes" : "Create Collection"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-admin-status-danger-bg border border-admin-status-danger-border text-admin-status-danger-text text-admin-sm rounded-admin-md">
          {error}
        </div>
      )}

      <form id="collection-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-6 shadow-xs">
          <h3 className="text-admin-base font-bold text-admin-text-primary border-b border-admin-border pb-3">
            Collection Details & Imagery (3 Dedicated Uploads)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Collection Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={collection?.name}
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="slug" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                URL Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                defaultValue={collection?.slug}
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="parentId" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Parent Collection (Optional)
              </label>
              <select
                id="parentId"
                name="parentId"
                defaultValue={collection?.parentId || ""}
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              >
                <option value="">None (Top-level Collection)</option>
                {collections
                  ?.filter((c) => c.id !== collection?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sortOrder" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Sort Order Priority
              </label>
              <input
                type="number"
                id="sortOrder"
                name="sortOrder"
                defaultValue={collection?.sortOrder || 0}
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={collection?.description}
              rows={3}
              className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all leading-relaxed"
            />
          </div>

          {/* ════════════════════════════════════════════════════════════════════════ */}
          {/* UPLOAD 1: DESKTOP / LAPTOP EDITORIAL COVER                               */}
          {/* ════════════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-2.5 pt-4 border-t border-admin-border/60">
            <div className="flex items-center justify-between">
              <label className="text-admin-xs font-bold text-admin-text-primary uppercase tracking-wider flex items-center gap-2">
                <span>💻 1. Desktop Cover Photo (Featured 4-Box Grid)</span>
              </label>
              <span className="text-[10px] bg-admin-primary/10 text-admin-primary font-bold px-2 py-0.5 rounded-sm">
                Desktop Ratio: 1:2 Vertical
              </span>
            </div>
            <input type="hidden" name="imageUrl" value={imageUrl || ""} />

            {/* Spec Guideline Card */}
            <div className="p-3 bg-admin-content/80 border border-admin-border/70 rounded-admin-md text-[11px] text-admin-text-secondary flex items-center justify-between">
              <div>
                <span className="font-bold text-admin-text-primary">Recommended Laptop / Desktop Size: </span>
                <strong className="text-admin-text-primary">1000 × 2000 px</strong> (or 1200 × 2400 px Retina)
              </div>
              <span className="text-[10px] font-mono text-admin-text-secondary/70">1:2 Editorial Aspect</span>
            </div>
            
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragDesktop(true); }}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragDesktop(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragDesktop(false); }}
              onDrop={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragDesktop(false)
                const file = e.dataTransfer.files?.[0]
                if (file) {
                  setIsUploading(true)
                  try {
                    const url = await uploadImage(file, { purpose: "collection" })
                    setImageUrl(url)
                  } catch (err) {
                    alert("Failed to upload desktop cover photo.")
                  } finally {
                    setIsUploading(false)
                  }
                }
              }}
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-5 p-3 rounded-admin-md border transition-all ${
                dragDesktop ? "border-2 border-dashed border-admin-primary bg-admin-primary/10 ring-4 ring-admin-primary/20" : "border-transparent"
              }`}
            >
              <div 
                onClick={() => desktopFileRef.current?.click()}
                title="Click or drag photo here to upload"
                className="w-24 h-44 bg-admin-content border-2 border-dashed border-admin-border hover:border-admin-primary/80 rounded-admin-md overflow-hidden flex items-center justify-center flex-shrink-0 relative shadow-inner cursor-pointer group transition-all"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Desktop Cover"
                    className="w-full h-full object-cover object-top group-hover:opacity-85 transition-opacity"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 p-2 text-center text-admin-text-secondary/60 group-hover:text-admin-primary transition-colors">
                    <ImageIcon className="w-7 h-7" />
                    <span className="text-[8px] uppercase font-bold tracking-wider">Click or Drop 1:2</span>
                  </div>
                )}
                {dragDesktop && (
                  <div className="absolute inset-0 bg-admin-primary/20 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-admin-primary">📥 Drop</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="cursor-pointer bg-admin-primary text-admin-primary-on hover:bg-admin-primary/95 text-admin-xs font-semibold px-4 py-2 rounded-admin-md transition-colors select-none">
                    {isUploading ? "Uploading..." : imageUrl ? "Replace Desktop Photo" : "Upload Ready Photo"}
                    <input
                      ref={desktopFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setIsUploading(true)
                          try {
                            const url = await uploadImage(file, { purpose: "collection" })
                            setImageUrl(url)
                          } catch (err) {
                            console.error(err)
                            alert("Failed to upload desktop cover photo.")
                          } finally {
                            setIsUploading(false)
                            e.target.value = ""
                          }
                        }
                      }}
                    />
                  </label>

                  <label className="cursor-pointer bg-admin-content border border-admin-border hover:border-admin-border-strong text-admin-text-primary text-admin-xs font-semibold px-3.5 py-2 rounded-admin-md transition-colors select-none">
                    Crop & Upload (1:2)
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

                  {imageUrl && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setCoverSource(imageUrl)
                          setIsCroppingCover(true)
                        }}
                        className="text-admin-primary text-admin-xs font-semibold hover:underline"
                      >
                        Recrop
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl(null)}
                        className="text-admin-status-danger-text text-admin-xs font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-admin-text-secondary/80 leading-relaxed">
                  Used directly for the 4-box full-height editorial collection cards on laptops & desktops. Drag & drop image anywhere here to upload.
                </p>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════ */}
          {/* UPLOAD 2: MOBILE PHONE EDITORIAL COVER                                   */}
          {/* ════════════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-2.5 pt-4 border-t border-admin-border/60">
            <div className="flex items-center justify-between">
              <label className="text-admin-xs font-bold text-admin-text-primary uppercase tracking-wider flex items-center gap-2">
                <span>📱 2. Mobile Phone Cover Photo (Featured 4-Box Grid)</span>
              </label>
              <span className="text-[10px] bg-admin-primary/10 text-admin-primary font-bold px-2 py-0.5 rounded-sm">
                Mobile Ratio: 1:2 Story Portrait
              </span>
            </div>
            <input type="hidden" name="imageMobileUrl" value={imageMobileUrl || ""} />

            {/* Spec Guideline Card */}
            <div className="p-3 bg-admin-content/80 border border-admin-border/70 rounded-admin-md text-[11px] text-admin-text-secondary flex items-center justify-between">
              <div>
                <span className="font-bold text-admin-text-primary">Recommended Mobile Size: </span>
                <strong className="text-admin-text-primary">800 × 1600 px</strong> (or 750 × 1500 px)
              </div>
              <span className="text-[10px] font-mono text-admin-text-secondary/70">1:2 Mobile Portrait</span>
            </div>
            
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragMobile(true); }}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragMobile(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragMobile(false); }}
              onDrop={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragMobile(false)
                const file = e.dataTransfer.files?.[0]
                if (file) {
                  setIsUploadingMobile(true)
                  try {
                    const url = await uploadImage(file, { purpose: "collection" })
                    setImageMobileUrl(url)
                  } catch (err) {
                    alert("Failed to upload mobile cover photo.")
                  } finally {
                    setIsUploadingMobile(false)
                  }
                }
              }}
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-5 p-3 rounded-admin-md border transition-all ${
                dragMobile ? "border-2 border-dashed border-admin-primary bg-admin-primary/10 ring-4 ring-admin-primary/20" : "border-transparent"
              }`}
            >
              <div 
                onClick={() => mobileFileRef.current?.click()}
                title="Click or drag photo here to upload"
                className="w-24 h-44 bg-admin-content border-2 border-dashed border-admin-border hover:border-admin-primary/80 rounded-admin-md overflow-hidden flex items-center justify-center flex-shrink-0 relative shadow-inner cursor-pointer group transition-all"
              >
                {imageMobileUrl ? (
                  <img
                    src={imageMobileUrl}
                    alt="Mobile Cover"
                    className="w-full h-full object-cover object-top group-hover:opacity-85 transition-opacity"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 p-2 text-center text-admin-text-secondary/60 group-hover:text-admin-primary transition-colors">
                    <ImageIcon className="w-7 h-7" />
                    <span className="text-[8px] uppercase font-bold tracking-wider">Click or Drop 1:2</span>
                  </div>
                )}
                {dragMobile && (
                  <div className="absolute inset-0 bg-admin-primary/20 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-admin-primary">📥 Drop</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="cursor-pointer bg-admin-primary text-admin-primary-on hover:bg-admin-primary/95 text-admin-xs font-semibold px-4 py-2 rounded-admin-md transition-colors select-none">
                    {isUploadingMobile ? "Uploading..." : imageMobileUrl ? "Replace Mobile Photo" : "Upload Ready Photo"}
                    <input
                      ref={mobileFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingMobile}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setIsUploadingMobile(true)
                          try {
                            const url = await uploadImage(file, { purpose: "collection" })
                            setImageMobileUrl(url)
                          } catch (err) {
                            console.error(err)
                            alert("Failed to upload mobile cover photo.")
                          } finally {
                            setIsUploadingMobile(false)
                            e.target.value = ""
                          }
                        }
                      }}
                    />
                  </label>

                  <label className="cursor-pointer bg-admin-content border border-admin-border hover:border-admin-border-strong text-admin-text-primary text-admin-xs font-semibold px-3.5 py-2 rounded-admin-md transition-colors select-none">
                    Crop & Upload (1:2)
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

                  {imageMobileUrl && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileSource(imageMobileUrl)
                          setIsCroppingMobile(true)
                        }}
                        className="text-admin-primary text-admin-xs font-semibold hover:underline"
                      >
                        Recrop
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMobileUrl(null)}
                        className="text-admin-status-danger-text text-admin-xs font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-admin-text-secondary/80 leading-relaxed">
                  Mobile-optimized cover photo for the 4-box grid on smartphones. Drag & drop image anywhere here to upload.
                </p>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════ */}
          {/* UPLOAD 3: STOREFRONT LANDSCAPE BANNER                                    */}
          {/* ════════════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-2.5 pt-4 border-t border-admin-border/60">
            <div className="flex items-center justify-between">
              <label className="text-admin-xs font-bold text-admin-text-primary uppercase tracking-wider flex items-center gap-2">
                <span>🏪 3. Storefront Landscape Banner (Collection Page Top Header)</span>
              </label>
              <span className="text-[10px] bg-admin-primary/10 text-admin-primary font-bold px-2 py-0.5 rounded-sm">
                Storefront Ratio: 32:10 Wide
              </span>
            </div>
            <input type="hidden" name="bannerUrl" value={bannerUrl || ""} />

            {/* Spec Guideline Card */}
            <div className="p-3 bg-admin-content/80 border border-admin-border/70 rounded-admin-md grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-admin-text-secondary">
              <div>
                <span className="font-bold text-admin-text-primary">💻 Desktop / Laptop: </span>
                <strong className="text-admin-text-primary">1920 × 600 px</strong> (or 2560 × 800 px)
              </div>
              <div>
                <span className="font-bold text-admin-text-primary">📱 Mobile Phones: </span>
                <strong className="text-admin-text-primary">800 × 340 px</strong> (or 1080 × 460 px)
              </div>
            </div>
            
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragBanner(true); }}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragBanner(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragBanner(false); }}
              onDrop={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragBanner(false)
                const file = e.dataTransfer.files?.[0]
                if (file) {
                  setIsUploadingBanner(true)
                  try {
                    const url = await uploadImage(file, { purpose: "banner" })
                    setBannerUrl(url)
                  } catch (err) {
                    alert("Failed to upload banner image.")
                  } finally {
                    setIsUploadingBanner(false)
                  }
                }
              }}
              className={`flex flex-col md:flex-row items-start md:items-center gap-5 p-3 rounded-admin-md border transition-all ${
                dragBanner ? "border-2 border-dashed border-admin-primary bg-admin-primary/10 ring-4 ring-admin-primary/20" : "border-transparent"
              }`}
            >
              <div 
                onClick={() => bannerFileRef.current?.click()}
                title="Click or drag banner photo here to upload"
                className="w-full md:w-80 h-24 bg-admin-content border-2 border-dashed border-admin-border hover:border-admin-primary/80 rounded-admin-md overflow-hidden flex items-center justify-center flex-shrink-0 relative shadow-inner cursor-pointer group transition-all"
              >
                {bannerUrl ? (
                  <img
                    src={bannerUrl}
                    alt="Collection Banner"
                    className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center text-admin-text-secondary/60 group-hover:text-admin-primary transition-colors">
                    <ImageIcon className="w-7 h-7" />
                    <span className="text-[8px] uppercase font-bold tracking-wider">Click or Drop 32:10 Banner</span>
                  </div>
                )}
                {dragBanner && (
                  <div className="absolute inset-0 bg-admin-primary/20 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-admin-primary">📥 Drop Banner</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="cursor-pointer bg-admin-primary text-admin-primary-on hover:bg-admin-primary/95 text-admin-xs font-semibold px-4 py-2 rounded-admin-md transition-colors select-none">
                    {isUploadingBanner ? "Uploading..." : bannerUrl ? "Replace Banner" : "Upload Ready Banner"}
                    <input
                      ref={bannerFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingBanner}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setIsUploadingBanner(true)
                          try {
                            const url = await uploadImage(file, { purpose: "banner" })
                            setBannerUrl(url)
                          } catch (err) {
                            console.error(err)
                            alert("Failed to upload banner image.")
                          } finally {
                            setIsUploadingBanner(false)
                            e.target.value = ""
                          }
                        }
                      }}
                    />
                  </label>

                  <label className="cursor-pointer bg-admin-content border border-admin-border hover:border-admin-border-strong text-admin-text-primary text-admin-xs font-semibold px-3.5 py-2 rounded-admin-md transition-colors select-none">
                    Crop & Upload (32:10)
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingBanner}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = URL.createObjectURL(file)
                          setBannerSource(url)
                          setIsCroppingBanner(true)
                          e.target.value = ""
                        }
                      }}
                    />
                  </label>

                  {bannerUrl && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setBannerSource(bannerUrl)
                          setIsCroppingBanner(true)
                        }}
                        className="text-admin-primary text-admin-xs font-semibold hover:underline"
                      >
                        Recrop
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerUrl(null)}
                        className="text-admin-status-danger-text text-admin-xs font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-admin-text-secondary/80 leading-relaxed">
                  Displays as the cinematic hero banner at the top of the individual collection page. Drag & drop image anywhere here to upload.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Photography Sequence Template Section */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-admin-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-admin-primary" />
                <h2 className="text-admin-base font-semibold text-admin-text-primary">
                  Photography Sequence & SEO Image Roles
                </h2>
              </div>
              <p className="text-admin-xs text-admin-text-secondary mt-1">
                Configure the standardized photography template for products in this collection. Products deterministically inherit semantic image roles and SEO alt text from this sequence.
              </p>
            </div>
            
            {collection?.id && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveTemplateExplicit}
                  disabled={isSavingTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-admin-xs font-bold uppercase tracking-wider bg-admin-primary text-admin-primary-on hover:bg-admin-primary/90 rounded-admin-md transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isSavingTemplate ? "Syncing..." : "Save & Sync Roles"}
                </button>
              </div>
            )}
          </div>

          {templateMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-admin-xs font-semibold rounded-admin-md">
              {templateMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-admin-xs font-bold text-admin-text-primary uppercase tracking-wider">
                  Ordered Photography Sequence ({templateRoles.length} Roles)
                </label>
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-admin-primary hover:underline uppercase tracking-wider cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Role
                </button>
              </div>

              <div className="space-y-2.5">
                {templateRoles.map((roleItem, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-admin-content/40 border border-admin-border rounded-admin-md"
                  >
                    <div className="w-8 h-8 rounded-full bg-admin-surface border border-admin-border flex items-center justify-center font-bold text-admin-xs text-admin-text-secondary flex-shrink-0">
                      #{idx + 1}
                    </div>

                    <div className="flex-1">
                      <select
                        value={roleItem.role}
                        onChange={(e) => handleRoleChange(idx, e.target.value)}
                        className="w-full bg-admin-surface border border-admin-border rounded-admin-md px-3 py-1.5 text-admin-sm text-admin-text-primary focus:outline-none focus:ring-1 focus:ring-admin-primary"
                      >
                        {SUPPORTED_IMAGE_ROLES.map((r) => (
                          <option key={r.role} value={r.role}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveRole(idx, "up")}
                        className="p-1.5 text-admin-text-secondary hover:text-admin-text-primary disabled:opacity-30 rounded hover:bg-admin-surface cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === templateRoles.length - 1}
                        onClick={() => handleMoveRole(idx, "down")}
                        className="p-1.5 text-admin-text-secondary hover:text-admin-text-primary disabled:opacity-30 rounded hover:bg-admin-surface cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={templateRoles.length <= 1}
                        onClick={() => handleRemoveRole(idx)}
                        className="p-1.5 text-admin-status-danger-text hover:bg-red-500/10 rounded disabled:opacity-30 cursor-pointer"
                        title="Delete Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live SEO Metadata Preview */}
            <div className="bg-admin-content/30 border border-admin-border rounded-admin-md p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-admin-xs font-bold text-admin-text-primary uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Live SEO Preview
                </div>
                <p className="text-[10px] text-admin-text-secondary mt-1">
                  Simulated metadata for a product in this collection:
                </p>

                <div className="mt-3 space-y-2 text-[11px]">
                  {templateRoles.map((r, i) => (
                    <div key={i} className="p-2 bg-admin-surface border border-admin-border/60 rounded text-admin-text-secondary">
                      <div className="font-semibold text-admin-text-primary text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Image #{i + 1} ➔ {r.label}
                      </div>
                      <div className="truncate text-admin-text-primary font-medium mt-0.5">
                        {collection?.name || "Silk Corset"} Top - {r.label}
                      </div>
                      <div className="text-[9px] text-admin-text-secondary/70 truncate font-mono">
                        {(collection?.slug || "silk-corset")}-top-{r.role.replace(/_/g, "-")}.webp
                      </div>
                    </div>
                  ))}
                  {templateRoles.length === 0 && (
                    <div className="text-admin-text-secondary text-center py-4 text-[11px]">
                      No roles configured. Products will use fallback "Photo N".
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[9px] text-admin-text-secondary/80 border-t border-admin-border/60 pt-2.5">
                🔒 100% Deterministic — Zero AI guessing. Position determines the exact role.
              </div>
            </div>
          </div>
        </div>

        {/* Render Cropping Modals */}
        {isCroppingCover && coverSource && (
          <ImageCropperModal
            imageSrc={coverSource}
            aspect={1 / 2}
            onCropComplete={async (croppedFile) => {
              setIsCroppingCover(false)
              if (coverSource.startsWith("blob:")) {
                URL.revokeObjectURL(coverSource)
              }
              setCoverSource(null)
              setIsUploading(true)
              try {
                const url = await uploadImage(croppedFile)
                setImageUrl(url)
              } catch (err) {
                console.error(err)
                alert("Failed to upload cropped desktop cover image.")
              } finally {
                setIsUploading(false)
              }
            }}
            onClose={() => {
              setIsCroppingCover(false)
              if (coverSource.startsWith("blob:")) {
                URL.revokeObjectURL(coverSource)
              }
              setCoverSource(null)
            }}
          />
        )}

        {isCroppingMobile && mobileSource && (
          <ImageCropperModal
            imageSrc={mobileSource}
            aspect={1 / 2}
            onCropComplete={async (croppedFile) => {
              setIsCroppingMobile(false)
              if (mobileSource.startsWith("blob:")) {
                URL.revokeObjectURL(mobileSource)
              }
              setMobileSource(null)
              setIsUploadingMobile(true)
              try {
                const url = await uploadImage(croppedFile)
                setImageMobileUrl(url)
              } catch (err) {
                console.error(err)
                alert("Failed to upload cropped mobile cover image.")
              } finally {
                setIsUploadingMobile(false)
              }
            }}
            onClose={() => {
              setIsCroppingMobile(false)
              if (mobileSource.startsWith("blob:")) {
                URL.revokeObjectURL(mobileSource)
              }
              setMobileSource(null)
            }}
          />
        )}

        {isCroppingBanner && bannerSource && (
          <ImageCropperModal
            imageSrc={bannerSource}
            aspect={32 / 10}
            onCropComplete={async (croppedFile) => {
              setIsCroppingBanner(false)
              if (bannerSource.startsWith("blob:")) {
                URL.revokeObjectURL(bannerSource)
              }
              setBannerSource(null)
              setIsUploadingBanner(true)
              try {
                const url = await uploadImage(croppedFile)
                setBannerUrl(url)
              } catch (err) {
                console.error(err)
                alert("Failed to upload cropped banner image.")
              } finally {
                setIsUploadingBanner(false)
              }
            }}
            onClose={() => {
              setIsCroppingBanner(false)
              if (bannerSource.startsWith("blob:")) {
                URL.revokeObjectURL(bannerSource)
              }
              setBannerSource(null)
            }}
          />
        )}

        {/* Section 2: Product Assignment */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-5 shadow-xs">
          <div className="flex justify-between items-center border-b border-admin-border pb-3">
            <h3 className="text-admin-base font-bold text-admin-text-primary">
              Product Assignment
            </h3>
            <span className="text-admin-xs text-admin-text-secondary font-semibold">
              {selectedProductIds.length} product(s) selected
            </span>
          </div>

          {/* Search box */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products to add..."
              className="w-full bg-admin-content border border-admin-border rounded-admin-md pl-10 pr-4 py-1.5 text-admin-sm text-admin-text-primary placeholder:text-admin-text-secondary focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
            />
          </div>

          {/* Product checklist */}
          <div className="max-h-60 overflow-y-auto border border-admin-border p-2 bg-admin-content rounded-admin-md divide-y divide-admin-border/50">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id)
                return (
                  <label
                    key={p.id}
                    className="flex items-center gap-2.5 p-2.5 text-admin-sm text-admin-text-primary cursor-pointer hover:bg-admin-content-hover/40 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleProduct(p.id)}
                      className="rounded border-admin-border text-admin-primary focus:ring-admin-primary"
                    />
                    <div className="h-10 w-8 bg-admin-content border border-admin-border rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover object-top" />
                      ) : (
                        <div className="text-[7px] uppercase font-bold text-admin-text-secondary">XINV</div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold leading-tight">{p.name}</span>
                      <span className="text-[10px] text-admin-text-secondary font-mono mt-0.5">{p.slug}</span>
                    </div>
                  </label>
                )
              })
            ) : (
              <div className="p-6 text-center text-admin-sm text-admin-text-secondary italic">
                No active products found matching your search.
              </div>
            )}
          </div>
        </div>

        {/* Section 3: SEO settings */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-5 shadow-xs">
          <h3 className="text-admin-base font-bold text-admin-text-primary border-b border-admin-border pb-3">
            Search Engine Optimization (SEO)
          </h3>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="seoTitle" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                SEO Meta Title
              </label>
              <input
                id="seoTitle"
                name="seoTitle"
                defaultValue={collection?.seoTitle}
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="seoDescription" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                SEO Meta Description
              </label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                defaultValue={collection?.seoDescription}
                rows={2}
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
            </div>
          </div>
        </div>

        {/* Form controls panel */}
        <div className="flex justify-between items-center pt-4">
          {collection ? (
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleArchive}
                disabled={isLoading}
                className="text-amber-600 text-admin-sm font-semibold underline hover:text-amber-700 transition-colors"
              >
                Archive Collection
              </button>
              <button
                type="button"
                onClick={handleHardDelete}
                disabled={isLoading}
                className="text-red-500 text-admin-sm font-bold underline hover:text-red-700 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          ) : (
            <div />
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/collections")}
              disabled={isLoading}
              className="text-admin-text-secondary text-admin-sm font-semibold hover:text-admin-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-admin-primary text-admin-primary-on px-6 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-admin-primary/95 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Collection"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
