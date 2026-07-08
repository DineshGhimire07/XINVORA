"use client"

import React, { useState, useEffect, useTransition } from "react"
import { getCdpCustomersAction, getCustomerDetailsAction } from "@/actions/admin/cdp.actions"

interface CustomerSummary {
  userId: string
  email: string
  firstName: string | null
  lastName: string | null
  lifetimeSpend: string
  currency: string
  totalOrders: number
  averageOrderValue: string
  sessionCount: number
  lastVisitAt: Date | null
  customerTier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  riskScore: number
  fraudFlag: boolean
}

export default function CdpPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sortKey, setSortKey] = useState("lifetimeSpend")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)

  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    totalSpend: "0",
    avgAov: "0",
    totalSessions: 0,
  })

  // Selected customer for CRM details drawer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [customerDetails, setCustomerDetails] = useState<any | null>(null)
  
  const [isPending, startTransition] = useTransition()
  const [isDetailsPending, startDetailsTransition] = useTransition()

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setOffset(0)
    }, 400)
    return () => clearTimeout(handler)
  }, [search])

  // Fetch list of customers
  useEffect(() => {
    startTransition(async () => {
      try {
        const res = await getCdpCustomersAction({
          search: debouncedSearch,
          limit,
          offset,
          sortKey,
          sortOrder,
        })
        setCustomers(res.data as any)
        setTotal(res.total)
        setSummary(res.summary)
      } catch (err) {
        console.error("Failed fetching customer telemetry:", err)
      }
    })
  }, [debouncedSearch, offset, sortKey, sortOrder, limit])

  // Fetch details when customer is selected
  useEffect(() => {
    if (!selectedCustomerId) {
      setCustomerDetails(null)
      return
    }
    startDetailsTransition(async () => {
      try {
        const details = await getCustomerDetailsAction(selectedCustomerId)
        setCustomerDetails(details)
      } catch (err) {
        console.error("Failed loading customer details:", err)
      }
    })
  }, [selectedCustomerId])

  const formatPrice = (amountStr: string) => {
    const amount = Number(amountStr) / 100
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "BRONZE":
        return "bg-amber-900/30 text-amber-500 border border-amber-900/50"
      case "SILVER":
        return "bg-slate-800/80 text-slate-400 border border-slate-700"
      case "GOLD":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20"
      case "PLATINUM":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
      default:
        return "bg-surface-secondary text-text-secondary"
    }
  }

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("desc")
    }
    setOffset(0)
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-body-lg font-bold tracking-tight text-text-primary">
          Customer Data Platform
        </h1>
        <p className="text-body-sm text-text-secondary mt-1">
          Customer intelligence telemetry, brand engagement affinities, and fraud detection flags.
        </p>
      </div>

      {/* CDP Summary Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden transition-all duration-300 hover:border-text-secondary">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
          <p className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Total Profile Cache</p>
          <p className="text-title-sm font-bold text-text-primary mt-2">{summary.totalCustomers.toLocaleString()}</p>
          <p className="text-[10px] text-text-secondary mt-1">Identified database accounts</p>
        </div>

        <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden transition-all duration-300 hover:border-text-secondary">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
          <p className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Total LTV Spend</p>
          <p className="text-title-sm font-bold text-text-primary mt-2">{formatPrice(summary.totalSpend)}</p>
          <p className="text-[10px] text-text-secondary mt-1">Cumulative order volume</p>
        </div>

        <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden transition-all duration-300 hover:border-text-secondary">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
          <p className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Platform AOV</p>
          <p className="text-title-sm font-bold text-text-primary mt-2">{formatPrice(summary.avgAov)}</p>
          <p className="text-[10px] text-text-secondary mt-1">Average user cart value</p>
        </div>

        <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden transition-all duration-300 hover:border-text-secondary">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <p className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Collected Sessions</p>
          <p className="text-title-sm font-bold text-text-primary mt-2">{summary.totalSessions.toLocaleString()}</p>
          <p className="text-[10px] text-text-secondary mt-1">Interaction logs recorded</p>
        </div>
      </div>

      {/* Control Filters Block */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Filter profiles by name or email..."
            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-body-sm text-text-primary focus:outline-none focus:border-text-secondary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary text-caption font-bold"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-caption text-text-secondary">
          <span>Displaying {Math.min(total, limit)} of {total} customer profiles</span>
        </div>
      </div>

      {/* Customers Main Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-secondary text-[10px] uppercase tracking-wider text-text-secondary font-bold">
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Status & Tier</th>
                <th className="px-6 py-4 cursor-pointer hover:text-text-primary" onClick={() => handleSort("lifetimeSpend")}>
                  Lifetime Spend {sortKey === "lifetimeSpend" && (sortOrder === "desc" ? "↓" : "↑")}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-text-primary" onClick={() => handleSort("averageOrderValue")}>
                  AOV {sortKey === "averageOrderValue" && (sortOrder === "desc" ? "↓" : "↑")}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-text-primary" onClick={() => handleSort("totalOrders")}>
                  Orders
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-text-primary" onClick={() => handleSort("riskScore")}>
                  Risk Score
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-text-primary" onClick={() => handleSort("lastVisitAt")}>
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-body-sm text-text-primary">
              {isPending && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-secondary">
                    Retrieving customer profiles...
                  </td>
                </tr>
              )}

              {!isPending && customers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-secondary">
                    No customer profiles matched the criteria.
                  </td>
                </tr>
              )}

              {!isPending &&
                customers.map((c) => (
                  <tr
                    key={c.userId}
                    onClick={() => setSelectedCustomerId(c.userId)}
                    className="hover:bg-surface-secondary cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary group-hover:text-accent transition-colors">
                        {c.firstName || c.lastName
                          ? `${c.firstName || ""} ${c.lastName || ""}`.trim()
                          : "Anonymous Visitor"}
                      </div>
                      <div className="text-[11px] text-text-secondary mt-0.5">{c.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getTierColor(c.customerTier)}`}>
                        {c.customerTier}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">{formatPrice(c.lifetimeSpend)}</td>
                    <td className="px-6 py-4 font-mono text-text-secondary">{formatPrice(c.averageOrderValue)}</td>
                    <td className="px-6 py-4">{c.totalOrders}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-surface-secondary h-1.5 rounded-full overflow-hidden border border-border">
                          <div
                            className={`h-full rounded-full ${
                              c.riskScore > 70 ? "bg-red-500" : c.riskScore > 35 ? "bg-amber-500" : "bg-green-500"
                            }`}
                            style={{ width: `${c.riskScore}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-text-secondary">{c.riskScore}%</span>
                        {c.fraudFlag && (
                          <span className="text-red-500 font-bold" title="Fraud Warning Flagged">
                            ⚠
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-caption">
                      {c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString() : "Never"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {total > limit && (
          <div className="border-t border-border px-6 py-4 flex justify-between items-center bg-surface-secondary">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-3 py-1.5 border border-border rounded text-caption text-text-secondary hover:text-text-primary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-caption text-text-secondary">
              Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-3 py-1.5 border border-border rounded text-caption text-text-secondary hover:text-text-primary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* CRM Details Drawer Panel */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
          {/* Backdrop Click */}
          <div className="flex-grow" onClick={() => setSelectedCustomerId(null)} />
          
          <div className="w-full max-w-2xl bg-surface border-l border-border h-full flex flex-col overflow-hidden animate-slide-in shadow-2xl">
            {/* Drawer Header */}
            <div className="border-b border-border p-6 flex justify-between items-start bg-surface-secondary">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-accent font-bold">Customer CRM Profile</span>
                <h2 className="text-body-lg font-bold text-text-primary mt-1">
                  {customerDetails?.customer
                    ? `${customerDetails.customer.firstName || ""} ${customerDetails.customer.lastName || ""}`.trim()
                    : "Loading profile..."}
                </h2>
                <p className="text-[11px] text-text-secondary mt-0.5">{customerDetails?.customer?.email}</p>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="text-text-secondary hover:text-text-primary text-caption border border-border rounded px-2.5 py-1 transition-all"
              >
                Close Panel
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              {isDetailsPending && (
                <div className="text-center py-20 text-text-secondary">
                  Loading customer activity metrics...
                </div>
              )}

              {!isDetailsPending && customerDetails && (
                <>
                  {/* Grid details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-secondary border border-border p-4 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Contact</span>
                      <p className="text-body-sm font-medium mt-1">{customerDetails.customer.phone || "No phone added"}</p>
                    </div>
                    <div className="bg-surface-secondary border border-border p-4 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Loyalty Points</span>
                      <p className="text-body-sm font-medium mt-1 font-mono text-accent">{customerDetails.customer.loyaltyPoints} PTS</p>
                    </div>
                    <div className="bg-surface-secondary border border-border p-4 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Marketing Source</span>
                      <p className="text-body-sm font-medium mt-1">{customerDetails.customer.marketingSource || "Organic"}</p>
                    </div>
                    <div className="bg-surface-secondary border border-border p-4 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Referral</span>
                      <p className="text-body-sm font-medium mt-1">{customerDetails.customer.referralSource || "Direct Search"}</p>
                    </div>
                  </div>

                  {/* Fraud Metrics */}
                  <div className={`border rounded-lg p-5 ${customerDetails.customer.fraudFlag ? 'bg-red-950/20 border-red-900/50' : 'bg-surface border-border'}`}>
                    <h3 className="text-caption font-bold uppercase tracking-wider text-text-primary">CDP Risk Intelligence</h3>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-body-sm font-medium">Fraud Flag Score</p>
                        <p className="text-[11px] text-text-secondary mt-0.5">Based on device, country shift, and velocity metrics.</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-body-sm font-mono font-bold ${customerDetails.customer.riskScore > 70 ? 'text-red-500' : 'text-text-primary'}`}>
                          {customerDetails.customer.riskScore}% RISK
                        </span>
                        {customerDetails.customer.fraudFlag && (
                          <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-0.5">SUSPICIOUS ACTIVITY</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Customer Timeline */}
                  <div className="space-y-4">
                    <h3 className="text-caption font-bold uppercase tracking-wider text-text-primary border-b border-border pb-2">
                      Event Timeline Activity
                    </h3>
                    {customerDetails.timeline.length === 0 ? (
                      <p className="text-body-sm text-text-secondary">No activity logs recorded for this visitor.</p>
                    ) : (
                      <div className="relative pl-6 border-l border-border space-y-6">
                        {customerDetails.timeline.map((t: any) => (
                          <div key={t.id} className="relative">
                            {/* Bullet indicator */}
                            <div className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-accent border-4 border-surface" />
                            
                            <div>
                              <span className="text-[10px] font-mono text-text-secondary">
                                {new Date(t.createdAt).toLocaleString()}
                              </span>
                              <p className="text-body-sm font-semibold text-text-primary mt-0.5">{t.title}</p>
                              {t.description && <p className="text-[11px] text-text-secondary mt-0.5">{t.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sessions Activity */}
                  <div className="space-y-4">
                    <h3 className="text-caption font-bold uppercase tracking-wider text-text-primary border-b border-border pb-2">
                      Session Fingerprints
                    </h3>
                    <div className="space-y-3">
                      {customerDetails.sessions.map((s: any) => (
                        <div key={s.id} className="bg-surface-secondary border border-border rounded-lg p-4 text-caption text-text-secondary">
                          <div className="flex justify-between items-center text-text-primary font-medium mb-2">
                            <span>Key: {s.sessionKey.substring(0, 12)}...</span>
                            <span className="text-[10px] bg-surface border border-border px-2 py-0.5 rounded uppercase">{s.deviceType}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div><strong className="text-text-secondary">Client:</strong> {s.browser} on {s.operatingSystem}</div>
                            <div><strong className="text-text-secondary">IP:</strong> {s.ipAddress}</div>
                            <div><strong className="text-text-secondary">Geo IP:</strong> {s.city || "Unknown"}, {s.countryCode || "NP"}</div>
                            <div><strong className="text-text-secondary">Started:</strong> {new Date(s.startedAt).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
