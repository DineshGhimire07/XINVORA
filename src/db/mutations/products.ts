import "server-only"
import { eq } from "drizzle-orm"
import { products, variants } from "../schema"

export async function insertProduct(data: Partial<typeof products.$inferInsert>, tx: any) {
  const result = await tx.insert(products).values(data).returning()
  return result[0]
}

export async function updateProduct(id: string, data: Partial<typeof products.$inferInsert>, tx: any) {
  const result = await tx
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning()
  return result[0]
}

export async function softDeleteProduct(id: string, tx: any) {
  const result = await tx
    .update(products)
    .set({ deletedAt: new Date(), status: "ARCHIVED", updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning()

  await tx
    .update(variants)
    .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
    .where(eq(variants.productId, id))

  return result[0]
}

export async function restoreProduct(id: string, tx: any) {
  const result = await tx
    .update(products)
    .set({ deletedAt: null, status: "DRAFT", updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning()

  await tx
    .update(variants)
    .set({ deletedAt: null, isActive: true, updatedAt: new Date() })
    .where(eq(variants.productId, id))

  return result[0]
}
