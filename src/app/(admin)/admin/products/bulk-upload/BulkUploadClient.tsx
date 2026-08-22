"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { bulkUploadProductsAction, generateAiProductContentAction } from "@/actions/admin/bulk-products.actions"
import { getMediaLibraryItemsAction } from "@/actions/admin/media.actions"
import { SmartAutoGroupModal } from "@/components/admin/SmartAutoGroupModal"
import { BulkProductItemInput, BulkImportResult } from "@/services/admin.bulk-product.service"
import { AiContentEngine } from "@/domains/seo/engines/ai-content.engine"
import { cn } from "@/lib/utils"

export default function BulkUploadClient() {
  const router = useRouter()
  const [items, setItems] = useState<BulkProductItemInput[]>([])
  const [isProcessing, startTransition] = useTransition()
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false)
  const [smartModalImages, setSmartModalImages] = useState<{ url: string; title: string }[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)

  const handleOpenMediaGrouper = async () => {
    setIsLoadingMedia(true)
    setErrorMsg(null)
    const res = await getMediaLibraryItemsAction()
    if (res.success && res.data) {
      if (res.data.length === 0) {
        setErrorMsg("Media Library is empty. Please upload photos first.")
      } else {
        setSmartModalImages(res.data.map((i: any) => ({ url: i.url, title: i.title })))
        setIsSmartModalOpen(true)
      }
    } else {
      setErrorMsg(res.error || "Failed to fetch Media Library items.")
    }
    setIsLoadingMedia(false)
  }

  // 1. Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvHeader = "Product Name,Category,Price,Sizes,Original Price,Badge,Brand,Short Description,Description,SEO Title,SEO Description\n"
    const sampleRows = [
      `"Aurora Silk Wrap Dress","Dresses",150.00,"S:10, M:15, L:20, XL:5",200.00,"LIMITED EDITION","XINVORA","","","Aurora Silk Wrap Dress | Exclusive Luxury Dresses - XINVORA","Shop the Aurora Silk Wrap Dress crafted from 100% mulberry silk with signature drape and tailored fit."`,
      `"Free Size Kaftan Dress","Dresses",120.00,"Free Size (Fits XS-M):25",,"NEW","XINVORA","","","Free Size Kaftan Dress | Contemporary Bohemian Fashion - XINVORA","Discover the Free Size Kaftan Dress in premium breathable linen for effortless luxury styling."`,
      `"Boutique Kimono Dress","Dresses",160.00,"XS-M:1",,,"XINVORA","","","Boutique Kimono Dress | Artisan Evening Wear - XINVORA","Handcrafted Kimono Dress with sculptural silhouette and bespoke embroidery detailing."`,
      `"Classic Cotton Shirt","Tops",85.00,"S:10, M:10, L:10",100.00,,"XINVORA","","","Classic Cotton Shirt | Premium Tops Collection - XINVORA","Elevate your everyday wardrobe with our crisp tailored Classic Cotton Shirt in pure organic cotton."`
    ].join("\n")

    const blob = new Blob([csvHeader + sampleRows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "xinvora_bulk_products_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 2. Parse CSV Text into Items
  const parseCSVText = (text: string) => {
    const lines: string[] = []
    let currentLine = ""
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
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
      setErrorMsg("CSV file must contain a header row and at least 1 product row.")
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

    const headers = parseLineToCells(lines[0]).map((h) => h.toLowerCase().trim())

    const nameIdx = headers.findIndex((h) => h.includes("name") || h.includes("title"))
    const catIdx = headers.findIndex((h) => h.includes("category") || h.includes("cat"))
    const priceIdx = headers.findIndex((h) => h.includes("price") && !h.includes("original") && !h.includes("compare"))
    const origPriceIdx = headers.findIndex((h) => h.includes("original") || h.includes("compare"))
    const sizesIdx = headers.findIndex((h) => h.includes("size"))
    const badgeIdx = headers.findIndex((h) => h.includes("badge") || h.includes("tag"))
    const brandIdx = headers.findIndex((h) => h.includes("brand"))
    const shortDescIdx = headers.findIndex((h) => h.includes("short"))
    const descIdx = headers.findIndex((h) => h.includes("description") && !h.includes("short") && !h.includes("seo"))
    const seoTitleIdx = headers.findIndex((h) => h.includes("seo title") || h.includes("meta title") || h.includes("seo_title") || h === "seo" || h === "title tag")
    const seoDescIdx = headers.findIndex((h) => h.includes("seo desc") || h.includes("meta desc") || h.includes("seo_description") || h.includes("meta description"))

    const parsedItems: BulkProductItemInput[] = []

    for (let i = 1; i < lines.length; i++) {
      const cells = parseLineToCells(lines[i])
      if (cells.length === 0 || cells.every((c) => !c)) continue

      const name = nameIdx !== -1 ? cells[nameIdx] || "" : cells[0] || ""
      const categoryName = catIdx !== -1 ? cells[catIdx] || "" : cells[1] || ""
      const basePrice = priceIdx !== -1 ? cells[priceIdx] || "0" : cells[2] || "0"
      const compareAtPrice = origPriceIdx !== -1 ? cells[origPriceIdx] || null : null
      const sizes = sizesIdx !== -1 ? cells[sizesIdx] || null : null
      const badge = badgeIdx !== -1 ? cells[badgeIdx] || null : null
      const brandName = brandIdx !== -1 ? cells[brandIdx] || null : null
      const shortDescription = shortDescIdx !== -1 ? cells[shortDescIdx] || null : null
      const description = descIdx !== -1 ? cells[descIdx] || null : null
      const seoTitle = seoTitleIdx !== -1 ? cells[seoTitleIdx] || null : null
      const seoDescription = seoDescIdx !== -1 ? cells[seoDescIdx] || null : null

      if (name) {
        // Auto-generate instant SEO title & description if not provided in CSV
        const aiFallback = AiContentEngine.generateContent(name, categoryName || "Apparel")

        parsedItems.push({
          name,
          categoryName: categoryName || "Apparel",
          basePrice: basePrice || "0",
          compareAtPrice,
          sizes,
          badge,
          brandName,
          shortDescription: shortDescription || aiFallback.shortDescription,
          description: description || aiFallback.description,
          seoTitle: seoTitle || aiFallback.seoTitle,
          seoDescription: seoDescription || aiFallback.seoDescription,
          status: "DRAFT"
        })
      }
    }

    if (parsedItems.length === 0) {
      setErrorMsg("No valid product rows could be read from the file.")
      return
    }

    setErrorMsg(null)
    setItems(parsedItems)
  }

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      setErrorMsg("Please upload a .csv file.")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        parseCSVText(content)
      }
    }
    reader.readAsText(file)
  }

  // 3. Auto-Fill AI Content for all rows
  const handleAutoFillAi = async () => {
    if (items.length === 0) return
    setIsAutoFilling(true)
    setErrorMsg(null)

    const payload = items.map((it) => ({
      name: it.name,
      categoryName: it.categoryName
    }))

    const res = await generateAiProductContentAction(payload)
    if (res.success && res.data) {
      const updated = items.map((item, idx) => {
        const ai = res.data[idx]
        if (!ai) return item
        return {
          ...item,
          shortDescription: item.shortDescription && item.shortDescription.length >= 30 ? item.shortDescription : ai.shortDescription,
          description: item.description || ai.description,
          details: item.details || ai.details,
          careGuide: item.careGuide || ai.careGuide,
          sizeGuide: item.sizeGuide || ai.sizeGuide,
          virtualTryonPrompt: item.virtualTryonPrompt || ai.virtualTryonPrompt,
          seoTitle: item.seoTitle || ai.seoTitle,
          seoDescription: item.seoDescription || ai.seoDescription
        }
      })
      setItems(updated)
    } else {
      setErrorMsg(res.error || "Failed to auto-generate AI content.")
    }
    setIsAutoFilling(false)
  }

  // 4. Submit Bulk Products as Drafts
  const handleImportDrafts = () => {
    if (items.length === 0) return
    setErrorMsg(null)
    setImportResult(null)

    startTransition(async () => {
      const res = await bulkUploadProductsAction(items)
      if (res.success && res.data) {
        setImportResult(res.data)
      } else {
        setErrorMsg(res.error || "Failed to process bulk upload.")
      }
    })
  }

  // Generate AI SEO and content for a single row
  const handleGenerateRowAi = (index: number) => {
    const item = items[index]
    if (!item.name.trim()) {
      alert("Please enter a product name first.")
      return
    }
    const ai = AiContentEngine.generateContent(item.name, item.categoryName || "Apparel")
    setItems((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index],
        shortDescription: ai.shortDescription,
        description: ai.description,
        seoTitle: ai.seoTitle,
        seoDescription: ai.seoDescription,
      }
      return next
    })
  }

  // Row input field changes
  const updateItemField = (index: number, field: keyof BulkProductItemInput, value: any) => {
    setItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* ── Smart Auto-Group Modal ── */}
      <SmartAutoGroupModal
        isOpen={isSmartModalOpen}
        onClose={() => setIsSmartModalOpen(false)}
        inputImages={smartModalImages}
        onImportComplete={() => {
          router.push("/admin/products")
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
            Bulk Product Import & Smart AI Photo Grouper
          </h1>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Import products via CSV or use <span className="font-bold text-purple-600">AI Smart Photo Auto-Grouper</span> to group photos into dresses automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenMediaGrouper}
            disabled={isLoadingMedia}
            className="px-4 py-2 bg-purple-600 text-white text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <span>✨</span>
            {isLoadingMedia ? "Loading Library..." : "AI Auto-Group Photos"}
          </button>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 border border-admin-border text-admin-text-primary hover:bg-admin-content-hover text-admin-xs font-bold uppercase tracking-wider rounded-admin-md transition-colors"
          >
            ↓ Download CSV Template
          </button>
          <a
            href="/admin/products"
            className="px-3.5 py-2 border border-admin-border text-admin-text-secondary hover:text-admin-text-primary text-admin-xs font-bold uppercase tracking-wider rounded-admin-md transition-colors"
          >
            ← Back to Products
          </a>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-admin-status-danger-bg/30 border border-admin-status-danger-text/40 text-admin-status-danger-text text-admin-sm rounded-admin-md font-medium">
          {errorMsg}
        </div>
      )}

      {/* Import Result Banner */}
      {importResult && (
        <div className="p-6 bg-admin-surface border border-admin-status-success-text/40 rounded-admin-lg space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-admin-base font-bold text-admin-status-success-text flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Bulk Import Completed Successfully!
              </h3>
              <p className="text-admin-xs text-admin-text-secondary mt-1">
                {importResult.succeeded} of {importResult.total} products imported as DRAFT.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="px-4 py-2 bg-admin-primary text-admin-primary-on font-bold text-admin-xs uppercase tracking-wider rounded-admin-md hover:bg-admin-primary/90 transition-colors"
            >
              View Draft Products →
            </button>
          </div>

          {importResult.errors.length > 0 && (
            <div className="border-t border-admin-border pt-3 space-y-1">
              <h4 className="text-admin-xs font-bold text-admin-status-danger-text uppercase">
                Import Errors ({importResult.errors.length}):
              </h4>
              <ul className="text-admin-xs text-admin-text-secondary space-y-1 max-h-32 overflow-y-auto">
                {importResult.errors.map((err, idx) => (
                  <li key={idx} className="font-mono">
                    Row {err.row} ({err.name}): {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* File Dropzone */}
      {items.length === 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0])
            }
          }}
          className={cn(
            "border-2 border-dashed rounded-admin-xl p-12 text-center transition-all bg-admin-surface cursor-pointer flex flex-col items-center justify-center min-h-[280px]",
            isDragging ? "border-admin-primary bg-admin-primary/5" : "border-admin-border hover:border-admin-border-strong"
          )}
        >
          <div className="w-14 h-14 rounded-full bg-admin-content border border-admin-border flex items-center justify-center text-admin-text-primary text-2xl mb-4 shadow-xs">
            📄
          </div>
          <h3 className="text-admin-base font-bold text-admin-text-primary">
            Drag and Drop your CSV File Here
          </h3>
          <p className="text-admin-xs text-admin-text-secondary mt-1 max-w-md">
            Upload your CSV file containing Product Name, Category, Price, and Sizes. We will auto-fill descriptions, care guides, and SEO metadata automatically!
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <label className="px-6 py-2.5 bg-admin-primary text-admin-primary-on text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-admin-primary/95 transition-colors cursor-pointer shadow-xs">
              Select CSV File
              <input
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0])
                  }
                }}
              />
            </label>

            <span className="text-admin-xs font-bold text-admin-text-tertiary uppercase">OR</span>

            <button
              type="button"
              onClick={handleOpenMediaGrouper}
              disabled={isLoadingMedia}
              className="px-6 py-2.5 bg-purple-600 text-white text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <span>✨</span>
              Auto-Group Photos from Media Library
            </button>
          </div>
        </div>
      )}

      {/* Interactive Review Table */}
      {items.length > 0 && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-admin-xs font-bold uppercase tracking-wider text-admin-text-primary bg-admin-content border border-admin-border px-3 py-1.5 rounded-admin-md">
                {items.length} Products Loaded
              </span>
              <button
                type="button"
                onClick={handleAutoFillAi}
                disabled={isAutoFilling || isProcessing}
                className="px-4 py-2 bg-purple-600 text-white text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span>✨</span>
                {isAutoFilling ? "Auto-Filling AI Content..." : "Auto-Fill AI Descriptions & SEO"}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setItems([])}
                disabled={isProcessing}
                className="px-3.5 py-2 text-admin-text-secondary hover:text-admin-text-primary text-admin-xs font-semibold uppercase tracking-wider"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={handleImportDrafts}
                disabled={isProcessing || isAutoFilling}
                className="px-6 py-2 bg-emerald-600 text-white text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isProcessing ? "Importing Products..." : `Import ${items.length} Products as DRAFT`}
              </button>
            </div>
          </div>

          {/* Spreadsheet Table */}
          <div className="bg-admin-surface border border-admin-border rounded-admin-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-admin-xs border-collapse">
                <thead className="sticky top-0 bg-admin-content border-b border-admin-border font-bold uppercase tracking-wider text-admin-text-secondary z-10">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3 min-w-[170px]">Product Name *</th>
                    <th className="p-3 min-w-[110px]">Category *</th>
                    <th className="p-3 w-24">Price (NPR) *</th>
                    <th className="p-3 min-w-[140px]">Sizes & Stock</th>
                    <th className="p-3 min-w-[180px]">Short Description</th>
                    <th className="p-3 min-w-[170px]">SEO Meta Title</th>
                    <th className="p-3 min-w-[200px]">SEO Meta Description</th>
                    <th className="p-3 w-20 text-center">AI SEO</th>
                    <th className="p-3 w-16 text-center">Status</th>
                    <th className="p-3 w-10 text-center">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/60">
                  {items.map((item, idx) => {
                    const isValid = item.name.trim() && item.categoryName.trim() && Number(item.basePrice) > 0
                    return (
                      <tr
                        key={idx}
                        className={cn(
                          "hover:bg-admin-content-hover/30 transition-colors",
                          !isValid ? "bg-red-500/5" : ""
                        )}
                      >
                        <td className="p-3 font-mono text-center text-admin-text-secondary">{idx + 1}</td>

                        {/* Name */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItemField(idx, "name", e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-admin-content border border-admin-border rounded-admin-sm text-admin-text-primary font-medium focus:outline-none focus:border-admin-border-strong"
                          />
                        </td>

                        {/* Category */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.categoryName}
                            onChange={(e) => updateItemField(idx, "categoryName", e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-admin-content border border-admin-border rounded-admin-sm text-admin-text-primary focus:outline-none focus:border-admin-border-strong"
                          />
                        </td>

                        {/* Base Price */}
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.basePrice}
                            onChange={(e) => updateItemField(idx, "basePrice", e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-admin-content border border-admin-border rounded-admin-sm text-admin-text-primary font-mono focus:outline-none focus:border-admin-border-strong"
                          />
                        </td>

                        {/* Sizes */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.sizes || ""}
                            onChange={(e) => updateItemField(idx, "sizes", e.target.value)}
                            placeholder="e.g. S:10, M:15 or Free Size:1"
                            className="w-full px-2.5 py-1.5 bg-admin-content border border-admin-border rounded-admin-sm text-admin-text-primary text-[11px] font-mono focus:outline-none focus:border-admin-border-strong"
                          />
                        </td>

                        {/* Short Description */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.shortDescription || ""}
                            onChange={(e) => updateItemField(idx, "shortDescription", e.target.value)}
                            placeholder="Auto-generated if left blank"
                            className="w-full px-2.5 py-1.5 bg-admin-content border border-admin-border rounded-admin-sm text-admin-text-secondary text-[11px] focus:outline-none focus:border-admin-border-strong truncate"
                          />
                        </td>

                        {/* SEO Title */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.seoTitle || ""}
                            onChange={(e) => updateItemField(idx, "seoTitle", e.target.value)}
                            placeholder="Auto-generated SEO Title"
                            className="w-full px-2.5 py-1.5 bg-admin-content border border-admin-border rounded-admin-sm text-admin-text-secondary text-[11px] focus:outline-none focus:border-admin-border-strong truncate"
                          />
                        </td>

                        {/* SEO Description */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.seoDescription || ""}
                            onChange={(e) => updateItemField(idx, "seoDescription", e.target.value)}
                            placeholder="Auto-generated SEO Description"
                            className="w-full px-2.5 py-1.5 bg-admin-content border border-admin-border rounded-admin-sm text-admin-text-secondary text-[11px] focus:outline-none focus:border-admin-border-strong truncate"
                          />
                        </td>

                        {/* Per-row AI Generate Button */}
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleGenerateRowAi(idx)}
                            className="px-2.5 py-1 bg-purple-600/10 hover:bg-purple-600 text-purple-600 hover:text-white border border-purple-600/30 rounded-admin-sm text-[10px] font-bold uppercase transition-colors"
                            title="Auto-generate AI Description and SEO for this row"
                          >
                            ✨ AI
                          </button>
                        </td>

                        {/* Status */}
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase rounded-sm">
                            DRAFT
                          </span>
                        </td>

                        {/* Action */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-admin-text-secondary hover:text-red-500 font-bold transition-colors"
                            title="Remove row"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
