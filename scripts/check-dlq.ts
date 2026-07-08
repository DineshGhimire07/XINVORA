import postgres from "postgres"

async function run() {
  const sql = postgres(process.env.DATABASE_URL!)
  const res = await sql`SELECT error_message FROM analytics_dlq ORDER BY failed_at DESC LIMIT 5`
  console.log(res)
  process.exit(0)
}

run().catch(console.error)
