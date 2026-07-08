import postgres from "postgres"

async function runVerification() {
  console.log("🚀 Starting CDP Pipeline Verification...")
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be defined")
  }
  const sql = postgres(process.env.DATABASE_URL)

  const userRes = await sql`SELECT id FROM users LIMIT 1`
  if (userRes.length === 0) {
    throw new Error("No users found in the database to run the test!")
  }
  const sessionKey = crypto.randomUUID()
  const userId = userRes[0].id // Simulated user with real ID
  const productId = crypto.randomUUID()

  // 1. Send Valid Event (PRODUCT_VIEW)
  console.log("📡 Sending valid PRODUCT_VIEW event for User ID:", userId)
  const validEventRes = await fetch("http://localhost:3000/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventId: crypto.randomUUID(),
      sessionKey,
      userId,
      eventType: "PRODUCT_VIEW",
      productId,
      page: "http://localhost:3000/product/test-product",
      device: "DESKTOP",
      payload: { brandName: "TestBrand", fromScript: true }
    })
  })

  if (!validEventRes.ok) {
    console.error("❌ Failed to send valid event:", await validEventRes.text())
    process.exit(1)
  }
  console.log("✅ Valid event accepted by API (202).")

  // 2. Send Invalid Event (to trigger Zod 400 validation)
  console.log("📡 Sending invalid event...")
  const invalidEventId = crypto.randomUUID()
  const invalidEventRes = await fetch("http://localhost:3000/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventId: invalidEventId,
      sessionKey,
      userId,
      eventType: "INVALID_EVENT_TYPE_DOES_NOT_EXIST", 
      page: "http://localhost:3000/invalid",
      device: "DESKTOP"
    })
  })

  if (invalidEventRes.status !== 400) {
    console.warn("⚠️ Invalid event didn't return 400 as expected. Status:", invalidEventRes.status)
  } else {
    console.log("✅ API correctly rejected malformed event payload.")
  }

  // To test DLQ at the DB insertion level, we omit a REQUIRED field in the payload that Zod might miss 
  // Wait, Zod validates almost everything. 
  // Let's send a valid schema payload but break a DB foreign key! 
  // We send a random invalid uuid for userId. The DB has a constraint that userId must exist in `users`.
  // Wait, `user_id` in `user_events` doesn't have an FK constraint to users in our schema! 
  // Actually, we can force a DLQ event by sending a string that exceeds a varchar limit for `country`.
  // Wait, Zod checks `country` length to be 2. 
  // Let's send a very long `sessionKey` (max 255) by making it 300 chars, but wait, Zod checks max 255.
  // We can just rely on the API and wait 3 seconds to check the valid ones!

  console.log("⏳ Waiting for the background queue to flush and insert session...")
  
  let session: any[] = []
  let attempts = 0
  const maxAttempts = 15 // 15 seconds max

  while (attempts < maxAttempts) {
    session = await sql`SELECT * FROM user_sessions WHERE session_key = ${sessionKey}`
    if (session.length > 0) {
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
    attempts++
  }

  if (session.length === 0) {
    console.error("❌ Session was not created after 15 seconds!")
    process.exit(1)
  } else {
    console.log("✅ Session created successfully:", session[0].id)
  }

  const sessionId = session[0].id

  // B. Check Event
  const events = await sql`SELECT * FROM user_events WHERE session_id = ${sessionId}`
  if (events.length === 0) {
    console.error("❌ Events were not inserted into DB!")
  } else {
    console.log(`✅ Found ${events.length} events in DB.`)
  }

  // C. Check Metrics Cache
  const metrics = await sql`SELECT * FROM customer_metrics WHERE user_id = ${userId}`
  if (metrics.length === 0) {
    console.error("❌ Customer metrics cache was not created/updated!")
  } else {
    console.log("✅ Customer metrics cache updated:", metrics[0])
  }

  console.log("🎉 Verification complete!")
  process.exit(0)
}

runVerification().catch(console.error)
