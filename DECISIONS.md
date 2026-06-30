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

---

## Decisions Detail

### ADR-001: Feature-First Architecture

*   **Status**: Approved
*   **Context**: Code modularity, scalability, and code navigation ease for complex lifestyle domain requirements (Fashion, Home, etc.).
*   **Decision**: We structure the repository under `features/<feature_name>/` containing co-located components, hooks, stores, and types, isolating feature dependencies from other features.
*   **Reasoning**: Prevents structural spaghetti and barrel imports. Simplifies adding or deleting product domains as the brand grows.

---

### ADR-002: Database Object-Relational Mapper (ORM)

*   **Status**: Pending
*   **Context**: Type-safe database queries, schema migration pipelines, and developer developer-velocity.
*   **Candidates**:
    *   **Prisma**: Excellent schema modeling format, migration engine, auto-generated type output, but higher engine bundle weight.
    *   **Drizzle ORM**: Lightweight, SQL-like query structure, edge-runtime friendly, high performance, requires manual migration tracking scripting.
*   **Decision Date (Expected)**: Phase 9 (Database Integration).

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

*XINVORA DECISIONS.md — v1.0.0*
*Established: 2026*
