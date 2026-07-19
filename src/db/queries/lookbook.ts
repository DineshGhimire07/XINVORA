import "server-only"
import { db } from "../client"
import { products, productPairings, priceBooks, priceBookEntries, variants, cmsPages, cmsSections, cmsBlocks } from "../schema"
import { eq, and, asc, isNull, inArray } from "drizzle-orm"

/**
 * Fetches the active LOOKBOOK slides from the CMS homepage block,
 * plus full linked-product details (images, pricing, stock, default variant ID)
 * for the product grid shown under each active slide.
 */
export async function findLookbookSlides() {
  // 1. Find the home page page record
  const page = await db.query.cmsPages.findFirst({
    where: and(eq(cmsPages.slug, "home"), isNull(cmsPages.deletedAt)),
    with: {
      sections: {
        with: { blocks: true },
      },
    },
  })

  if (!page) return { slides: [], products: [] }

  // 2. Find the LOOKBOOK block
  let lookbookBlock: any = null
  for (const section of page.sections) {
    const found = section.blocks?.find((b: any) => b.type === "LOOKBOOK")
    if (found) { lookbookBlock = found; break }
  }

  if (!lookbookBlock) return { slides: [], products: [] }

  const allSlides: any[] = lookbookBlock.data?.slides || []
  const activeSlides = allSlides.filter((s: any) => s.isActive && s.imageUrl)
  if (activeSlides.length === 0) return { slides: activeSlides, products: [] }

  // 3. Collect linked product IDs
  const linkedProductIds: string[] = activeSlides
    .flatMap((s: any) => s.linkedProductIds || (s.linkedProductId ? [s.linkedProductId] : []))
    .filter(Boolean)

  if (linkedProductIds.length === 0) return { slides: activeSlides, products: [] }

  // 4. Query full product cards with images, variants, and stock
  const items = await db.query.products.findMany({
    where: and(
      eq(products.status, "PUBLISHED"),
      inArray(products.id, linkedProductIds)
    ),
    with: {
      productImages: {
        orderBy: (img, { asc }) => [asc(img.position)],
        columns: { url: true, altText: true },
      },
      variants: {
        where: (v, { eq, and, isNull }) => and(eq(v.isActive, true), isNull(v.deletedAt)),
        with: {
          inventory: {
            columns: { quantity: true },
          },
        },
      },
    },
    columns: { id: true, slug: true, name: true },
  })

  if (items.length === 0) return { slides: activeSlides, products: [] }

  // Fetch default-pricebook prices
  const variantIds = items.flatMap((item) => item.variants.map((v) => v.id))
  let prices: any[] = []
  if (variantIds.length > 0) {
    prices = await db
      .select({
        variantId: priceBookEntries.variantId,
        price: priceBookEntries.price,
        compareAtPrice: priceBookEntries.compareAtPrice,
      })
      .from(priceBookEntries)
      .innerJoin(
        priceBooks,
        and(eq(priceBookEntries.priceBookId, priceBooks.id), eq(priceBooks.isDefault, true))
      )
      .where(inArray(priceBookEntries.variantId, variantIds))
  }

  // Map and assemble details
  const productsWithPricesAndStock = items.map((item) => {
    const productVariants = item.variants.map((v) => {
      const pEntry = prices.find((p) => p.variantId === v.id)
      return {
        ...v,
        price: pEntry ? pEntry.price : null,
        compareAtPrice: pEntry ? pEntry.compareAtPrice : null,
      }
    })

    const activePrices = productVariants.map((v) => v.price).filter((p): p is number => p !== null)
    const lowestPrice = activePrices.length > 0 ? Math.min(...activePrices) : null

    const activeComparePrices = productVariants
      .map((v) => v.compareAtPrice)
      .filter((p): p is number => p !== null)
    const compareAtPrice = activeComparePrices.length > 0 ? Math.min(...activeComparePrices) : null

    const inStock = productVariants.some((v) => v.inventory && v.inventory.quantity > 0)
    const defaultVariant =
      productVariants.find((v) => v.inventory && v.inventory.quantity > 0) || productVariants[0]

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      productImages: item.productImages,
      lowestPrice,
      compareAtPrice,
      inStock,
      defaultVariantId: defaultVariant?.id || null,
    }
  })

  return { slides: activeSlides, products: productsWithPricesAndStock }
}

export async function findProductPairings(productId: string) {
  const pairings = await db
    .select({
      pairedProductId: productPairings.pairedProductId,
      sortOrder: productPairings.sortOrder,
    })
    .from(productPairings)
    .where(eq(productPairings.productId, productId))
    .orderBy(asc(productPairings.sortOrder))

  if (pairings.length === 0) return []

  const pairedIds = pairings.map((p) => p.pairedProductId)

  // Fetch product info with images, variants, inventory
  const items = await db.query.products.findMany({
    where: and(
      eq(products.status, "PUBLISHED"),
      inArray(products.id, pairedIds)
    ),
    with: {
      productImages: {
        orderBy: (img, { asc }) => [asc(img.position)],
        columns: { url: true, altText: true },
      },
      variants: {
        where: (v, { eq, and, isNull }) => and(eq(v.isActive, true), isNull(v.deletedAt)),
        with: {
          inventory: {
            columns: { quantity: true },
          },
        },
      },
    },
    columns: { id: true, slug: true, name: true },
  })

  if (items.length === 0) return []

  // Fetch prices
  const variantIds = items.flatMap((item) => item.variants.map((v) => v.id))
  let prices: any[] = []
  if (variantIds.length > 0) {
    prices = await db
      .select({
        variantId: priceBookEntries.variantId,
        price: priceBookEntries.price,
        compareAtPrice: priceBookEntries.compareAtPrice,
      })
      .from(priceBookEntries)
      .innerJoin(
        priceBooks,
        and(eq(priceBookEntries.priceBookId, priceBooks.id), eq(priceBooks.isDefault, true))
      )
      .where(inArray(priceBookEntries.variantId, variantIds))
  }

  // Map and assemble
  const itemsWithPricesAndStock = items.map((item) => {
    // Resolve prices for all variants of this product
    const productVariants = item.variants.map((v) => {
      const pEntry = prices.find((p) => p.variantId === v.id)
      return {
        ...v,
        price: pEntry ? pEntry.price : null,
        compareAtPrice: pEntry ? pEntry.compareAtPrice : null,
      }
    })

    // Find lowest price and compareAtPrice
    const activePrices = productVariants.map((v) => v.price).filter((p): p is number => p !== null)
    const lowestPrice = activePrices.length > 0 ? Math.min(...activePrices) : null

    const activeComparePrices = productVariants
      .map((v) => v.compareAtPrice)
      .filter((p): p is number => p !== null)
    const compareAtPrice = activeComparePrices.length > 0 ? Math.min(...activeComparePrices) : null

    // Determine in stock and default variant (first in stock, or first active)
    const inStock = productVariants.some((v) => v.inventory && v.inventory.quantity > 0)
    const defaultVariant =
      productVariants.find((v) => v.inventory && v.inventory.quantity > 0) || productVariants[0]

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      productImages: item.productImages,
      lowestPrice,
      compareAtPrice,
      inStock,
      defaultVariantId: defaultVariant?.id || null,
    }
  })

  // Sort according to lookbook sort order
  const orderMap = new Map(pairedIds.map((id, index) => [id, index]))
  return itemsWithPricesAndStock.sort((a, b) => {
    const indexA = orderMap.get(a.id) ?? 9999
    const indexB = orderMap.get(b.id) ?? 9999
    return indexA - indexB
  })
}
