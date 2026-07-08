import "server-only"
import { db } from "@/db/client"
import { auditLogs } from "@/db/schema/audit-logs"

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "PUBLISH" | "ARCHIVE" | "RESTORE"
export type AuditEntityType = "PRODUCT" | "VARIANT" | "INVENTORY" | "CATEGORY" | "COLLECTION" | "BRAND" | "MATERIAL" | "COLOR" | "SIZE" | "COUPON" | "ORDER" | "USER" | "CMS_PAGE" | "CMS_SECTION" | "CMS_BLOCK" | "MEDIA" | "NAVIGATION_MENU" | "MENU_ITEM" | "ANNOUNCEMENT" | "HOMEPAGE_SETTINGS"

export class AdminAuditService {
  /**
   * Log an administrative action to the audit logs.
   * Can optionally be passed a transaction (tx) to include this log in an atomic operation.
   */
  static async logAction(
    params: {
      userId: string
      action: AuditAction
      entityType: AuditEntityType
      entityId: string
      oldValue?: any
      newValue?: any
      reason?: string
    },
    tx?: any
  ) {
    const runner = tx ?? db

    await runner.insert(auditLogs).values({
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue ? params.oldValue : null,
      newValue: params.newValue ? params.newValue : null,
      reason: params.reason,
    })
  }
}
