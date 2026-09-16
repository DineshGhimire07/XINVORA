import { NextRequest, NextResponse } from "next/server"
import { getMunicipalitiesByDistrict } from "@/db/queries/nepal"

export const revalidate = 3600 // cache 24h

export async function GET(req: NextRequest) {
  const districtId = req.nextUrl.searchParams.get("districtId")
  if (!districtId) {
    return NextResponse.json({ error: "districtId is required" }, { status: 400 })
  }
  const municipalities = await getMunicipalitiesByDistrict(districtId)
  return NextResponse.json(municipalities)
}
