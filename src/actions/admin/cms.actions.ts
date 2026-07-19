"use server"

import { revalidatePath } from "next/cache"
import { CMSService } from "@/services/cms.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
})

export async function createCMSPageAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      seoTitle: formData.get("seoTitle") || undefined,
      seoDescription: formData.get("seoDescription") || undefined,
      status: formData.get("status"),
    }

    const data = pageSchema.parse(rawData)

    await CMSService.createPage(data, session.id)

    revalidatePath("/admin/cms/pages")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create CMS page" }
  }
}

export async function updateCMSPageAction(id: string, formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      seoTitle: formData.get("seoTitle") || undefined,
      seoDescription: formData.get("seoDescription") || undefined,
      status: formData.get("status"),
    }

    const data = pageSchema.parse(rawData)

    await CMSService.updatePage(id, data, session.id)

    revalidatePath("/admin/cms/pages")
    revalidatePath(`/admin/cms/pages/${id}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update CMS page" }
  }
}

export async function archiveCMSPageAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    await CMSService.deletePage(id, session.id)
    revalidatePath("/admin/cms/pages")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive CMS page" }
  }
}

import { db } from "@/db/client"
import { cmsPages, cmsSections, cmsBlocks } from "@/db/schema/cms"
import { eq, and } from "drizzle-orm"

// Blocks/Sections simplified for now
export async function addCMSSectionAction(pageId: string, name: string) {
  try {
    const session = await SessionService.requireAdmin()
    await CMSService.addSection(pageId, { name }, session.id)
    revalidatePath(`/admin/cms/pages/${pageId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add section" }
  }
}

