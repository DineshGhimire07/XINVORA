import * as React from "react"
import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import DOMPurify from "isomorphic-dompurify"

// In a real implementation, this would import specific block components
// e.g. HeroBlock, RichTextBlock, ImageBlock, etc.

export function CMSBlockRenderer({ block }: { block: any }) {
  if (!block || !block.type) return null

  switch (block.type) {
    case "RICHTEXT":
      const cleanHTML = DOMPurify.sanitize(block.data.content || "", {
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      })
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
