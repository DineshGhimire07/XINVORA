/**
 * src/domains/seo/services/product-image-metadata.service.ts
 *
 * Central Single Source of Truth for:
 * 1. Deterministic Collection-Driven Image Role Resolution (Zero AI, Zero Guessing).
 * 2. Product Image Title & Accessible Alt Text Generation.
 * 3. Recommended SEO Filename Generation (Metadata only — never alters storage URLs).
 * 4. Transactional Synchronization & Manual Override Protection.
 */

import { eq, and, asc, inArray } from "drizzle-orm"
import { db } from "@/db/client"
import {
  products,
  productImages,
  collections,
  productCollections,
  collectionImageRoleTemplates,
  collectionImageRoles,
  SUPPORTED_IMAGE_ROLES,
  type ImageRoleType,
} from "@/db/schema"

export interface ResolvedImageRole {
  role: string
  label: string
}

export interface GeneratedImageMetadata {
  url: string
  position: number
  imageRole: string | null
  roleLabel: string | null
  altText: string
  altTextSource: "auto" | "manual"
  title: string
  recommendedFilename: string
}

export interface TemplateWithRoles {
  id: string
  name: string
  collectionId: string | null
  isActive: boolean
  roles: {
    position: number
    role: string
    label: string
  }[]
}

export class ProductImageMetadataService {
  /**
   * Controlled registry map of supported roles to immutable human-readable display labels.
   */
  public static readonly ROLE_MAP: Record<string, string> = Object.freeze(
    SUPPORTED_IMAGE_ROLES.reduce((acc, curr) => {
      acc[curr.role] = curr.label
      return acc
    }, {} as Record<string, string>)
  )

  /**
   * Returns human-readable label for a valid role key, or null if unmapped.
   */
  public static getRoleLabel(roleKey: string | null | undefined): string | null {
    if (!roleKey) return null
    return this.ROLE_MAP[roleKey] || null
  }

  /**
   * Deterministically resolves the active Image Role Template for a product based on strict hierarchy:
   * 1. product.imageRoleTemplateId (explicit product override if active)
   * 2. product.primaryCollectionId -> active template
   * 3. product_collections -> lowest collection sort_order / created_at with active template
   * 4. Fallback: null (Zero guessing)
   */
  public static async resolveProductImageTemplate(
    product: {
      id?: string
      imageRoleTemplateId?: string | null
      primaryCollectionId?: string | null
    },
    collectionIds?: string[],
    tx: any = db
  ): Promise<TemplateWithRoles | null> {
    // 1. Explicit Product-Level Template Override
    if (product.imageRoleTemplateId) {
      const explicitTemplate = await tx.query.collectionImageRoleTemplates.findFirst({
        where: and(
          eq(collectionImageRoleTemplates.id, product.imageRoleTemplateId),
          eq(collectionImageRoleTemplates.isActive, true)
        ),
        with: {
          roles: {
            orderBy: [asc(collectionImageRoles.position)],
          },
        },
      })
      if (explicitTemplate) return explicitTemplate as TemplateWithRoles
    }

    // 2. Primary / Designated Collection Active Template
    if (product.primaryCollectionId) {
      const primaryTemplate = await tx.query.collectionImageRoleTemplates.findFirst({
        where: and(
          eq(collectionImageRoleTemplates.collectionId, product.primaryCollectionId),
          eq(collectionImageRoleTemplates.isActive, true)
        ),
        with: {
          roles: {
            orderBy: [asc(collectionImageRoles.position)],
          },
        },
      })
      if (primaryTemplate) return primaryTemplate as TemplateWithRoles
    }

    // 3. Associated Collections (Deterministic Ordering: sortOrder ASC, createdAt ASC)
    let candidateCollectionIds = collectionIds || []
    if (candidateCollectionIds.length === 0 && product.id) {
      const linked = await tx
        .select({ collectionId: productCollections.collectionId })
        .from(productCollections)
        .where(eq(productCollections.productId, product.id))
      candidateCollectionIds = linked.map((l: any) => l.collectionId)
    }

    if (candidateCollectionIds.length > 0) {
      // Fetch collections ordered deterministically
      const orderedCollections = await tx
        .select({ id: collections.id })
        .from(collections)
        .where(inArray(collections.id, candidateCollectionIds))
        .orderBy(asc(collections.sortOrder), asc(collections.createdAt))

      for (const col of orderedCollections) {
        const colTemplate = await tx.query.collectionImageRoleTemplates.findFirst({
          where: and(
            eq(collectionImageRoleTemplates.collectionId, col.id),
            eq(collectionImageRoleTemplates.isActive, true)
          ),
          with: {
            roles: {
              orderBy: [asc(collectionImageRoles.position)],
            },
          },
        })
        if (colTemplate) return colTemplate as TemplateWithRoles
      }
    }

    // 4. No Template Configured
    return null
  }

