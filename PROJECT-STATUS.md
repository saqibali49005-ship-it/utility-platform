# ZemTools — Master Project Status

**Workflow version:** 1.0  
**Approved:** 2026-11-13  
**Repository:** `saqibali49005-ship-it/utility-platform`  
**Production domain:** `zemtools.com`

This file is the source of truth for project phases, task status, decisions, and verified evidence. Update it whenever a significant task changes status. Do not silently change the roadmap or completion denominator.

## 1. Permanent working rules

1. Keep one master roadmap. New bugs and requests become subtasks under an existing phase; they do not create or replace phases.
2. Check this file and recent evidence before starting work. Do not repeat a completed audit unless a regression, material change, or new evidence justifies it.
3. A historical successful check proves only what was checked at that time. Re-check live behavior when a later change could affect it.
4. Never claim a task is complete without evidence. Code written, committed, merged, or deployed does not by itself prove the live result.
5. Production changes require preview, relevant tests, and explicit user approval. After publishing, verify the live result.
6. Do not use Vercel. Do not assume a Cloudflare Worker or Pages project serves production without verifying the actual routing and deployment configuration.
7. Do not invent completion percentages. Calculate one only from a fixed, agreed checklist and its verified completed items.
8. Preserve the active milestone when handling an unrelated issue; return to it when the side issue is resolved.
9. Add new scope only when there is a clear need and the user approves it.
10. Record blockers and unknowns explicitly rather than guessing.

## 2. Master roadmap

### Phase 1 — Foundation and infrastructure
Domain, HTTPS, redirects, repository structure, deployment configuration, shared navigation, responsive foundations.

### Phase 2 — Website functionality and UI
Header/footer, menus, search, tools and category pages, desktop/mobile layout, functional defects, broken links.

### Phase 3 — Technical SEO
Canonical URLs, sitemap, robots.txt, redirects/clean URLs, metadata, structured data, internal links, crawlability and indexability.

### Phase 4 — Content quality and AdSense readiness
Useful and original content, tool correctness, trust/information pages, UX, policy and quality review.

### Phase 5 — Analytics and search performance
Search Console indexing and performance, impressions, clicks, queries, traffic and evidence-based optimization.

### Phase 6 — Growth and monetization
Demand-led tools, content expansion, performance, affiliate and advertising opportunities, other monetization.

## 3. Task status vocabulary

Use exactly one status per task:

- `NOT STARTED`
- `IN PROGRESS`
- `BLOCKED`
- `FIXED — NOT VERIFIED`
- `VERIFIED — PREVIEW`
- `APPROVED`
- `LIVE — NOT VERIFIED`
- `COMPLETED — LIVE VERIFIED`

Only `COMPLETED — LIVE VERIFIED` counts as fully complete. For tasks that do not require production publishing, document why and use the appropriate verified status.

## 4. Current project baseline (2026-11-13)

This is a snapshot of known evidence, not a claim that every area has been fully audited.

| Phase | Recorded status | Evidence / qualification |
|---|---|---|
| 1. Foundation and infrastructure | Core sitewide header audit completed historically; later isolated test observation needs reconciliation | HTTPS/redirect smoke checks passed in GitHub workflow run 43313733225 on merged main commit `224fbc2be88720262e17fc8e57d0f73da38137ea`. A prior sitewide header audit/fix across the 20 tool pages was recorded on 2026-09-22, covering search, hamburger, search/menu mutual closing and click behavior. Later navigation centralization was committed. A subsequent 95/96 browser run reported one desktop burger visibility failure on `/sod-staple-spacing-guide/`; this is a separate later test observation, not grounds to mark the original sitewide audit incomplete or repeat it. Reconcile that specific observation against the user's existing evidence before treating it as an open defect. |
| 2. Website functionality and UI | In progress; historical sitewide header work preserved as completed | The 2026-09-22 sitewide header audit/fix is recorded as completed for its original scope. Later shared navigation work is committed. The single guide-page desktop failure is a later reported regression/test discrepancy awaiting evidence reconciliation, not a reason to restart the full header audit. Four information-page changes were merged, but live rendering still needs direct verification. |
| 3. Technical SEO | Partially verified; audit incomplete | Smoke checks reported apex HTTPS redirect, www-to-apex redirect, legacy .html redirect with query preservation, a canonical tool page returning 200, robots.txt returning 200, and sitemap.xml returning 200. Sitemap source contains 31 URLs, including all 20 catalog tool pages. Metadata/internal-link regression checks did not run because the earlier responsive test failed. |
| 4. Content quality and AdSense readiness | Not fully audited | Previous discussions included an AdSense readiness audit, but there is no completed, evidence-backed final sign-off recorded here. |
| 5. Analytics and search performance | Pending fresh data review | No current Search Console performance export or connected data is recorded in this baseline. Do not infer impressions, clicks, rankings, or indexing counts. |
| 6. Growth and monetization | Not started as a tracked phase | Begin after the quality and measurement foundations are sufficiently verified. |

### Important historical references