export async function updateHomepageSettingsAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    // Resolve homepage page and default section first
    let page = await db.query.cmsPages.findFirst({
      where: eq(cmsPages.slug, "home"),
    })
    if (!page) {
      const [newPage] = await db.insert(cmsPages).values({
        slug: "home",
        title: "Homepage",
        status: "PUBLISHED",
      }).returning()
      page = newPage
    }

    let section = await db.query.cmsSections.findFirst({
      where: eq(cmsSections.pageId, page.id),
    })
    if (!section) {
      const [newSection] = await db.insert(cmsSections).values({
        pageId: page.id,
        name: "Default Section",
        sortOrder: 0,
      }).returning()
      section = newSection
    }

    // Save Banners and update temporary layoutConfig section order keys
    const bannersDataStr = formData.get("bannersData") as string
    const tempIdMap = new Map<string, string>()
    if (bannersDataStr) {
      try {
        const bannersData = JSON.parse(bannersDataStr) as any[]
        const incomingIds = bannersData.map((b) => b.id).filter((id) => !id.startsWith("temp-"))
        
        // Fetch all existing banner blocks
        const existingBanners = await db.query.cmsBlocks.findMany({
          where: and(
            eq(cmsBlocks.sectionId, section.id),
            eq(cmsBlocks.type, "BANNER")
          ),
        })

        // Delete banners that are no longer present
        const activeIds = bannersData.map(b => b.id)
        const toDelete = existingBanners.filter((b) => !activeIds.includes(b.id))
        for (const block of toDelete) {
          await db.delete(cmsBlocks).where(eq(cmsBlocks.id, block.id))
        }

        // Insert or update banners
        for (let idx = 0; idx < bannersData.length; idx++) {
          const b = bannersData[idx]
          if (b.id.startsWith("temp-")) {
            const [inserted] = await db.insert(cmsBlocks).values({
              sectionId: section.id,
              type: "BANNER",
              data: b.data,
              sortOrder: idx,
            }).returning()
            tempIdMap.set(b.id, inserted.id)
          } else {
            await db.update(cmsBlocks).set({
              data: b.data,
              sortOrder: idx,
              updatedAt: new Date(),
            }).where(eq(cmsBlocks.id, b.id))
          }
        }
      } catch (err) {
        console.error("Failed to update homepage banners in action:", err)
      }
    }

    // Resolve dynamic keys in layoutConfig
    let layoutConfig = {}
    const layoutConfigStr = formData.get("layoutConfig") as string
    if (layoutConfigStr) {
      try {
        const parsed = JSON.parse(layoutConfigStr)
        if (Array.isArray(parsed.sectionOrder)) {
          parsed.sectionOrder = parsed.sectionOrder.map((key: string) => {
            if (key.startsWith("banner-temp-")) {
              const tempId = key.replace("banner-", "")
              const dbId = tempIdMap.get(tempId)
              return dbId ? `banner-${dbId}` : key
            }
            return key
          })
        }
        layoutConfig = parsed
      } catch (e) {
        console.error("Failed to parse/update layoutConfig in server action", e)
      }
    }

    const rawData = {
      newsletterToggle: formData.get("newsletterToggle") === "on",
      layoutConfig,
    }

    await CMSService.updateHomepageSettings(rawData, session.id)

    // Save Hero Carousel Slides (heroRotation) directly into cmsBlocks HERO block
    const heroSlidesStr = formData.get("heroSlides") as string
    if (heroSlidesStr) {
      try {
        const slides = JSON.parse(heroSlidesStr)
        
        // Find HERO block
        let heroBlock = await db.query.cmsBlocks.findFirst({
          where: and(
            eq(cmsBlocks.sectionId, section.id),
            eq(cmsBlocks.type, "HERO")
          ),
        })

        if (heroBlock) {
          await db.update(cmsBlocks).set({
            data: { slides },
            updatedAt: new Date(),
          }).where(eq(cmsBlocks.id, heroBlock.id))
        } else {
          await db.insert(cmsBlocks).values({
            sectionId: section.id,
            type: "HERO",
            sortOrder: 0,
            data: { slides },
          })
        }
      } catch (err) {
        console.error("Failed to update homepage HERO blocks in action:", err)
      }
    }

    // Save Product Grid Items directly into cmsBlocks PRODUCT_GRID block
    const productGridItemsStr = formData.get("productGridItems") as string
    if (productGridItemsStr) {
      try {
        const items = JSON.parse(productGridItemsStr)
        
        let pgBlock = await db.query.cmsBlocks.findFirst({
          where: and(
            eq(cmsBlocks.sectionId, section.id),
            eq(cmsBlocks.type, "PRODUCT_GRID")
          ),
        })

        if (pgBlock) {
          await db.update(cmsBlocks).set({
            data: { items },
            updatedAt: new Date(),
          }).where(eq(cmsBlocks.id, pgBlock.id))
        } else {
          await db.insert(cmsBlocks).values({
            sectionId: section.id,
            type: "PRODUCT_GRID",
            sortOrder: 1,
            data: { items },
          })
        }
      } catch (err) {
        console.error("Failed to update homepage PRODUCT_GRID blocks in action:", err)
      }
    }

    // Save Collection Grid IDs directly into cmsBlocks COLLECTION_GRID block
    const collectionGridIdsStr = formData.get("collectionGridIds") as string
    if (collectionGridIdsStr) {
      try {
        const collectionIds = JSON.parse(collectionGridIdsStr)
        
        let cgBlock = await db.query.cmsBlocks.findFirst({
          where: and(
            eq(cmsBlocks.sectionId, section.id),
            eq(cmsBlocks.type, "COLLECTION_GRID")
          ),
        })

        if (cgBlock) {
          await db.update(cmsBlocks).set({
            data: { collectionIds },
            updatedAt: new Date(),
          }).where(eq(cmsBlocks.id, cgBlock.id))
        } else {
          await db.insert(cmsBlocks).values({
            sectionId: section.id,
            type: "COLLECTION_GRID",
            sortOrder: 2,
            data: { collectionIds },
          })
        }
      } catch (err) {
        console.error("Failed to update homepage COLLECTION_GRID blocks in action:", err)
      }
    }
    // Save LOOKBOOK block data
    const lookbookSlidesStr = formData.get("lookbookSlides") as string
    if (lookbookSlidesStr) {
      try {
        const slides = JSON.parse(lookbookSlidesStr)
        
        let page = await db.query.cmsPages.findFirst({
          where: eq(cmsPages.slug, "home"),
        })
        if (page) {
          let section = await db.query.cmsSections.findFirst({
            where: eq(cmsSections.pageId, page.id),
          })
          if (section) {
            let lookbookBlock = await db.query.cmsBlocks.findFirst({
              where: and(
                eq(cmsBlocks.sectionId, section.id),
                eq(cmsBlocks.type, "LOOKBOOK")
              ),
            })

            if (lookbookBlock) {
              await db.update(cmsBlocks).set({
                data: { slides },
                updatedAt: new Date(),
              }).where(eq(cmsBlocks.id, lookbookBlock.id))
            } else {
              await db.insert(cmsBlocks).values({
                sectionId: section.id,
                type: "LOOKBOOK",
                sortOrder: 4,
                data: { slides },
              })
            }
          }
        }
      } catch (err) {
        console.error("Failed to update homepage LOOKBOOK block in action:", err)
      }
    }


    revalidatePath("/admin/cms/homepage")
    revalidatePath("/") // Revalidate storefront homepage
    revalidatePath("/products", "layout") // Refresh all PDPs so compact lookbook carousel appears
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update homepage settings" }
  }
}

export async function createProductFromCmsAction(data: {
  name: string
  slug: string
  description: string
  categoryId: string
  brandId: string | null
  basePrice: string
  stockQuantity: string
  imageUrl: string
  collectionIds: string[]
  materialIds: string[]
}) {
  try {
    const session = await SessionService.requireAdmin()
    const { AdminProductService } = await import("@/services/admin.product.service")

    const productPayload = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId,
      brandId: data.brandId || null,
      status: "PUBLISHED" as const,
      basePrice: data.basePrice,
      stockQuantity: data.stockQuantity,
      images: [data.imageUrl],
      collectionIds: data.collectionIds,
      materialIds: data.materialIds,
    }

    const product = await AdminProductService.createProduct(productPayload, session.id)

    revalidatePath("/admin/products")
    
    return { 
      success: true, 
      product: { 
        id: product.id, 
        name: product.name, 
        slug: product.slug, 
        image: data.imageUrl 
      } 
    }
  } catch (error: any) {
    console.error("[createProductFromCmsAction] Error:", error)
    return { success: false, error: error.message || "Failed to create product from CMS" }
  }
}
