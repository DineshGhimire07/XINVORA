import { db } from "@/db/client"
import { homepageSettings, categories, brands, materials, collections } from "@/db/schema"
import HomepageEditor from "./HomepageEditor"

export default async function AdminHomepageBuilderRoute() {
  const settings = await db.select().from(homepageSettings).limit(1)
  const settingsData = settings.length > 0 ? settings[0] : null

  // Fetch lists to populate product insertion modals
  const categoriesList = await db.select().from(categories)
  const brandsList = await db.select().from(brands)
  const materialsList = await db.select().from(materials)
  const collectionsList = await db.select().from(collections)

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mb-8">
        Homepage Builder
      </h1>
      
      <HomepageEditor 
        settings={settingsData} 
        categories={categoriesList}
        brands={brandsList}
        materials={materialsList}
        collections={collectionsList}
      />
    </div>
  )
}
