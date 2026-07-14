import "server-only"
import { db } from "@/db/client"
import {
  insertAttribute,
  updateAttribute,
  deleteAttribute,
  insertAttributeValue,
  clearAttributeValues,
} from "@/db/mutations/attributes"
import { AdminAuditService } from "./admin.audit.service"

export class AdminAttributeService {
  static async createAttribute(data: { name: string; values: string[] }, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const attribute = await insertAttribute({ name: data.name }, tx)

      const insertedValues = []
      for (const val of data.values) {
        if (val.trim()) {
          const insertedVal = await insertAttributeValue({
            attributeId: attribute.id,
            value: val.trim(),
          }, tx)
          insertedValues.push(insertedVal)
        }
      }

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "ATTRIBUTE",
        entityId: attribute.id,
        newValue: { ...attribute, values: insertedValues },
      }, tx)

      return { ...attribute, values: insertedValues }
    })
  }

  static async updateAttribute(id: string, data: { name: string; values: string[] }, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const attribute = await updateAttribute(id, { name: data.name }, tx)

      // Re-synchronize values: clear and insert
      await clearAttributeValues(id, tx)

      const insertedValues = []
      for (const val of data.values) {
        if (val.trim()) {
          const insertedVal = await insertAttributeValue({
            attributeId: id,
            value: val.trim(),
          }, tx)
          insertedValues.push(insertedVal)
        }
      }

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "ATTRIBUTE",
        entityId: id,
        newValue: { ...attribute, values: insertedValues },
      }, tx)

      return { ...attribute, values: insertedValues }
    })
  }

  static async deleteAttribute(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const attribute = await deleteAttribute(id, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "ATTRIBUTE",
        entityId: id,
      }, tx)

      return attribute
    })
  }
}
