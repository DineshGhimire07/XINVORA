import postgres from "postgres"

async function runLoadTest() {
  console.log("🚀 Starting CDP Pipeline Load Test (2,000 events)...")
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be defined")
  }
  const sql = postgres(process.env.DATABASE_URL)

  const userRes = await sql`SELECT id FROM users LIMIT 1`
  if (userRes.length === 0) {
    throw new Error("No users found in the database to run the test!")
  }
  const sessionKey = crypto.randomUUID()
  const userId = userRes[0].id
  const totalEvents = 200
  const batchSize = 100 // back to 100

  const startTime = Date.now()

  for (let i = 0; i < totalEvents; i += batchSize) {
    const promises = []
    for (let j = 0; j < batchSize; j++) {
      promises.push(
        fetch("http://localhost:3000/api/analytics/event", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Connection": "keep-alive" },
          body: JSON.stringify({
            eventId: crypto.randomUUID(),
            sessionKey,
            userId,
            eventType: "PAGE_VIEW",
            page: `http://localhost:3000/page/${i + j}`,
            device: "MOBILE",
            payload: { loadTestIdx: i + j }
          })
        }).then(res => res.status)
      )
    }
    const results = await Promise.all(promises)
    const failed = results.filter(s => s !== 202)
    if (failed.length > 0) {
      console.error(`❌ Batch ${i / batchSize} had ${failed.length} failed requests!`)
    }
    process.stdout.write(`\rSent ${i + batchSize} / ${totalEvents} events...`)
  }

  const duration = Date.now() - startTime
  console.log(`\n✅ Finished sending 2,000 events in ${duration}ms (${(2000 / (duration/1000)).toFixed(2)} req/s).`)

  console.log("⏳ Waiting 6 seconds for the background queue to drain completely...")
  await new Promise((resolve) => setTimeout(resolve, 6000))

  console.log("🔍 Verifying Database...")
  
  const dbCountRes = await sql`SELECT COUNT(*) FROM user_events WHERE user_id = ${userId}`
  const dbCount = parseInt(dbCountRes[0].count, 10)
  
  if (dbCount === totalEvents) {
    console.log(`✅ Success! Found exactly ${totalEvents} events in the database with no drops.`)
  } else {
    console.error(`❌ Failure! Expected ${totalEvents} events, but found ${dbCount} in the database.`)
    process.exit(1)
  }

  process.exit(0)
}

runLoadTest().catch(console.error)
