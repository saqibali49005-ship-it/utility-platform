# Related Tools Fix — 2026-09-17

The sitewide Related Tools styling was corrected without changing the approved footer styling.

## Fix
- Related Tools containers now stay full-width and block-level.
- Only the Related Tools card grid becomes a grid.
- Desktop uses two columns; mobile uses one full-width column.
- Related cards keep the icon, title, description, and arrow treatment.
- Direct related-card layouts and inline related-link layouts are supported.
- Footer CSS/layout was intentionally left unchanged in this fix.

## Commit
The fix was applied to `visual-polish.css` in the commit immediately preceding this checkpoint.

## Deployment refresh
A harmless documentation-only change was made to trigger a fresh GitHub Pages deployment after verifying the UUID page source contains the intended Time Calculator, Significant Figures Calculator, and Browse All Tools cards.
