# ZemTools SEO Redirect & Canonical Audit
Date: 2026-11-09
Scope: Read-only review of the current `main` branch and Search Console screenshots supplied by the site owner.

## Safety status
- This report is on branch `seo-redirect-canonical-audit`.
- No production files were modified.
- No deployment or merge was performed.

## Verified repository findings
1. The homepage canonical is `https://zemtools.com/`.
2. The Gravel Calculator page source at `gravel-calculator/index.html` declares `https://zemtools.com/gravel-calculator/`.
3. The checked canonical tags for Pilot Hole, Time, Business Hours, Privacy, Significant Figures, About, and Aspect Ratio pages point to their current `https://zemtools.com/<slug>/` URLs.
4. `sitemap.xml` lists the current slash-format URLs and does not list the legacy `.html` URLs shown in the supplied GSC 404 report.
5. Legacy root-level `.html` files (including About, Aspect Ratio, Energy & Electrical, Deck Joist Blocking, Paver Edge Restraint, and Math & Science) contain a canonical to the new URL plus meta-refresh and JavaScript navigation. These are browser-side redirects, not HTTP 301 responses.
6. The repository includes a `CNAME` file for `zemtools.com`, consistent with a GitHub Pages custom-domain deployment.

## Search Console evidence supplied by owner
- The 5 URLs in the Not found (404) report are legacy `.html` URLs last crawled on 2026-10-11.
- The owner subsequently confirmed the corresponding current slash-format pages open successfully.
- The owner also tested `about.html` in a browser and confirmed it navigates to the slash URL.
- The Gravel Calculator new URL is indexed; GSC's older report showed an old GitHub Pages canonical as the user-declared canonical for the legacy URL. Current repository source for the new page has the correct ZemTools canonical.

## Important limitation: HTTP 301
GitHub Pages does not provide configurable per-path server-side 301 rules for arbitrary paths in a static branch deployment. HTML meta-refresh/JavaScript cannot be upgraded to a true HTTP 301 by editing the page source alone.
Do not add Netlify-style `_redirects`, Apache `.htaccess`, or Cloudflare configuration files to this GitHub Pages repository and assume they will work; GitHub Pages will not interpret them as redirect rules.

A true 301 for old `.html` paths requires an edge/hosting layer that supports redirects (for example, a configured Cloudflare proxy/Bulk Redirect rule) or moving to a host with native redirect rules. Before doing this, confirm the domain's DNS/proxy arrangement and test on a small set. Do not change DNS or nameservers as part of this branch.

## Recommended next steps
1. Keep the current legacy HTML fallback pages in place for now; do not delete them.
2. Verify the actual response status and final URL for representative legacy paths using an HTTP header checker (or `curl -I -L` from a terminal). Browser navigation alone does not prove a 301.
3. Check the domain DNS/proxy provider before selecting an edge redirect solution. GitHub repository access alone cannot establish whether Cloudflare or another proxy is active.
4. If an edge redirect service is available, configure exact old-path to new-path 301 mappings and test one route before expanding to all legacy routes.
5. Re-run URL Inspection for the new canonical page and wait for Google to recrawl the old URLs. The supplied 404 report's last-crawled date predates the later legacy URL files/redirect stubs, so it may be stale.
6. Keep sitemap and internal links pointing only to current slash-format URLs.

## Do not do
- Do not remove legacy `.html` files.
- Do not alter canonical tags that already point to the current ZemTools URLs.
- Do not submit old `.html` URLs in the sitemap.
- Do not merge this branch or change DNS until the redirect hosting layer is confirmed.
