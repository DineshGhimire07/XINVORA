import { db } from "../db/client"
import { darazSyncedProducts, darazSyncLogs } from "../db/schema"
import { eq, and } from "drizzle-orm"
import { DarazService } from "./daraz.service"
import { CloudinaryMediaSyncService, type CloudinaryAssetRecord } from "./cloudinary-media-sync.service"

export interface DarazSkuItem {
  SkuId: string | number
  SellerSku: string
  ShopSku?: string
  Url?: string
  price: number | string
  special_price?: number | string
  special_from_date?: string
  special_to_date?: string
  special_from_time?: string
  special_to_time?: string
  quantity?: number | string
  Available?: number | string
  Status?: string
  Images?: string[]
  saleProp?: Record<string, any>
  package_weight?: string | number
  package_height?: string | number
  package_length?: string | number
  package_width?: string | number
}

export interface DarazProductItem {
  item_id: string | number
  status: string // "Active", "inactive", "pending-qc", "deleted"
  primary_category?: string | number
  images?: string[]
  attributes?: {
    name?: string
    description?: string
    short_description?: string
    brand?: string
    category_name?: string
    [key: string]: any
  }
  skus?: DarazSkuItem[]
  [key: string]: any
}

export interface CatalogueImportOptions {
  limit?: number
  offset?: number
  batchSize?: number
  filter?: "all" | "live" | "inactive" | "pending-qc"
  skipExistingMedia?: boolean
  onProgress?: (progress: {
    processed: number
    total: number
    currentBatch: number
    totalBatches: number
    currentItemId: string
  }) => void
}

export interface CatalogueImportSummary {
  totalDiscovered: number
  totalImportedProducts: number
  totalImportedSkus: number
  activeCount: number
  inactiveCount: number
  qcPendingCount: number
  imagesDownloaded: number
  imagesUploaded: number
  imagesSkippedDuplicate: number
  imagesFailed: number
  duplicateSkuCount: number
  errors: Array<{ itemId: string; error: string }>
  durationMs: number
}

export class DarazCatalogueImporter {
  /**
   * Calculates effective Daraz price and website price (15% discount)
   */
  public static calculatePricing(sku: DarazSkuItem): {
    originalPrice: string
    specialPrice: string | null
    effectivePrice: string
    websitePrice: string
    specialStart: Date | null
    specialEnd: Date | null
  } {
    const originalPriceNum = Number(sku.price || 0)
    let specialPriceNum = sku.special_price !== undefined && sku.special_price !== null ? Number(sku.special_price) : null
    let specialStart: Date | null = null
    let specialEnd: Date | null = null

    // Parse campaign time
    const startStr = sku.special_from_time || sku.special_from_date
    const endStr = sku.special_to_time || sku.special_to_date

    if (startStr) {
      const parsed = new Date(startStr.replace(" ", "T"))
      if (!isNaN(parsed.getTime())) specialStart = parsed
    }
    if (endStr) {
      const parsed = new Date(endStr.replace(" ", "T"))
      if (!isNaN(parsed.getTime())) specialEnd = parsed
    }

    // Determine if special campaign price is currently active
    const now = new Date()
    let isSpecialActive = false

    if (specialPriceNum && specialPriceNum > 0 && specialPriceNum < originalPriceNum) {
      if (specialStart && specialEnd) {
        isSpecialActive = now >= specialStart && now <= specialEnd
      } else if (specialEnd) {
        isSpecialActive = now <= specialEnd
      } else {
        isSpecialActive = true
      }
    }

    const effectivePriceNum = isSpecialActive && specialPriceNum ? specialPriceNum : originalPriceNum

    // XINVORA Formula: Website price = Effective Daraz price * 0.85
    // Rounded to nearest NPR rupee
    const websitePriceNum = Math.round(effectivePriceNum * 0.85)

    return {
      originalPrice: originalPriceNum.toFixed(2),
      specialPrice: specialPriceNum ? specialPriceNum.toFixed(2) : null,
      effectivePrice: effectivePriceNum.toFixed(2),
      websitePrice: websitePriceNum.toFixed(2),
      specialStart,
      specialEnd,
    }
  }

  /**
   * Fetches a paginated list of products from Daraz Open Platform (/products/get)
   */
  public static async fetchProductsPage(
    offset = 0,
    limit = 50,
    filter: "all" | "live" | "inactive" | "pending-qc" = "all"
  ): Promise<{ products: DarazProductItem[]; total: number }> {
    const token = await DarazService.getValidAccessToken()
    const response = await (DarazService as any).client.execute(
      "/products/get",
      {
        filter,
        offset,
        limit,
      },
      { accessToken: token, method: "GET" }
    )

    const total = Number(response.data?.total_products || 0)
    const products: DarazProductItem[] = response.data?.products || []

    return { products, total }
  }

