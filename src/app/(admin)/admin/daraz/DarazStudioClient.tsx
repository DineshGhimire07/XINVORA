"use client"

import React, { useState, useEffect, useTransition, useMemo, useRef } from "react"
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Lock,
  FolderTree,
  FileText,
  Copy,
  Check,
  Search,
  Database,
  ShieldCheck,
  Unplug,
  KeyRound,
  Info,
  Sparkles,
  PlayCircle,
  Code2,
  PackageCheck,
  ListChecks,
  Upload,
  FolderOpen,
  XCircle,
  Loader2,
} from "lucide-react"
import {
  startDarazAuthAction,
  disconnectDarazAction,
  fetchCategoryTreeAction,
  fetchCategoryAttributesAction,
  exchangeDarazCodeAction,
  simulateListingSubmissionAction,
  refreshDarazQcAction,
  getDarazSubmissionsAction,
  processWebFolderBatchAction,
} from "@/actions/admin/daraz.actions"
import type { DarazConnectionStatus } from "@/services/daraz.service"
import type { DarazCategoryNode, DarazAttributeItem } from "@/lib/daraz/client"

interface DarazStudioClientProps {
  initialStatus: DarazConnectionStatus
  initialLogs: any[]
  initialTemplates: any[]
  initialSubmissions?: any[]
  initialQueueJobs?: any[]
}

