import * as React from "react"
import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import sanitizeHtml from "sanitize-html"

// Server-safe HTML sanitizer — no jsdom, no ERR_REQUIRE_ESM.
// sanitize-html runs cleanly in Node.js Server Components under Next.js + Turbopack.

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img", "h1", "h2", "h3", "h4", "h5", "h6",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height", "loading"],
    "*": ["class", "id", "style"],
  },
  // Mirror the old DOMPurify FORBID_TAGS / FORBID_ATTR behaviour
  disallowedTagsMode: "discard",
  allowedSchemes: ["http", "https", "mailto", "tel"],
}

export function CMSBlockRenderer({ block }: { block: any }) {
  if (!block || !block.type) return null

  switch (block.type) {
    case "RICHTEXT": {
      const cleanHTML = sanitizeHtml(block.data.content || "", SANITIZE_OPTIONS)
      return (
        <Section padding="xl" className="bg-background">
          <Container>
            <div
              className="prose prose-neutral max-w-3xl mx-auto text-text-secondary"
              dangerouslySetInnerHTML={{ __html: cleanHTML }}
            />
          </Container>
        </Section>
      )
    }
    case "HERO":
      return (
        <Section padding="2xl" className="bg-surface-elevated text-center">
          <Container>
            <h1 className="text-display-lg font-display text-text-primary uppercase tracking-wide">
              {block.data.title || "CMS Hero"}
            </h1>
            <p className="text-body-lg text-text-secondary mt-4 max-w-2xl mx-auto">
              {block.data.subtitle}
            </p>
          </Container>
        </Section>
      )
    default:
      return (
        <div className="p-8 border border-dashed border-border/40 text-center text-text-secondary text-body-sm">
          Unsupported block type: {block.type}
        </div>
      )
  }
}
