import { eq, and, ne } from "drizzle-orm"
import { db } from "../client"
import { addresses } from "../schema"

export class AddressRepository {
  static async findById(tx: any, id: string) {
    const client = tx || db
    const result = await client
      .select()
      .from(addresses)
      .where(eq(addresses.id, id))
      .limit(1)
    return result[0] ?? null
  }

  static async findByUserId(tx: any, userId: string) {
    const client = tx || db
    return await client
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
  }

  static async createAddress(tx: any, data: any) {
    const client = tx || db
    const [newAddress] = await client
      .insert(addresses)
      .values(data)
      .returning()

    // Enforce default rules
    if (data.isDefaultShipping) {
      await client
        .update(addresses)
        .set({ isDefaultShipping: false, updatedAt: new Date() })
        .where(
          and(
            eq(addresses.userId, data.userId),
            ne(addresses.id, newAddress.id)
          )
        )
    }

    if (data.isDefaultBilling) {
      await client
        .update(addresses)
        .set({ isDefaultBilling: false, updatedAt: new Date() })
        .where(
          and(
            eq(addresses.userId, data.userId),
            ne(addresses.id, newAddress.id)
          )
        )
    }

    return newAddress
  }

  static async updateAddress(tx: any, id: string, userId: string, data: any) {
    const client = tx || db
    const [updatedAddress] = await client
      .update(addresses)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(addresses.id, id),
          eq(addresses.userId, userId)
        )
      )
      .returning()

    if (!updatedAddress) return null

    // Enforce defaults
    if (data.isDefaultShipping) {
      await client
        .update(addresses)
        .set({ isDefaultShipping: false, updatedAt: new Date() })
        .where(
          and(
            eq(addresses.userId, userId),
            ne(addresses.id, id)
          )
        )
    }

    if (data.isDefaultBilling) {
      await client
        .update(addresses)
        .set({ isDefaultBilling: false, updatedAt: new Date() })
        .where(
          and(
            eq(addresses.userId, userId),
            ne(addresses.id, id)
          )
        )
    }

    return updatedAddress
  }

  static async deleteAddress(tx: any, id: string, userId: string) {
    const client = tx || db
    await client
      .delete(addresses)
      .where(
        and(
          eq(addresses.id, id),
          eq(addresses.userId, userId)
        )
      )
  }
}