  /**
   * Imports and synchronizes a single Daraz product and all its SKUs into XINVORA
   */
  public static async syncProduct(
    darazProduct: DarazProductItem,
    options: { skipMediaIfComplete?: boolean } = {}
  ): Promise<{
    itemId: string
    skuCount: number
    uploadedImages: number
    skippedImages: number
    failedImages: number
    status: string
  }> {
    const itemId = String(darazProduct.item_id)
    const title = darazProduct.attributes?.name || `Daraz Product ${itemId}`
    const description = darazProduct.attributes?.description || null
    const shortDescription = darazProduct.attributes?.short_description || null
    const brand = darazProduct.attributes?.brand || "No Brand"
    const primaryCategoryId = darazProduct.primary_category ? String(darazProduct.primary_category) : null
    const categoryName = darazProduct.attributes?.category_name || "General"
    const productStatus = darazProduct.status || "Active"
    const rawImages = Array.isArray(darazProduct.images) ? darazProduct.images.filter(Boolean) : []

    const skus = darazProduct.skus || []
    if (skus.length === 0) {
      throw new Error(`Product ${itemId} has no SKUs on Daraz`)
    }

    let totalUploadedImages = 0
    let totalSkippedImages = 0
    let totalFailedImages = 0

    // 1. Process and Ingest Media via CloudinaryMediaSyncService
    // Extract variant-specific images
    const variantImages: Array<{ skuId: string; url: string }> = []
    for (const sku of skus) {
      const skuId = String(sku.SkuId || itemId)
      if (Array.isArray(sku.Images)) {
        for (const vUrl of sku.Images) {
          if (vUrl && !rawImages.includes(vUrl)) {
            variantImages.push({ skuId, url: vUrl })
          }
        }
      }
    }

    const mediaResult = await CloudinaryMediaSyncService.ingestProductMedia({
      darazItemId: itemId,
      productTitle: title,
      sellerSku: skus[0]?.SellerSku,
      skuId: String(skus[0]?.SkuId || itemId),
      images: rawImages,
      variantImages,
    })

    totalUploadedImages += mediaResult.uploadedCount
    totalSkippedImages += mediaResult.skippedDuplicateCount
    totalFailedImages += mediaResult.failedCount

    // 2. Upsert each SKU variation into daraz_synced_products
    for (const sku of skus) {
      const skuId = String(sku.SkuId || itemId)
      const sellerSku = sku.SellerSku || `SKU-${itemId}-${skuId}`
      const shopSku = sku.ShopSku || null
      const stock = Number(sku.quantity ?? sku.Available ?? 0)
      const skuStatus = sku.Status || productStatus

      const pricing = this.calculatePricing(sku)

      // Filter images applicable to this SKU (hero + gallery + this SKU's variant images)
      const applicableAssets = mediaResult.assets.filter(
        (a) => a.role === "main" || a.role === "gallery" || a.skuId === skuId
      )

      await db
        .insert(darazSyncedProducts)
        .values({
          darazItemId: itemId,
          skuId: skuId,
          sellerSku: sellerSku,
          shopSku: shopSku,
          title: title,
          description: description,
          shortDescription: shortDescription,
          primaryCategoryId: primaryCategoryId,
          categoryName: categoryName,
          brand: brand,

          // Pricing
          darazOriginalPrice: pricing.originalPrice,
          darazSpecialPrice: pricing.specialPrice,
          specialPriceStart: pricing.specialStart,
          specialPriceEnd: pricing.specialEnd,
          effectiveDarazPrice: pricing.effectivePrice,
          websiteCalculatedPrice: pricing.websitePrice,
          appliedDiscountPercentage: "15.00",
          isManualPriceOverride: false,

          // Stock
          darazStock: stock,
          websiteAvailableStock: stock,
          pendingReservations: 0,

          // Media
          mediaSyncStatus: mediaResult.status,
          darazRawImages: rawImages,
          cloudinaryImages: applicableAssets,
          syncError: mediaResult.errors.length > 0 ? JSON.stringify(mediaResult.errors) : null,

          // Lifecycle & Visibility
          productStatus: skuStatus,
          isPublishedOnWebsite: false, // STRICT: Keep unpublished until validated
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [darazSyncedProducts.darazItemId, darazSyncedProducts.skuId],
          set: {
            title: title,
            description: description,
            shortDescription: shortDescription,
            sellerSku: sellerSku,
            shopSku: shopSku,
            primaryCategoryId: primaryCategoryId,
            categoryName: categoryName,
            brand: brand,

            darazOriginalPrice: pricing.originalPrice,
            darazSpecialPrice: pricing.specialPrice,
            specialPriceStart: pricing.specialStart,
            specialPriceEnd: pricing.specialEnd,
            effectiveDarazPrice: pricing.effectivePrice,
            websiteCalculatedPrice: pricing.websitePrice,

            darazStock: stock,
            websiteAvailableStock: stock,
            productStatus: skuStatus,
            isPublishedOnWebsite: false, // Ensure it stays false during sync

            mediaSyncStatus: mediaResult.status,
            darazRawImages: rawImages,
            cloudinaryImages: applicableAssets,
            syncError: mediaResult.errors.length > 0 ? JSON.stringify(mediaResult.errors) : null,
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          },
        })
    }

    return {
      itemId,
      skuCount: skus.length,
      uploadedImages: totalUploadedImages,
      skippedImages: totalSkippedImages,
      failedImages: totalFailedImages,
      status: mediaResult.status,
    }
  }

