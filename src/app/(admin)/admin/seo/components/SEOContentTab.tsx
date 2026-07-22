"use client"

import React, { useState } from "react"
import { Search, Sparkles, Eye, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface SEOContentTabProps {
  entities: any[]
  onInspect: (entityType: string, entityId: string) => void
  onBulkGenerate: (entityType: string, entityIds: string[]) => void
}

export function SEOContentTab({ entities = [], onInspect, onBulkGenerate }: SEOContentTabProps) {
  const [selectedType, setSelectedType] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filtered = entities.filter((e) => {
    const matchesType = selectedType === "ALL" || e.entityType === selectedType
    const matchesSearch = !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.path.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map((e) => e.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkGenerateClick = () => {
    const targetType = selectedType === "ALL" ? "PRODUCT" : selectedType
    const targetIds = selectedIds.length > 0 ? selectedIds : filtered.map((e) => e.id)
    onBulkGenerate(targetType, targetIds)
  }

  return (
    <div className="space-y-6">
      {/* Filter & Toolbar */}
      <Card className="p-4 rounded-xl border border-border/60 bg-surface flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto scrollbar-none">
          {["ALL", "PRODUCT", "COLLECTION", "JOURNAL", "CMS_PAGE"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type)
                setSelectedIds([])
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                selectedType === type
                  ? "bg-text-primary text-surface shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50"
              }`}
            >
              {type === "CMS_PAGE" ? "CMS Pages" : type === "ALL" ? "All Content" : `${type}s`}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Search by title or path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-surface border-border/60"
            />
          </div>

          <Button
            onClick={handleBulkGenerateClick}
            className="bg-accent hover:bg-accent/90 text-white font-bold text-xs uppercase tracking-wider h-9 px-4 rounded-lg flex items-center gap-1.5 shrink-0"
          >
            <Sparkles size={14} /> Bulk Generate Metadata
          </Button>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="rounded-xl border border-border/60 bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-surface-secondary/50 text-[10px] font-bold tracking-widest uppercase text-text-secondary">
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="py-4 px-6">Content Entity</th>
                <th className="py-4 px-4 text-center">Type</th>
                <th className="py-4 px-4 text-center">SEO Score</th>
                <th className="py-4 px-6">SEO Title & Meta Description</th>
                <th className="py-4 px-4 text-center">Canonical</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-body-sm text-text-primary">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-secondary italic text-body-sm">
                    No content entities found matching filter parameters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isChecked = selectedIds.includes(item.id)
                  const score = item.seoScore || 0
                  const grade = item.scoreGrade || "C"

                  return (
                    <tr key={item.id} className={`hover:bg-surface-secondary/30 transition-colors ${isChecked ? "bg-accent/5" : ""}`}>
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded border-border"
                        />
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-semibold text-text-primary">{item.name}</div>
                        <div className="text-[11px] font-mono text-text-secondary mt-0.5">{item.path}</div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="text-[9px] font-bold tracking-widest uppercase bg-surface-secondary px-2 py-0.5 rounded text-text-secondary border border-border/40">
                          {item.entityType}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs font-bold border border-border/40 bg-surface">
                          {score >= 85 ? (
                            <CheckCircle2 size={13} className="text-green-500" />
                          ) : score >= 65 ? (
                            <AlertTriangle size={13} className="text-amber-500" />
                          ) : (
                            <XCircle size={13} className="text-red-500" />
                          )}
                          <span className={score >= 85 ? "text-green-600" : score >= 65 ? "text-amber-600" : "text-red-600"}>
                            {score}/100
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 max-w-xs">
                        <div className="text-body-xs font-semibold text-text-primary truncate">
                          {item.seoTitle || <span className="text-red-500 italic">Missing SEO Title</span>}
                        </div>
                        <div className="text-[11px] text-text-secondary truncate mt-0.5">
                          {item.seoDescription || <span className="text-amber-600 italic">Missing Meta Description</span>}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {item.canonicalUrl ? (
                          <span className="text-[10px] text-green-700 font-semibold bg-green-500/10 px-2 py-0.5 rounded">Set</span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">Missing</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onInspect(item.entityType, item.id)}
                          className="h-8 text-xs font-bold uppercase tracking-wider border-border/80"
                        >
                          <Eye size={13} className="mr-1" /> Inspect
                        </Button>
                        <Link href={item.path} target="_blank">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-text-secondary hover:text-text-primary">
                            <ArrowUpRight size={14} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
