import { db } from "@/db"
import { darazQueueJobs, type darazJobStatusEnum } from "@/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { parseListingMarkdown } from "@/lib/daraz/markdown-parser"
import { DarazService } from "./daraz.service"
import type { ProductListingInput } from "@/lib/daraz/payload-builder"

export interface QueueJobInput {
  localProductId: string
  folderPath: string
  metadata?: any
}

export class DarazQueueService {
  /**
   * Initializes a batch of product folders in the durable queue
   */
  public static async createBatch(batchId: string, items: QueueJobInput[]) {
    if (items.length === 0) return []

    const inserted = await db
      .insert(darazQueueJobs)
      .values(
        items.map((item) => ({
          batchId,
          localProductId: item.localProductId,
          folderPath: item.folderPath,
          status: "PENDING" as const,
          currentStep: "QUEUED",
          progressPercent: 0,
          metadata: item.metadata || {},
        }))
      )
      .returning()

    return inserted
  }

  /**
   * Retrieves summary and job list for a batch
   */
  public static async getBatchStatus(batchId: string) {
    const jobs = await db
      .select()
      .from(darazQueueJobs)
      .where(eq(darazQueueJobs.batchId, batchId))
      .orderBy(desc(darazQueueJobs.createdAt))

    const total = jobs.length
    const completed = jobs.filter((j) => j.status === "COMPLETED").length
    const failed = jobs.filter((j) => j.status === "FAILED").length
    const pending = total - completed - failed

    return {
      batchId,
      total,
      completed,
      failed,
      pending,
      jobs,
    }
  }

  /**
   * Updates state of a queue job
   */
  public static async updateJobState(
    jobId: string,
    status: (typeof darazJobStatusEnum.enumValues)[number],
    currentStep: string,
    progressPercent: number,
    errorMessage?: string
  ) {
    await db
      .update(darazQueueJobs)
      .set({
        status,
        currentStep,
        progressPercent,
        errorMessage: errorMessage || null,
        updatedAt: new Date(),
      })
      .where(eq(darazQueueJobs.id, jobId))
  }

  /**
   * Processes a single product folder end-to-end:
   * 1. Parse listing.md
   * 2. Upload and cache images to Daraz CDN
   * 3. Submit listing to Daraz OpenAPI
   * 4. Update queue job status to COMPLETED (or FAILED)
   */
  public static async processProductFolder(
    jobId: string,
    files: {
      markdownContent: string
      images: Array<{ filename: string; buffer: Buffer }>
    }
  ): Promise<{ success: boolean; itemId?: string | number; error?: string }> {
    try {
      // 1. Parse listing.md
      await this.updateJobState(jobId, "READING_FOLDER", "Parsing listing.md", 15)
      const parsed = parseListingMarkdown(files.markdownContent)

      // 2. Validate essential fields
      await this.updateJobState(jobId, "VALIDATING", "Validating category schema", 30)
      if (!files.images || files.images.length === 0) {
        throw new Error(`Product folder has no image files (.jpg, .jpeg, .png). At least 1 image is required.`)
      }

      // 3. Upload & Deduplicate Images to Daraz CDN
      await this.updateJobState(jobId, "UPLOADING_IMAGES", "Uploading images to Daraz CDN", 50)
      const uploadedImageUrls: string[] = []

      for (let i = 0; i < files.images.length; i++) {
        const img = files.images[i]
        const uploaded = await DarazService.uploadAndCacheImage(img.buffer, img.filename)
        uploadedImageUrls.push(uploaded.url)
        const uploadProgress = 50 + Math.round(((i + 1) / files.images.length) * 25)
        await this.updateJobState(
          jobId,
          "UPLOADING_IMAGES",
          `Uploaded ${i + 1}/${files.images.length} images`,
          uploadProgress
        )
      }

      // 4. Submit listing to Daraz OpenAPI
      await this.updateJobState(jobId, "SUBMITTING_LISTING", "Submitting to Daraz OpenAPI", 85)

      const excludedFromNormal = new Set([
        "product_id", "id", "title", "name", "category_id", "category",
        "seller_sku", "sku", "price", "special_price", "stock", "quantity",
        "color", "color_family", "package", "package_weight", "package_length",
        "package_width", "package_height", "package_content", "highlights",
        "description", "short_description", "brand", "images", "fabric"
      ])

      const cleanExtra: Record<string, any> = {}
      for (const [k, v] of Object.entries(parsed.extraAttributes)) {
        if (!excludedFromNormal.has(k.toLowerCase())) {
          cleanExtra[k] = v
        }
      }

      // In Daraz API, size_chart requires an uploaded image URL on Daraz CDN.
      // If a custom URL is provided use it; otherwise use the primary product image from Daraz CDN.
      const rawSizeChart =
        cleanExtra.size_chart ||
        parsed.size_chart ||
        parsed.extraAttributes?.size_chart
      const isSizeChartUrl = typeof rawSizeChart === "string" && rawSizeChart.startsWith("http")
      const effectiveSizeChart = isSizeChartUrl ? rawSizeChart : uploadedImageUrls[0]

      const listingInput: ProductListingInput = {
        primaryCategory: String(parsed.categoryId),
        title: parsed.title,
        highlights: parsed.highlights,
        description: parsed.description,
        brand: parsed.brand || "XINVORA",
        normalAttributes: {
          ...(parsed.fabric ? { Fabric_Type: parsed.fabric } : {}),
          material: parsed.material || cleanExtra.material || "Other",
          ...(parsed.size ? { size: parsed.size } : {}),
          ...(effectiveSizeChart ? { size_chart: effectiveSizeChart } : {}),
          ...cleanExtra,
        },
        sku: {
          sellerSku: parsed.sellerSku,
          price: parsed.price,
          specialPrice: parsed.specialPrice,
          quantity: parsed.stock,
          colorFamily: parsed.color || "Multi",
          packageWeight: parsed.package.weight,
          packageLength: parsed.package.length,
          packageWidth: parsed.package.width,
          packageHeight: parsed.package.height,
          packageContent: parsed.package.content,
          images: uploadedImageUrls,
        },
      }

      const submitRes = await DarazService.submitProduct(listingInput, parsed.productId)

      // 5. Success
      await this.updateJobState(jobId, "COMPLETED", `Listed (Item ID: ${submitRes.itemId})`, 100)
      return { success: true, itemId: submitRes.itemId }
    } catch (err: any) {
      const errMsg = err.message || "Failed to process product folder."
      await this.updateJobState(jobId, "FAILED", "Error", 100, errMsg)
      return { success: false, error: errMsg }
    }
  }
}
