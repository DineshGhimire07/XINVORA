import { NextResponse } from "next/server"
import { db } from "@/db/client"
import { sql } from "drizzle-orm"

/**
 * GET /api/admin/debug-media-match
 *
 * Diagnostic route: verifies that the `image_mobile_url` column exists on the
 * `collections` table by running a safe SELECT probe — NOT an ALTER TABLE.
 *
 * The column is declared in src/db/schema/collections.ts and should be present
 * in the database via the versioned Drizzle migration
 * (src/db/migrations/0012_add_missing_columns.sql).
 *
 * HISTORY: This route previously executed
 *   ALTER TABLE collections ADD COLUMN IF NOT EXISTS image_mobile_url varchar(1024)
 * on every GET request. DDL must never execute during application runtime.
 * That statement has been removed. Schema changes belong in migration files only.
 */
export async function GET() {
  try {
    // Safe probe: attempt to select the column — throws if it does not exist
    const result = await db.execute(
      sql`SELECT image_mobile_url FROM collections LIMIT 1`
    )
    return NextResponse.json({
      success: true,
      message: "image_mobile_url column exists and is accessible on collections table.",
      rows: result.length,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        hint: "Run the Drizzle migration 0012_add_missing_columns.sql to add the column.",
      },
      { status: 500 }
    )
  }
}
