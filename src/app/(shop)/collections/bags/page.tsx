import { db } from "@/db/client"
import { products, productCollections, collections, variants, priceBookEntries, priceBooks, inventory, productImages } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { notFound } from "next/navigation"
import { BagsSplitCanvas } from "@/components/storefront/BagsSplitCanvas"

export const metadata = {
  title: "The Bags Edit | XINVORA",
  description: "Explore structural shapes, tactile leather grains, and minimal utility in the XINVORA Bags collection.",
}

export default async function BagsCollectionPage() {
  // 1. Fetch active default price book
  const defaultPriceBook = await db.query.priceBooks.findFirst({
    where: (pb, { eq }) => eq(pb.isDefault, true),
  })

  if (!defaultPriceBook) {
    return notFound()
  }

  // 2. Fetch all products associated with the "bags" collection
  const bagsData = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      imageUrl: productImages.url,
      variantId: variants.id,
      sku: variants.sku,
      price: priceBookEntries.price,
      quantity: inventory.quantity,
    })
    .from(products)
    .innerJoin(productCollections, eq(products.id, productCollections.productId))
    .innerJoin(collections, eq(productCollections.collectionId, collections.id))
    .innerJoin(variants, eq(products.id, variants.productId))
    .innerJoin(productImages, eq(products.id, productImages.productId))
    .leftJoin(inventory, eq(variants.id, inventory.variantId))
    .leftJoin(
      priceBookEntries,
      and(
        eq(variants.id, priceBookEntries.variantId),
        eq(priceBookEntries.priceBookId, defaultPriceBook.id)
      )
    )
    .where(
      and(
        eq(collections.slug, "bags"),
        eq(products.status, "PUBLISHED")
      )
    )

  // 3. De-duplicate products in case there are multiple images (grab the first image)
  const uniqueBagsMap = new Map<string, any>()
  for (const item of bagsData) {
    if (!uniqueBagsMap.has(item.id)) {
      uniqueBagsMap.set(item.id, {
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        imageUrl: item.imageUrl,
        variantId: item.variantId,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity || 0,
      })
    }
  }
  const formattedBags = Array.from(uniqueBagsMap.values())

  return (
    <main className="flex-1 pt-20 md:pt-28 pb-16 bg-background">
      <BagsSplitCanvas products={formattedBags} />
    </main>
  )
}
