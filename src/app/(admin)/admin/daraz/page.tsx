import { SessionService } from "@/services/session.service"
import { DarazService } from "@/services/daraz.service"
import { db } from "@/db"
import { darazAuditLogs, darazCategoryTemplates } from "@/db/schema"
import { desc } from "drizzle-orm"
import { DarazStudioClient } from "./DarazStudioClient"

export const metadata = {
  title: "Daraz Listing Studio | XINVORA Admin",
  description: "Official Daraz Open Platform integration and automated listing studio for XINVORA Nepal.",
}

export default async function DarazStudioPage() {
  await SessionService.requireAdmin()

  const connectionStatus = await DarazService.getConnectionStatus()

  // Fetch recent audit logs
  const recentLogs = await db
    .select()
    .from(darazAuditLogs)
    .orderBy(desc(darazAuditLogs.createdAt))
    .limit(25)

  // Fetch cached category templates
  const cachedTemplates = await db
    .select({
      id: darazCategoryTemplates.id,
      darazCategoryId: darazCategoryTemplates.darazCategoryId,
      categoryName: darazCategoryTemplates.categoryName,
      isLeaf: darazCategoryTemplates.isLeaf,
      version: darazCategoryTemplates.version,
      updatedAt: darazCategoryTemplates.updatedAt,
    })
    .from(darazCategoryTemplates)
    .orderBy(desc(darazCategoryTemplates.updatedAt))
    .limit(20)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-admin-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
              Daraz Listing Studio
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
              Nepal Marketplace
            </span>
          </div>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Official Daraz Open Platform API bridge, OAuth management, and category attribute mapping.
          </p>
        </div>
      </div>

      <DarazStudioClient
        initialStatus={connectionStatus}
        initialLogs={recentLogs}
        initialTemplates={cachedTemplates}
      />
    </div>
  )
}
