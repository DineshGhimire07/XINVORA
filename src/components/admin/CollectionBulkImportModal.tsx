"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { bulkCreateCollectionsAction } from "@/actions/admin/collections.actions"
import { BulkCollectionInput, BulkCollectionImportResult } from "@/services/admin.collection.service"
import { slugify } from "@/lib/utils"

interface CollectionBulkImportModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ParsedCollectionRow extends BulkCollectionInput {
  id: string
  rowNumber: number
  isValid: boolean
  validationError?: string
}

export function CollectionBulkImportModal({ isOpen, onClose }: CollectionBulkImportModalProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<ParsedCollectionRow[]>([])
  const [isProcessing, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<BulkCollectionImportResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showFieldGuide, setShowFieldGuide] = useState(false)
  const [rawText, setRawText] = useState("")
  const [inputMode, setInputMode] = useState<"file" | "paste">("file")

  if (!isOpen) return null

  // 1. Download Header-Only CSV Template (No sample data rows)
  const handleDownloadTemplate = () => {
    // Header only — strictly NO collection sample data rows
    const csvHeader = "Name,Slug,Description,Image URL,Image Mobile URL,Banner URL,Sort Order,Is Active,SEO Title,SEO Description,Parent Slug\n"
    const blob = new Blob([csvHeader], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "xinvora_collections_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("CSV Template downloaded (headers only)")
  }

  // 2. Parse CSV Text into Parsed Rows
  const parseCSV = (csvText: string) => {
    setErrorMsg(null)
    setImportResult(null)

    const lines: string[] = []
    let currentLine = ""
    let inQuotes = false

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i]
      if (char === '"') {
        inQuotes = !inQuotes
        currentLine += char
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim())
        }
        currentLine = ""
      } else {
        currentLine += char
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim())
    }

    if (lines.length < 2) {
      setErrorMsg("CSV must contain a header row and at least 1 collection row.")
      return
    }

    const parseLineToCells = (line: string): string[] => {
      const cells: string[] = []
      let cell = ""
      let inside = false
      for (let i = 0; i < line.length; i++) {
        const c = line[i]
        if (c === '"') {
          inside = !inside
        } else if (c === "," && !inside) {
          cells.push(cell.trim().replace(/^"|"$/g, "").replace(/""/g, '"'))
          cell = ""
        } else {
          cell += c
        }
      }
      cells.push(cell.trim().replace(/^"|"$/g, "").replace(/""/g, '"'))
      return cells
    }

    const headerCells = parseLineToCells(lines[0]).map((h) =>
      h.toLowerCase().replace(/[^a-z0-9]/g, "")
    )

    // Map header positions flexibly
    const colIndex = {
      name: headerCells.findIndex((h) => h === "name" || h === "collectionname" || h === "title"),
      slug: headerCells.findIndex((h) => h === "slug" || h === "handle"),
      description: headerCells.findIndex((h) => h === "description" || h === "desc"),
      imageUrl: headerCells.findIndex((h) => h === "imageurl" || h === "image" || h === "photo" || h === "coverimage"),
      imageMobileUrl: headerCells.findIndex((h) => h === "imagemobileurl" || h === "mobileimage" || h === "mobilephoto"),
      bannerUrl: headerCells.findIndex((h) => h === "bannerurl" || h === "banner" || h === "heroimage"),
      sortOrder: headerCells.findIndex((h) => h === "sortorder" || h === "order" || h === "position"),
      isActive: headerCells.findIndex((h) => h === "isactive" || h === "active" || h === "status"),
      seoTitle: headerCells.findIndex((h) => h === "seotitle" || h === "metatitle"),
      seoDescription: headerCells.findIndex((h) => h === "seodescription" || h === "metadescription"),
      parentSlug: headerCells.findIndex((h) => h === "parentslug" || h === "parent" || h === "parentcollection"),
    }

    if (colIndex.name === -1) {
      setErrorMsg('CSV header is missing the required "Name" column.')
      return
    }

    const parsedItems: ParsedCollectionRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const cells = parseLineToCells(lines[i])
      if (cells.every((c) => !c)) continue // skip empty rows

      const name = (colIndex.name !== -1 ? cells[colIndex.name] : "")?.trim() || ""
      const slugRaw = colIndex.slug !== -1 ? cells[colIndex.slug]?.trim() : ""
      const description = colIndex.description !== -1 ? cells[colIndex.description]?.trim() : ""
      const imageUrl = colIndex.imageUrl !== -1 ? cells[colIndex.imageUrl]?.trim() : ""
      const imageMobileUrl = colIndex.imageMobileUrl !== -1 ? cells[colIndex.imageMobileUrl]?.trim() : ""
      const bannerUrl = colIndex.bannerUrl !== -1 ? cells[colIndex.bannerUrl]?.trim() : ""
      const sortOrderRaw = colIndex.sortOrder !== -1 ? cells[colIndex.sortOrder]?.trim() : ""
      const isActiveRaw = colIndex.isActive !== -1 ? cells[colIndex.isActive]?.trim() : ""
      const seoTitle = colIndex.seoTitle !== -1 ? cells[colIndex.seoTitle]?.trim() : ""
      const seoDescription = colIndex.seoDescription !== -1 ? cells[colIndex.seoDescription]?.trim() : ""
      const parentSlug = colIndex.parentSlug !== -1 ? cells[colIndex.parentSlug]?.trim() : ""

      const isValid = Boolean(name)
      const validationError = !name ? "Name is required" : undefined

      parsedItems.push({
        id: `row-${i}-${Date.now()}`,
        rowNumber: i,
        name,
        slug: slugRaw ? slugify(slugRaw) : name ? slugify(name) : "",
        description: description || null,
        imageUrl: imageUrl || null,
        imageMobileUrl: imageMobileUrl || null,
        bannerUrl: bannerUrl || null,
        sortOrder: sortOrderRaw ? parseInt(sortOrderRaw, 10) || 0 : 0,
        isActive: isActiveRaw ? !["false", "0", "no", "inactive"].includes(isActiveRaw.toLowerCase()) : true,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        parentSlug: parentSlug ? slugify(parentSlug) : null,
        isValid,
        validationError,
      })
    }

    if (parsedItems.length === 0) {
      setErrorMsg("No valid collection rows found in CSV.")
      return
    }

    setItems(parsedItems)
  }

  // 3. File Input Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) parseCSV(text)
    }
    reader.readAsText(file)
  }

  // 4. Drag and Drop Handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) parseCSV(text)
    }
    reader.readAsText(file)
  }

  // 5. Submit Bulk Import
  const handleImport = () => {
    const validItems = items.filter((item) => item.isValid)
    if (validItems.length === 0) {
      toast.error("No valid collections to import. Please check your data.")
      return
    }

    startTransition(async () => {
      try {
        const payload: BulkCollectionInput[] = validItems.map((item) => ({
          name: item.name,
          slug: item.slug || slugify(item.name),
          description: item.description,
          imageUrl: item.imageUrl,
          imageMobileUrl: item.imageMobileUrl,
          bannerUrl: item.bannerUrl,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
          seoTitle: item.seoTitle,
          seoDescription: item.seoDescription,
          parentSlug: item.parentSlug,
        }))

        const res = await bulkCreateCollectionsAction(payload)

        if (res.success && res.data) {
          setImportResult(res.data)
          toast.success(
            `Import complete: ${res.data.created} created, ${res.data.updated} updated.`
          )
          router.refresh()
        } else {
          setErrorMsg(res.error || "Failed to import collections.")
          toast.error(res.error || "Import failed.")
        }
      } catch (err: any) {
        setErrorMsg(err.message || "An unexpected error occurred.")
        toast.error("Import failed.")
      }
    })
  }

  const handleRemoveRow = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const validCount = items.filter((i) => i.isValid).length
  const invalidCount = items.length - validCount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-admin-card border border-admin-border rounded-admin-lg shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-admin-border bg-admin-content/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-admin-md bg-admin-primary/10 text-admin-primary">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-admin-lg font-bold font-display text-admin-text-primary tracking-tight">
                Bulk Import Collections
              </h2>
              <p className="text-admin-xs text-admin-text-secondary">
                Upload a CSV spreadsheet to create or update multiple collections at once.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-admin-xs font-semibold uppercase tracking-wider rounded-admin-md border border-admin-border bg-admin-card hover:bg-admin-content text-admin-text-primary transition-colors"
              title="Download empty CSV template (headers only)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-admin-text-secondary hover:text-admin-text-primary rounded-admin-md hover:bg-admin-content transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Field Guide Toggle */}
          <div className="rounded-admin-md border border-admin-border/80 bg-admin-content/30 overflow-hidden">
            <button
              onClick={() => setShowFieldGuide((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-admin-xs font-semibold uppercase tracking-wider text-admin-text-secondary hover:text-admin-text-primary transition-colors text-left"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-admin-primary" />
                <span>What can you fill in the CSV template? (Column Guide)</span>
              </span>
              {showFieldGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFieldGuide && (
              <div className="px-4 pb-4 pt-1 text-admin-xs text-admin-text-secondary border-t border-admin-border/50 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 pt-2">
                  <div>
                    <span className="font-bold text-admin-text-primary font-mono">Name</span>
                    <span className="text-red-500 font-bold ml-1">*Required</span>
                    <p className="text-admin-text-secondary/80 mt-0.5">Collection title (e.g. &quot;Summer 2026 Collection&quot;).</p>
                  </div>
                  <div>
                    <span className="font-bold text-admin-text-primary font-mono">Slug</span>
                    <span className="text-admin-text-secondary/60 ml-1">(Optional)</span>
                    <p className="text-admin-text-secondary/80 mt-0.5">URL handle (e.g. &quot;summer-2026&quot;). Auto-generated if blank.</p>
                  </div>
                  <div>
                    <span className="font-bold text-admin-text-primary font-mono">Description</span>
                    <span className="text-admin-text-secondary/60 ml-1">(Optional)</span>
                    <p className="text-admin-text-secondary/80 mt-0.5">Editorial copy / description for the collection page.</p>
                  </div>
                  <div>
                    <span className="font-bold text-admin-text-primary font-mono">Image URL</span>
                    <span className="text-admin-text-secondary/60 ml-1">(Optional)</span>
                    <p className="text-admin-text-secondary/80 mt-0.5">Desktop card cover photo URL (e.g. Cloudinary link).</p>
                  </div>
                  <div>
                    <span className="font-bold text-admin-text-primary font-mono">Image Mobile URL</span>
                    <span className="text-admin-text-secondary/60 ml-1">(Optional)</span>
                    <p className="text-admin-text-secondary/80 mt-0.5">Mobile-optimized cover photo URL.</p>
                  </div>
                  <div>
                    <span className="font-bold text-admin-text-primary font-mono">Banner URL</span>
                    <span className="text-admin-text-secondary/60 ml-1">(Optional)</span>
                    <p className="text-admin-text-secondary/80 mt-0.5">Wide hero banner image URL for collection landing pages.</p>
                  </div>
                  <div>
                    <span className="font-bold text-admin-text-primary font-mono">Sort Order</span>
                    <span className="text-admin-text-secondary/60 ml-1">(Optional)</span>
                    <p className="text-admin-text-secondary/80 mt-0.5">Integer position for listing order (e.g. 0, 1, 2). Default: 0.</p>
                  </div>
                  <div>
                    <span className="font-bold text-admin-text-primary font-mono">Is Active</span>
                    <span className="text-admin-text-secondary/60 ml-1">(Optional)</span>
                    <p className="text-admin-text-secondary/80 mt-0.5">&quot;true&quot; or &quot;false&quot;. Default: true.</p>
                  </div>
                  <div>
                    <span className="font-bold text-admin-text-primary font-mono">SEO Title</span>
                    <span className="text-admin-text-secondary/60 ml-1">(Optional)</span>
                    <p className="text-admin-text-secondary/80 mt-0.5">Custom browser title tag for SEO.</p>
                  </div>
                  <div>
                    <span className="font-bold text-admin-text-primary font-mono">SEO Description</span>
                    <span className="text-admin-text-secondary/60 ml-1">(Optional)</span>
                    <p className="text-admin-text-secondary/80 mt-0.5">Search engine meta description.</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-bold text-admin-text-primary font-mono">Parent Slug</span>
                    <span className="text-admin-text-secondary/60 ml-1">(Optional)</span>
                    <p className="text-admin-text-secondary/80 mt-0.5">Slug of parent collection if this is a sub-collection (e.g. &quot;women&quot;).</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Import Mode Tabs */}
          {items.length === 0 && (
            <div className="space-y-4">
              <div className="flex border-b border-admin-border">
                <button
                  onClick={() => setInputMode("file")}
                  className={`px-4 py-2 text-admin-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    inputMode === "file"
                      ? "border-admin-primary text-admin-primary"
                      : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
                  }`}
                >
                  Upload CSV File
                </button>
                <button
                  onClick={() => setInputMode("paste")}
                  className={`px-4 py-2 text-admin-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    inputMode === "paste"
                      ? "border-admin-primary text-admin-primary"
                      : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
                  }`}
                >
                  Paste CSV Text
                </button>
              </div>

              {inputMode === "file" ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-admin-lg p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? "border-admin-primary bg-admin-primary/5"
                      : "border-admin-border hover:border-admin-primary/60 bg-admin-content/20"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="p-3 rounded-full bg-admin-content border border-admin-border text-admin-text-primary">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-admin-sm font-semibold text-admin-text-primary">
                      Click to upload or drag & drop your CSV file
                    </p>
                    <p className="text-admin-xs text-admin-text-secondary mt-1">
                      Header row required. Clean empty template available via the Download Template button.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Name,Slug,Description,Image URL,Image Mobile URL,Banner URL,Sort Order,Is Active,SEO Title,SEO Description,Parent Slug&#10;Summer 2026,summer-2026,Curated summer luxury,https://...,,,0,true,,,"
                    className="w-full font-mono text-admin-xs bg-admin-content/50 border border-admin-border rounded-admin-md p-3 text-admin-text-primary placeholder:text-admin-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-admin-primary"
                  />
                  <button
                    onClick={() => parseCSV(rawText)}
                    disabled={!rawText.trim()}
                    className="px-4 py-2 bg-admin-primary text-admin-primary-on hover:bg-admin-primary/90 disabled:opacity-50 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md transition-colors"
                  >
                    Parse CSV Data
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-admin-md bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-admin-sm">
                <p className="font-semibold">Import Error</p>
                <p className="text-admin-xs opacity-90 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Import Result Summary */}
          {importResult && (
            <div className="p-4 rounded-admin-md bg-green-500/10 border border-green-500/30 space-y-2">
              <div className="flex items-center gap-2 text-green-600 font-semibold text-admin-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Bulk Import Completed Successfully</span>
              </div>
              <div className="flex items-center gap-4 text-admin-xs text-admin-text-primary pt-1">
                <span>
                  <strong>{importResult.created}</strong> created
                </span>
                <span>•</span>
                <span>
                  <strong>{importResult.updated}</strong> updated
                </span>
                {importResult.failed > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-500 font-semibold">
                      {importResult.failed} failed
                    </span>
                  </>
                )}
              </div>

              {importResult.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-500/20 space-y-1">
                  <p className="text-admin-xs font-bold text-red-500">Errors encountered:</p>
                  {importResult.errors.map((err, i) => (
                    <p key={i} className="text-[11px] text-red-500/90 font-mono">
                      Row #{err.row} ({err.name}): {err.error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Parsed Items Preview Table */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-admin-sm font-bold text-admin-text-primary font-display">
                    Preview Data ({items.length} collections)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600">
                    {validCount} ready
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500">
                      {invalidCount} invalid
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setItems([])
                      setRawText("")
                      setErrorMsg(null)
                      setImportResult(null)
                    }}
                    className="text-admin-xs text-admin-text-secondary hover:text-admin-text-primary px-2.5 py-1 rounded-admin-sm hover:bg-admin-content transition-colors uppercase tracking-wider font-semibold"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="border border-admin-border rounded-admin-md overflow-x-auto max-h-72">
                <table className="w-full text-left text-admin-xs">
                  <thead className="bg-admin-content/60 text-admin-text-secondary font-semibold uppercase tracking-wider border-b border-admin-border sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Slug</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Order</th>
                      <th className="py-2.5 px-3">Active</th>
                      <th className="py-2.5 px-3">Parent</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border/50">
                    {items.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-admin-content/30 transition-colors ${
                          !row.isValid ? "bg-red-500/5" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Valid</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500" title={row.validationError}>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{row.validationError}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-admin-text-primary max-w-[180px] truncate">
                          {row.name || <span className="text-red-500 italic">Empty</span>}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-admin-text-secondary max-w-[140px] truncate">
                          {row.slug}
                        </td>
                        <td className="py-2.5 px-3 text-admin-text-secondary max-w-[180px] truncate">
                          {row.description || "—"}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-admin-text-secondary">
                          {row.sortOrder}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              row.isActive
                                ? "bg-green-500/10 text-green-600"
                                : "bg-neutral-500/10 text-neutral-400"
                            }`}
                          >
                            {row.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-admin-text-secondary max-w-[100px] truncate">
                          {row.parentSlug || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleRemoveRow(row.id)}
                            className="p-1 text-admin-text-secondary hover:text-red-500 rounded transition-colors"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-admin-border bg-admin-content/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-admin-xs font-semibold uppercase tracking-wider text-admin-text-secondary hover:text-admin-text-primary rounded-admin-md transition-colors"
          >
            {importResult ? "Close" : "Cancel"}
          </button>

          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={handleImport}
                disabled={isProcessing || validCount === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-admin-primary text-admin-primary-on hover:bg-admin-primary/90 disabled:opacity-50 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md transition-all shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing Collections...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import {validCount} Collections</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
