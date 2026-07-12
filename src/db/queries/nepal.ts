import { db } from "@/db/client"
import { nepalProvinces, nepalDistricts, nepalMunicipalities } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { unstable_cache } from "next/cache"

export type NepalProvince = {
  id: string
  name: string
  code: string
  sortOrder: number
}

export type NepalDistrict = {
  id: string
  provinceId: string
  name: string
}

export type NepalMunicipality = {
  id: string
  districtId: string
  name: string
  type: "METROPOLITAN" | "SUBMETROPOLITAN" | "MUNICIPALITY" | "RURAL_MUNICIPALITY"
  totalWards: number
}

export const getProvinces = unstable_cache(
  async (): Promise<NepalProvince[]> => {
    return db
      .select({
        id: nepalProvinces.id,
        name: nepalProvinces.name,
        code: nepalProvinces.code,
        sortOrder: nepalProvinces.sortOrder,
      })
      .from(nepalProvinces)
      .orderBy(asc(nepalProvinces.sortOrder))
  },
  ["nepal-provinces"],
  { revalidate: 86400, tags: ["nepal-provinces", "nepal"] }
)

// Districts are keyed per province — static geographic data, cache forever (24h TTL)
const _districtsByProvinceCacheMap = new Map<string, () => Promise<NepalDistrict[]>>()

export async function getDistrictsByProvince(provinceId: string): Promise<NepalDistrict[]> {
  if (!_districtsByProvinceCacheMap.has(provinceId)) {
    _districtsByProvinceCacheMap.set(
      provinceId,
      unstable_cache(
        async () => db
          .select({
            id: nepalDistricts.id,
            provinceId: nepalDistricts.provinceId,
            name: nepalDistricts.name,
          })
          .from(nepalDistricts)
          .where(eq(nepalDistricts.provinceId, provinceId))
          .orderBy(asc(nepalDistricts.name)),
        [`nepal-districts-${provinceId}`],
        { revalidate: 86400, tags: ["nepal-districts", "nepal"] }
      )
    )
  }
  return _districtsByProvinceCacheMap.get(provinceId)!()
}

// Municipalities are keyed per district — static geographic data, cache forever (24h TTL)
const _municipalitiesByDistrictCacheMap = new Map<string, () => Promise<NepalMunicipality[]>>()

export async function getMunicipalitiesByDistrict(districtId: string): Promise<NepalMunicipality[]> {
  if (!_municipalitiesByDistrictCacheMap.has(districtId)) {
    _municipalitiesByDistrictCacheMap.set(
      districtId,
      unstable_cache(
        async () => db
          .select({
            id: nepalMunicipalities.id,
            districtId: nepalMunicipalities.districtId,
            name: nepalMunicipalities.name,
            type: nepalMunicipalities.type,
            totalWards: nepalMunicipalities.totalWards,
          })
          .from(nepalMunicipalities)
          .where(eq(nepalMunicipalities.districtId, districtId))
          .orderBy(asc(nepalMunicipalities.name)),
        [`nepal-municipalities-${districtId}`],
        { revalidate: 86400, tags: ["nepal-municipalities", "nepal"] }
      )
    )
  }
  return _municipalitiesByDistrictCacheMap.get(districtId)!()
}

