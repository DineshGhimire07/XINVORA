import { db } from "@/db"
import { appSettings, settingsHistory } from "@/db/schema/settings"
import { eq } from "drizzle-orm"
import { unstable_cache } from "next/cache"
import type { AppSettings } from "@/types/settings"

// ── Per-key cache functions created at module level (not inside the method) ──
// IMPORTANT: unstable_cache must be called at module load time, not inside a
// method body, otherwise Next.js cannot deduplicate across requests because a
// new function reference is created on every call.

const _settingCacheMap = new Map<string, () => Promise<any>>()

function getSettingCachedFn<K extends keyof AppSettings>(key: K) {
  if (!_settingCacheMap.has(key)) {
    _settingCacheMap.set(
      key,
      unstable_cache(
        async () => {
          const result = await db.query.appSettings.findFirst({
            where: eq(appSettings.key, key),
          })
          return (result?.value as AppSettings[K]) || null
        },
        [`setting-${key}`],
        { tags: [`settings-${key}`, "settings"], revalidate: 3600 }
      )
    )
  }
  return _settingCacheMap.get(key)!
}

const _getAllSettingsCached = unstable_cache(
  async () => {
    const results = await db.select().from(appSettings)
    const settingsMap: Partial<AppSettings> = {}
    for (const row of results) {
      settingsMap[row.key as keyof AppSettings] = row.value as any
    }
    return settingsMap
  },
  ["all-settings"],
  { tags: ["settings"], revalidate: 3600 }
)

export class AdminSettingsService {
  /**
   * Fetch a specific setting by key with caching.
   * The cache function is created once per key at module level — not inside
   * the method — so Next.js can properly deduplicate across requests.
   */
  static async getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K] | null> {
    return getSettingCachedFn(key)() as Promise<AppSettings[K] | null>
  }

  /**
   * Fetch all settings in a single dictionary.
   */
  static async getAllSettings(): Promise<Partial<AppSettings>> {
    return _getAllSettingsCached()
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
        where: eq(appSettings.key, key),
      })

      if (!existing) {
        await tx.insert(appSettings).values({
          key,
          value,
          version: 1,
          updatedBy: userId,
        })

        await tx.insert(settingsHistory).values({
          settingKey: key,
          oldValue: null,
          newValue: value,
          changedBy: userId,
        })
      } else {
        await tx
          .update(appSettings)
          .set({
            value,
            version: existing.version + 1,
            updatedAt: new Date(),
            updatedBy: userId,
          })
          .where(eq(appSettings.key, key))

        await tx.insert(settingsHistory).values({
          settingKey: key,
          oldValue: existing.value,
          newValue: value,
          changedBy: userId,
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