  /**
   * Deterministically resolves image role from template and 1-indexed position.
   * If template has no entry for this position, returns null. (Never guesses!)
   */
  public static resolveImageRole(
    position: number,
    template: TemplateWithRoles | null | undefined
  ): ResolvedImageRole | null {
    if (!template || !template.roles || template.roles.length === 0) {
      return null
    }

    const matchedRole = template.roles.find((r) => r.position === position)
    if (!matchedRole) {
      return null
    }

    const label = this.getRoleLabel(matchedRole.role) || matchedRole.label || matchedRole.role
    return {
      role: matchedRole.role,
      label,
    }
  }

  /**
   * Generates descriptive, accessible Alt Text:
   * - With role: "{productName} - {roleLabel}" (e.g. "Black Sculpt Crop Top - Lifestyle")
   * - Without role: "{productName} - Photo {position}" (e.g. "Black Sculpt Crop Top - Photo 1")
   */
  public static generateImageAltText(
    productName: string,
    roleLabel: string | null | undefined,
    position: number
  ): string {
    const cleanName = (productName || "Product").trim()
    if (roleLabel && roleLabel.trim()) {
      return `${cleanName} - ${roleLabel.trim()}`
    }
    return `${cleanName} - Photo ${position}`
  }

  /**
   * Generates human-readable Media Library Title.
   */
  public static generateImageTitle(
    productName: string,
    roleLabel: string | null | undefined,
    position: number
  ): string {
    return this.generateImageAltText(productName, roleLabel, position)
  }

  /**
   * Generates a recommended SEO-friendly filename metadata string.
   * NOTE: This is metadata only; it does NOT rewrite physical storage URLs or keys.
   */
  public static generateRecommendedFilename(
    productSlug: string,
    roleKey: string | null | undefined,
    position: number,
    originalUrl?: string
  ): string {
    const cleanSlug = (productSlug || "product")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const rolePart = roleKey
      ? roleKey.toLowerCase().replace(/_/g, "-")
      : `photo-${position}`

    let extension = "webp"
    if (originalUrl) {
      const match = originalUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
      if (match && match[1]) {
        extension = match[1].toLowerCase()
      }
    }

    return `${cleanSlug}-${rolePart}.${extension}`
  }

  /**
   * Generates complete structured metadata for a set of product images.
   */
  public static generateMetadataForProduct(params: {
    productName: string
    productSlug: string
    images: {
      url: string
      altText?: string | null
      altTextSource?: "auto" | "manual" | null
      position?: number
      role?: string | null
    }[]
    template?: TemplateWithRoles | null
  }): GeneratedImageMetadata[] {
    const { productName, productSlug, images, template } = params

    return images.map((img, index) => {
      const position = typeof img.position === "number" && img.position > 0 ? img.position : index + 1
      
      let role: string | null = null
      let roleLabel: string | null = null

      if (img.role && img.role !== "auto") {
        role = img.role
        roleLabel = this.getRoleLabel(img.role) || img.role
      } else {
        const roleResult = this.resolveImageRole(position, template)
        role = roleResult?.role || null
        roleLabel = roleResult?.label || null
      }

      const isManual = img.altTextSource === "manual" && Boolean(img.altText && img.altText.trim())
      const autoAlt = this.generateImageAltText(productName, roleLabel, position)
      const altText = isManual ? (img.altText as string).trim() : autoAlt
      const altTextSource: "auto" | "manual" = isManual ? "manual" : "auto"
      const title = this.generateImageTitle(productName, roleLabel, position)
      const recommendedFilename = this.generateRecommendedFilename(productSlug, role, position, img.url)

      return {
        url: img.url,
        position,
        imageRole: role,
        roleLabel,
        altText,
        altTextSource,
        title,
        recommendedFilename,
      }
    })
  }

