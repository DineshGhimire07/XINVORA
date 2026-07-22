import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { categories, products, variants, inventory, priceBooks, priceBookEntries, sizes, colors, productImages, variantImages } from "./schema"
import { eq } from "drizzle-orm"

import dotenv from "dotenv"
import path from "path"
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })
const db = drizzle(sql)

async function seed() {
  console.log("Seeding sample product...")
  try {
    // 1. Create Categories
    const [category] = await db.insert(categories).values({
      name: "Men",
      slug: "men",
      description: "Men's collection",
      isActive: true,
    }).onConflictDoNothing().returning()
    
    await db.insert(categories).values([
      {
        name: "Women",
        slug: "women",
        description: "Women's collection",
        isActive: true,
      },
      {
        name: "Unisex",
        slug: "unisex",
        description: "Unisex collection",
        isActive: true,
      }
    ]).onConflictDoNothing()

    let categoryId = category?.id
    if (!categoryId) {
      const cat = await db.select().from(categories).where(eq(categories.slug, "men")).limit(1)
      categoryId = cat[0].id
    }

    // 2. Create a Product
    const [product] = await db.insert(products).values({
      name: "Luxury Silk Shirt",
      slug: "luxury-silk-shirt",
      description: "A premium 100% silk shirt tailored for a modern fit.",
      categoryId,
      status: "PUBLISHED",
    }).onConflictDoNothing().returning()

    let productId = product?.id
    if (!productId) {
      const prod = await db.select().from(products).where(eq(products.slug, "luxury-silk-shirt")).limit(1)
      productId = prod[0].id
    }

    // 3. Create a Color and Size
    const [color] = await db.insert(colors).values({
      name: "Midnight Blue",
      hexCode: "#191970",
    }).onConflictDoNothing().returning()

    let colorId = color?.id
    if (!colorId) {
      const col = await db.select().from(colors).where(eq(colors.name, "Midnight Blue")).limit(1)
      colorId = col[0].id
    }

    const [size] = await db.insert(sizes).values({
      name: "M",
      category: "CLOTHING",
    }).onConflictDoNothing().returning()

    let sizeId = size?.id
    if (!sizeId) {
      const sz = await db.select().from(sizes).where(eq(sizes.name, "M")).limit(1)
      sizeId = sz[0].id
    }

    // 4. Create a Variant
    const [variant] = await db.insert(variants).values({
      productId,
      sku: "SHIRT-SILK-M-BLU",
      colorId,
      sizeId,
    }).onConflictDoNothing().returning()
    
    let variantId = variant?.id
    if (!variantId) {
      const vr = await db.select().from(variants).where(eq(variants.sku, "SHIRT-SILK-M-BLU")).limit(1)
      variantId = vr[0].id
    }

    // 5. Create Inventory
    await db.insert(inventory).values({
      variantId,
      quantity: 50,
      reserved: 0,
      status: "IN_STOCK",
    }).onConflictDoNothing()

    // 6. Create Price Book and Entry
    const [priceBook] = await db.insert(priceBooks).values({
      name: "Default NPR",
      currency: "NPR",
      isDefault: true,
    }).onConflictDoNothing().returning()
    
    let priceBookId = priceBook?.id
    if (!priceBookId) {
      const pb = await db.select().from(priceBooks).where(eq(priceBooks.name, "Default NPR")).limit(1)
      priceBookId = pb[0].id
    }

    await db.insert(priceBookEntries).values({
      priceBookId,
      variantId,
      price: 15000,
      compareAtPrice: 20000,
    }).onConflictDoNothing()

    // 7. Dummy Images
    const [prodImg] = await db.insert(productImages).values({
      productId,
      url: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=800&auto=format&fit=crop",
      altText: "Luxury Silk Shirt",
      position: 0,
    }).onConflictDoNothing().returning()

    if (prodImg) {
      await db.insert(variantImages).values({
        variantId,
        url: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=800&auto=format&fit=crop",
        altText: "Luxury Silk Shirt",
      }).onConflictDoNothing()
    }

    console.log("Successfully seeded sample product 'Luxury Silk Shirt' (SKU: SHIRT-SILK-M-BLU)")
    
  } catch (err) {
    console.error("Error seeding product:", err)
  }
  process.exit(0)
}

seed()
