import { defineConfig } from "drizzle-kit"
import * as dotenv from "dotenv"

// Load environment variables from .env.local for local development
dotenv.config({ path: ".env.local" })

export default defineConfig({
  schema: "./src/db/schema/*.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
})
