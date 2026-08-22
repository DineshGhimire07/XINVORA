import { NextResponse } from "next/server"
import { db } from "@/db/client"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    await db.execute(sql`ALTER TABLE collections ADD COLUMN IF NOT EXISTS image_mobile_url varchar(1024);`)
    return NextResponse.json({ success: true, message: "image_mobile_url column added/verified in collections table." })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
