# Utility Platform — Foundation Lock

**Status:** LOCKED  
**Baseline:** 2026-09-19  
**Current catalog baseline:** 20 tools

This document defines the rules that should remain stable while the platform grows toward 50, 100, and 200+ tools.

## 1. URL stability
- Published tool URLs are stable public URLs.
- Do not rename or move a live tool URL without a deliberate migration plan.
- Slugs should be lowercase, descriptive, and hyphen-separated.

## 2. Central catalog
- `tools-data.js` is the master registry for live tools.
- Every live tool gets exactly one catalog entry.
- Keep `slug`, `href`, `category`, `title`, `description`, `keywords`, and `addedOrder` consistent.
- Do not create duplicate catalog entries for the same live URL.

## 3. Category architecture
- Add a category only when it represents a real topical cluster.
- Do not create categories just to hold one tool.
- A category page must link to its own relevant tools.
- Placeholder categories may remain in the central registry, but should not be promoted as active navigation unless they contain live tools.

## 4. Internal linking
- Related Tools means genuinely/directly related tools only.
- Never add unrelated links just to increase link count.
- Category pages may link to their own category and relevant navigation destinations.
- Avoid forced cross-category chains.

## 5. Homepage
- Keep discovery compact.
- Newest/featured tools are limited to the latest six cards.
- Categories are generated from the central catalog.
- Do not turn the homepage into a full tool directory.

## 6. Search and directory
- `tools.html` remains the central searchable directory.
- Homepage search may send an exact/clear match directly to its tool; otherwise it should fall back to the directory query.
- Category filtering should use the central catalog.

## 7. Sitemap
- Every live tool URL must be represented in `sitemap.xml`.
- Non-tool editorial/legal pages may also be listed.
- When adding a tool, sitemap validation must pass before launch.

## 8. Tool-page baseline
A new tool should preserve the established page foundation: unique title/description, canonical URL, index/follow policy, usable mobile layout, clear input/output UX, relevant explanatory content, and structured data where appropriate.

## 9. Design and code
- Preserve the established visual system and responsive behavior.
- Do not introduce unnecessary page-specific navigation, columns, or duplicate UI.
- Prefer shared CSS/JS and the central catalog over repeated hardcoded structures.

## 10. Growth rule
Adding tools should extend the system, not require redesigning the system. Before adding a large batch, run the foundation validator and resolve real structural errors first.

**This lock is a guardrail, not a restriction on future improvements.** Changes are allowed when they improve the architecture deliberately and are applied consistently across the platform.
