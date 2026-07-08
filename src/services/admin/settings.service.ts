import { db } from "@/db"
import { appSettings, settingsHistory } from "@/db/schema/settings"
import { eq } from "drizzle-orm"
import { unstable_cache } from "next/cache"
import type { AppSettings } from "@/types/settings"

export class AdminSettingsService {
  /**
   * Fetch a specific setting by key with caching.
   */
  static async getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K] | null> {
    const fetchSetting = unstable_cache(
      async () => {
        const result = await db.query.appSettings.findFirst({
          where: eq(appSettings.key, key)
        })
        return (result?.value as AppSettings[K]) || null
      },
      [`setting-${key}`],
      { tags: [`settings-${key}`, "settings"] }
    )

    return fetchSetting()
  }

  /**
   * Fetch all settings in a single dictionary.
   */
  static async getAllSettings(): Promise<Partial<AppSettings>> {
    const fetchAll = unstable_cache(
      async () => {
        const results = await db.select().from(appSettings)
        const settingsMap: Partial<AppSettings> = {}
        for (const row of results) {
          settingsMap[row.key as keyof AppSettings] = row.value as any
        }
        return settingsMap
      },
      ["all-settings"],
      { tags: ["settings"] }
    )

    return fetchAll()
  }

  /**
   * Update a specific setting, increment version, and record history.
   */
  static async updateSetting<K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K], 
    userId: string
  ): Promise<void> {
    await db.transaction(async (tx) => {
      const existing = await tx.query.appSettings.findFirst({
        where: eq(appSettings.key, key)
      })

      if (!existing) {
        // Technically should not happen with our seed
        await tx.insert(appSettings).values({
          key,
          value,
          version: 1,
          updatedBy: userId
        })

        await tx.insert(settingsHistory).values({
          settingKey: key,
          oldValue: null,
          newValue: value,
          changedBy: userId
        })
      } else {
        await tx.update(appSettings)
          .set({
            value,
            version: existing.version + 1,
            updatedAt: new Date(),
            updatedBy: userId
          })
          .where(eq(appSettings.key, key))

        await tx.insert(settingsHistory).values({
          settingKey: key,
          oldValue: existing.value,
          newValue: value,
          changedBy: userId
        })
      }
    })
  }

  /**
   * Export all settings.
   */
  static async getSettingsExport(): Promise<string> {
    const all = await this.getAllSettings()
    return JSON.stringify(all, null, 2)
  }
}
