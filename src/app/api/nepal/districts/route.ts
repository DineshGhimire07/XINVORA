import { NextRequest, NextResponse } from "next/server"
import { getDistrictsByProvince } from "@/db/queries/nepal"

export const revalidate = 3600 // cache 24h

export async function GET(req: NextRequest) {
  const provinceId = req.nextUrl.searchParams.get("provinceId")
  if (!provinceId) {
    return NextResponse.json({ error: "provinceId is required" }, { status: 400 })
  }
  const districts = await getDistrictsByProvince(provinceId)
  return NextResponse.json(districts)
}
