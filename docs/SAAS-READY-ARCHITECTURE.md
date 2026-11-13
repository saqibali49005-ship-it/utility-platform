# ZemTools SaaS-Ready Architecture (Staged)

**Status:** Foundation preparation only  
**Current product mode:** Public, browser-based tools  
**Production impact:** None until a reviewed change is explicitly approved and merged

## Product decision

ZemTools should evolve toward a polished SaaS utility platform, but the current release remains a public tools website. Do not add sign-in, registration, user profiles, billing, subscriptions, paid access gates, API endpoints, cloud storage, or account databases in this phase.

This document records the agreed boundary so future work can extend the existing platform without prematurely introducing operational cost or security obligations.

## What exists today

- A central catalog in `tools-data.js` drives homepage and directory discovery.
- Published tool slugs and clean URLs are stable public identifiers.
- Search and category browsing use the shared catalog.
- Tool calculations currently run in the browser on their individual pages.
- The homepage has the premium visual treatment and responsive navigation already merged to production.

## Catalog contract

Each tool record now carries three forward-looking fields:

| Field | Current value | Meaning |
|---|---|---|
| `slug` | Stable unique string | Durable tool identifier; do not change after launch without a migration |
| `access` | `public` | The tool is publicly accessible today; this is descriptive metadata, not an authorization check |
| `execution` | `browser` | The current user-facing execution model runs in the browser |
| `contractVersion` | `1` | Version of this catalog metadata contract |

Keep existing fields (`href`, `category`, `title`, `description`, `keywords`, `addedOrder`) backward compatible. Catalog consumers must continue to work if future optional metadata is added.

**Security note:** A browser-side catalog field must never be treated as a secure paywall or permission check. Any future paid entitlement or API authorization must be enforced by a trusted server.

## Future implementation boundaries

### 1. Tool calculation engines

When API or server-side processing becomes a real requirement, extract each calculator's calculation rules into small, deterministic functions with explicit input and output contracts. Keep DOM rendering, input collection, and display formatting in the page adapter. Reuse the calculation functions from browser UI and future server/API handlers where practical.

Do not mass-refactor all 20 tools now. Migrate one representative tool at a time with regression tests before repeating the pattern.

### 2. Accounts and identity (deferred)

When needed, introduce a server-verified identity/session layer and account lifecycle (registration, login, recovery, deletion). Do not store passwords or session secrets in static files, browser local storage, or the public tool catalog.

### 3. Plans, billing, and entitlements (deferred)

When needed, keep plans and entitlements in a server-side service. Payment provider webhooks must be verified server-side. The browser can display a plan state, but cannot grant access to paid capabilities by itself.

### 4. API (deferred)

When needed, provide versioned endpoints (for example `/api/v1`) with input validation, rate limits, abuse controls, observability, and server-side authorization. Reuse tested calculation engines rather than scraping results from page markup.

### 5. Bulk jobs and saved work (deferred)

Only add queues, persistent storage, exports, or saved projects when usage data shows a need. Define retention, privacy, deletion, and failure-recovery behavior before accepting user data.

## Delivery sequence

1. **Public experience:** Keep homepage, catalog, search, categories, tool pages, mobile navigation, and SEO stable.
2. **Catalog contract:** Maintain stable IDs and metadata; validate the schema in CI.
3. **Calculation boundary pilot:** Select one suitable tool, separate calculation from DOM code, and prove parity with existing browser tests.
4. **Reusable tool engine pattern:** Migrate additional tools gradually, only where justified.
5. **Accounts, plans, billing, API, and storage:** Start these as separate projects after the site has meaningful usage and the owner explicitly approves scope, provider choice, budget, and privacy requirements.

## Explicitly out of scope for the current phase

- Login or registration
- User accounts or profiles
- Payment gateway or billing
- Monthly/yearly subscriptions
- Premium restrictions or paywalls
- Public API endpoints or API keys
- Cloud sync, saved projects, or account database

## Change safety

- Preserve production URLs, canonical tags, formulas, calculation behavior, metadata, sitemap, and redirects unless a task specifically calls for a reviewed change.
- Work on a preview branch first.
- Run catalog validation and the existing browser regression suite.
- Review desktop and mobile preview pages before proposing deployment.
- Production deployment requires the owner's explicit approval.
