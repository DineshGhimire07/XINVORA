# Coding Standards & Architecture Guidelines

## Architecture Rules
1. **Data Access Boundary**:
   - Write Path: `Server Action` ➔ `Service` ➔ `Repository` / `Drizzle`.
   - Read Path: `Server Component` ➔ `Repository` / `Drizzle`.
   - Direct Drizzle calls in Server Components or Actions are strictly forbidden.

2. **Type Safety**:
   - Zero `any` policy for domain entities. Use types from `@/types/*`.

3. **Privacy & Security**:
   - Never store raw IP addresses; use `hashIpAddress(rawIp)`.
   - All client cookies storing user state must be HMAC signed.

4. **UI Styling**:
   - Use Tailwind CSS v4 utility classes.
   - Use Framer Motion for micro-animations.

---

**Last Updated**: July 20, 2026
