import { db } from "@/db/client"
import { cmsPages, cmsSections, cmsBlocks } from "@/db/schema/cms"
import { products, variants, priceBooks, priceBookEntries } from "@/db/schema"
import { eq, and, isNull, inArray } from "drizzle-orm"

export async function findProductsByIds(ids: string[]) {
  if (!ids || ids.length === 0) return []

  const items = await db.query.products.findMany({
    where: and(
      eq(products.status, "PUBLISHED"),
      inArray(products.id, ids)
    ),
    with: {
      productImages: {
        orderBy: (img, { asc }) => [asc(img.position)],
        columns: { url: true, altText: true },
      },
      variants: {
        where: (v, { eq, and, isNull }) => and(eq(v.isActive, true), isNull(v.deletedAt)),
        with: {
          color: true,
          size: true,
        }
      }
    },
    columns: { id: true, slug: true, name: true },
  })

  // Fetch prices for items
  const productIds = items.map(i => i.id)
  let prices: any[] = []
  if (productIds.length > 0) {
    prices = await db
      .select({
        productId: variants.productId,
        price: priceBookEntries.price,
      })
      .from(variants)
      .innerJoin(priceBookEntries, eq(variants.id, priceBookEntries.variantId))
      .innerJoin(priceBooks, and(eq(priceBookEntries.priceBookId, priceBooks.id), eq(priceBooks.isDefault, true)))
      .where(and(inArray(variants.productId, productIds), isNull(variants.deletedAt), eq(variants.isActive, true)))
  }

  const itemsWithPrices = items.map(item => {
    const itemPrices = prices.filter(p => p.productId === item.id)
    const lowestPrice = itemPrices.length > 0 ? Math.min(...itemPrices.map(p => p.price)) : null
    
    return {
      ...item,
      lowestPrice,
    }
  })

  // Order rows exactly as in the ids array parameter
  const orderMap = new Map(ids.map((id, index) => [id, index]))
  return itemsWithPrices
    .sort((a, b) => {
      const indexA = orderMap.get(a.id) ?? 9999
      const indexB = orderMap.get(b.id) ?? 9999
      return indexA - indexB
    })
}

export async function getHomepageCMS() {
  // Try to find the homepage record
  let page = await db.query.cmsPages.findFirst({
    where: and(
      eq(cmsPages.slug, "home"),
      isNull(cmsPages.deletedAt)
    ),
    with: {
      sections: {
        with: {
          blocks: true,
        },
      },
    },
  })

  // If homepage record doesn't exist, create it (along with a default section & HERO / PRODUCT_GRID blocks)
  if (!page) {
    try {
      const [newPage] = await db.insert(cmsPages).values({
        slug: "home",
        title: "Homepage",
        status: "PUBLISHED",
      }).returning()

      const [newSection] = await db.insert(cmsSections).values({
        pageId: newPage.id,
        name: "Hero Section",
        sortOrder: 0,
      }).returning()

      await db.insert(cmsBlocks).values({
        sectionId: newSection.id,
        type: "HERO",
        sortOrder: 0,
        data: {
          slides: [
            {
              id: "slide-default-1",
              imageDesktopUrl: "/assets/brand/hero/hero-bg.png",
              imageMobileUrl: "/assets/brand/hero/hero-bg.png",
              redirectUrl: "/collections",
              altText: "Elevate Everyday Living",
              isActive: true,
            }
          ]
        },
      })

      await db.insert(cmsBlocks).values({
        sectionId: newSection.id,
        type: "PRODUCT_GRID",
        sortOrder: 1,
        data: { items: [] },
      })

      // Query again to get the populated structure
      page = await db.query.cmsPages.findFirst({
        where: eq(cmsPages.id, newPage.id),
        with: {
          sections: {
            with: {
              blocks: true,
            },
          },
        },
      })
    } catch (error) {
      console.error("Failed to auto-seed homepage CMS record:", error)
    }
  } else {
    // If homepage exists, ensure it has a PRODUCT_GRID block
    let productGridBlock = null
    const firstSection = page.sections[0]
    for (const section of page.sections) {
      const block = section.blocks?.find((b: any) => b.type === "PRODUCT_GRID")
      if (block) {
        productGridBlock = block
        break
      }
    }

    if (!productGridBlock && firstSection) {
      try {
        await db.insert(cmsBlocks).values({
          sectionId: firstSection.id,
          type: "PRODUCT_GRID",
          sortOrder: 1,
          data: { items: [] },
        })

        // Re-query to get updated page structure
        page = await db.query.cmsPages.findFirst({
          where: eq(cmsPages.id, page.id),
          with: {
            sections: {
              with: {
                blocks: true,
              },
            },
          },
        })
      } catch (err) {
        console.error("Failed to seed missing PRODUCT_GRID block:", err)
      }
    }
  }

  return page
}
