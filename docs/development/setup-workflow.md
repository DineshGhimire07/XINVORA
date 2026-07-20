# Developer Setup & Workflow Guide

## Prerequisites
- Node.js `20.x` or higher
- npm `10.x` or higher
- Supabase PostgreSQL instance

---

## Installation & Setup

1. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/DineshGhimire07/XINVORA.git
   cd XINVORA
   npm install
   ```

2. **Environment Variables Configuration**:
   Create `.env.local` with:
   ```env
   DATABASE_URL="postgresql://user:password@db.supabase.co:5432/postgres"
   AUTH_SECRET="your_nextauth_secret"
   COOKIE_HMAC_SECRET="your_cookie_hmac_secret"
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Verify TypeScript Compilation**:
   ```bash
   npx tsc --noEmit
   ```

---

**Last Updated**: July 20, 2026
