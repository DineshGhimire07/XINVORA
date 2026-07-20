# Feature Documentation — Authentication & User Management

## Purpose
Provides secure authentication and user management for XINVORA using Auth.js v5 (NextAuth), Credentials provider with bcryptjs password hashing, and Google OAuth.

---

## Core Flow & Architecture
- **Login Action**: `src/actions/auth.actions.ts` handles `loginAction`.
- **Registration Action**: `registerAction` registers new user and automatically logs them in using `signIn("credentials", { email, password, redirect: false })`.
- **Cart Merge**: Merges guest cart session into user account upon authentication.
- **Guest Consent Sync**: Merges signed guest cookie preferences into the database upon login.

---

## Security Specifications
- Password Hashing: `bcryptjs` with salt rounds = 10.
- Session Strategy: JWT session token with SameSite=Lax.
- Personal Email Protection: Registration forms do not pre-fill personal developer email addresses.

---

**Last Updated**: July 20, 2026
