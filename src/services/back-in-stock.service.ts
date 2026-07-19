import { db } from "@/db/client"
import { backInStockRequests } from "@/db/schema"

export async function createBackInStockRequest(productId: string, email: string) {
  await db.insert(backInStockRequests).values({ productId, email })
}