export function DarazStudioClient({
  initialStatus,
  initialLogs,
  initialTemplates,
  initialSubmissions = [],
  initialQueueJobs = [],
}: DarazStudioClientProps) {
  const [status, setStatus] = useState<DarazConnectionStatus>(initialStatus)
  const [logs] = useState<any[]>(initialLogs)
  const [templates] = useState<any[]>(initialTemplates)
  const [submissions, setSubmissions] = useState<any[]>(initialSubmissions)
  const [refreshingQc, setRefreshingQc] = useState(false)
  const [qcMessage, setQcMessage] = useState<string | null>(null)

  // Web Folder Ingestor state
  const [ingestorFiles, setIngestorFiles] = useState<Array<{ folderName: string; markdownContent: string; images: Array<{ filename: string; base64: string }> }>>([])
  const [ingestorRunning, setIngestorRunning] = useState(false)
  const [ingestorResults, setIngestorResults] = useState<any[]>([])
  const [ingestorError, setIngestorError] = useState<string | null>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<"connection" | "categories" | "demo" | "submissions" | "ingestor" | "logs">("connection")
  const [isPending, startTransition] = useTransition()
  const [authError, setAuthError] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—"
    if (!mounted) return new Date(dateStr).toISOString().slice(0, 10)
    return new Date(dateStr).toLocaleString()
  }

  // Manual code exchange state
  const [manualInput, setManualInput] = useState("")
  const [exchangingCode, setExchangingCode] = useState(false)
  const [manualSuccess, setManualSuccess] = useState<string | null>(null)
  const [manualError, setManualError] = useState<string | null>(null)

  // Category Tree State
  const [categoryTree, setCategoryTree] = useState<DarazCategoryNode[]>([])
  const [categorySearch, setCategorySearch] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL")
  const [fetchingTree, setFetchingTree] = useState(false)
  const [treeError, setTreeError] = useState<string | null>(null)

  // Attribute Inspection State
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null)
  const [attributes, setAttributes] = useState<DarazAttributeItem[]>([])
  const [fetchingAttrs, setFetchingAttrs] = useState(false)
  const [attrsError, setAttrsError] = useState<string | null>(null)
  const [isCachedAttrs, setIsCachedAttrs] = useState(false)

  const callbackUrl = "https://xinvora.com.np/daraz/callback"

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(callbackUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleConnect = () => {
    setAuthError(null)
    startTransition(async () => {
      const res = await startDarazAuthAction()
      if (res.success && res.url) {
        window.location.href = res.url
      } else {
        setAuthError(res.error || "Failed to start Daraz authentication.")
      }
    })
  }

  const handleDisconnect = () => {
    if (!confirm("Are you sure you want to disconnect your Daraz store?")) return
    startTransition(async () => {
      const res = await disconnectDarazAction()
      if (res.success) {
        setStatus({
          ...status,
          isConnected: false,
          account: null,
          sellerId: null,
          expiresAt: null,
        })
      }
    })
  }

  const handleManualExchange = async () => {
    if (!manualInput.trim()) return
    setExchangingCode(true)
    setManualError(null)
    setManualSuccess(null)
    try {
      const res = await exchangeDarazCodeAction(manualInput.trim())
      if (res.success) {
        setManualSuccess("Successfully authorized! Updating connection status...")
        setTimeout(() => {
          window.location.reload()
        }, 1200)
      } else {
        setManualError(res.error || "Failed to exchange authorization code.")
      }
    } catch (err: any) {
      setManualError(err.message || "An unexpected error occurred.")
    } finally {
      setExchangingCode(false)
    }
  }

  // Demo / Simulation State
  const defaultSampleMd = `---
product_id: PRODUCT_001
title: "XINVORA Vintage Cottagecore Ivory Floral Maxi Dress"
category_id: 1740
brand: "XINVORA"
seller_sku: "XIN-DRS-001"
price: 1349
special_price: 1199
stock: 12
color: "Ivory"
size: "Free Size"
fabric: "Linen"

highlights:
  - Premium breathable pure linen blend fabric
  - Elegant ruched bodice with adjustable tie back
  - Designed for warm weather styling in Nepal

package:
  weight: 0.35
  length: 30
  width: 25
  height: 5
  content: "1x Maxi Dress, 1x Care Tag"
---

Experience timeless cottagecore elegance with our handcrafted maxi dress. Tailored from a breathable linen blend, featuring subtle floral detailing and a flattering flowing tiered silhouette.`

  const [demoMarkdown, setDemoMarkdown] = useState(defaultSampleMd)
  const [demoCatId, setDemoCatId] = useState("1740")
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoResult, setDemoResult] = useState<any>(null)
  const [demoCopiedXml, setDemoCopiedXml] = useState(false)

  const handleRunDemo = async () => {
    setDemoLoading(true)
    try {
      const res = await simulateListingSubmissionAction({
        categoryId: demoCatId,
        markdown: demoMarkdown,
      })
      if (res.success) {
        setDemoResult(res.data)
      } else {
        alert(res.error || "Simulation failed.")
      }
    } catch (err: any) {
      alert(err.message || "Simulation failed.")
    } finally {
      setDemoLoading(false)
    }
  }

  const handleRefreshQc = async () => {
    setRefreshingQc(true)
    setQcMessage(null)
    try {
      const res = await refreshDarazQcAction()
      if (res.success) {
        setQcMessage(`QC refresh complete: checked ${res.count || 0} items.`)
        const updated = await getDarazSubmissionsAction()
        if (updated.success && updated.data) {
          setSubmissions(updated.data)
        }
      } else {
        setQcMessage(res.error || "Failed to refresh QC.")
      }
    } catch (err: any) {
      setQcMessage(err.message || "An error occurred.")
    } finally {
      setRefreshingQc(false)
    }
  }

  const handleFolderPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    const folderMap: Record<string, { markdownContent?: string; images: Array<{ filename: string; base64: string }> }> = {}

    await Promise.all(
      Array.from(fileList).map(async (file) => {
        const parts = file.webkitRelativePath.split("/")
        const folderName = parts[0]
        const fileName = parts[parts.length - 1]
        if (!folderMap[folderName]) folderMap[folderName] = { images: [] }

        if (fileName === "listing.md") {
          const text = await file.text()
          folderMap[folderName].markdownContent = text
        } else if (/\.(jpg|jpeg|png|webp)$/i.test(fileName)) {
          const buf = await file.arrayBuffer()
          const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
          folderMap[folderName].images.push({ filename: fileName, base64 })
        }
      })
    )

    const items = Object.entries(folderMap)
      .filter(([, v]) => v.markdownContent)
      .map(([folderName, v]) => ({
        folderName,
        markdownContent: v.markdownContent!,
        images: v.images,
      }))

    setIngestorFiles(items)
    setIngestorResults([])
    setIngestorError(null)
    if (folderInputRef.current) folderInputRef.current.value = ""
  }

  const handleRunIngestor = async () => {
    if (ingestorFiles.length === 0) return
    setIngestorRunning(true)
    setIngestorError(null)
    setIngestorResults([])
    try {
      const res = await processWebFolderBatchAction(ingestorFiles)
      if (res.success && res.results) {
        setIngestorResults(res.results)
        const updated = await getDarazSubmissionsAction()
        if (updated.success && updated.data) setSubmissions(updated.data)
      } else {
        setIngestorError((res as any).error || "Batch failed.")
      }
    } catch (err: any) {
      setIngestorError(err.message || "Unexpected error during batch.")
    } finally {
      setIngestorRunning(false)
    }
  }

  const handleFetchCategories = async () => {
    setFetchingTree(true)
    setTreeError(null)
    try {
      const res = await fetchCategoryTreeAction()
      if (res.success && res.data) {
        setCategoryTree(res.data)
      } else {
        setTreeError(res.error || "Failed to fetch categories.")
      }
    } catch (err: any) {
      setTreeError(err.message || "An unexpected error occurred.")
    } finally {
      setFetchingTree(false)
    }
  }

  const handleInspectCategory = async (catId: number | string, catName: string) => {
    setSelectedCategory({ id: String(catId), name: catName })
    setFetchingAttrs(true)
    setAttrsError(null)
    setAttributes([])

    try {
      const res = await fetchCategoryAttributesAction(catId)
      if (res.success && res.data) {
        setAttributes((res.data.attributes as DarazAttributeItem[]) || [])
        setIsCachedAttrs(!!res.data.cached)
      } else {
        setAttrsError(res.error || "Failed to load attributes.")
      }
    } catch (err: any) {
      setAttrsError(err.message || "Failed to load category attributes.")
    } finally {
      setFetchingAttrs(false)
    }
  }

  // Flatten category tree preserving department and hierarchy path
  const flattenLeaves = (
    nodes: DarazCategoryNode[],
    parentPath = "",
    rootDept = ""
  ): Array<{ id: number | string; name: string; path: string; rootDept: string; leaf: boolean }> => {
    let list: Array<{ id: number | string; name: string; path: string; rootDept: string; leaf: boolean }> = []
    for (const node of nodes) {
      const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name
      const dept = rootDept || node.name
      if (node.leaf) {
        list.push({ id: node.category_id, name: node.name, path: currentPath, rootDept: dept, leaf: true })
      }
      if (node.children && node.children.length > 0) {
        list = list.concat(flattenLeaves(node.children, currentPath, dept))
      }
    }
    return list
  }

  const rootDepartments = useMemo(() => {
    return categoryTree.map((c) => ({ id: c.category_id, name: c.name }))
  }, [categoryTree])

  const allLeaves = useMemo(() => {
    return flattenLeaves(categoryTree)
  }, [categoryTree])

  const filteredCategories = useMemo(() => {
    let list = allLeaves
    if (selectedDepartment !== "ALL") {
      list = list.filter((c) => c.rootDept === selectedDepartment)
    }
    if (categorySearch.trim()) {
      const q = categorySearch.toLowerCase().trim()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.path.toLowerCase().includes(q) ||
          String(c.id).includes(q)
      )
    }
    return list.slice(0, 300)
  }, [allLeaves, selectedDepartment, categorySearch])

  return (
    <div className="space-y-6">
      {/* Phase 2 Safety Banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-900 text-sm flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Phase 2 Operational Mode:</span> Daraz Nepal API Client, HMAC-SHA256 signer, AES-256-GCM token vault, and Category Discovery are active. Live product creation is currently safe-locked until batch queue verification.
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-admin-border gap-2">
        <button
          onClick={() => setActiveTab("connection")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "connection"
              ? "border-orange-600 text-orange-600 font-semibold"
              : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Store Connection & OAuth
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "categories"
              ? "border-orange-600 text-orange-600 font-semibold"
              : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Category Discovery & Attributes
        </button>

        <button
          onClick={() => {
            setActiveTab("demo")
            if (!demoResult) handleRunDemo()
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "demo"
              ? "border-orange-600 text-orange-600 font-semibold"
              : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          <Sparkles className="w-4 h-4 text-orange-500" />
          Listing Simulator (Live Demo)
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "submissions"
              ? "border-orange-600 text-orange-600 font-semibold"
              : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          <ListChecks className="w-4 h-4" />
          Live Listings &amp; QC Status ({submissions.length})
        </button>

        <button
          onClick={() => setActiveTab("ingestor")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "ingestor"
              ? "border-orange-600 text-orange-600 font-semibold"
              : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          <Upload className="w-4 h-4" />
          Web Folder Upload
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "logs"
              ? "border-orange-600 text-orange-600 font-semibold"
              : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          <FileText className="w-4 h-4" />
          API Audit Logs ({logs.length})
        </button>
      </div>

      {/* TAB 1: CONNECTION */}
      {activeTab === "connection" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Status Card */}
          <div className="lg:col-span-2 bg-admin-card rounded-xl border border-admin-border p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-admin-border pb-4">
              <div>
                <h2 className="text-base font-semibold text-admin-text-primary">
                  Daraz Store Linkage
                </h2>
                <p className="text-xs text-admin-text-secondary mt-0.5">
                  Secure OAuth 2.0 connection to Daraz Open Platform (Nepal)
                </p>
              </div>

              {status.isConnected && !status.isExpired ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
                </span>
              ) : status.isConnected && status.isExpired ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  Token Expired
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Not Connected
                </span>
              )}
            </div>

            {authError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div>{authError}</div>
              </div>
            )}

            {/* Connection Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-admin-bg/50 border border-admin-border space-y-1">
                <span className="text-admin-text-secondary uppercase font-semibold text-[10px] tracking-wider">
                  Store / Account
                </span>
                <div className="font-medium text-admin-text-primary text-sm">
                  {status.account || "No account linked"}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-admin-bg/50 border border-admin-border space-y-1">
                <span className="text-admin-text-secondary uppercase font-semibold text-[10px] tracking-wider">
                  Seller ID
                </span>
                <div className="font-mono text-admin-text-primary text-sm">
                  {status.sellerId || "—"}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-admin-bg/50 border border-admin-border space-y-1">
                <span className="text-admin-text-secondary uppercase font-semibold text-[10px] tracking-wider">
                  Access Token Expiry
                </span>
                <div className="font-mono text-admin-text-primary" suppressHydrationWarning>
                  {formatDate(status.expiresAt)}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-admin-bg/50 border border-admin-border space-y-1">
                <span className="text-admin-text-secondary uppercase font-semibold text-[10px] tracking-wider">
                  Refresh Token Expiry
                </span>
                <div className="font-mono text-admin-text-primary" suppressHydrationWarning>
                  {formatDate(status.refreshExpiresAt)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleConnect}
                disabled={isPending || !status.hasAppCredentials}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs tracking-wide shadow-sm disabled:opacity-50 transition-colors"
              >
                {isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                {status.isConnected ? "Re-authorize Store" : "Connect with Daraz"}
              </button>

              {status.isConnected && (
                <button
                  onClick={handleDisconnect}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors"
                >
                  <Unplug className="w-4 h-4" />
                  Disconnect
                </button>
              )}
            </div>

            {!status.hasAppCredentials && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <strong>Credentials Required:</strong> Add <code>DARAZ_APP_KEY</code> and{" "}
                  <code>DARAZ_APP_SECRET</code> to your environment variables (.env.local or Vercel dashboard) before connecting.
                </div>
              </div>
            )}

            {/* Manual Callback / Code Exchange helper */}
            <div className="p-4 rounded-xl border border-dashed border-admin-border bg-admin-bg/40 space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-admin-text-primary flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-orange-600" />
                  Complete Authorization via Callback URL / Code
                </h4>
                <p className="text-[11px] text-admin-text-secondary mt-0.5 leading-relaxed">
                  When you authorized on Daraz, if your browser landed on <code className="text-admin-text-primary">https://xinvora.com.np/daraz/callback?code=...</code> (or showed 404 because production is not deployed yet), copy that URL or code from your address bar and paste it below:
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Paste URL (https://xinvora.com.np/daraz/callback?code=...) or code here..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-admin-border bg-admin-card text-admin-text-primary focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                />
                <button
                  onClick={handleManualExchange}
                  disabled={exchangingCode || !manualInput.trim()}
                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors shrink-0 flex items-center justify-center gap-1.5"
                >
                  {exchangingCode ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Complete Connection
                </button>
              </div>

              {manualSuccess && (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{manualSuccess}</span>
                </div>
              )}

              {manualError && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{manualError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Configuration & Security Card */}
          <div className="bg-admin-card rounded-xl border border-admin-border p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-semibold text-admin-text-primary flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-600" />
              Security & Endpoints
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-admin-text-secondary font-medium block mb-1">
                  Registered Callback URL
                </label>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-admin-bg border border-admin-border font-mono text-[11px] break-all">
                  <span>{callbackUrl}</span>
                  <button
                    onClick={handleCopyCallback}
                    className="ml-auto text-admin-text-secondary hover:text-admin-text-primary p-1 shrink-0"
                    title="Copy URL"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-admin-text-secondary mt-1">
                  Must exactly match the registered callback in Daraz Open Platform.
                </p>
              </div>

              <div>
                <label className="text-admin-text-secondary font-medium block mb-1">
                  API Gateway Endpoint
                </label>
                <div className="p-2 rounded-lg bg-admin-bg border border-admin-border font-mono text-[11px]">
                  https://api.daraz.com.np/rest
                </div>
              </div>

              <div className="pt-2 border-t border-admin-border space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>AES-256-GCM Token Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>CSRF State Nonce Validation</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>HMAC-SHA256 Signature Signer</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Auto-Refresh within 12h of Expiry</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY DISCOVERY */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="bg-admin-card rounded-xl border border-admin-border p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-admin-text-primary">
                  Daraz Category Hierarchy & Attribute Engine
                </h2>
                <p className="text-xs text-admin-text-secondary mt-0.5">
                  Fetch live category taxonomy and inspect required product listing attributes.
                </p>
              </div>

              <button
                onClick={handleFetchCategories}
                disabled={fetchingTree}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-admin-primary text-admin-primary-on hover:bg-admin-primary/90 text-xs font-semibold tracking-wide disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${fetchingTree ? "animate-spin" : ""}`} />
                {categoryTree.length > 0 ? "Refresh Categories" : "Fetch Category Tree"}
              </button>
            </div>

            {treeError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{treeError}</span>
              </div>
            )}

            {/* Department Shortcuts & Search */}
            {categoryTree.length > 0 && (
              <div className="space-y-3">
                {/* Department Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-admin-text-secondary font-medium mr-1 text-[11px]">Department:</span>
                  {[
                    { label: `All Departments (${allLeaves.length})`, value: "ALL" },
                    { label: "👗 Fashion", value: "Fashion" },
                    { label: "🛋️ Furniture & Decor", value: "Furniture & Decor" },
                    { label: "🍳 Kitchen & Dining", value: "Kitchen & Dining" },
                    { label: "🎨 Stationery & Craft", value: "Stationery & Craft" },
                    { label: "💄 Health & Beauty", value: "Health & Beauty" },
                    { label: "👜 Bags & Travel", value: "Bags and Travel" },
                  ].map((dept) => (
                    <button
                      key={dept.value}
                      onClick={() => {
                        setSelectedDepartment(dept.value)
                        setCategorySearch("")
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                        selectedDepartment === dept.value
                          ? "bg-orange-600 text-white font-semibold"
                          : "bg-admin-bg hover:bg-admin-border text-admin-text-primary border border-admin-border"
                      }`}
                    >
                      {dept.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {/* All 27 Departments Selector Dropdown */}
                  <select
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value)
                    }}
                    className="sm:w-64 px-3 py-2 text-xs rounded-lg border border-admin-border bg-admin-bg text-admin-text-primary focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                  >
                    <option value="ALL">All Departments ({allLeaves.length} categories)</option>
                    {rootDepartments.map((dept) => (
                      <option key={dept.name} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>

                  {/* Search Box */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-admin-text-secondary" />
                    <input
                      type="text"
                      placeholder={`Search across ${selectedDepartment === "ALL" ? "all 4,200+" : selectedDepartment} categories (e.g., dress, skirt, poster, mug, wall art)...`}
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-admin-border bg-admin-bg text-admin-text-primary focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category List */}
            <div className="bg-admin-card rounded-xl border border-admin-border p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-admin-border pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-admin-text-primary">
                    Leaf Categories ({filteredCategories.length})
                  </h3>
                  <span className="text-[11px] text-admin-text-secondary">
                    {selectedDepartment === "ALL" ? "All Departments" : selectedDepartment}
                    {categorySearch && ` • Matching "${categorySearch}"`}
                  </span>
                </div>
                <span className="text-[11px] text-admin-text-secondary">
                  Click to inspect required attributes
                </span>
              </div>

              {categoryTree.length === 0 && !fetchingTree ? (
                <div className="text-center py-12 text-admin-text-secondary text-xs">
                  <FolderTree className="w-8 h-8 mx-auto mb-2 text-admin-text-secondary/50" />
                  Click <strong>&quot;Fetch Category Tree&quot;</strong> above to load Daraz Nepal categories.
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto divide-y divide-admin-border/50 text-xs">
                  {filteredCategories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => handleInspectCategory(cat.id, cat.name)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                        selectedCategory?.id === String(cat.id)
                          ? "bg-orange-50 border border-orange-200 text-orange-950 font-medium"
                          : "hover:bg-admin-bg"
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-medium text-admin-text-primary">{cat.name}</div>
                        <div className="text-[11px] text-admin-text-secondary truncate">{cat.path}</div>
                      </div>
                      <span className="font-mono text-[10px] text-admin-text-secondary px-2 py-0.5 rounded bg-admin-bg shrink-0">
                        ID: {cat.id}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attribute Inspector Panel */}
            <div className="bg-admin-card rounded-xl border border-admin-border p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-admin-border pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-admin-text-primary">
                    Attribute Schema
                  </h3>
                  {selectedCategory && (
                    <p className="text-[11px] text-admin-text-secondary truncate">
                      {selectedCategory.name} (ID: {selectedCategory.id})
                    </p>
                  )}
                </div>

                {isCachedAttrs && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    <Database className="w-3 h-3" />
                    Cached Locally
                  </span>
                )}
              </div>

              {fetchingAttrs ? (
                <div className="py-12 text-center text-xs text-admin-text-secondary">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-600" />
                  Loading attributes from Daraz OpenAPI...
                </div>
              ) : attrsError ? (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
                  {attrsError}
                </div>
              ) : attributes.length === 0 ? (
                <div className="text-center py-12 text-admin-text-secondary text-xs">
                  Select any leaf category on the left to inspect its mandatory and optional attributes.
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto space-y-2.5 pr-1">
                  {attributes.map((attr) => (
                    <div
                      key={attr.id}
                      className="p-3 rounded-lg border border-admin-border bg-admin-bg/30 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-admin-text-primary">
                          {attr.label || attr.name}
                        </span>
                        {attr.is_mandatory === 1 ? (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                            Mandatory
                          </span>
                        ) : (
                          <span className="text-[10px] text-admin-text-secondary bg-admin-bg px-1.5 py-0.5 rounded">
                            Optional
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-admin-text-secondary">
                        <span>
                          Field Key: <code className="font-mono text-admin-text-primary">{attr.name}</code>
                        </span>
                        <span>•</span>
                        <span>Input: {attr.input_type}</span>
                        <span>•</span>
                        <span>Type: {attr.attribute_type}</span>
                      </div>

                      {attr.options && attr.options.length > 0 && (
                        <div className="pt-1 text-[10px] text-admin-text-secondary">
                          Options ({attr.options.length}):{" "}
                          {attr.options
                            .slice(0, 5)
                            .map((o) => o.name)
                            .join(", ")}
                          {attr.options.length > 5 && "..."}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEMO & SIMULATOR */}
      {activeTab === "demo" && (
        <div className="space-y-6">
          <div className="bg-admin-card rounded-xl border border-admin-border p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-admin-text-primary">
                    Product Folder & Listing Simulator (Live Demo)
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live Engine
                  </span>
                </div>
                <p className="text-xs text-admin-text-secondary mt-0.5">
                  Simulate reading a product folder (<code>listing.md</code> + product images), validating against Daraz Nepal&apos;s live attribute schema, and generating the official XML payload.
                </p>
              </div>

              <button
                onClick={handleRunDemo}
                disabled={demoLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs tracking-wide shadow-sm disabled:opacity-50 transition-colors"
              >
                {demoLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Run Live Simulation &amp; Validation
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Simulated Product Folder */}
            <div className="bg-admin-card rounded-xl border border-admin-border p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-admin-border pb-3">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-admin-text-primary">
                    Product Folder: XINVORA_PRODUCTS/PRODUCT_001/
                  </h3>
                </div>
                <span className="text-[11px] text-admin-text-secondary font-mono">
                  listing.md + 3 photos
                </span>
              </div>

              {/* Photos in Folder Preview */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-admin-text-secondary uppercase tracking-wider">
                  Detected Product Images (3 files)
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-admin-border bg-admin-bg/50 flex flex-col items-center justify-center text-center">
                    <span className="font-mono text-[11px] text-admin-text-primary font-medium">image_1.jpg</span>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Primary Cover</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-admin-border bg-admin-bg/50 flex flex-col items-center justify-center text-center">
                    <span className="font-mono text-[11px] text-admin-text-primary font-medium">image_2.jpg</span>
                    <span className="text-[10px] text-admin-text-secondary mt-0.5">Detail Shot</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-admin-border bg-admin-bg/50 flex flex-col items-center justify-center text-center">
                    <span className="font-mono text-[11px] text-admin-text-primary font-medium">image_3.jpg</span>
                    <span className="text-[10px] text-admin-text-secondary mt-0.5">Lifestyle</span>
                  </div>
                </div>
              </div>

              {/* Target Category Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-admin-text-secondary uppercase tracking-wider">
                  Target Daraz Leaf Category
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-admin-border bg-admin-bg/50 text-xs">
                  <span className="font-semibold text-admin-text-primary">Dresses</span>
                  <span className="font-mono text-[11px] text-admin-text-secondary ml-auto bg-admin-card px-2 py-0.5 rounded border border-admin-border">
                    ID: {demoCatId}
                  </span>
                </div>
              </div>

              {/* Editable listing.md */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-admin-text-secondary uppercase tracking-wider">
                    Folder listing.md (Editable)
                  </label>
                  <span className="text-[10px] text-admin-text-secondary">Edit values and re-run</span>
                </div>
                <textarea
                  rows={14}
                  value={demoMarkdown}
                  onChange={(e) => setDemoMarkdown(e.target.value)}
                  className="w-full font-mono text-[11px] p-3 rounded-lg border border-admin-border bg-admin-bg text-admin-text-primary focus:outline-none focus:ring-1 focus:ring-orange-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Right Column: Live Compilation & Official XML Preview */}
            <div className="bg-admin-card rounded-xl border border-admin-border p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-admin-border pb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-admin-text-primary">
                    Daraz Nepal API Compilation
                  </h3>
                </div>

                {demoResult && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(demoResult.xml)
                      setDemoCopiedXml(true)
                      setTimeout(() => setDemoCopiedXml(false), 2000)
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-admin-text-primary hover:text-orange-600 bg-admin-bg px-2.5 py-1 rounded border border-admin-border transition-colors"
                  >
                    {demoCopiedXml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {demoCopiedXml ? "Copied!" : "Copy XML"}
                  </button>
                )}
              </div>

              {demoLoading ? (
                <div className="py-20 text-center text-xs text-admin-text-secondary space-y-2">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-600" />
                  <p>Fetching live category attributes &amp; compiling XML...</p>
                </div>
              ) : demoResult ? (
                <div className="space-y-4 text-xs">
                  {/* Pre-flight Validation Box */}
                  <div
                    className={`p-3.5 rounded-lg border flex items-start gap-3 ${
                      demoResult.validation.valid
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-red-50 border-red-200 text-red-900"
                    }`}
                  >
                    {demoResult.validation.valid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-xs">
                        {demoResult.validation.valid
                          ? "Pre-Flight Validation: PASSED"
                          : "Pre-Flight Validation: FAILED"}
                      </div>
                      <p className="text-[11px] mt-0.5 text-opacity-90">
                        Evaluated against {demoResult.totalAttributes} live category attributes for Daraz Category {demoResult.categoryId} ({demoResult.categoryName}).
                      </p>
                      {demoResult.validation.errors && demoResult.validation.errors.length > 0 && (
                        <ul className="list-disc list-inside mt-2 text-[11px] text-red-700 space-y-1">
                          {demoResult.validation.errors.map((err: string, i: number) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Field Mapping Overview */}
                  <div className="p-3 rounded-lg border border-admin-border bg-admin-bg/40 space-y-2 text-[11px]">
                    <div className="font-semibold text-admin-text-primary text-xs flex items-center gap-1.5">
                      <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Automatic Attribute Mapping
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px]">
                      <div>title &rarr; &lt;name&gt;</div>
                      <div className="text-admin-text-secondary truncate">{demoResult.parsed.title}</div>
                      <div>fabric &rarr; &lt;Fabric_Type&gt;</div>
                      <div className="text-admin-text-secondary">{demoResult.parsed.fabric || "Linen"}</div>
                      <div>seller_sku &rarr; &lt;SellerSku&gt;</div>
                      <div className="text-admin-text-secondary">{demoResult.parsed.sellerSku}</div>
                      <div>price / special_price</div>
                      <div className="text-admin-text-secondary">NPR {demoResult.parsed.price} / {demoResult.parsed.specialPrice}</div>
                      <div>package.weight &rarr; &lt;package_weight&gt;</div>
                      <div className="text-admin-text-secondary">{demoResult.parsed.package.weight} kg</div>
                      <div>highlights &rarr; &lt;short_description&gt;</div>
                      <div className="text-admin-text-secondary">{demoResult.parsed.highlights?.length} bullet points</div>
                    </div>
                  </div>

                  {/* Official XML Code Box */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-admin-text-secondary uppercase tracking-wider flex items-center justify-between">
                      <span>Compiled Daraz /product/create XML Payload</span>
                      <span className="text-[10px] text-emerald-600 font-mono">100% Daraz OpenAPI Compliant</span>
                    </label>
                    <pre className="max-h-[300px] overflow-y-auto p-3.5 rounded-lg border border-admin-border bg-gray-950 text-emerald-400 font-mono text-[11px] leading-relaxed select-all">
                      {demoResult.xml}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-xs text-admin-text-secondary">
                  Click <strong>&quot;Run Live Simulation &amp; Validation&quot;</strong> above to compile the sample product.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE LISTINGS & QC STATUS */}
      {activeTab === "submissions" && (
        <div className="space-y-5">
          <div className="bg-admin-card rounded-xl border border-admin-border p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-admin-border pb-3">
              <div>
                <h3 className="text-sm font-semibold text-admin-text-primary flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-orange-500" />
                  Live Listings &amp; QC Review Status
                </h3>
                <p className="text-xs text-admin-text-secondary mt-0.5">
                  Products submitted to Daraz OpenAPI. QC status is polled from Daraz review servers.
                </p>
              </div>
              <button
                onClick={handleRefreshQc}
                disabled={refreshingQc}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {refreshingQc ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Refresh QC Status
              </button>
            </div>

            {qcMessage && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-blue-800 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                {qcMessage}
              </div>
            )}

            {submissions.length === 0 ? (
              <div className="py-16 text-center text-xs text-admin-text-secondary space-y-2">
                <PackageCheck className="w-10 h-10 mx-auto text-admin-text-secondary/40" />
                <p>No product submissions yet.</p>
                <p className="text-[11px]">Use the CLI worker (<code className="bg-admin-bg px-1 py-0.5 rounded">npm run daraz:worker</code>) or the Web Folder Upload tab to submit products.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-admin-border text-admin-text-secondary font-medium">
                      <th className="pb-2 pr-3">SKU</th>
                      <th className="pb-2 pr-3">Title</th>
                      <th className="pb-2 pr-3">Category</th>
                      <th className="pb-2 pr-3">Daraz Item ID</th>
                      <th className="pb-2 pr-3">Status</th>
                      <th className="pb-2 pr-3">QC</th>
                      <th className="pb-2">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border/40 font-mono">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-admin-bg/50">
                        <td className="py-2.5 pr-3 font-semibold text-admin-text-primary">{sub.sellerSku}</td>
                        <td className="py-2.5 pr-3 max-w-[160px] truncate text-admin-text-primary">{sub.title}</td>
                        <td className="py-2.5 pr-3 text-admin-text-secondary">{sub.darazCategoryId}</td>
                        <td className="py-2.5 pr-3 text-admin-text-secondary">{sub.darazItemId || "—"}</td>
                        <td className="py-2.5 pr-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.status === "QC_APPROVED" ? "bg-emerald-100 text-emerald-800"
                            : sub.status === "QC_REJECTED" ? "bg-red-100 text-red-800"
                            : sub.status === "SUBMITTED" ? "bg-blue-100 text-blue-800"
                            : sub.status === "PENDING_QC" ? "bg-amber-100 text-amber-800"
                            : sub.status === "FAILED" ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.qcStatus === "approved" ? "bg-emerald-100 text-emerald-800"
                            : sub.qcStatus === "rejected" ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-600"
                          }`}>
                            {sub.qcStatus || "pending"}
                          </span>
                        </td>
                        <td className="py-2.5 text-admin-text-secondary whitespace-nowrap" suppressHydrationWarning>
                          {formatDate(sub.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {submissions.some((s) => s.status === "QC_REJECTED" && s.qcReason) && (
              <div className="mt-4 space-y-2">
                <h4 className="text-xs font-semibold text-red-700 uppercase tracking-wider">QC Rejection Notes</h4>
                {submissions.filter((s) => s.qcReason).map((s) => (
                  <div key={s.id} className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                    <span className="font-semibold">{s.sellerSku}:</span> {s.qcReason}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: WEB FOLDER INGESTOR */}
      {activeTab === "ingestor" && (
        <div className="space-y-5">
          <div className="bg-admin-card rounded-xl border border-admin-border p-5 shadow-sm space-y-5">
            <div className="border-b border-admin-border pb-3">
              <h3 className="text-sm font-semibold text-admin-text-primary flex items-center gap-2">
                <Upload className="w-4 h-4 text-orange-500" />
                Web Folder Upload — Browser-Based Batch Ingestor
              </h3>
              <p className="text-xs text-admin-text-secondary mt-0.5">
                Select your <code className="bg-admin-bg px-1 rounded">XINVORA_PRODUCTS/</code> folder directly from your browser. Each sub-folder needs a <code className="bg-admin-bg px-1 rounded">listing.md</code> and at least one image.
              </p>
            </div>

            {/* How it works */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-900 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> How to Use</div>
              <ol className="list-decimal list-inside space-y-0.5 ml-1">
                <li>Organise products as: <code>XINVORA_PRODUCTS/PRODUCT_001/listing.md</code> + images</li>
                <li>Click <strong>Select Product Folder</strong> and choose your <code>XINVORA_PRODUCTS</code> folder</li>
                <li>Review the detected products below, then click <strong>Submit All to Daraz</strong></li>
              </ol>
            </div>

            {/* Hidden folder input */}
            <input
              ref={folderInputRef}
              type="file"
              // @ts-ignore – webkitdirectory is non-standard
              webkitdirectory="true"
              multiple
              className="hidden"
              onChange={handleFolderPick}
            />

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => folderInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-admin-bg border border-admin-border hover:border-orange-400 text-admin-text-primary text-sm font-medium rounded-lg transition-colors"
              >
                <FolderOpen className="w-4 h-4 text-orange-500" />
                Select Product Folder
              </button>

              {ingestorFiles.length > 0 && (
                <button
                  onClick={handleRunIngestor}
                  disabled={ingestorRunning}
                  className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {ingestorRunning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Submit All to Daraz ({ingestorFiles.length} products)
                </button>
              )}
            </div>

            {/* Detected Products Preview */}
            {ingestorFiles.length > 0 && ingestorResults.length === 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                  Detected Products ({ingestorFiles.length})
                </h4>
                <div className="divide-y divide-admin-border/40 border border-admin-border rounded-lg overflow-hidden">
                  {ingestorFiles.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 text-xs hover:bg-admin-bg/50">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="font-semibold text-admin-text-primary">{item.folderName}</span>
                        <span className="text-admin-text-secondary">({item.images.length} image{item.images.length !== 1 ? "s" : ""})</span>
                      </div>
                      <span className="text-admin-text-secondary text-[11px] font-mono">listing.md ✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ingestor Error */}
            {ingestorError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-800 text-xs flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                {ingestorError}
              </div>
            )}

            {/* Batch Results */}
            {ingestorResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                  Submission Results
                </h4>
                <div className="divide-y divide-admin-border/40 border border-admin-border rounded-lg overflow-hidden">
                  {ingestorResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 text-xs">
                      <div className="flex items-center gap-2">
                        {r.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span className="font-semibold text-admin-text-primary">{r.folderName}</span>
                      </div>
                      <div className="text-right">
                        {r.success ? (
                          <span className="text-emerald-700 font-mono">Item ID: {r.itemId}</span>
                        ) : (
                          <span className="text-red-700 max-w-xs truncate block">{r.error}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-admin-text-secondary">
                  ✅ {ingestorResults.filter((r) => r.success).length} succeeded &nbsp;|&nbsp;
                  ❌ {ingestorResults.filter((r) => !r.success).length} failed
                </div>
              </div>
            )}

            {ingestorFiles.length === 0 && ingestorResults.length === 0 && (
              <div className="py-12 text-center text-xs text-admin-text-secondary space-y-2">
                <FolderOpen className="w-10 h-10 mx-auto text-admin-text-secondary/40" />
                <p>No folder selected yet. Click <strong>Select Product Folder</strong> to begin.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === "logs" && (
        <div className="bg-admin-card rounded-xl border border-admin-border p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-admin-border pb-3">
            <div>
              <h3 className="text-sm font-semibold text-admin-text-primary">
                API Transaction & Audit Trail
              </h3>
              <p className="text-xs text-admin-text-secondary">
                Verifiable record of every request signed and sent to Daraz Open Platform.
              </p>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-admin-text-secondary">
              No audit logs recorded yet. Transactions will appear here as OAuth flows and category queries occur.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-admin-border text-admin-text-secondary font-medium">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Action / Path</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/40 font-mono">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-admin-bg/50">
                      <td className="py-2.5 text-admin-text-secondary whitespace-nowrap" suppressHydrationWarning>
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-2.5 text-admin-text-primary font-semibold">
                        {log.action}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {log.status} {log.statusCode ? `(${log.statusCode})` : ""}
                        </span>
                      </td>
                      <td className="py-2.5 text-admin-text-secondary text-[11px] max-w-xs truncate">
                        {log.errorMessage || JSON.stringify(log.responseBody || "")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
