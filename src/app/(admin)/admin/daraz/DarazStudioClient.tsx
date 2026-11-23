"use client"

import React, { useState, useEffect, useTransition } from "react"
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
} from "lucide-react"
import {
  startDarazAuthAction,
  disconnectDarazAction,
  fetchCategoryTreeAction,
  fetchCategoryAttributesAction,
  exchangeDarazCodeAction,
} from "@/actions/admin/daraz.actions"
import type { DarazConnectionStatus } from "@/services/daraz.service"
import type { DarazCategoryNode, DarazAttributeItem } from "@/lib/daraz/client"

interface DarazStudioClientProps {
  initialStatus: DarazConnectionStatus
  initialLogs: any[]
  initialTemplates: any[]
}

export function DarazStudioClient({
  initialStatus,
  initialLogs,
  initialTemplates,
}: DarazStudioClientProps) {
  const [status, setStatus] = useState<DarazConnectionStatus>(initialStatus)
  const [logs] = useState<any[]>(initialLogs)
  const [templates] = useState<any[]>(initialTemplates)

  const [activeTab, setActiveTab] = useState<"connection" | "categories" | "logs">("connection")
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

  // Flatten category tree for simple searching
  const flattenLeaves = (nodes: DarazCategoryNode[], parentPath = ""): Array<{ id: number | string; name: string; path: string; leaf: boolean }> => {
    let list: Array<{ id: number | string; name: string; path: string; leaf: boolean }> = []
    for (const node of nodes) {
      const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name
      if (node.leaf) {
        list.push({ id: node.category_id, name: node.name, path: currentPath, leaf: true })
      }
      if (node.children && node.children.length > 0) {
        list = list.concat(flattenLeaves(node.children, currentPath))
      }
    }
    return list
  }

  const flatCategories = flattenLeaves(categoryTree)
  const filteredCategories = categorySearch.trim()
    ? flatCategories.filter(
        (c) =>
          c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
          c.path.toLowerCase().includes(categorySearch.toLowerCase()) ||
          String(c.id).includes(categorySearch)
      )
    : flatCategories.slice(0, 50)

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

            {/* Search Box */}
            {categoryTree.length > 0 && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-admin-text-secondary" />
                <input
                  type="text"
                  placeholder="Search categories (e.g., Dress, Skirt, Poster, Home Decor)..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-admin-border bg-admin-bg text-admin-text-primary focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category List */}
            <div className="bg-admin-card rounded-xl border border-admin-border p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-admin-border pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-admin-text-primary">
                  Leaf Categories ({filteredCategories.length})
                </h3>
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

      {/* TAB 3: AUDIT LOGS */}
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
