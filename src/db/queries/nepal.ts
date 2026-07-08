import { db } from "@/db/client"
import { nepalProvinces, nepalDistricts, nepalMunicipalities } from "@/db/schema"
import { eq, asc } from "drizzle-orm"

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

export async function getProvinces(): Promise<NepalProvince[]> {
  return db
    .select({
      id: nepalProvinces.id,
      name: nepalProvinces.name,
      code: nepalProvinces.code,
      sortOrder: nepalProvinces.sortOrder,
    })
    .from(nepalProvinces)
    .orderBy(asc(nepalProvinces.sortOrder))
}

export async function getDistrictsByProvince(provinceId: string): Promise<NepalDistrict[]> {
  return db
    .select({
      id: nepalDistricts.id,
      provinceId: nepalDistricts.provinceId,
      name: nepalDistricts.name,
    })
    .from(nepalDistricts)
    .where(eq(nepalDistricts.provinceId, provinceId))
    .orderBy(asc(nepalDistricts.name))
}

export async function getMunicipalitiesByDistrict(districtId: string): Promise<NepalMunicipality[]> {
  return db
    .select({
      id: nepalMunicipalities.id,
      districtId: nepalMunicipalities.districtId,
      name: nepalMunicipalities.name,
      type: nepalMunicipalities.type,
      totalWards: nepalMunicipalities.totalWards,
    })
    .from(nepalMunicipalities)
    .where(eq(nepalMunicipalities.districtId, districtId))
    .orderBy(asc(nepalMunicipalities.name))
}
