# Fence Calculator — Quality and Calculation Review

**Date:** 11 November 2026  
**Target page:** `https://zemtools.com/fence-calculator/`  
**Scope:** Multi-run estimates, gate assumptions, metric preset labels, post-hole validation and page guidance.

## Search intent context

Historical international Search Console screenshots supplied for 7 August–7 November 2026 showed early impressions for phrases such as “wood fence material calculator”, “fence material calculator”, “fence material and post calculator”, “how to calculate fence panels” and “fence lumber calculator”. Query-level counts were small, so these are relevance signals rather than proof of stable demand or rankings.

## Changes in this branch

- Estimate rail pieces and board/panel quantities separately for each non-empty fence run, then add the run totals. This avoids treating multiple short runs as one continuous fence.
- Keep the number of gate posts as a separately displayed conservative allowance. Because exact gate positions are not collected, this can overcount where gate posts replace ordinary line posts.
- Distribute total gate opening width proportionally across runs when estimating covered material. This preserves total covered length, but is only an approximation and does not model the real position of each opening.
- Update post-spacing preset labels when switching between imperial and metric units.
- Use explicit element lookup for the post-shape control.
- Validate whole-number gate count, rail piece length, post fit inside the selected hole and gate openings that leave no covered fence.
- Clarify supported fence types, rail-piece counts and the assumptions that affect estimates.

## Arithmetic regression cases

Assumptions for the cases below: 8 ft maximum post spacing, 8 ft rail pieces, 3 rail courses per section, 8 ft-wide panels, no waste, and the gate model described above.

| Case | Material sections | Layout posts before gate extras | Gate-post extras | Total posts | Panels |
|---|---:|---:|---:|---:|---:|
| One 100 ft run, no gates | 13 | 14 | 0 | 14 | 13 |
| Two separate 4 ft runs, no gates | 2 | 4 | 0 | 4 | 2 |
| Two connected 4 ft runs, one shared corner | 2 | 3 | 0 | 3 | 2 |
| Two 40 ft runs, one 4 ft gate opening | 10 | 11 (one shared corner) | 2 | 13 | 10 |
| Two separate 4 ft runs, panel mode | 2 | 4 | 0 | 4 | 2 |

For the two 40 ft run example, the gate opening is 5% of the 80 ft total. The proportional model allocates 2 ft of opening to each run, leaving 38 ft of covered length per run. Each run rounds to five 8 ft material sections. The calculator counts 11 layout posts after one shared-corner adjustment and adds two gate-post allowances, for 13 total. This is intentionally conservative and may overcount if gate posts coincide with ordinary line-post positions.

**Invalid edge cases:** gate opening equal to or greater than total run length must be rejected; fractional or negative gate counts must be rejected.

## Remaining limitations

- Gate positions are not captured; proportional allocation can differ from a real gate layout, especially when one short run contains most or all of an opening.
- Shared corners are user-entered; the calculator cannot validate the physical geometry.
- Post takeoff and concrete remain planning estimates. Confirm footing dimensions, post embedment, material specifications, local requirements and supplier information before purchasing or building.
- The tool does not calculate gate hardware or exact gate-frame material.
- Chain-link and metal fence systems are outside the supported model.

## Validation status

The Foundation Check is expected to validate the current ZemTools site structure. It does not test calculator arithmetic or browser interactions. Manual browser checks are still required for:
- one and multiple runs, including a shared corner;
- gate count and width, including equal-to/exceeding total run length;
- panel and picket modes;
- imperial → metric → imperial round-trip and visible preset labels;
- square and round post-hole fit checks;
- concrete volume with and without gravel base;
- result rendering, reset and clipboard behavior;
- mobile and desktop layout.

Do not treat a successful Foundation Check as a substitute for these browser tests.
