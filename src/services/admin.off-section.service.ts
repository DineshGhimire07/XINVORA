import "server-only"
import { db } from "@/db/client"
import { productOffSection } from "@/db/schema"
import { eq } from "drizzle-orm"

export interface OffSectionInput {
  productId: string
  originalPrice: number // in NPR (not minor units)
  sellingPrice: number  // in NPR (not minor units)
}

export interface OffSectionUpdateInput {
  originalPrice?: number
  sellingPrice?: number
  isOffEnabled?: boolean
}

export class AdminOffSectionService {
  /**
   * Add a product to the Off Section.
   * Prices are provided in NPR and stored in minor units (× 100).
   */
  static async addProduct(data: OffSectionInput) {
    const [result] = await db
      .insert(productOffSection)
      .values({
        productId: data.productId,
        originalPrice: Math.round(data.originalPrice * 100),
        sellingPrice: Math.round(data.sellingPrice * 100),
        isOffEnabled: true,
      })
      .returning()

    return result
  }

  /**
   * Update pricing or status for an Off Section entry.
   */
  static async update(id: string, data: OffSectionUpdateInput) {
    const updates: Record<string, any> = {
      updatedAt: new Date(),
    }

    if (data.originalPrice !== undefined) {
      updates.originalPrice = Math.round(data.originalPrice * 100)
    }
    if (data.sellingPrice !== undefined) {
      updates.sellingPrice = Math.round(data.sellingPrice * 100)
    }
    if (data.isOffEnabled !== undefined) {
      updates.isOffEnabled = data.isOffEnabled
    }

    const [result] = await db
      .update(productOffSection)
      .set(updates)
      .where(eq(productOffSection.id, id))
      .returning()

    return result
  }

  /**
   * Toggle the isOffEnabled status.
   */
  static async toggleStatus(id: string, isEnabled: boolean) {
    const [result] = await db
      .update(productOffSection)
      .set({ isOffEnabled: isEnabled, updatedAt: new Date() })
      .where(eq(productOffSection.id, id))
      .returning()

    return result
  }

  /**
   * Remove a product from the Off Section (hard delete).
   */
  static async remove(id: string) {
    await db.delete(productOffSection).where(eq(productOffSection.id, id))
  }
}
