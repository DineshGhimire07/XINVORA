#!/usr/bin/env node

/**
 * XINVORA Listing Studio — Local Companion Worker CLI
 *
 * Scans local product folders, parses listing.md, verifies images,
 * deduplicates & uploads photos to Daraz CDN, compiles official OpenAPI XML,
 * and moves processed folders into COMPLETED/ or FAILED/.
 *
 * Usage:
 *   npx tsx scripts/daraz-companion-worker.ts [--dir <path>] [--dry-run] [--watch]
 */

import fs from "fs"
import path from "path"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

import { DarazService } from "../src/services/daraz.service"
import { DarazQueueService } from "../src/services/daraz-queue.service"
import { parseListingMarkdown } from "../src/lib/daraz/markdown-parser"
import { validateProductPayload, buildDarazProductXml, type ProductListingInput } from "../src/lib/daraz/payload-builder"

// Parse CLI arguments
const args = process.argv.slice(2)
const dirArgIdx = args.indexOf("--dir")
const TARGET_DIR = dirArgIdx !== -1 && args[dirArgIdx + 1] ? path.resolve(args[dirArgIdx + 1]) : path.resolve(process.cwd(), "XINVORA_PRODUCTS")
const IS_DRY_RUN = args.includes("--dry-run")
const IS_WATCH = args.includes("--watch")

const COMPLETED_DIR = path.join(TARGET_DIR, "COMPLETED")
const FAILED_DIR = path.join(TARGET_DIR, "FAILED")

const VALID_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"])

function ensureDirectories() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true })
    console.log(`📁 Created base directory: ${TARGET_DIR}`)
  }
  if (!fs.existsSync(COMPLETED_DIR)) {
    fs.mkdirSync(COMPLETED_DIR, { recursive: true })
  }
  if (!fs.existsSync(FAILED_DIR)) {
    fs.mkdirSync(FAILED_DIR, { recursive: true })
  }
}

async function processSingleFolder(folderPath: string, folderName: string) {
  console.log(`\n────────────────────────────────────────────────────────────`)
  console.log(`📦 Processing Product Folder: [${folderName}]`)
  console.log(`   Path: ${folderPath}`)

  const listingMdPath = path.join(folderPath, "listing.md")
  if (!fs.existsSync(listingMdPath)) {
    console.warn(`   ⚠️ Skipped: Missing listing.md in ${folderName}`)
    return
  }

  // 1. Read listing.md
  const markdownContent = fs.readFileSync(listingMdPath, "utf-8")
  const parsed = parseListingMarkdown(markdownContent)
  console.log(`   📄 Title: "${parsed.title}"`)
  console.log(`   🏷️  Category ID: ${parsed.categoryId} | Brand: ${parsed.brand}`)
  console.log(`   🔖 SellerSKU: ${parsed.sellerSku} | Price: NPR ${parsed.price}`)

  // 2. Discover local image files
  const files = fs.readdirSync(folderPath)
  const imageFiles = files.filter((f) => {
    const ext = path.extname(f).toLowerCase()
    return VALID_IMAGE_EXTENSIONS.has(ext) && !f.startsWith(".")
  })

  if (imageFiles.length === 0) {
    const errMsg = `Folder contains 0 product images (.jpg, .jpeg, .png). At least 1 image is required.`
    console.error(`   ❌ ${errMsg}`)
    handleFailure(folderPath, folderName, errMsg)
    return
  }

  console.log(`   🖼️  Found ${imageFiles.length} image(s): ${imageFiles.join(", ")}`)

  // 3. Dry-run Mode
  if (IS_DRY_RUN) {
    console.log(`   🔍 [DRY RUN] Validating schema against Daraz rules...`)
    try {
      const attrRes = await DarazService.getCategoryAttributes(parsed.categoryId)
      const rawAttrs = (attrRes.attributes as any[]) || []
      const listingInput: ProductListingInput = {
        primaryCategory: String(parsed.categoryId),
        title: parsed.title,
        highlights: parsed.highlights,
        description: parsed.description,
        brand: parsed.brand,
        normalAttributes: {
          Fabric_Type: parsed.fabric || "Linen",
          material: parsed.material || "Linen",
          size: parsed.size || "free size",
          size_chart: (parsed.extraAttributes as any)?.size_chart || "Standard Sizing",
          ...parsed.extraAttributes,
        },
        sku: {
          sellerSku: parsed.sellerSku,
          price: parsed.price,
          specialPrice: parsed.specialPrice,
          quantity: parsed.stock,
          colorFamily: parsed.color || "Ivory",
          packageWeight: parsed.package.weight,
          images: imageFiles.map(() => "https://static-01.daraz.com.np/sample.jpg"),
        },
      }
      const val = validateProductPayload(listingInput, rawAttrs)
      if (val.valid) {
        console.log(`   ✅ [DRY RUN PASSED] All required attributes satisfied.`)
      } else {
        console.warn(`   ⚠️ [DRY RUN VALIDATION ERRORS]:`)
        val.errors.forEach((e) => console.warn(`      - ${e}`))
      }
    } catch (err: any) {
      console.error(`   ❌ [DRY RUN FAILED]: ${err.message}`)
    }
    return
  }

  // 4. Live Processing
  try {
    // A. Read image buffers
    const imagePayloads = imageFiles.map((filename) => ({
      filename,
      buffer: fs.readFileSync(path.join(folderPath, filename)),
    }))

    // B. Queue item in database
    const batchId = `CLI_${new Date().toISOString().slice(0, 10)}`
    const [job] = await DarazQueueService.createBatch(batchId, [
      {
        localProductId: parsed.productId || folderName,
        folderPath,
        metadata: { sellerSku: parsed.sellerSku, title: parsed.title },
      },
    ])

    // C. Execute End-to-End processing
    console.log(`   🚀 Uploading images & compiling Daraz OpenAPI submission...`)
    const result = await DarazQueueService.processProductFolder(job.id, {
      markdownContent,
      images: imagePayloads,
    })

    if (result.success) {
      console.log(`   🎉 SUCCESS! Listed on Daraz (Item ID: ${result.itemId})`)
      handleSuccess(folderPath, folderName)
    } else {
      console.error(`   ❌ FAILED: ${result.error}`)
      handleFailure(folderPath, folderName, result.error || "Unknown Daraz error")
    }
  } catch (err: any) {
    console.error(`   ❌ EXCEPTION: ${err.message}`)
    handleFailure(folderPath, folderName, err.message)
  }
}

