# XINVORA Comprehensive Documentation Hub

Welcome to the central documentation repository for XINVORA, an enterprise-grade luxury e-commerce platform built using Next.js 16 (App Router), React 19, TypeScript, Drizzle ORM, and Supabase PostgreSQL.

This documentation suite is organized to serve both technical engineers and non-technical business managers. All descriptions reflect the verified, live source code implementation of the platform.

---

## Document Categories

### 1. Owner Guide (Non-Technical Stakeholders)
Documentation tailored specifically for business owners, store managers, and non-technical stakeholders:
- [Project Explained](./owner-guide/project-explained.md) — High-level overview of XINVORA, business goals, and platform capabilities.
- [Complete Customer User Journey](./owner-guide/complete-user-journey.md) — Step-by-step navigation path of customers from discovery to checkout.
- [Complete Admin & Management Journey](./owner-guide/complete-admin-journey.md) — Operational workflows for managing inventory, orders, CMS, and analytics.
- [How Everything Connects](./owner-guide/how-everything-connects.md) — Plain-English explanation of system integration and data flows.
- [Simple Architecture Guide](./owner-guide/simple-architecture-guide.md) — Clear explanations of core storefront actions.
- [Business Logic & Pricing Rules](./owner-guide/business-logic-guide.md) — Commercial rules governing pricing, discounts, inventory, and logistics.
- [Technical & Business Glossary](./owner-guide/glossary.md) — Clear definitions of technical terminology.
- [Frequently Asked Questions (FAQ)](./owner-guide/faq.md) — Practical answers to common operational questions.

### 2. Architecture (Engineering & Infrastructure)
Technical documentation detailing system design and infrastructure:
- [System Architecture Overview](./architecture/overview.md) — High-level architecture, bounded domains, and data access rules.
- [Frontend Architecture](./architecture/frontend.md) — Next.js App Router, React 19, component tree, and design system.
- [Backend Services & Data Boundaries](./architecture/backend-services.md) — Service layer, domain repositories, and transaction management.
- [Database Schema & Data Models](./architecture/database-schema.md) — Drizzle ORM schemas, relationships, and index design.

### 3. Features & Subsystems
Detailed technical breakdowns of core platform features:
- [Privacy & Cookie Consent (CMP)](./features/privacy-cmp.md) — Signed HMAC cookies, policy versioning, audit logs, and script gating.
- [Customer Data & Analytics Engine (CDP)](./features/analytics-cdp.md) — Event tracking, anonymous session IDs, and executive BI metrics.
- [Authentication & User Management](./features/authentication.md) — Credentials, OAuth, auto-login, and guest-to-user sync.
- [Product & Catalog Engine](./features/products-catalog.md) — Variants, price books, off-section promotions, and sold-out indicators.
- [Cart & Checkout System](./features/cart-checkout.md) — Guest cart persistence, inline size swapper, and Nepal logistics.
- [Order Processing & Fulfillment](./features/order-processing.md) — Order states, inventory deduction, and printable invoices.

### 4. Development & Workflow
Guides for software engineers and contributors:
- [Developer Setup & Workflow Guide](./development/setup-workflow.md) — Environment configuration, local server setup, and verification.
- [Coding Standards & Guidelines](./development/coding-standards.md) — Architectural boundary constraints, type safety rules, and design tokens.

### 5. Audit & Health Reports
Comprehensive audits evaluating implementation quality:
- [Repository Implementation Audit Report](./audit/repository-audit.md) — Comprehensive technical audit of codebase health and domain separation.
- [Documentation Health & Coverage Report](./audit/documentation-health.md) — Coverage metrics and maintenance strategy.

---

**Last Updated**: July 20, 2026