  /**
   * Imports products in controlled batches with progress logging and resume capability
   */
  public static async importCatalogue(
    options: CatalogueImportOptions = {}
  ): Promise<CatalogueImportSummary> {
    const startTime = Date.now()
    const targetLimit = options.limit // if set, limits total products imported (e.g. 10 for test batch)
    const batchSize = options.batchSize || 10
    const filter = options.filter || "all"

    console.log(`Starting catalogue import: filter=${filter}, targetLimit=${targetLimit || "ALL"}, batchSize=${batchSize}`)

    // 1. Initial discovery call
    const firstPage = await this.fetchProductsPage(0, Math.min(batchSize, 50), filter)
    const totalAvailable = firstPage.total
    const totalToImport = targetLimit ? Math.min(targetLimit, totalAvailable) : totalAvailable

    console.log(`Discovered ${totalAvailable} total products in Daraz Seller account. Importing ${totalToImport} products.`)

    const summary: CatalogueImportSummary = {
      totalDiscovered: totalAvailable,
      totalImportedProducts: 0,
      totalImportedSkus: 0,
      activeCount: 0,
      inactiveCount: 0,
      qcPendingCount: 0,
      imagesDownloaded: 0,
      imagesUploaded: 0,
      imagesSkippedDuplicate: 0,
      imagesFailed: 0,
      duplicateSkuCount: 0,
      errors: [],
      durationMs: 0,
    }

    let processedCount = 0
    let currentOffset = options.offset || 0

    while (processedCount < totalToImport) {
      const currentBatchLimit = Math.min(batchSize, totalToImport - processedCount)
      console.log(`\nFetching batch: offset=${currentOffset}, limit=${currentBatchLimit}...`)

      const { products } = await this.fetchProductsPage(currentOffset, currentBatchLimit, filter)
      if (!products || products.length === 0) {
        console.log("No more products returned from Daraz API. Halting import loop.")
        break
      }

      console.log(`Processing batch of ${products.length} products...`)

      for (let i = 0; i < products.length; i++) {
        const prod = products[i]
        const itemId = String(prod.item_id)
        const status = prod.status?.toLowerCase() || ""

        if (status === "active" || status === "live") {
          summary.activeCount++
        } else if (status.includes("qc") || status.includes("pending")) {
          summary.qcPendingCount++
        } else {
          summary.inactiveCount++
        }

        try {
          const res = await this.syncProduct(prod)
          summary.totalImportedProducts++
          summary.totalImportedSkus += res.skuCount
          summary.imagesUploaded += res.uploadedImages
          summary.imagesSkippedDuplicate += res.skippedImages
          summary.imagesFailed += res.failedImages
          summary.imagesDownloaded += (res.uploadedImages + res.skippedImages)

          console.log(
            `[${processedCount + 1}/${totalToImport}] Item ${itemId} synced: ${res.skuCount} SKU(s), ${res.uploadedImages} uploaded, ${res.skippedImages} dup skipped, status=${res.status}`
          )
        } catch (err: any) {
          console.error(`Error syncing product ${itemId}:`, err.message)
          summary.errors.push({ itemId, error: err.message })
        }

        processedCount++
        if (options.onProgress) {
          options.onProgress({
            processed: processedCount,
            total: totalToImport,
            currentBatch: Math.floor(processedCount / batchSize),
            totalBatches: Math.ceil(totalToImport / batchSize),
            currentItemId: itemId,
          })
        }

        if (processedCount >= totalToImport) {
          break
        }
      }

      currentOffset += products.length
    }

    summary.durationMs = Date.now() - startTime

    // Log the import execution in daraz_sync_logs
    await db.insert(darazSyncLogs).values({
      syncType: targetLimit ? "BATCH_TEST_IMPORT" : "FULL_IMPORT",
      status: summary.errors.length === 0 ? "SUCCESS" : "WARNING",
      details: JSON.stringify({
        totalDiscovered: summary.totalDiscovered,
        totalImportedProducts: summary.totalImportedProducts,
        totalImportedSkus: summary.totalImportedSkus,
        activeCount: summary.activeCount,
        inactiveCount: summary.inactiveCount,
        imagesUploaded: summary.imagesUploaded,
        imagesSkippedDuplicate: summary.imagesSkippedDuplicate,
        imagesFailed: summary.imagesFailed,
        errorsCount: summary.errors.length,
      }),
      durationMs: summary.durationMs,
    })

    return summary
  }
}