- 2026-09-22 historical sitewide header audit: recorded as covering all 20 tool pages, including search, hamburger menu, mutual close behavior and click handling; deployment was pending in that historical conversation, so retain the completed implementation/audit record without overstating current live status.
- Earlier page-specific header fixes: Aspect Ratio commit `311ca887`; Case Converter commit `0c160df34b171f83aba1c8b6e089cac1963324a2`.
- Navigation centralization commit: `99f6570d38c0cb8c80d477fc333b03f0c723e8a3`
- Shared search behavior commit: `82b865a5a09d619a88347af1f48c2134f602e7ea`
- Information-page parity PR #43 was merged into main as `224fbc2be88720262e17fc8e57d0f73da38137ea`.
- PR #43 changed `about/index.html`, `contact/index.html`, `privacy/index.html`, `terms/index.html`, and `site-design.css`. User approved the changes after preview review; production/live verification remains pending in this record.
- Later responsive test observation: `/sod-staple-spacing-guide/` at desktop viewport was the sole failure in a 95/96 run. Source inspection found `.tool-page .site-header .menu-btn{display:none!important}`, with a mobile-only override. Treat this as a specific observation to reconcile against the user's earlier fix evidence; do not reopen the entire sitewide header audit or claim the earlier work was never completed.

## 5. Active work queue

Work in this order unless new evidence changes priority:

1. **P1 — Verify information pages on production:** inspect the four live routes and confirm the merged header/footer changes actually reached `zemtools.com`. Status: `IN PROGRESS` (merge verified; live verification pending).
2. **P1 — Reconcile the single guide-page desktop burger test observation:** compare the 95/96 test result and inspected page CSS with the user's earlier evidence of the completed sitewide header fix. Do not make another code change or repeat the full header audit until the discrepancy is established. Status: `BLOCKED` pending evidence reconciliation.
3. **P1 — Complete skipped technical QA:** run responsive tests after the fix, then run the SEO metadata and internal-link regression checks that were skipped. Status: `BLOCKED` by the responsive regression.
4. **P2 — Complete technical SEO review:** only after the above checks, review remaining canonical/metadata/schema/internal-link and crawlability coverage. Avoid repeating the already-recorded smoke checks unless needed for post-change verification.
5. **P2 — Review current Search Console data:** use a current export or authorized connected data. Separate historical indexing checks from current indexing/performance.
6. **P3 — Complete content quality and AdSense readiness review:** use a defined checklist and record page-level findings.

## 6. New issue workflow

For every new issue:

1. Identify the exact route, device/viewport, and expected behavior.
2. Reproduce it and capture evidence.
3. Identify the root cause before changing code.
4. Add it as a task under the relevant existing phase.
5. Make the smallest safe change on a branch.
6. Run targeted tests plus relevant regression tests.
7. Provide a preview for review.
8. Obtain explicit user approval before production publishing.
9. Publish using the verified production mechanism only.
10. Verify the live result and update this file.

A side issue does not reset or rename the active phase.

## 7. Audit no-repeat register

| Audit / check | Last recorded result | Repeat only when |
|---|---|---|
| Apex HTTPS and www redirects | Passed in workflow run 43313733225 | DNS/SSL/redirect config changes, regression, or production verification needed |
| Legacy .html redirect and query preservation | Passed in workflow run 43313733225 | Redirect rules change or a related regression appears |
| Canonical tool-page HTTP response | One pilot-hole calculator route returned 200 | That route or routing/deployment changes; broader crawl is a separate audit |
| robots.txt and sitemap.xml HTTP response | Both returned 200 | Files, hosting, routing, or indexing configuration changes |
| Sitemap inventory | Source snapshot: 31 URLs; 20 catalog tool pages included | Sitemap/catalog changes; use current source before making claims |
| Sitewide header audit (20 tool pages) | Historical audit/fixes recorded 2026-09-22; later navigation centralization committed | Do not repeat the full audit. Revisit only for a specific new regression or changed code |
| Responsive browser regression suite | 95/96; one desktop burger visibility failure reported on guide page in a later run; conflicts with user's evidence of prior sitewide fix and needs reconciliation | Re-run only the affected route/test after reconciling evidence or making a targeted change |
| SEO metadata and internal-link regression tests | Not run; blocked by earlier responsive failure | Run after responsive suite passes |
| Search Console indexing/performance | No current dataset recorded here | Review when fresh GSC data is available; do not pretend prior checks are current |

## 8. Completion and reporting

- Do not report a project-wide percentage until a fixed, agreed task checklist and denominator exist.
- If a percentage is later approved, use: verified completed tasks / total agreed tasks × 100.
- Any change to the denominator must be documented with the reason; never silently recalculate against a different scope.
- Report the active phase, active task, status, evidence, blocker, and next action.
- Keep completed history. Do not erase or re-label previous work to make progress appear larger.

## 9. Session handoff template

At the start of a work session, read this file and report:

- Current active phase and task
- Last verified milestone
- Open blockers
- Work already completed that must not be repeated
- The next concrete action

Then continue from the active task unless the user explicitly changes priority.
