import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
const failures = [];
const titles = new Map();
let passed = 0;

try {
  const sitemapResponse = await page.request.get('http://127.0.0.1:4173/sitemap.xml');
  assert.equal(sitemapResponse.status(), 200, 'Local sitemap must return HTTP 200');
  const sitemapText = await sitemapResponse.text();
  const routes = [...sitemapText.matchAll(/<loc>\s*(https:\/\/zemtools\.com\/[^<]+?)\s*<\/loc>/gi)].map(match => match[1].trim());
  assert.equal(routes.length, 31, 'The locked public sitemap inventory must contain 31 URLs');

  for (const canonicalUrl of routes) {
    const route = new URL(canonicalUrl).pathname;
    try {
      const response = await page.goto('http://127.0.0.1:4173' + route, { waitUntil: 'domcontentloaded' });
      assert.equal(response?.status(), 200, 'Expected HTTP 200');
      const data = await page.evaluate(() => {
        const one = selector => document.querySelector(selector)?.getAttribute('content') || '';
        const all = selector => [...document.querySelectorAll(selector)];
        const canonical = all('link[rel="canonical"]');
        const jsonLd = all('script[type="application/ld+json"]').map(node => node.textContent || '');
        return {
          title: document.title.trim(),
          description: one('meta[name="description"]'),
          robots: one('meta[name="robots"]'),
          canonicalCount: canonical.length,
          canonical: canonical[0]?.href || '',
          h1Count: document.querySelectorAll('h1').length,
          header: Boolean(document.querySelector('.site-header')),
          footer: Boolean(document.querySelector('footer')),
          ogTitle: one('meta[property="og:title"]'),
          ogDescription: one('meta[property="og:description"]'),
          ogImage: one('meta[property="og:image"]'),
          twitterCard: one('meta[name="twitter:card"]'),
          twitterTitle: one('meta[name="twitter:title"]'),
          twitterDescription: one('meta[name="twitter:description"]'),
          twitterImage: one('meta[name="twitter:image"]'),
          jsonLd
        };
      });

      assert.ok(data.title, 'Missing title');
      assert.ok(data.description.length >= 70 && data.description.length <= 180,
        'Meta description should be 70–180 characters; got ' + data.description.length);
      assert.match(data.robots, /index/i, 'Expected index directive');
      assert.match(data.robots, /follow/i, 'Expected follow directive');
      assert.equal(data.canonicalCount, 1, 'Expected exactly one canonical');
      assert.equal(data.canonical, canonicalUrl, 'Canonical must match sitemap URL');
      assert.equal(data.h1Count, 1, 'Expected exactly one H1');
      assert.ok(data.header, 'Missing shared site header');
      assert.ok(data.footer, 'Missing footer');
      assert.ok(data.ogTitle, 'Missing Open Graph title');
      assert.ok(data.ogDescription, 'Missing Open Graph description');
      assert.ok(data.ogImage, 'Missing Open Graph image');
      assert.ok(data.twitterCard, 'Missing Twitter card type');
      assert.ok(data.twitterTitle, 'Missing Twitter title');
      assert.ok(data.twitterDescription, 'Missing Twitter description');
      assert.ok(data.twitterImage, 'Missing Twitter image');
      for (const json of data.jsonLd) JSON.parse(json);

      if (titles.has(data.title)) {
        throw new Error('Duplicate title also used by ' + titles.get(data.title));
      }
      titles.set(data.title, route);
      passed++;
      console.log('PASS', route);
    } catch (error) {
      failures.push({ route, error: error.message });
      console.error('FAIL', route, error.message);
    }
  }
} finally {
  await browser.close();
}

console.log('Sitemap-wide page metadata and structure checks: ' + passed + '/31 passed; ' + failures.length + ' failed');
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
