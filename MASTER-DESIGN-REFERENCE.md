# Utility Platform — Master Design Reference

## Canonical reference page

Use this live page as the visual and structural reference for all future tool pages:

https://zemtools.com/time-calculator/

Source file: `time-calculator.html`

## Rule

New tool pages must match the reference page's shared site chrome and overall UI system rather than introducing a separate header, footer, navigation style, typography system, color system, spacing system, or mobile behavior.

## Shared elements to keep consistent

- Header and Utility Platform brand treatment
- Primary navigation labels, typography, spacing, and alignment
- Page/container width and horizontal alignment
- Breadcrumb treatment
- H1 and lead/intro typography and alignment
- Card/panel treatment, borders, radii, and spacing
- Form controls, labels, inputs, selects, and buttons
- Result/output presentation
- Related-tools presentation
- Footer structure, alignment, links, and spacing
- Responsive/mobile behavior

## Implementation rule

Prefer shared CSS and reusable structure. Do not solve a shared visual problem by adding unrelated per-page overrides unless the page genuinely needs tool-specific behavior.

Tool-specific code should contain the calculator's content and calculation logic; shared visual behavior belongs in the common design system.

## Safety rule

When standardizing visual styling, do not change calculator equations, JavaScript behavior, SEO content, URLs, or tool functionality unless the task explicitly asks for it.

Last updated: 2026-09-17
