<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Data Access Boundaries

- **Never call Drizzle directly from a Server Action.** All write operations must flow:
  `Server Action` ➔ `Service` ➔ `Drizzle`
- **Never call Drizzle directly from a Server Component.** All read operations must flow:
  `Server Component` ➔ `Query (Repository)` ➔ `Drizzle`

