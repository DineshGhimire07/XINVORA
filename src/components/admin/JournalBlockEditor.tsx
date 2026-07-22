"use client"

import { useState, useRef, useEffect } from "react"
import { GripVertical, Plus, Trash2, Copy, ArrowUp, ArrowDown, ShoppingBag, Layers, Image as ImageIcon, Video, Code, AlignLeft, Heading1, Heading2, Quote, AlertCircle, Minus, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AdminProductPicker from "@/components/admin/AdminProductPicker"
import AdminCollectionPicker from "@/components/admin/AdminCollectionPicker"
import { MediaSelector } from "@/components/admin/MediaSelector"

export interface JournalBlock {
  id: string
  type: "paragraph" | "heading" | "quote" | "divider" | "image" | "video" | "product" | "collection" | "button" | "code" | "callout" | "html" | "faq"
  data: any
  metadata?: any
}

interface JournalBlockEditorProps {
  initialBlocks?: JournalBlock[]
  onChange: (blocks: JournalBlock[]) => void
  allProducts: any[]
  allCollections: any[]
  mediaItems: any[]
}

const BLOCK_TYPES = [
  { type: "paragraph", label: "Paragraph", icon: AlignLeft, description: "Plain rich text content" },
  { type: "heading", label: "Heading", icon: Heading1, description: "Section titles (H2, H3)" },
  { type: "quote", label: "Quote", icon: Quote, description: "Pull quote highlighted text" },
  { type: "divider", label: "Divider", icon: Minus, description: "Horizontal separation line" },
  { type: "image", label: "Image", icon: ImageIcon, description: "Select from media library" },
  { type: "video", label: "Video Embed", icon: Video, description: "Vimeo or YouTube URL" },
  { type: "product", label: "Product Card", icon: ShoppingBag, description: "Live interactive product cards" },
  { type: "collection", label: "Collection Card", icon: Layers, description: "Live collection showcase card" },
  { type: "callout", label: "Callout", icon: AlertCircle, description: "Editorial notice callout box" },
  { type: "code", label: "Code Block", icon: Code, description: "Code snippets or configurations" },
  { type: "faq", label: "FAQ Item", icon: HelpCircle, description: "Collapsible question and answer" },
]

export default function JournalBlockEditor({
  initialBlocks = [],
  onChange,
  allProducts = [],
  allCollections = [],
  mediaItems = [],
}: JournalBlockEditorProps) {
  const [blocks, setBlocks] = useState<JournalBlock[]>(
    initialBlocks.length > 0
      ? initialBlocks
      : [{ id: "block_initial", type: "paragraph", data: { text: "" } }]
  )
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onChange(blocks)
  }, [blocks, onChange])

  // Menu click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuIndex(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const addBlock = (type: any, index: number) => {
    const newBlock: JournalBlock = {
      id: `block_${crypto.randomUUID().replace(/-/g, "")}`,
      type,
      data: getInitialDataForType(type),
      metadata: {},
    }
    const updated = [...blocks]
    updated.splice(index + 1, 0, newBlock)
    setBlocks(updated)
    setActiveMenuIndex(null)
  }

  const deleteBlock = (index: number) => {
    if (blocks.length === 1) {
      setBlocks([{ id: "block_initial", type: "paragraph", data: { text: "" } }])
      return
    }
    setBlocks(blocks.filter((_, i) => i !== index))
  }

  const duplicateBlock = (index: number) => {
    const target = blocks[index]
    const copy: JournalBlock = {
      id: `block_${crypto.randomUUID().replace(/-/g, "")}`,
      type: target.type,
      data: JSON.parse(JSON.stringify(target.data)),
      metadata: JSON.parse(JSON.stringify(target.metadata || {})),
    }
    const updated = [...blocks]
    updated.splice(index + 1, 0, copy)
    setBlocks(updated)
  }

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === blocks.length - 1) return

    const swapIndex = direction === "up" ? index - 1 : index + 1
    const updated = [...blocks]
    const temp = updated[index]
    updated[index] = updated[swapIndex]
    updated[swapIndex] = temp
    setBlocks(updated)
  }

  const updateBlockData = (index: number, data: any) => {
    const updated = [...blocks]
    updated[index].data = { ...updated[index].data, ...data }
    setBlocks(updated)
  }

  const getInitialDataForType = (type: string) => {
    switch (type) {
      case "heading":
        return { text: "", level: 2 }
      case "quote":
        return { text: "", citation: "" }
      case "image":
        return { urls: [], caption: "" }
      case "video":
        return { url: "", caption: "" }
      case "product":
        return { productId: "" }
      case "collection":
        return { collectionId: "" }
      case "callout":
        return { text: "", title: "", type: "info" }
      case "code":
        return { code: "", language: "javascript" }
      case "faq":
        return { question: "", answer: "" }
      default:
        return { text: "" }
    }
  }

  // Handle slash "/" command trigger for search menu
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    if (e.key === "/") {
      setActiveMenuIndex(index)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-admin-border pb-4">
        <div>
          <h3 className="text-admin-base font-bold text-admin-text-primary uppercase tracking-wider">
            Block Editor
          </h3>
          <p className="text-admin-xs text-admin-text-secondary mt-1">
            Type "/" in any text block to trigger slash command menu.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {blocks.map((block, index) => {
          const isActiveMenu = activeMenuIndex === index

          return (
            <div
              key={block.id}
              className="group relative flex items-start gap-4 p-4 bg-admin-surface border border-admin-border rounded-admin-lg hover:border-admin-text-secondary transition-all"
            >
              {/* Drag handles & Order operations */}
              <div className="flex flex-col gap-1 text-admin-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => moveBlock(index, "up")}
                  disabled={index === 0}
                  className="p-1 hover:text-admin-text-primary transition-colors disabled:opacity-30"
                >
                  <ArrowUp size={14} />
                </button>
                <div className="p-1 cursor-grab">
                  <GripVertical size={14} />
                </div>
                <button
                  type="button"
                  onClick={() => moveBlock(index, "down")}
                  disabled={index === blocks.length - 1}
                  className="p-1 hover:text-admin-text-primary transition-colors disabled:opacity-30"
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              {/* Editable Block Content Renderer */}
              <div className="flex-1 min-w-0">
                {block.type === "paragraph" && (
                  <textarea
                    placeholder="Start typing your paragraph... Type '/' to insert blocks"
                    value={block.data.text || ""}
                    onChange={(e) => updateBlockData(index, { text: e.target.value })}
                    onKeyDown={(e) => handleTextareaKeyDown(e, index)}
                    rows={3}
                    className="w-full bg-transparent border-none outline-none resize-none text-admin-sm leading-relaxed text-admin-text-primary focus:ring-0 p-0"
                  />
                )}

                {block.type === "heading" && (
                  <div className="flex gap-4 items-start">
                    <select
                      value={block.data.level || 2}
                      onChange={(e) => updateBlockData(index, { level: parseInt(e.target.value) })}
                      className="bg-admin-surface-hover border border-admin-border rounded-admin-sm text-admin-xs px-2 py-1 outline-none text-admin-text-primary"
                    >
                      <option value={2}>H2</option>
                      <option value={3}>H3</option>
                      <option value={4}>H4</option>
                    </select>
                    <Input
                      type="text"
                      placeholder="Heading text..."
                      value={block.data.text || ""}
                      onChange={(e) => updateBlockData(index, { text: e.target.value })}
                      className="flex-1 bg-transparent border-none outline-none focus-visible:ring-0 p-0 text-admin-md font-bold text-admin-text-primary"
                    />
                  </div>
                )}

                {block.type === "quote" && (
                  <div className="border-l-2 border-admin-text-secondary pl-4 space-y-2">
                    <textarea
                      placeholder="Pull quote text..."
                      value={block.data.text || ""}
                      onChange={(e) => updateBlockData(index, { text: e.target.value })}
                      rows={2}
                      className="w-full bg-transparent border-none outline-none resize-none italic text-admin-md leading-relaxed text-admin-text-primary focus:ring-0 p-0"
                    />
                    <Input
                      type="text"
                      placeholder="Citation (Author name)"
                      value={block.data.citation || ""}
                      onChange={(e) => updateBlockData(index, { citation: e.target.value })}
                      className="bg-transparent border-none outline-none focus-visible:ring-0 p-0 text-admin-xs text-admin-text-secondary uppercase tracking-wider"
                    />
                  </div>
                )}

                {block.type === "divider" && (
                  <div className="py-4 select-none">
                    <hr className="border-admin-border" />
                    <span className="text-[10px] text-admin-text-secondary uppercase tracking-widest block text-center mt-1">Divider</span>
                  </div>
                )}

                {block.type === "image" && (
                  <div className="space-y-4">
                    <Label className="text-admin-xs text-admin-text-secondary uppercase font-semibold">Image Selector</Label>
                    <MediaSelector
                      mediaItems={mediaItems}
                      selectedImages={block.data.urls || []}
                      onChange={(images) => updateBlockData(index, { urls: images })}
                    />
                    <Input
                      type="text"
                      placeholder="Image caption text..."
                      value={block.data.caption || ""}
                      onChange={(e) => updateBlockData(index, { caption: e.target.value })}
                      className="text-admin-xs text-admin-text-secondary bg-transparent border-none p-0 focus-visible:ring-0"
                    />
                  </div>
                )}

                {block.type === "video" && (
                  <div className="space-y-3">
                    <Label className="text-admin-xs text-admin-text-secondary uppercase font-semibold">Video URL</Label>
                    <Input
                      type="url"
                      placeholder="Enter YouTube or Vimeo Embed URL..."
                      value={block.data.url || ""}
                      onChange={(e) => updateBlockData(index, { url: e.target.value })}
                      className="text-admin-sm bg-admin-surface-hover border border-admin-border rounded-admin-md"
                    />
                    <Input
                      type="text"
                      placeholder="Video caption text..."
                      value={block.data.caption || ""}
                      onChange={(e) => updateBlockData(index, { caption: e.target.value })}
                      className="text-admin-xs text-admin-text-secondary bg-transparent border-none p-0 focus-visible:ring-0"
                    />
                  </div>
                )}

                {block.type === "product" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-admin-xs text-admin-text-secondary uppercase font-semibold">Embedded Product Card</Label>
                      {block.data.productId && !allProducts.some(p => p.id === block.data.productId) && (
                        <span className="text-red-500 text-admin-xs font-bold">This product no longer exists.</span>
                      )}
                    </div>
                    <AdminProductPicker
                      allProducts={allProducts}
                      selectedIds={block.data.productId ? [block.data.productId] : []}
                      onChange={(ids) => updateBlockData(index, { productId: ids[0] || "" })}
                      mode="single"
                      label=""
                    />
                  </div>
                )}

                {block.type === "collection" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-admin-xs text-admin-text-secondary uppercase font-semibold">Embedded Collection Showcase</Label>
                      {block.data.collectionId && !allCollections.some(c => c.id === block.data.collectionId) && (
                        <span className="text-red-500 text-admin-xs font-bold">This collection no longer exists.</span>
                      )}
                    </div>
                    <AdminCollectionPicker
                      allCollections={allCollections}
                      selectedIds={block.data.collectionId ? [block.data.collectionId] : []}
                      onChange={(ids) => updateBlockData(index, { collectionId: ids[0] || "" })}
                      mode="single"
                      label=""
                    />
                  </div>
                )}

                {block.type === "callout" && (
                  <div className="border border-admin-border bg-admin-surface-hover p-4 rounded-admin-md space-y-3">
                    <div className="flex gap-4">
                      <select
                        value={block.data.type || "info"}
                        onChange={(e) => updateBlockData(index, { type: e.target.value })}
                        className="bg-admin-surface border border-admin-border rounded-admin-sm text-admin-xs px-2 py-1 outline-none text-admin-text-primary"
                      >
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="success">Success</option>
                      </select>
                      <Input
                        type="text"
                        placeholder="Callout title..."
                        value={block.data.title || ""}
                        onChange={(e) => updateBlockData(index, { title: e.target.value })}
                        className="flex-1 bg-transparent border-none outline-none focus-visible:ring-0 p-0 text-admin-sm font-semibold text-admin-text-primary"
                      />
                    </div>
                    <textarea
                      placeholder="Callout body text..."
                      value={block.data.text || ""}
                      onChange={(e) => updateBlockData(index, { text: e.target.value })}
                      rows={2}
                      className="w-full bg-transparent border-none outline-none resize-none text-admin-sm text-admin-text-secondary p-0 focus:ring-0"
                    />
                  </div>
                )}

                {block.type === "code" && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-admin-xs text-admin-text-secondary uppercase font-semibold">Code Snippet</Label>
                      <select
                        value={block.data.language || "javascript"}
                        onChange={(e) => updateBlockData(index, { language: e.target.value })}
                        className="bg-admin-surface-hover border border-admin-border rounded-admin-sm text-admin-xs px-2 py-1 text-admin-text-primary"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Paste code snippet here..."
                      value={block.data.code || ""}
                      onChange={(e) => updateBlockData(index, { code: e.target.value })}
                      rows={4}
                      className="w-full bg-admin-surface-hover border border-admin-border rounded-admin-md p-3 font-mono text-admin-xs text-admin-text-primary focus:ring-1 focus:ring-admin-text-secondary outline-none"
                    />
                  </div>
                )}

                {block.type === "faq" && (
                  <div className="space-y-3 bg-admin-surface-hover/30 p-3 rounded-admin-md border border-admin-border">
                    <Label className="text-admin-xs text-admin-text-secondary uppercase font-semibold block">FAQ Accordion Node</Label>
                    <Input
                      type="text"
                      placeholder="Frequently Asked Question..."
                      value={block.data.question || ""}
                      onChange={(e) => updateBlockData(index, { question: e.target.value })}
                      className="bg-admin-surface text-admin-sm border border-admin-border"
                    />
                    <textarea
                      placeholder="Detailed answer..."
                      value={block.data.answer || ""}
                      onChange={(e) => updateBlockData(index, { answer: e.target.value })}
                      rows={3}
                      className="w-full bg-admin-surface border border-admin-border rounded-admin-md p-3 text-admin-sm outline-none text-admin-text-primary"
                    />
                  </div>
                )}
              </div>

              {/* Right Side Options Controls */}
              <div className="flex items-center gap-2 select-none opacity-0 group-hover:opacity-100 transition-opacity self-center">
                <button
                  type="button"
                  onClick={() => duplicateBlock(index)}
                  title="Duplicate Block"
                  className="p-2 hover:bg-admin-surface-hover rounded-admin-md text-admin-text-secondary hover:text-admin-text-primary transition-colors"
                >
                  <Copy size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteBlock(index)}
                  title="Delete Block"
                  className="p-2 hover:bg-admin-surface-hover rounded-admin-md text-admin-text-secondary hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMenuIndex(isActiveMenu ? null : index)}
                  className="p-2 hover:bg-admin-surface-hover rounded-admin-md text-admin-text-secondary hover:text-admin-text-primary transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Notion-style Slash / Plus Insert Block Menu Popover */}
              {isActiveMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-4 top-full mt-2 bg-admin-surface border border-admin-border rounded-admin-lg shadow-xl max-h-[300px] w-[260px] overflow-y-auto z-50 p-2 space-y-1"
                >
                  <div className="text-[10px] font-bold tracking-wider text-admin-text-secondary uppercase px-2 py-1 select-none">
                    Slash Blocks Menu
                  </div>
                  {BLOCK_TYPES.map((b) => {
                    const Icon = b.icon
                    return (
                      <button
                        key={b.type}
                        type="button"
                        onClick={() => addBlock(b.type, index)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-admin-surface-hover rounded-admin-md transition-colors"
                      >
                        <Icon size={16} className="text-admin-text-secondary" />
                        <div>
                          <p className="text-admin-sm font-semibold text-admin-text-primary">{b.label}</p>
                          <p className="text-[10px] text-admin-text-secondary">{b.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-center border-t border-admin-border pt-4">
        <Button
          type="button"
          onClick={() => addBlock("paragraph", blocks.length - 1)}
          className="bg-admin-surface-hover border border-admin-border text-admin-text-primary font-semibold hover:bg-admin-border transition-colors rounded-admin-md px-6 text-admin-sm"
        >
          + Add New Block
        </Button>
      </div>
    </div>
  )
}
