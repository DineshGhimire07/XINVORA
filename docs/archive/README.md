# XINVORA

> **Premium Lifestyle Brand — Digital Commerce Platform**

---

## Table of Contents

1. [Vision](#vision)
2. [Mission](#mission)
3. [Goals](#goals)
4. [Technology Stack & Candidates](#technology-stack--candidates)
5. [High-Level Architecture](#high-level-architecture)
6. [Folder Overview](#folder-overview)
7. [How the Repository Grows](#how-the-repository-grows)
8. [Development Philosophy](#development-philosophy)
9. [Documentation Index](#documentation-index)

---

## Vision

XINVORA is a **premium, multi-category lifestyle brand** delivered through a world-class digital commerce experience. We are building more than a store — we are building an identity: timeless, elegant, and trusted by a global audience.

The XINVORA platform must reflect the brand's values in every pixel, every interaction, every millisecond of response time. There is no room for mediocrity. The digital platform is the brand.

---

## Mission

To deliver a digital shopping experience that is indistinguishable in quality from the world's most celebrated luxury e-commerce platforms — while remaining scalable, maintainable, and engineered to last.

---

## Goals

### Business Goals

| Priority | Goal |
|---|---|
| 1 | Establish a premium, trustworthy digital storefront for fashion products |
| 2 | Expand catalog to cover Home, Kitchen, Bathroom, Office, Travel, Accessories, and Lifestyle |
| 3 | Build a loyal customer base through superior UX and brand experience |
| 4 | Enable global sales with multi-currency and multi-language support (future) |
| 5 | Compete directly with top-tier DTC (Direct-to-Consumer) luxury brands online |

### Engineering Goals

| Priority | Goal |
|---|---|
| 1 | Build a maintainable, scalable, feature-first architecture from day one |
| 2 | Establish a design system and brand token infrastructure that never needs to be rebuilt |
| 3 | Achieve near-perfect Lighthouse scores across Performance, Accessibility, and SEO |
| 4 | Enable any engineer or AI agent to onboard and contribute without breaking existing work |
| 5 | Ship each phase independently with zero regressions to prior phases |

---

## Technology Stack & Candidates

To maintain agility and avoid vendor lock-in, all technical implementations must rely on abstracted interfaces. The specific tools listed below represent current candidates and will be finalized through formal architectural records in [DECISIONS.md](./DECISIONS.md).

### Frontend

| Layer | Selected Provider | Candidates / Alternatives | Rationale |
|---|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Remix, Vite + SPA | Standard for SSR/SSG, SEO, and performance at scale |
| **Language** | TypeScript | Vanilla JavaScript | Type safety eliminates entire classes of runtime bugs |
| **Styling** | Tailwind CSS + CSS Custom Properties | CSS Modules, Styled Components | Utility-first with brand token integration |
| **Animation** | Framer Motion | GSAP, Web Animations API | Production-grade motion library with layout animations |
| **State (UI)** | Zustand | Redux Toolkit, Recoil | Minimal, performant, non-boilerplate client state |
| **State (Server)** | TanStack Query | RTK Query, SWR | Server state management, caching, synchronization |
| **Forms** | React Hook Form + Zod | Formik, Yup | Performant forms with schema-validated inputs |

### Backend & Infrastructure

| Layer | Selected Provider | Candidates / Alternatives | Rationale |
|---|---|---|---|
| **API Layer** | Next.js Route Handlers | Express, NestJS | Co-located, edge-compatible, zero-config API |
| **Database ORM** | **Pending** (See Decision #002) | Prisma, Drizzle, Kysely | Type-safe database access with migration tooling |
| **Database Engine** | **Pending** | PostgreSQL, MySQL, Supabase | ACID-compliant, battle-tested for e-commerce |
| **Database Hosting** | **Pending** | Neon, Supabase, AWS RDS, PlanetScale | Serverless or managed hosting scaled for production |
| **Authentication** | **Pending** | Auth.js (NextAuth), Clerk, Kinde, Supabase Auth | Secure session and identity management |
| **Storage / CDN** | **Pending** | Cloudinary, AWS S3 + CloudFront, Uploadthing | Optimization, CDN delivery, and upload management |
| **Transactional Email** | **Pending** | Resend, SendGrid, Postmark | Developer-friendly transactional email delivery |
| **Payment Gateway** | **Pending** (See Decision #003) | Stripe, eSewa, Khalti, Fonepay | Global and local payment processing, webhooks |

---

## High-Level Architecture

```
Browser / Client
       |
       v
  Web Application Framework
       |
  +----+-----------------------------+
  |   Server Components (RSC)        |  <- Data fetching, SEO, layout
  |   Client Components              |  <- Interactivity, animations, state
  +----+-----------------------------+
       |
  +----v--------------------+
  |  API Gateway / Routes    |  <- /api/* endpoints, webhooks
  +----+--------------------+
       |
  +----v--------------------+
  |  Service Layer           |  <- Business logic (pure TypeScript, provider-agnostic)
  +----+--------------------+
       |
  +----v--------------------+
  |  Database ORM Layer      |  <- Type-safe DB access (abstracted query layer)
  +----+--------------------+
       |
  Database Service (PostgreSQL/SQL)
```

External services (Payments, Storage, Email) are accessed exclusively through abstract wrappers in the Service Layer — never directly from UI components.

---

## Folder Overview

> Full architectural detail is in [ARCHITECTURE.md](./ARCHITECTURE.md)

```
xinvora/
+-- app/                    # Next.js App Router (pages, layouts, routes)
+-- components/             # Reusable UI components
|   +-- ui/                 # Primitive design system components
|   +-- shared/             # Shared layout/structural components
+-- features/               # Feature-first modules (shop, cart, auth, etc.)
+-- lib/                    # Core utilities, config, constants
+-- services/               # External service integrations
+-- hooks/                  # Custom React hooks
+-- providers/              # React context providers
+-- types/                  # Global TypeScript types and interfaces
+-- styles/                 # Global CSS, design tokens
+-- public/                 # Static assets (fonts, images, icons)
+-- prisma/                 # Database schema and migrations
+-- docs/                   # Engineering documentation
```

---

## How the Repository Grows

XINVORA is built **phase by phase**, as documented in [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md). Each phase is:

- **Self-contained** — completed and reviewed independently.
- **Non-destructive** — never modifies or breaks output from prior phases.
- **Documented** — progress is tracked in [PROJECT_STATUS.md](./PROJECT_STATUS.md).

The repository grows **vertically** (new features added to existing architecture), never **horizontally** (architecture is not reorganized mid-project). New categories and features are added within the established folder structure. The architecture is defined once and extended — never rewritten.

---

## Development Philosophy

### 1. Architecture First
No code is written without understanding where it lives, why it exists, and how it connects to the rest of the system.

### 2. Design Tokens Over Raw Values
Every color, spacing value, font size, shadow, radius, and duration lives in the design token system. Raw values are never hardcoded in components.

### 3. Feature-First Modules
Related code (components, hooks, types, utilities, API) is co-located inside feature folders. Features are portable, testable, and independently understandable.

### 4. Server by Default
Components are Server Components by default. The `'use client'` directive is added only when genuinely required. This maximizes performance and SEO.

### 5. Type Safety Everywhere
TypeScript strict mode is enforced. No `any`. No implicit `any`. No type casting without explicit justification.

### 6. Performance is a Feature
Image optimization, lazy loading, code splitting, caching, and edge delivery are built into every component from the start.

### 7. Accessibility is Non-Negotiable
Every interactive element is keyboard-accessible, screen-reader-friendly, and WCAG 2.1 AA compliant by default.

### 8. Consistency Over Cleverness
Predictable, readable code is preferred over clever abstractions. Patterns are established once and followed everywhere.

### 9. Never Build Ahead
No code for Phase N+1 is written during Phase N. Future requirements must not pollute current implementations.

### 10. Documentation is Code
Every architectural decision, every deviation, every phase completion is documented. The docs are as important as the source code.

---

## Documentation Index

The project's documentation is strictly divided into **Permanent Documentation** (the frozen constitution) and **Living Documentation** (continuous execution tracking).

### Permanent Documentation (FROZEN - Do not edit unless fundamental direction changes)

| File | Purpose |
|---|---|
| [README.md](./README.md) | Project overview, vision, technology candidates, and roadmap index. |
| [AI_RULES.md](./AI_RULES.md) | Strict engineering rules that all AI sessions must parse and follow. |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System principles, rendering choices, folder structure, and naming rules. |
| [BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md) | Visual design tokens, typography, white space philosophy, and styling rules. |
| [PROMPT_TEMPLATE.md](./PROMPT_TEMPLATE.md) | Structural prompt frame that must head every future AI instruction block. |

### Living Documentation (ACTIVE - Updated continuously during execution)

| File | Purpose |
|---|---|
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Active phases, checkboxes, and project asset snapshots. |
| [CHANGELOG.md](./CHANGELOG.md) | Clean logs of versions, milestones, and completed features. |
| [DECISIONS.md](./DECISIONS.md) | Architectural Decisions Records (ADR) for tools, database, and vendors. |

---

*XINVORA Engineering Documentation — v1.1.0*
*Established: 2026 — All rights reserved.*
