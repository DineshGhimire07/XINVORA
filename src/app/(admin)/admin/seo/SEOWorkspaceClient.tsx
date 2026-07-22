"use client"

import React, { useState, useTransition } from "react"
import { SEOOverviewTab } from "./components/SEOOverviewTab"
import { SEOContentTab } from "./components/SEOContentTab"
import { SEOTechnicalTab } from "./components/SEOTechnicalTab"
import { SEOMonitoringTab } from "./components/SEOMonitoringTab"
import { SEOPerformanceTab } from "./components/SEOPerformanceTab"
import { SEORedirectsTab } from "./components/SEORedirectsTab"
import { SEOSearchConsoleTab } from "./components/SEOSearchConsoleTab"
import { SEOSettingsTab } from "./components/SEOSettingsTab"
import { SEOInspectorModal } from "./components/SEOInspectorModal"

import {
  runFullSiteAuditAction,
  bulkGenerateMetadataAction,
  createSEORedirectAction,
  deleteSEORedirectAction,
  saveSEOSettingsAction,
  getEntitySEOInspectionAction,
  getSEOContentEntitiesAction,
} from "@/actions/admin/seo.actions"

import {
  LayoutDashboard,
  FileText,
  Wrench,
  Activity,
  Gauge,
  ArrowRightLeft,
  Globe,
  Settings,
  RefreshCw,
} from "lucide-react"

import { toast } from "sonner"

interface SEOWorkspaceClientProps {
  initialOverview: any
  initialEntities: any[]
}

export function SEOWorkspaceClient({ initialOverview, initialEntities }: SEOWorkspaceClientProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "content" | "technical" | "monitoring" | "performance" | "redirects" | "search-console" | "settings"
  >("overview")

  const [isPending, startTransition] = useTransition()
  const [overview, setOverview] = useState(initialOverview)
  const [entities, setEntities] = useState(initialEntities)
  const [redirects, setRedirects] = useState<any[]>(initialOverview?.settings ? initialOverview.redirects || [] : [])

  // Inspector modal state
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [inspectingEntity, setInspectingEntity] = useState<any>(null)
  const [inspectionData, setInspectionData] = useState<any>(null)

  const handleRunAudit = () => {
    startTransition(async () => {
      const res = await runFullSiteAuditAction()
      if (res.success && res.data) {
        toast.success(`Full site audit completed! Scanned ${res.data.totalEntitiesScanned} entities.`)
        // Refresh entities & overview
        const entRes = await getSEOContentEntitiesAction()
        if (entRes.success && entRes.data) setEntities(entRes.data)
      } else {
        toast.error(res.error || "Audit failed.")
      }
    })
  }

  const handleInspect = async (entityType: string, entityId: string) => {
    const res = await getEntitySEOInspectionAction(entityType, entityId)
    if (res.success && res.data) {
      setInspectingEntity(res.data.entity)
      setInspectionData(res.data)
      setInspectorOpen(true)
    } else {
      toast.error("Failed to fetch inspection details")
    }
  }

  const handleBulkGenerate = async (entityType: string, entityIds: string[]) => {
    startTransition(async () => {
      const res = await bulkGenerateMetadataAction(entityType, entityIds)
      if (res.success && res.data) {
        toast.success(`Auto-generated metadata for ${res.data.updatedCount} items!`)
        const entRes = await getSEOContentEntitiesAction()
        if (entRes.success && entRes.data) setEntities(entRes.data)
      } else {
        toast.error(res.error || "Bulk generation failed")
      }
    })
  }

  const handleCreateRedirect = async (data: { sourceUrl: string; targetUrl: string; statusCode: number }) => {
    startTransition(async () => {
      const res = await createSEORedirectAction(data)
      if (res.success) {
        setRedirects([...redirects, res.data])
        toast.success("Redirect created successfully!")
      } else {
        toast.error(res.error || "Failed to create redirect")
      }
    })
  }

  const handleDeleteRedirect = async (id: string) => {
    startTransition(async () => {
      const res = await deleteSEORedirectAction(id)
      if (res.success) {
        setRedirects(redirects.filter((r) => r.id !== id))
        toast.success("Redirect rule removed")
      } else {
        toast.error(res.error || "Failed to delete redirect")
      }
    })
  }

  const handleSaveSettings = async (settings: any) => {
    startTransition(async () => {
      const res = await saveSEOSettingsAction(settings)
      if (res.success) {
        toast.success("SEO settings saved!")
      } else {
        toast.error(res.error || "Failed to save settings")
      }
    })
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "content", label: "Content", icon: FileText },
    { id: "technical", label: "Technical", icon: Wrench },
    { id: "monitoring", label: "Monitoring", icon: Activity },
    { id: "performance", label: "Performance", icon: Gauge },
    { id: "redirects", label: "Redirects", icon: ArrowRightLeft },
    { id: "search-console", label: "Search Console", icon: Globe },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="space-y-8 pb-16">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-accent uppercase bg-accent/10 px-2 py-0.5 rounded">
              XINVORA Enterprise OS
            </span>
          </div>
          <h1 className="text-display-md font-display font-bold text-text-primary mt-1">SEO Center</h1>
          <p className="text-body-sm text-text-secondary font-light mt-0.5">
            Continuous storefront inspection, sitemap indexing, metadata automation, and technical SEO monitoring.
          </p>
        </div>
      </div>

      {/* Unified Tab Bar */}
      <div className="flex items-center gap-1 border-b border-border/60 overflow-x-auto scrollbar-none pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? "bg-text-primary text-surface shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/40"
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Active Tab Component Render */}
      <div>
        {activeTab === "overview" && (
          <SEOOverviewTab overview={overview} onRunAudit={handleRunAudit} onSwitchTab={(t) => setActiveTab(t as any)} />
        )}

        {activeTab === "content" && (
          <SEOContentTab entities={entities} onInspect={handleInspect} onBulkGenerate={handleBulkGenerate} />
        )}

        {activeTab === "technical" && (
          <SEOTechnicalTab settings={overview?.settings} onSaveSettings={handleSaveSettings} />
        )}

        {activeTab === "monitoring" && (
          <SEOMonitoringTab issues={overview?.issues?.open || []} onRunAudit={handleRunAudit} />
        )}

        {activeTab === "performance" && <SEOPerformanceTab />}

        {activeTab === "redirects" && (
          <SEORedirectsTab
            redirects={redirects.length > 0 ? redirects : overview?.redirects || []}
            onCreateRedirect={handleCreateRedirect}
            onDeleteRedirect={handleDeleteRedirect}
          />
        )}

        {activeTab === "search-console" && <SEOSearchConsoleTab searchConsole={overview?.searchConsole} />}

        {activeTab === "settings" && (
          <SEOSettingsTab settings={overview?.settings} onSaveSettings={handleSaveSettings} />
        )}
      </div>

      {/* SEO Inspector Modal */}
      <SEOInspectorModal
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        entity={inspectingEntity}
        inspectionData={inspectionData}
      />
    </div>
  )
}
