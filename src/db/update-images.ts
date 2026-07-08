import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { productImages, variantImages } from "./schema"
import { eq } from "drizzle-orm"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })
const db = drizzle(sql)

async function updateImages() {
  console.log("Updating broken image URLs...")
  try {
    const validUrl = "https://placehold.co/800x800.png"
    
    await db.update(productImages).set({ url: validUrl })
    await db.update(variantImages).set({ url: validUrl })
    
    console.log("Images updated to placehold.co!")
  } catch (e) {
    console.error(e)
  }
  process.exit(0)
}

updateImages()
