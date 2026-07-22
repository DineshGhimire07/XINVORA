"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Globe, Eye, History, FileText, CheckCircle2, AlertTriangle, Monitor, Tablet, Smartphone, Sparkles, TrendingUp, ShoppingCart, DollarSign, MousePointer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { MediaSelector } from "@/components/admin/MediaSelector"
import JournalBlockEditor from "@/components/admin/JournalBlockEditor"
import { createJournalPostAction, updateJournalPostAction, restoreJournalRevisionAction } from "@/actions/admin/journal.actions"

import { formatCurrency } from "@/lib/utils"

interface JournalAnalytics {
  views: number
  uniqueReaders: number
  clicks: number
  ordersCount: number
  ctr: number
  conversion: number
  revenueGenerated: number
}

interface JournalEditorClientProps {
  post?: any
  analytics?: JournalAnalytics
  categories: any[]
  allProducts: any[]
  allCollections: any[]
  mediaItems: any[]
}

export function JournalEditorClient({
  post,
  analytics,
  categories = [],
  allProducts = [],
  allCollections = [],
  mediaItems = [],
}: JournalEditorClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = !!post

  // --- Form States ---
  const [title, setTitle] = useState(post?.title || "")
  const [slug, setSlug] = useState(post?.slug || "")
  const [excerpt, setExcerpt] = useState(post?.excerpt || "")
  const [coverImage, setCoverImage] = useState(post?.coverImage || "")
  const [gallery, setGallery] = useState<string[]>(post?.gallery || [])
  const [categoryId, setCategoryId] = useState(post?.categoryId || "")
  const [tagsInput, setTagsInput] = useState(post?.postTags?.map((pt: any) => pt.tag?.name).join(", ") || "")
  const [visibility, setVisibility] = useState(post?.visibility || "PUBLIC")
  const [isFeatured, setIsFeatured] = useState(post?.isFeatured || false)
  const [isPinned, setIsPinned] = useState(post?.isPinned || false)
  const [allowComments, setAllowComments] = useState(post?.allowComments !== false)
  const [readingTimeOverride, setReadingTimeOverride] = useState(post?.readingTimeOverride || "")
  const [workflowState, setWorkflowState] = useState(post?.workflowState || "DRAFT")
  
  // --- Blocks ---
  const [blocks, setBlocks] = useState<any[]>(post?.body || [])

  // --- SEO ---
  const [focusKeyword, setFocusKeyword] = useState(post?.focusKeyword || "")
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || "")
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "")
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl || "")

  // --- Active Tab & Preview Mode ---
  const [activeTab, setActiveTab] = useState<"general" | "editor" | "seo" | "preview" | "analytics" | "history">("general")
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
    }
  }, [title, isEdit, slug])

  // --- Autosave every 10 seconds to DRAFT ---
  useEffect(() => {
    if (!isEdit || workflowState === "PUBLISHED" || workflowState === "ARCHIVED") return

    const interval = setInterval(() => {
      const payload = getPayload()
      // Run update action in background silently
      updateJournalPostAction(post.id, { ...payload, workflowState: "DRAFT" })
        .then((res) => {
          if (res.success) {
            console.log("[Autosave] Draft saved automatically.")
          }
        })
    }, 10000)

    return () => clearInterval(interval)
  }, [isEdit, title, slug, excerpt, blocks, workflowState])

  const getPayload = () => {
    const tags = tagsInput
      .split(",")
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0)

    return {
      title,
      slug,
      excerpt,
      body: blocks,
      coverImage: coverImage || null,
      gallery,
      categoryId: categoryId || null,
      tags,
      visibility,
      isFeatured,
      isPinned,
      allowComments,
      readingTimeOverride: readingTimeOverride ? parseInt(readingTimeOverride.toString()) : null,
      workflowState,
      focusKeyword,
      metaDescription,
      seoTitle,
      canonicalUrl,
    }
  }

  const handleSave = (stateToSet?: string) => {
    const state = stateToSet || workflowState
    setWorkflowState(state)

    startTransition(async () => {
      const payload = { ...getPayload(), workflowState: state }

      let res: any
      if (isEdit) {
        res = await updateJournalPostAction(post.id, payload)
      } else {
        res = await createJournalPostAction(payload)
      }

      if (res.success) {
        toast.success(isEdit ? "Article updated successfully" : "Article created successfully")
        if (!isEdit && res.id) {
          router.push(`/admin/content/journal/${res.id}`)
        } else {
          router.refresh()
        }
      } else {
        toast.error(res.error || "Failed to save article")
      }
    })
  }

  const handleRestore = (revisionId: string) => {
    if (!confirm("Are you sure you want to roll back to this revision snapshot?")) return
    startTransition(async () => {
      const res = await restoreJournalRevisionAction(revisionId)
      if (res.success) {
        toast.success("Revision restored successfully")
        router.refresh()
      } else {
        toast.error(res.error || "Failed to restore revision")
      }
    })
  }

  // --- Dynamic SEO Audit Audits ---
  const calculateSEOResults = () => {
    const keyword = focusKeyword.trim().toLowerCase()
    const results = []
    let score = 30

    if (!keyword) {
      return { score: 10, items: [{ label: "Focus Keyword", ok: false, msg: "No focus keyword set." }] }
    }

    // Title
    const titleOk = title.toLowerCase().includes(keyword)
    if (titleOk) score += 15
    results.push({ label: "Keyword in Title", ok: titleOk, msg: titleOk ? "Keyword found in page title" : "Title does not contain focus keyword." })

    // Slug
    const slugOk = slug.toLowerCase().includes(keyword)
    if (slugOk) score += 15
    results.push({ label: "Keyword in Slug", ok: slugOk, msg: slugOk ? "Keyword matches slug URL coordinates" : "Slug path does not contain focus keyword." })

    // Excerpt
    const excOk = excerpt.toLowerCase().includes(keyword)
    if (excOk) score += 15
    results.push({ label: "Keyword in Excerpt", ok: excOk, msg: excOk ? "Excerpt has focus keyword" : "Excerpt does not contain focus keyword." })

    // Heading blocks validation
    let hasH2 = false
    let h2WithKeyword = false
    blocks.forEach(b => {
      if (b.type === "heading" && b.data.level === 2) {
        hasH2 = true
        if (b.data.text?.toLowerCase().includes(keyword)) {
          h2WithKeyword = true
        }
      }
    })
    results.push({ label: "Heading Structure", ok: hasH2, msg: hasH2 ? "Found H2 section headings" : "Add H2 headings to divide content sections." })
    if (hasH2) {
      results.push({ label: "Keyword in H2 Heading", ok: h2WithKeyword, msg: h2WithKeyword ? "H2 contains focus keyword" : "H2 headings do not reference focus keyword." })
      if (h2WithKeyword) score += 15
    }

    // Word count calculation
    let wordCount = 0
    blocks.forEach(b => {
      if (b.type === "paragraph" || b.type === "heading" || b.type === "quote") {
        wordCount += (b.data.text || b.data.content || "").split(/\s+/).filter(Boolean).length
      }
    })
    const wordsOk = wordCount >= 300
    if (wordsOk) score += 10
    results.push({ label: "Word Count", ok: wordsOk, msg: `Total words: ${wordCount}. (Recommended minimum: 300 words)` })

    return {
      score: Math.min(100, score),
      items: results
    }
  }

  const seoAudit = calculateSEOResults()

  return (
    <div className="space-y-8">
      {/* Edit Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/content/journal" className="p-2 hover:bg-surface-secondary rounded-admin-md transition-colors text-text-secondary">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase select-none">
              Journal / {isEdit ? "Edit Story" : "New Story"}
            </span>
            <h1 className="text-display-xs font-display text-text-primary uppercase tracking-wide">
              {title || "Untitled Story"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Workflow state selector */}
          <select
            value={workflowState}
            onChange={(e) => setWorkflowState(e.target.value)}
            className="bg-surface border border-border rounded-admin-md px-3 py-2 text-body-sm text-text-primary focus:outline-none"
          >
            <option value="DRAFT">Draft</option>
            <option value="REVIEW">In Review</option>
            <option value="APPROVED">Approved</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <Button
            onClick={() => handleSave()}
            disabled={isPending}
            className="bg-text-primary text-surface px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors"
          >
            <Save size={14} className="mr-2" />
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-6 border-b border-border/40 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none select-none">
        {[
          { id: "general", label: "General Settings", icon: FileText },
          { id: "editor", label: "Block Content", icon: Sparkles },
          { id: "seo", label: "SEO Audit", icon: Globe },
          { id: "preview", label: "Live Preview", icon: Eye },
          { id: "analytics", label: "Performance", icon: TrendingUp },
          { id: "history", label: "Revision History", icon: History },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase pb-3 transition-colors ${
                isActive
                  ? "text-text-primary border-b-2 border-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[14px] border-border-primary/40 shadow-sm bg-surface">
              <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
                <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">General Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-admin-xs text-admin-text-secondary uppercase tracking-wider font-semibold">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article Title..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-admin-xs text-admin-text-secondary uppercase tracking-wider font-semibold">Slug URL Path</Label>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="URL slug..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-admin-xs text-admin-text-secondary uppercase tracking-wider font-semibold">Excerpt</Label>
                  <textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short description summary for archives page..."
                    rows={3}
                    className="w-full bg-admin-surface border border-admin-border rounded-admin-md p-3 text-admin-sm outline-none focus:ring-1 focus:ring-admin-text-secondary text-admin-text-primary"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[14px] border-border-primary/40 shadow-sm bg-surface">
              <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
                <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary font-semibold">Media Assets</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-admin-xs text-admin-text-secondary uppercase tracking-wider font-semibold block">Cover Image</Label>
                  <MediaSelector
                    mediaItems={mediaItems}
                    selectedImages={coverImage ? [coverImage] : []}
                    onChange={(imgs: string[]) => setCoverImage(imgs[0] || "")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-admin-xs text-admin-text-secondary uppercase tracking-wider font-semibold block">Gallery Images</Label>
                  <MediaSelector
                    mediaItems={mediaItems}
                    selectedImages={gallery}
                    onChange={(imgs: string[]) => setGallery(imgs)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[14px] border-border-primary/40 shadow-sm bg-surface">
              <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
                <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary font-semibold">Publishing Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-admin-xs text-admin-text-secondary uppercase tracking-wider font-semibold">Category</Label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-admin-surface border border-admin-border rounded-admin-md p-2.5 text-admin-sm text-admin-text-primary focus:outline-none"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-admin-xs text-admin-text-secondary uppercase tracking-wider font-semibold">Tags (comma separated)</Label>
                  <Input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Flax, Sourcing, Summer, Styling..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility" className="text-admin-xs text-admin-text-secondary uppercase tracking-wider font-semibold">Visibility</Label>
                  <select
                    id="visibility"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full bg-admin-surface border border-admin-border rounded-admin-md p-2.5 text-admin-sm text-admin-text-primary focus:outline-none"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                    <option value="PASSWORD">Password Protected</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="readingTime" className="text-admin-xs text-admin-text-secondary uppercase tracking-wider font-semibold">Reading Time Override (Minutes)</Label>
                  <Input id="readingTime" type="number" value={readingTimeOverride} onChange={(e) => setReadingTimeOverride(e.target.value)} placeholder="Calculated automatically..." />
                </div>

                <div className="space-y-4 pt-4 border-t border-admin-border">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isFeatured" className="text-admin-sm text-admin-text-primary cursor-pointer font-semibold">Feature on Home</Label>
                    <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isPinned" className="text-admin-sm text-admin-text-primary cursor-pointer font-semibold">Pin to Top</Label>
                    <input type="checkbox" id="isPinned" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowComments" className="text-admin-sm text-admin-text-primary cursor-pointer font-semibold">Allow Comments</Label>
                    <input type="checkbox" id="allowComments" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} className="rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "editor" && (
        <JournalBlockEditor
          initialBlocks={blocks}
          onChange={(updatedBlocks) => setBlocks(updatedBlocks)}
          allProducts={allProducts}
          allCollections={allCollections}
          mediaItems={mediaItems}
        />
      )}

      {activeTab === "seo" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[14px] border-border-primary/40 shadow-sm bg-surface">
              <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
                <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary font-semibold">SEO Configuration</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="focusKeyword" className="text-admin-xs text-admin-text-secondary uppercase font-semibold">Focus Keyword</Label>
                  <Input id="focusKeyword" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="Target SEO word..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoTitle" className="text-admin-xs text-admin-text-secondary uppercase font-semibold">SEO Meta Title</Label>
                  <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO Title..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription" className="text-admin-xs text-admin-text-secondary uppercase font-semibold">Meta Description</Label>
                  <textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Meta Description..."
                    rows={3}
                    className="w-full bg-admin-surface border border-admin-border rounded-admin-md p-3 text-admin-sm outline-none text-admin-text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl" className="text-admin-xs text-admin-text-secondary uppercase font-semibold">Canonical URL</Label>
                  <Input id="canonicalUrl" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://xinvora.com/journal/..." />
                </div>
              </CardContent>
            </Card>

            {/* Google Search Snippet Card Preview */}
            <Card className="rounded-[14px] border-border-primary/40 shadow-sm bg-surface">
              <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
                <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary font-semibold">Search Engine Snippet Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="max-w-[600px] border border-border/40 rounded-admin-md p-4 bg-white text-left font-sans shadow-sm select-none">
                  <div className="text-xs text-[#202124] flex items-center gap-1.5 mb-1.5 font-light">
                    <span>https://xinvora.com</span>
                    <span>&rsaquo;</span>
                    <span className="text-[#5f6368]">journal &rsaquo; {slug || "story"}</span>
                  </div>
                  <h3 className="text-lg text-[#1a0dab] hover:underline cursor-pointer leading-tight mb-1 font-normal">
                    {seoTitle || title || "Article Headline - XINVORA"}
                  </h3>
                  <p className="text-xs text-[#4d5156] leading-relaxed font-light">
                    {metaDescription || excerpt || "No description set. Please fill out metadata description values to configure search layout properly."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[14px] border-border-primary/40 shadow-sm bg-surface">
              <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3 flex items-center justify-between">
                <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary font-semibold">Lighthouse Audit</CardTitle>
                <span className={`inline-block font-mono text-admin-sm font-bold px-2 py-0.5 rounded-full ${
                  seoAudit.score >= 80 ? "bg-green-100 text-green-800" : seoAudit.score >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                }`}>
                  {seoAudit.score}/100
                </span>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {seoAudit.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 text-admin-sm select-none">
                    {item.ok ? (
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold text-admin-text-primary">{item.label}</p>
                      <p className="text-admin-xs text-admin-text-secondary mt-0.5">{item.msg}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "preview" && (
        <div className="space-y-4">
          <div className="flex justify-center gap-3 bg-surface-secondary/40 border border-border/40 py-2 rounded-admin-md max-w-xs mx-auto select-none">
            <button onClick={() => setViewportMode("desktop")} className={`p-2 rounded-admin-sm ${viewportMode === "desktop" ? "bg-border/20 text-text-primary" : "text-text-secondary"}`}>
              <Monitor size={16} />
            </button>
            <button onClick={() => setViewportMode("tablet")} className={`p-2 rounded-admin-sm ${viewportMode === "tablet" ? "bg-border/20 text-text-primary" : "text-text-secondary"}`}>
              <Tablet size={16} />
            </button>
            <button onClick={() => setViewportMode("mobile")} className={`p-2 rounded-admin-sm ${viewportMode === "mobile" ? "bg-border/20 text-text-primary" : "text-text-secondary"}`}>
              <Smartphone size={16} />
            </button>
          </div>

          <div className="flex justify-center bg-admin-surface border border-admin-border/50 p-6 rounded-[14px] overflow-hidden min-h-[500px]">
            <div
              className={`bg-background border border-border/40 rounded-sm shadow-md transition-all ${
                viewportMode === "mobile" ? "w-[375px]" : viewportMode === "tablet" ? "w-[768px]" : "w-full max-w-[1000px]"
              }`}
            >
              {/* Storefront Layout Mock */}
              <div className="p-8 text-left space-y-6">
                <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                  {categories.find(c => c.id === categoryId)?.name || "Editorial"}
                </span>
                <h1 className="text-display-md font-display text-text-primary leading-tight tracking-tight">
                  {title || "Untitled Story"}
                </h1>
                {coverImage && (
                  <div className="relative aspect-video w-full bg-surface border border-border/40 overflow-hidden">
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="text-body-lg text-text-primary leading-relaxed border-l-2 border-accent pl-6 font-light italic">
                  {excerpt || "No description excerpt set yet."}
                </div>
                <div className="space-y-6 text-text-secondary text-body-md leading-relaxed font-light">
                  {blocks.map((block) => (
                    <div key={block.id}>
                      {block.type === "paragraph" && <p>{block.data.text}</p>}
                      {block.type === "heading" && <h2 className="text-display-xs font-display text-text-primary mt-8">{block.data.text}</h2>}
                      {block.type === "quote" && (
                        <blockquote className="my-8 border-y border-border/40 py-6 text-display-xs font-display italic text-text-primary pl-4">
                          {block.data.text}
                          {block.data.citation && <cite className="block text-[10px] not-italic tracking-wider uppercase text-text-secondary mt-2">- {block.data.citation}</cite>}
                        </blockquote>
                      )}
                      {block.type === "divider" && <hr className="border-border/40 my-8" />}
                      {block.type === "image" && block.data.urls?.[0] && (
                        <div className="my-6">
                          <img src={block.data.urls[0]} alt="block" className="w-full aspect-video object-cover border border-border/40" />
                          {block.data.caption && <span className="text-[10px] text-text-secondary mt-1 block">{block.data.caption}</span>}
                        </div>
                      )}
                      {block.type === "product" && block.data.productId && (
                        <div className="border border-border/60 p-4 bg-surface flex items-center justify-between my-6 rounded-sm">
                          <div>
                            <p className="font-semibold text-text-primary">{allProducts.find(p => p.id === block.data.productId)?.name || "Live Product"}</p>
                            <p className="text-accent text-body-sm">Rs. 14,500</p>
                          </div>
                          <Button className="bg-text-primary text-surface uppercase text-[9px] tracking-wider px-3 h-8">View Item</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="rounded-[14px] border border-border-primary/40 shadow-sm bg-surface p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center text-text-secondary">
              <span className="text-[10px] font-bold tracking-widest uppercase">Pageviews</span>
              <Eye size={16} />
            </div>
            <div className="mt-4">
              <h3 className="text-display-sm font-display text-text-primary font-bold">
                {(analytics?.views || 0).toLocaleString()}
              </h3>
              <p className="text-admin-xs text-green-600 flex items-center gap-1.5 mt-1 font-semibold">
                <TrendingUp size={12} /> {(analytics?.uniqueReaders || 0).toLocaleString()} unique readers
              </p>
            </div>
          </Card>

          <Card className="rounded-[14px] border border-border-primary/40 shadow-sm bg-surface p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center text-text-secondary">
              <span className="text-[10px] font-bold tracking-widest uppercase">Product Clicks</span>
              <MousePointer size={16} />
            </div>
            <div className="mt-4">
              <h3 className="text-display-sm font-display text-text-primary font-bold">
                {(analytics?.clicks || 0).toLocaleString()}
              </h3>
              <p className="text-admin-xs text-text-secondary mt-1">
                {(analytics?.ctr || 0).toFixed(1)}% Click-through Rate (CTR)
              </p>
            </div>
          </Card>

          <Card className="rounded-[14px] border border-border-primary/40 shadow-sm bg-surface p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center text-text-secondary">
              <span className="text-[10px] font-bold tracking-widest uppercase">Sales Attribution</span>
              <ShoppingCart size={16} />
            </div>
            <div className="mt-4">
              <h3 className="text-display-sm font-display text-text-primary font-bold">
                {(analytics?.ordersCount || 0).toLocaleString()}
              </h3>
              <p className="text-admin-xs text-green-600 flex items-center gap-1.5 mt-1 font-semibold">
                {(analytics?.conversion || 0).toFixed(1)}% checkout conversion
              </p>
            </div>
          </Card>

          <Card className="rounded-[14px] border border-border-primary/40 shadow-sm bg-surface p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center text-text-secondary">
              <span className="text-[10px] font-bold tracking-widest uppercase">Attribution Revenue</span>
              <DollarSign size={16} />
            </div>
            <div className="mt-4">
              <h3 className="text-display-sm font-display text-accent font-bold">
                {analytics?.revenueGenerated && analytics.revenueGenerated > 0
                  ? formatCurrency(analytics.revenueGenerated)
                  : "Rs. 0"}
              </h3>
              <p className="text-admin-xs text-text-secondary mt-1">Direct sales funnel value</p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "history" && (
        <Card className="rounded-[14px] border border-border-primary/40 shadow-sm bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-surface-secondary/50 text-[10px] font-bold tracking-widest uppercase text-text-secondary">
                  <th className="py-4 px-6">Saved Version Date</th>
                  <th className="py-4 px-6">Author / Editor</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-body-sm text-text-primary font-light">
                {post?.revisions?.length === 0 || !post?.revisions ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-text-secondary italic">
                      No past revision snapshots recorded yet.
                    </td>
                  </tr>
                ) : (
                  post.revisions.map((rev: any) => (
                    <tr key={rev.id} className="hover:bg-surface-secondary/30 transition-colors">
                      <td className="py-4 px-6 font-semibold">
                        {new Date(rev.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-text-secondary">
                        {rev.changedBy?.name || "System"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          onClick={() => handleRestore(rev.id)}
                          className="bg-surface border border-border hover:bg-border/20 text-[9px] uppercase font-bold tracking-wider px-3.5 py-1.5 h-auto text-text-primary"
                        >
                          Restore Snapshot
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
