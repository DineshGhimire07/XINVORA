import type { NormalizedSEOEntity } from "../contracts/entity.contract"

export interface CrawlGraphNode {
  id: string
  name: string
  entityType: string
  path: string
  inboundLinksCount: number
  outboundLinksCount: number
  linkDepth: number
  isOrphan: boolean
}

export interface CrawlGraphReport {
  totalNodes: number
  orphanNodesCount: number
  nodes: CrawlGraphNode[]
  orphanNodes: CrawlGraphNode[]
}

export class SEOCrawlGraphEngine {
  public static buildCrawlGraph(entities: NormalizedSEOEntity[]): CrawlGraphReport {
    const nodesMap = new Map<string, CrawlGraphNode>()

    // Initialize nodes
    entities.forEach((entity) => {
      nodesMap.set(entity.id, {
        id: entity.id,
        name: entity.name,
        entityType: entity.entityType,
        path: entity.canonicalUrl || entity.path,
        inboundLinksCount: 0,
        outboundLinksCount: 0,
        linkDepth: entity.entityType === "CMS_PAGE" ? 1 : entity.entityType === "COLLECTION" ? 2 : 3,
        isOrphan: false,
      })
    })

    // Simulate inbound link counts from content body analysis
    entities.forEach((entity) => {
      const contentStr = JSON.stringify(entity.raw || {})
      nodesMap.forEach((targetNode, targetId) => {
        if (targetId !== entity.id && contentStr.includes(targetNode.path)) {
          targetNode.inboundLinksCount += 1
          const sourceNode = nodesMap.get(entity.id)
          if (sourceNode) sourceNode.outboundLinksCount += 1
        }
      })
    })

    // Mark orphan nodes (published entities with 0 inbound links)
    const nodes = Array.from(nodesMap.values())
    const orphanNodes: CrawlGraphNode[] = []

    nodes.forEach((node) => {
      if (node.inboundLinksCount === 0 && node.entityType !== "CMS_PAGE") {
        node.isOrphan = true
        orphanNodes.push(node)
      }
    })

    return {
      totalNodes: nodes.length,
      orphanNodesCount: orphanNodes.length,
      nodes,
      orphanNodes,
    }
  }
}
