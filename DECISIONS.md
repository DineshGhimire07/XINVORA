# DECISIONS.md — XINVORA Architectural Decision Records

> **This is a living document tracking design patterns, tool evaluations, and technical decisions.**
>
> All updates to technology selections, libraries, hosting providers, or vendor selection must be appended below as a new Architectural Decision Record (ADR).
> Do not modify historical records once they are marked Approved.

---

## Architectural Decision Records Index

| ID | Title | Status | Date |
|---|---|---|---|
| ADR-001 | Feature-First Architecture | Approved | 2026-06-30 |
| ADR-002 | Database Object-Relational Mapper (ORM) | Pending | 2026-06-30 |
| ADR-003 | Payment Gateway Provider | Pending | 2026-06-30 |
| ADR-004 | Media Asset Storage Provider | Pending | 2026-06-30 |
| ADR-005 | Transactional Email Service | Pending | 2026-06-30 |
| ADR-006 | Styles Directory Convention | Approved | 2026-07-02 |
| ADR-007 | ORM Selection Deferred | Deferred | 2026-07-02 |
| ADR-008 | Animation Library | Approved | 2026-07-02 |
| ADR-009 | Server Actions as Primary Mutation Path | Approved | 2026-07-02 |
| ADR-010 | External Services Deferred | Approved | 2026-07-02 |

---

## Decisions Detail

### ADR-001: Feature-First Architecture

*   **Status**: Approved
*   **Context**: Code modularity, scalability, and code navigation ease for complex lifestyle domain requirements (Fashion, Home, etc.).
*   **Decision**: We structure the repository under `features/<feature_name>/` containing co-located components, hooks, stores, and types, isolating feature dependencies from other features.
*   **Reasoning**: Prevents structural spaghetti and barrel imports. Simplifies adding or deleting product domains as the brand grows.

---

### ADR-002: Database Object-Relational Mapper (ORM)

*   **Status**: Approved (Drizzle ORM)
*   **Context**: Type-safe database queries, schema migration pipelines, and developer-velocity.
*   **Candidates**:
    *   **Prisma**: Excellent schema modeling format, migration engine, auto-generated type output, but higher engine bundle weight and requires Prisma Accelerate for Edge compatibility.
    *   **Drizzle ORM**: Lightweight, SQL-like query structure, edge-runtime friendly, high performance, zero binary engine overhead.
*   **Decision**: Drizzle ORM is selected.
*   **Reasoning**: Aligns with the project's $0 budget goal by avoiding Prisma Accelerate costs for Edge compatibility. Drizzle's zero-overhead serverless model fits perfectly with Vercel/Neon deployments.

---

### ADR-003: Payment Gateway Provider

*   **Status**: Pending
*   **Context**: E-commerce payment capture locally (Nepal/Asia) and globally (US/Europe).
*   **Candidates**:
    *   **Stripe**: Premier global choice, supports multiple credit cards, Apple Pay, simple webhooks, but regional support limits in developing markets.
    *   **eSewa**: Essential local wallet provider for local currency transaction compliance.
    *   **Khalti**: Dynamic wallet provider with simple developer APIs.
    *   **Fonepay**: Standard QR-based banking payment integration.
*   **Decision Date (Expected)**: Phase 14 (Payments Integration).

---

### ADR-004: Media Asset Storage Provider

*   **Status**: Pending
*   **Context**: Hosting high-resolution editorial product photography and media files.
*   **Candidates**:
    *   **Cloudinary**: Native dynamic media transformation URLs, built-in optimization, smart cropping, but cost scales with bandwith.
    *   **AWS S3 + CloudFront**: Fully customized control, cheaper storage rates, but requires custom image compression functions.
    *   **Uploadthing**: Next.js native serverless-friendly framework attachment client.
*   **Decision Date (Expected)**: Phase 11 (Image Upload).

---

### ADR-005: Transactional Email Service

*   **Status**: Pending
*   **Context**: Sending automated transactional messages (registrations, order confirmations).
*   **Candidates**:
    *   **Resend**: NextJS / React-friendly templating, clean UI dashboard.
    *   **SendGrid**: Industry veteran, reliable deliverability rates.
    *   **Postmark**: Fast delivery speeds, highly descriptive delivery reports.
*   **Decision Date (Expected)**: Phase 10 (Backend API).

---

### ADR-006: Styles Directory Convention

*   **Status**: Approved
*   **Context**: The architecture specified a `styles/` folder, but all global CSS was placed in `app/globals.css` during Phase 1-3.
*   **Decision**: CSS remains in `app/globals.css`. The empty `styles/` directory is kept but not populated.
*   **Reasoning**: Aligns with Next.js App Router convention; avoids unnecessary file movement.

---

### ADR-007: ORM Selection Deferred

*   **Status**: Deferred to Phase 4B
*   **Context**: Need to select an ORM for type-safe database queries. Drizzle and Prisma are candidates.
*   **Decision**: The decision is explicitly deferred until the start of Phase 4B to allow for a practical evaluation of edge compatibility, team familiarity, and serverless overhead.

---

### ADR-008: Animation Library

*   **Status**: Approved
*   **Context**: Both `framer-motion` and `gsap` were installed in the repository.
*   **Decision**: `framer-motion` is the sole animation library. `gsap` will be audited and removed in Phase 4B if unused.
*   **Reasoning**: Eliminates dead bundle weight. Framer Motion was the originally selected library in ARCHITECTURE.md.

---

### ADR-009: Server Actions as Primary Mutation Path

*   **Status**: Approved
*   **Context**: Managing data mutations in Next.js App Router.
*   **Decision**: All data mutations will use Server Actions in `src/actions/`. Route Handlers (`app/api/`) are reserved strictly for webhooks and external-facing REST endpoints.
*   **Reasoning**: Type-safe, colocated, avoids API URL management, and is CSRF-safe by default.

---

### ADR-010: External Services Deferred

*   **Status**: Approved
*   **Context**: The architecture plan initially proposed selecting state management (Zustand), API layers (TanStack Query), Auth, Payments (Stripe), and CDN (Cloudinary) upfront.
*   **Decision**: Decisions on external services are deferred to the exact phase that requires them. No external service is installed speculatively.
*   **Reasoning**: Ensures the project maintains a $0 development budget for as long as possible and prevents configuring unused infrastructure.

---

*XINVORA DECISIONS.md — v1.1.0*
*Established: 2026*
