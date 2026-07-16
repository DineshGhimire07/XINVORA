import { db } from "@/db/client"
import { homepageSettings, categories, brands, materials, collections, products } from "@/db/schema"
import { getHomepageCMS } from "@/db/queries"
import HomepageEditor from "./HomepageEditor"
import { eq, and, isNull } from "drizzle-orm"

export default async function AdminHomepageBuilderRoute() {
  const settings = await db.select().from(homepageSettings).limit(1)
  const settingsData = settings.length > 0 ? settings[0] : null

  // Fetch HERO, PRODUCT_GRID & COLLECTION_GRID blocks from homepage CMS
  const homepageCMS = await getHomepageCMS()
  let heroBlock = null
  let productGridBlock = null
  let collectionGridBlock = null
  if (homepageCMS?.sections) {
    for (const section of homepageCMS.sections) {
      if (!heroBlock) {
        heroBlock = section.blocks?.find((b: any) => b.type === "HERO")
      }
      if (!productGridBlock) {
        productGridBlock = section.blocks?.find((b: any) => b.type === "PRODUCT_GRID")
      }
      if (!collectionGridBlock) {
        collectionGridBlock = section.blocks?.find((b: any) => b.type === "COLLECTION_GRID")
      }
    }
  }

  // Fetch lists to populate product insertion modals
  const categoriesList = await db.select().from(categories)
  const brandsList = await db.select().from(brands)
  const materialsList = await db.select().from(materials)
  const collectionsList = await db.select().from(collections)

  // Fetch all active collections for the featured collection grid picker
  const activeCollectionsList = await db.select({
    id: collections.id,
    name: collections.name,
    slug: collections.slug,
    imageUrl: collections.imageUrl,
  })
  .from(collections)
  .where(and(eq(collections.isActive, true), isNull(collections.deletedAt)))

  // Fetch all published products to populate the product grid arrivals picker
  const allProductsList = await db.query.products.findMany({
    where: eq(products.status, "PUBLISHED"),
    with: {
      productImages: {
        orderBy: (img, { asc }) => [asc(img.position)],
        columns: { url: true },
        limit: 1,
      },
    },
    columns: { id: true, name: true, slug: true },
  })

  return (
    <div className="w-full">
      <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mb-8">
        Homepage Builder
      </h1>
      
      <HomepageEditor 
        settings={settingsData} 
        heroBlock={heroBlock}
        productGridBlock={productGridBlock}
        collectionGridBlock={collectionGridBlock}
        allProducts={allProductsList}
        activeCollections={activeCollectionsList}
        categories={categoriesList}
        brands={brandsList}
        materials={materialsList}
        collections={collectionsList}
      />
    </div>
  )
}
