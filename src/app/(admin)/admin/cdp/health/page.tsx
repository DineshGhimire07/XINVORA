"use client"

import React, { useState, useEffect, useTransition } from "react"
import { getSystemHealthAction, getDlqEventsAction, resolveDlqEventAction, deleteDlqEventAction } from "@/actions/admin/cdp.actions"

interface DlqEvent {
  id: string
  rawPayload: any
  errorMessage: string
  errorStack: string | null
  failedAt: Date
  resolved: boolean
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<any | null>(null)
  const [dlqEvents, setDlqEvents] = useState<DlqEvent[]>([])
  
  // Track expanded row ids for JSON payload view
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()
  const [isActionPending, startActionTransition] = useTransition()

  // Fetch health stats and DLQ list
  const refreshStats = () => {
    startTransition(async () => {
      try {
        const h = await getSystemHealthAction()
        const d = await getDlqEventsAction()
        setHealth(h)
        setDlqEvents(d as any)
      } catch (err) {
        console.error("Failed fetching cdp health details:", err)
      }
    })
  }

  useEffect(() => {
    refreshStats()
    // Poll stats every 10 seconds for real-time monitoring
    const timer = setInterval(refreshStats, 10000)
    return () => clearInterval(timer)
  }, [])

  const handleResolve = (id: string) => {
    startActionTransition(async () => {
      try {
        await resolveDlqEventAction(id)
        refreshStats()
      } catch (err) {
        console.error("Failed resolving DLQ record:", err)
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this DLQ log?")) return
    startActionTransition(async () => {
      try {
        await deleteDlqEventAction(id)
        refreshStats()
      } catch (err) {
        console.error("Failed deleting DLQ record:", err)
      }
    })
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-body-lg font-bold tracking-tight text-text-primary">
            System Telemetry & Health
          </h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Real-time ingestion workers, slow query latencies, and Dead Letter Queue (DLQ) audits.
          </p>
        </div>
        <button
          onClick={refreshStats}
          disabled={isPending}
          className="px-4 py-2 border border-border rounded-lg text-body-sm text-text-primary bg-surface hover:bg-surface-secondary transition-all"
        >
          {isPending ? "Refreshing..." : "Force Refresh"}
        </button>
      </div>

      {/* Health Stats */}
      {health && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden transition-all hover:border-text-secondary">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Worker Status</p>
            <p className="text-title-sm font-bold text-text-primary mt-2 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${health.queueStats.isWorkerActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              {health.queueStats.isWorkerActive ? "ACTIVE" : "STOPPED"}
            </p>
            <p className="text-[10px] text-text-secondary mt-1">In-Memory Batch flusher active</p>
          </div>

          <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden transition-all hover:border-text-secondary">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Active Ingestion Queue</p>
            <p className="text-title-sm font-bold text-text-primary mt-2">{health.queueStats.queueLength} EVENTS</p>
            <p className="text-[10px] text-text-secondary mt-1">Buffered (Flush interval: {health.queueStats.flushIntervalMs}ms)</p>
          </div>

          <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden transition-all hover:border-text-secondary">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Active Sessions (30m)</p>
            <p className="text-title-sm font-bold text-text-primary mt-2">{health.activeSessions} USERS</p>
            <p className="text-[10px] text-text-secondary mt-1">Concurrent user sessions online</p>
          </div>

          <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden transition-all hover:border-text-secondary">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Avg Telemetry Latency</p>
            <p className="text-title-sm font-bold text-text-primary mt-2 font-mono">{health.avgLatency} ms</p>
            <p className="text-[10px] text-text-secondary mt-1">Database write performance</p>
          </div>
        </div>
      )}

      {/* DLQ Observability Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-body-md font-bold text-text-primary">
            Dead Letter Queue logs (DLQ)
          </h2>
          <p className="text-caption text-text-secondary mt-1">
            Telemetries that failed ingestion validation or database constraints after 3 retries.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-secondary text-[10px] uppercase tracking-wider text-text-secondary font-bold">
                  <th className="px-6 py-4 w-12"></th>
                  <th className="px-6 py-4">Failed Time</th>
                  <th className="px-6 py-4">Error Message</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-body-sm text-text-primary">
                {dlqEvents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-text-secondary">
                      Dead Letter Queue is empty. No ingestion drops detected!
                    </td>
                  </tr>
                )}

                {dlqEvents.map((d) => (
                  <React.Fragment key={d.id}>
                    <tr className="hover:bg-surface-secondary transition-colors">
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setExpandedRowId(expandedRowId === d.id ? null : d.id)}
                          className="text-text-secondary hover:text-text-primary font-bold text-caption transition-all"
                        >
                          {expandedRowId === d.id ? "▼" : "▶"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-caption text-text-secondary">
                        {new Date(d.failedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-red-500 max-w-sm truncate" title={d.errorMessage}>
                        {d.errorMessage}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          d.resolved ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {d.resolved ? "Resolved" : "Unresolved"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {!d.resolved && (
                          <button
                            onClick={() => handleResolve(d.id)}
                            disabled={isActionPending}
                            className="text-[11px] bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 rounded px-2.5 py-1 transition-all disabled:opacity-50"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(d.id)}
                          disabled={isActionPending}
                          className="text-[11px] bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded px-2.5 py-1 transition-all disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    
                    {/* Collapsible expanded row */}
                    {expandedRowId === d.id && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-surface-secondary border-t border-b border-border">
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-text-secondary">Raw Event Payload</p>
                              <pre className="mt-1 bg-surface border border-border p-4 rounded-lg overflow-x-auto text-[11px] font-mono text-text-primary max-h-60">
                                {JSON.stringify(d.rawPayload, null, 2)}
                              </pre>
                            </div>
                            {d.errorStack && (
                              <div>
                                <p className="text-[10px] uppercase font-bold text-text-secondary">Error Stack Trace</p>
                                <pre className="mt-1 bg-surface border border-border p-4 rounded-lg overflow-x-auto text-[10px] font-mono text-red-400 max-h-40">
                                  {d.errorStack}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
