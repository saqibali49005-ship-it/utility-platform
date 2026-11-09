# Fence Calculator SEO & Functional Audit

**Repository:** saqibali49005-ship-it/utility-platform  
**Page:** https://zemtools.com/fence-calculator/  
**Audited source:** `fence-calculator/index.html` on `main`  
**Audit branch:** `fence-calculator-seo-audit`  
**Scope:** Read-only audit and recommendations. No production files changed.

## Search Console signals supplied by the site owner

The filtered international GSC screenshots showed the Fence Calculator around average position 8.0 with 45 page impressions in the Pages view. Related query examples included:
- “wood fence material calculator” — position 4.6
- “fence material calculator” — position 6.8
- “fence material and post calculator” — position 7.8
- “how to calculate fence panels” — position 5.0
- “fence lumber calculator” — position 3.0

These are early signals with low query-level impression counts, not proof of search volume or stable rankings.

## What is already good

- Descriptive, relevant title and meta description are present.
- Canonical points to the clean slash URL.
- WebApplication and BreadcrumbList JSON-LD are present.
- The page has a functional calculator interface, multiple-run inputs, gates, multiple fence styles, metric/imperial inputs, concrete estimate, FAQ, methodology, sources and a related-tool link.
- Page copy correctly positions the tool as a planning estimate rather than an installation specification.

## Findings to address before SEO copy expansion

### High priority — calculator logic / trust

1. **Rails are calculated from combined covered length, not per-run sections.**  
   `materialSections = ceil(coveredFt / spacingFt)` collapses separate runs into one total. For example, two separate 4 ft runs with 8 ft spacing produce one combined section, although each run has its own section. Rails can therefore be undercounted for multiple runs. Gate openings further complicate this because their locations within each run are not entered.

2. **Panel quantities are calculated from combined covered length.**  
   `ceil(coveredFt / panelWidthFt)` can undercount when separate runs each need a separately rounded-up panel count. Calculate per run (and account for gate placement) or clearly limit the model and explain its assumptions.

3. **Gate-post treatment needs a clearer model.**  
   The current result uses `Math.max(layoutPosts, gateCount * 2)`, then labels two of the resulting posts as gate-position posts. There is no gate position input, so the calculator cannot reliably distinguish gate posts from ordinary run-end/intermediate posts or determine which posts are shared. The UI and result should describe this as an approximate allowance, or the inputs should be expanded to model gate positions explicitly.

4. **Post purchase length and concrete depth are not the same concept.**  
   Post length is currently fence height + entered hole depth, even though gravel base is subtracted from concrete depth. This may be a reasonable conservative approximation, but the output should clearly explain that embedment and above-ground post height are assumptions and that gravel/base details affect the actual required post length.

5. **Metric preset labels remain imperial.**  
   The preset buttons display “6 ft” and “8 ft” even after switching to metric, although their values switch to 1.8 m and 2.4 m. Update the visible labels dynamically.

6. **Global element reference.**  
   `postShape.value` relies on a browser-created global for an element ID. Use the existing `$('postShape')` accessor for predictable behavior.

### Medium priority — search intent and page clarity

- The title already targets “Fence Material Calculator” and communicates posts, rails, pickets and concrete. Keep the primary title; do not stuff near-duplicate phrases into it.
- Strengthen the opening explanation with a concise statement that the tool estimates fence materials for wood privacy/picket and pre-made panel layouts, supports multiple straight runs and gates, and returns posts, rails, boards/panels and concrete.
- Add a short “How to calculate fence materials” section that explains the sequence and key assumptions. Avoid claiming that every layout or fence type is supported.
- Expand FAQs only where the calculator can give accurate, useful answers. Candidate questions: “How many fence panels do I need?”, “How many posts do I need for a fence?”, “How do gates affect material quantities?”, and “Does this calculator support chain-link fencing?” The last answer should continue to say no, unless the product is expanded.
- Ensure any new copy is genuinely useful and not repetitive of the existing methodology/FAQ sections.
- The current related-tools area has one relevant Pilot Hole Size Calculator link. Keep it relevant; do not add unrelated links merely to increase internal links.

## Recommended implementation order

1. Fix and test multi-run rail and panel quantity calculations, then explicitly define gate-post assumptions.
2. Correct metric preset labels and replace the implicit `postShape` global.
3. Add concise, accurate “how to calculate” guidance and refine the opening copy/FAQs to match actual supported functionality.
4. Re-test imperial and metric modes, single and multiple runs, gates, shared corners, panel mode, and concrete calculations.
5. Re-check GSC after deployment; compare clicks, impressions, CTR and query positions against the pre-change baseline.

## Test cases required before merge

- One 100 ft straight run at 8 ft spacing.
- Two separate 4 ft runs at 8 ft spacing (must not be treated as one continuous run for rail/panel section rounding).
- Two connected runs with one shared corner.
- One or more gates, including a case where gate openings approach/exceed total run length.
- Panel mode with multiple short runs.
- Imperial-to-metric-to-imperial switching, checking values and visible preset labels.
- Concrete estimate with square and round posts, and with/without gravel base.

## Deployment status

This audit branch is separate from `main`. No production page, DNS, Cloudflare setting, GitHub Pages setting, or deployment has been changed. Do not merge until the calculation model and test cases are resolved and reviewed.


## Follow-up arithmetic verification (2026-11-10)

The revised per-run arithmetic was checked against these representative cases:

| Case | Expected sections | Expected posts | Expected panels (8 ft panels) |
|---|---:|---:|---:|
| One 100 ft run, 8 ft spacing | 13 | 14 | 13 |
| Two separate 4 ft runs, 8 ft spacing | 2 | 4 | 2 |
| Two connected 4 ft runs, one shared corner | 2 | 3 | 2 |
| Two 40 ft runs, one 4 ft gate opening distributed proportionally | 10 | 11 (one shared corner) | 10 |
| Two separate 4 ft runs in panel mode | 2 | 4 | 2 |

These checks confirm the intended arithmetic for separate-run rounding and shared-corner post subtraction. They are calculation-level checks, not a live-browser or end-to-end test of the page.

## Remaining validation / known limitation

- Gate openings are proportionally distributed across all runs because the interface asks only for a gate count and common gate width, not the run and position of each gate. This is an explicit approximation; users must verify gate placement and the resulting takeoff.
- Shared-corner input is a user-supplied count; the calculator cannot validate the actual geometry of the fence layout.
- Browser interaction, visual layout, clipboard, metric conversion round-trip, and concrete volume should still be tested in a browser before merge.
- Pull request remains draft and must not be merged or deployed until those checks are completed.
