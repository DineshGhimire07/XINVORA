import type { NormalizedSEOEntity } from "../contracts/entity.contract"

export interface InternalLinkSuggestion {
  entityId: string
  entityType: string
  entityName: string
  path: string
  anchorText: string
  contextSnippet: string
}

export class SEOInternalLinkEngine {
  public static analyzeContentForLinks(
    content: string,
    allEntities: NormalizedSEOEntity[],
    currentEntityId?: string
  ): InternalLinkSuggestion[] {
    if (!content || content.trim().length === 0) return []

    const suggestions: InternalLinkSuggestion[] = []
    const lowerContent = content.toLowerCase()

    for (const entity of allEntities) {
      if (currentEntityId && entity.id === currentEntityId) continue

      const name = entity.name.trim()
      if (name.length < 3) continue

      const lowerName = name.toLowerCase()
      const index = lowerContent.indexOf(lowerName)

      if (index !== -1) {
        // Extract surrounding context snippet
        const start = Math.max(0, index - 30)
        const end = Math.min(content.length, index + name.length + 30)
        const snippet = content.slice(start, end).replace(/\s+/g, " ")

        suggestions.push({
          entityId: entity.id,
          entityType: entity.entityType,
          entityName: entity.name,
          path: entity.canonicalUrl || entity.path,
          anchorText: name,
          contextSnippet: `"...${snippet}..."`,
        })
      }
    }

    return suggestions
  }

  public static injectLinksIntoContent(
    content: string,
    linksToInject: Array<{ anchorText: string; path: string }>
  ): string {
    let result = content

    for (const item of linksToInject) {
      const regex = new RegExp(`\\b(${this.escapeRegExp(item.anchorText)})\\b`, "i")
      // Replace first match with markdown link if not already inside a markdown link
      result = result.replace(regex, `[$1](${item.path})`)
    }

    return result
  }

  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }
}