function handleSuccess(folderPath: string, folderName: string) {
  const dest = path.join(COMPLETED_DIR, folderName)
  try {
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true })
    }
    fs.renameSync(folderPath, dest)
    console.log(`   📦 Moved to: COMPLETED/${folderName}`)
  } catch (err: any) {
    console.error(`   ⚠️ Failed to move to COMPLETED: ${err.message}`)
  }
}

function handleFailure(folderPath: string, folderName: string, errorLog: string) {
  const dest = path.join(FAILED_DIR, folderName)
  try {
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true })
    }
    fs.renameSync(folderPath, dest)
    fs.writeFileSync(path.join(dest, "error.log"), `[${new Date().toISOString()}]\n${errorLog}\n`, "utf-8")
    console.log(`   ⚠️ Moved to: FAILED/${folderName} (with error.log)`)
  } catch (err: any) {
    console.error(`   ⚠️ Failed to move to FAILED: ${err.message}`)
  }
}

async function runBatch() {
  ensureDirectories()
  console.log(`============================================================`)
  console.log(`🚀 XINVORA Listing Studio — Local Companion Worker`)
  console.log(`   Directory: ${TARGET_DIR}`)
  console.log(`   Dry Run:   ${IS_DRY_RUN ? "YES (No listings will be created)" : "NO (Live Mode)"}`)
  console.log(`============================================================`)

  const entries = fs.readdirSync(TARGET_DIR, { withFileTypes: true })
  const productFolders = entries.filter(
    (e) => e.isDirectory() && !["COMPLETED", "FAILED", "node_modules", ".git"].includes(e.name)
  )

  if (productFolders.length === 0) {
    console.log(`\nℹ️  No product folders found in ${TARGET_DIR}`)
    console.log(`   Drop folders named PRODUCT_001, PRODUCT_002... into this directory.`)
    return
  }

  console.log(`\n📋 Found ${productFolders.length} product folder(s) ready to process.`)

  for (const folder of productFolders) {
    const fullPath = path.join(TARGET_DIR, folder.name)
    await processSingleFolder(fullPath, folder.name)
  }

  console.log(`\n✨ Batch execution finished.`)
}

runBatch().catch((err) => {
  console.error("Fatal Worker Error:", err)
  process.exit(1)
})
