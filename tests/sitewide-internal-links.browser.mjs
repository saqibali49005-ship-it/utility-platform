import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
const origin = 'https://zemtools.com';
const failures = [];
const checkedTargets = new Set();
const sitemapRoutes = [];

try {
  const sitemapResponse = await page.request.get(origin + '/sitemap.xml');
  assert.equal(sitemapResponse.status(), 200, 'Production sitemap should return HTTP 200');
  const xml = await sitemapResponse.text();
  sitemapRoutes.push(...xml.split('<loc>').slice(1)
    .map(part => part.split('</loc>')[0].trim())
    .filter(url => url.startsWith(origin + '/')));
  assert.equal(sitemapRoutes.length, 31, 'Expected 31 sitemap URLs');

  for (const canonicalUrl of sitemapRoutes) {
    try {
      const response = await page.goto(canonicalUrl, { waitUntil: 'domcontentloaded' });
      assert.equal(response?.status(), 200, 'Route should return HTTP 200');
      const footerLinks = await page.locator('footer a[href]').evaluateAll(nodes =>
        nodes.map(node => {
          const url = new URL(node.href, document.baseURI);
          return url.origin === location.origin ? url.pathname.replace(/\/$/, '') + '/' : '';
        }).filter(Boolean)
      );
      for (const expected of ['/about/', '/contact/', '/privacy/', '/terms/']) {
        assert.ok(footerLinks.includes(expected), 'Footer missing ' + expected);
      }

      const hrefs = await page.locator('a[href]').evaluateAll(nodes =>
        nodes.map(node => node.getAttribute('href')).filter(Boolean)
      );
      for (const href of hrefs) {
        if (/^(mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith('#')) continue;
        let target;
        try { target = new URL(href, origin + '/'); } catch { continue; }
        if (target.origin !== origin) continue;
        target.hash = '';
        checkedTargets.add(target.toString());
      }
    } catch (error) {
      failures.push({ source: canonicalUrl, target: '(page/footer)', error: error.message });
      console.error('FAIL page/footer', canonicalUrl, error.message);
    }
  }

  for (const target of checkedTargets) {
    try {
      const response = await page.request.get(target, { timeout: 15000, maxRedirects: 5 });
      assert.ok(response.status() >= 200 && response.status() < 400,
        'Internal target returned HTTP ' + response.status());
      const finalUrl = response.url();
      assert.ok(finalUrl.startsWith(origin + '/'), 'Unexpected final host: ' + finalUrl);
    } catch (error) {
      failures.push({ source: '(internal link inventory)', target, error: error.message });
      console.error('FAIL link', target, error.message);
    }
  }
} finally {
  await browser.close();
}

console.log('Live sitewide internal links and footer consistency: ' +
  (31 - failures.filter(x => x.target === '(page/footer)').length) + '/31 pages checked; ' +
  checkedTargets.size + ' unique internal targets checked; ' + failures.length + ' failures');
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
