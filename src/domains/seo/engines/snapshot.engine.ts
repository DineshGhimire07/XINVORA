import type { NormalizedSEOEntity } from "../contracts/entity.contract"
import crypto from "crypto"

export interface PageSnapshotPayload {
  url: string
  entityType: string
  entityId: string
  title: string | null
  metaDescription: string | null
  headings: Array<{ level: number; text: string }>
  links: Array<{ href: string; text: string }>
  images: Array<{ url: string; alt?: string | null }>
  schemaData: any
  htmlHash: string
}

export class SEOSnapshotEngine {
  public static createSnapshotPayload(entity: NormalizedSEOEntity): PageSnapshotPayload {
    const rawContent = `${entity.name}_${entity.seoTitle || ""}_${entity.seoDescription || ""}`
    const htmlHash = crypto.createHash("sha256").update(rawContent).digest("hex")

    return {
      url: entity.path,
      entityType: entity.entityType,
      entityId: entity.id,
      title: entity.seoTitle || entity.name,
      metaDescription: entity.seoDescription,
      headings: [{ level: 1, text: entity.name }],
      links: [],
      images: entity.images || [],
      schemaData: {},
      htmlHash,
    }
  }
}
