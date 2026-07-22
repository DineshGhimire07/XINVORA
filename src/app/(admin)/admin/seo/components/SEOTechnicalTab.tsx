"use client"

import React, { useState } from "react"
import { FileText, Map, Share2, Code2, Save, Download, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface SEOTechnicalTabProps {
  settings: any
  onSaveSettings: (settings: any) => void
}

export function SEOTechnicalTab({ settings, onSaveSettings }: SEOTechnicalTabProps) {
  const [subTab, setSubTab] = useState<"robots" | "sitemap" | "social" | "schema">("robots")
  const [robotsTxt, setRobotsTxt] = useState(
    settings?.robotsDefaults || "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout/\n\nSitemap: https://xinvora.com.np/sitemap.xml"
  )

  const handleSaveRobots = () => {
    onSaveSettings({ ...settings, robotsDefaults: robotsTxt })
    toast.success("robots.txt configuration saved successfully!")
  }

  return (
    <div className="space-y-6">
      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setSubTab("robots")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            subTab === "robots" ? "bg-text-primary text-surface shadow-sm" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <FileText size={14} /> robots.txt Editor
        </button>

        <button
          onClick={() => setSubTab("sitemap")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            subTab === "sitemap" ? "bg-text-primary text-surface shadow-sm" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Map size={14} /> Sitemap Index
        </button>

        <button
          onClick={() => setSubTab("social")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            subTab === "social" ? "bg-text-primary text-surface shadow-sm" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Share2 size={14} /> OpenGraph & Social
        </button>

        <button
          onClick={() => setSubTab("schema")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            subTab === "schema" ? "bg-text-primary text-surface shadow-sm" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Code2 size={14} /> JSON-LD Schema
        </button>
      </div>

      {/* 1. Robots.txt Editor */}
      {subTab === "robots" && (
        <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-body-md font-display font-bold text-text-primary">Dynamic robots.txt Configuration</h3>
              <p className="text-body-xs text-text-secondary mt-0.5">Control search engine crawler directives and index path restrictions.</p>
            </div>
            <Button onClick={handleSaveRobots} className="bg-text-primary text-surface font-bold text-xs uppercase tracking-wider h-9 px-4 rounded-lg">
              <Save size={14} className="mr-1.5" /> Save Configuration
            </Button>
          </div>

          <textarea
            value={robotsTxt}
            onChange={(e) => setRobotsTxt(e.target.value)}
            rows={12}
            className="w-full font-mono text-xs p-4 bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed"
          />
        </Card>
      )}

      {/* 2. Sitemap Index Manager */}
      {subTab === "sitemap" && (
        <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div>
              <h3 className="text-body-md font-display font-bold text-text-primary">XML Sitemap Index Architecture</h3>
              <p className="text-body-xs text-text-secondary mt-0.5">Automated sitemap index referencing specialized entity XML feeds.</p>
            </div>

            <a href="/sitemap.xml" target="_blank">
              <Button variant="outline" className="h-9 text-xs font-bold uppercase tracking-wider border-border/80">
                <Download size={14} className="mr-1.5" /> View /sitemap.xml
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Products Sitemap", path: "/sitemap-products.xml", desc: "All published catalog products" },
              { name: "Collections Sitemap", path: "/sitemap-collections.xml", desc: "Curated collection edition landing pages" },
              { name: "Journal Sitemap", path: "/sitemap-journal.xml", desc: "Editorial stories & articles" },
              { name: "CMS Pages Sitemap", path: "/sitemap-cms.xml", desc: "Static and custom CMS content pages" },
            ].map((sm) => (
              <div key={sm.path} className="p-4 border border-border/60 rounded-lg bg-surface-secondary/30 flex items-center justify-between">
                <div>
                  <h4 className="text-body-sm font-semibold text-text-primary">{sm.name}</h4>
                  <p className="text-body-xs text-text-secondary mt-0.5">{sm.desc}</p>
                  <span className="text-[11px] font-mono text-accent mt-1 block">{sm.path}</span>
                </div>

                <a href={sm.path} target="_blank">
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-text-secondary hover:text-text-primary">
                    View XML
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 3. OpenGraph & Social Cards */}
      {subTab === "social" && (
        <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-6">
          <div>
            <h3 className="text-body-md font-display font-bold text-text-primary">Social OpenGraph & Twitter Card Validator</h3>
            <p className="text-body-xs text-text-secondary mt-0.5">Preview how pages render when shared across Facebook, LinkedIn, X, and WhatsApp.</p>
          </div>

          <div className="p-6 border border-border/80 rounded-xl bg-neutral-950 text-white max-w-md space-y-3 shadow-xl">
            <div className="aspect-video w-full bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex items-center justify-center text-neutral-600 text-xs font-mono">
              [ OpenGraph Social Image Preview ]
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-mono tracking-widest">XINVORA.COM</span>
              <h4 className="text-body-sm font-bold text-white mt-0.5">XINVORA | Handcrafted Luxury & Quiet Living</h4>
              <p className="text-body-xs text-neutral-400 font-light mt-1">Discover handcrafted luxury items designed for thoughtful living.</p>
            </div>
          </div>
        </Card>
      )}

      {/* 4. JSON-LD Schema */}
      {subTab === "schema" && (
        <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-4">
          <div>
            <h3 className="text-body-md font-display font-bold text-text-primary">Organization & WebSite Schema (JSON-LD)</h3>
            <p className="text-body-xs text-text-secondary mt-0.5">Global structured data emitted across all storefront pages.</p>
          </div>

          <pre className="p-4 bg-neutral-950 text-neutral-200 rounded-lg text-[11px] font-mono border border-neutral-800 leading-relaxed overflow-x-auto">
{JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "XINVORA",
    url: "https://xinvora.com.np",
    logo: "https://xinvora.com.np/logo.png",
    sameAs: ["https://instagram.com/xinvora", "https://facebook.com/xinvora"],
  },
  null,
  2
)}
          </pre>
        </Card>
      )}
    </div>
  )
}
