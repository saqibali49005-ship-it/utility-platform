# Utility Platform — Master Design Reference

## Status
**Phase 1 — LOCKED**

The **Gravel Calculator** is the visual reference page for the Utility Platform tool family.

Reference page: `gravel-calculator.html`
Canonical stylesheet: `master-tool-design.css`

## What is locked

The following visual decisions are the baseline and should not be changed casually while other tool pages are being aligned:

- Light neutral page background
- White content surfaces/cards
- Blue primary accent
- Dark charcoal primary text with muted gray secondary text
- Rounded cards with subtle borders and shadows
- Clean, compact utility-style header and horizontal navigation
- Breadcrumbs above the tool title
- Large, clear tool heading and short supporting description
- Consistent form fields, labels, buttons and focus states
- Consistent result/output cards
- Responsive grids for desktop, tablet and mobile
- Related Tools as a reusable component
- FAQ/information sections using the same card and typography language
- Clean footer

## Architecture rule

`master-tool-design.css` is the canonical shared visual system. Individual tool pages must not introduce competing global styles that override the master components.

Page-specific CSS is allowed only when it is genuinely required for that tool's unique UI/functionality and must be scoped to that tool's unique component/classes.

## Related Tools rule

Related Tools is a master component. Its layout, card styling, spacing, icon treatment and responsive behavior must be controlled centrally rather than separately reinvented on every tool page.

The Gravel Calculator currently serves as the reference implementation for this component.

## Functionality rule

Aligning a tool to the master design must not change its calculation logic, JavaScript behavior, URLs, SEO metadata, or user-facing functionality unless explicitly requested.

## Implementation sequence

1. Lock Gravel reference — **DONE**
2. Clean/namespace the master design system
3. Standardize Related Tools component
4. Remove conflicting legacy page styles from existing tools
5. Align each tool to the master structure
6. Verify desktop/mobile rendering
7. Verify GitHub Pages deployment

## Important

Do not solve visual conflicts by stacking more emergency override styles. Fix the underlying cascade/component ownership instead.