  /**
   * Transactionally synchronizes product image roles and auto-generated alt text for a product.
   * Protects manual alt text overrides (altTextSource = 'manual').
   */
  public static async syncProductImagesMetadata(
    productId: string,
    tx: any = db
  ): Promise<void> {
    const [product] = await tx
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        primaryCollectionId: products.primaryCollectionId,
        imageRoleTemplateId: products.imageRoleTemplateId,
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    if (!product) {
      return
    }

    const existingImages = await tx
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.position))

    if (!existingImages || existingImages.length === 0) {
      return
    }

    const linkedCollections = await tx
      .select({ collectionId: productCollections.collectionId })
      .from(productCollections)
      .where(eq(productCollections.productId, productId))

    const collectionIds = linkedCollections.map((pc: any) => pc.collectionId)
    const template = await this.resolveProductImageTemplate(product, collectionIds, tx)

    for (let index = 0; index < existingImages.length; index++) {
      const img = existingImages[index]
      const position = index + 1 // Position is always strictly 1-indexed based on order
      const roleResult = this.resolveImageRole(position, template)
      const role = roleResult?.role || null
      const roleLabel = roleResult?.label || null

      const isManual = img.altTextSource === "manual" && Boolean(img.altText && img.altText.trim())
      const altText = isManual ? img.altText : this.generateImageAltText(product.name, roleLabel, position)

      await tx
        .update(productImages)
        .set({
          position,
          imageRole: role,
          altText,
          altTextSource: isManual ? "manual" : "auto",
        })
        .where(eq(productImages.id, img.id))
    }
  }

  /**
   * Resynchronizes all products that belong to a specific collection (or template).
   * Called whenever a collection image-role template is added, updated, or reordered.
   */
  public static async syncProductsForTemplate(
    templateId: string,
    tx: any = db
  ): Promise<{ updatedCount: number }> {
    const template = await tx.query.collectionImageRoleTemplates.findFirst({
      where: eq(collectionImageRoleTemplates.id, templateId),
    })

    if (!template) return { updatedCount: 0 }

    // Find all products directly linked via imageRoleTemplateId OR via collectionId
    const candidateProducts = await tx
      .select({ id: products.id })
      .from(products)
      .where(
        template.collectionId
          ? and(
              eq(products.primaryCollectionId, template.collectionId)
            )
          : eq(products.imageRoleTemplateId, templateId)
      )

    let count = 0
    for (const p of candidateProducts) {
      await this.syncProductImagesMetadata(p.id, tx)
      count++
    }

    // Also sync products linked via productCollections
    if (template.collectionId) {
      const linkedProducts = await tx
        .select({ productId: productCollections.productId })
        .from(productCollections)
        .where(eq(productCollections.collectionId, template.collectionId))

      for (const lp of linkedProducts) {
        if (!candidateProducts.some((cp: any) => cp.id === lp.productId)) {
          await this.syncProductImagesMetadata(lp.productId, tx)
          count++
        }
      }
    }

    return { updatedCount: count }
  }

  /**
   * Safe, non-destructive, idempotent backfill for all existing products in PostgreSQL.
   */
  public static async backfillProductImageMetadata(): Promise<{
    totalProducts: number
    updatedProducts: number
  }> {
    const allProducts = await db.select({ id: products.id }).from(products)
    let updated = 0

    for (const p of allProducts) {
      await this.syncProductImagesMetadata(p.id, db)
      updated++
    }

    return {
      totalProducts: allProducts.length,
      updatedProducts: updated,
    }
  }
}
