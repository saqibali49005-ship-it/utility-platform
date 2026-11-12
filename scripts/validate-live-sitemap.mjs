import assert from 'node:assert/strict';

const timeoutMs = 15000;
const fetchPage = async url => fetch(url, {
  redirect: 'manual',
  signal: AbortSignal.timeout(timeoutMs),
  headers: { 'user-agent': 'ZemTools-Final-Audit/1.0' }
});

const attrs = tag => Object.fromEntries(
  [...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)]
    .map(match => [match[1].toLowerCase(), match[2]])
);

const sitemapUrl = 'https://zemtools.com/sitemap.xml';
const sitemapResponse = await fetchPage(sitemapUrl);
assert.equal(sitemapResponse.status, 200, 'Production sitemap must return HTTP 200');
const sitemapText = await sitemapResponse.text();
const urls = [...sitemapText.matchAll(/<loc>\s*(https:\/\/zemtools\.com\/[^<]+?)\s*<\/loc>/gi)]
  .map(match => match[1].trim());
assert.equal(urls.length, 31, 'Production sitemap must contain exactly 31 public routes');
assert.equal(new Set(urls).size, 31, 'Production sitemap must not contain duplicate URLs');

const failures = [];
let passed = 0;

for (let offset = 0; offset < urls.length; offset += 5) {
  const batch = urls.slice(offset, offset + 5);
  const results = await Promise.all(batch.map(async url => {
    try {
      const response = await fetchPage(url);
      assert.equal(response.status, 200, 'Expected HTTP 200, received ' + response.status);
      assert.equal(response.url, url, 'Sitemap URL should resolve directly without another redirect');
      const html = await response.text();
      const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
      const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => attrs(match[0]));
      const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => attrs(match[0]));
      const description = metaTags.find(meta => meta.name === 'description')?.content || '';
      const robots = metaTags.find(meta => meta.name === 'robots')?.content || '';
      const canonicals = links.filter(link => link.rel === 'canonical');
      assert.ok(title, 'Missing page title');
      assert.ok(description.length >= 70 && description.length <= 180,
        'Meta description length outside 70–180: ' + description.length);
      assert.match(robots, /index/i, 'Page is not explicitly indexable');
      assert.match(robots, /follow/i, 'Page does not explicitly allow following links');
      assert.equal(canonicals.length, 1, 'Expected exactly one canonical link');
      assert.equal(canonicals[0].href, url, 'Canonical does not match sitemap URL');
      assert.equal((html.match(/<h1\b/gi) || []).length, 1, 'Expected exactly one H1');
      assert.ok(/class=["'][^"']*site-header/.test(html), 'Missing shared site header');
      assert.ok(/<footer\b/i.test(html), 'Missing footer');
      const jsonLd = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
      for (const [, raw] of jsonLd) JSON.parse(raw);
      return { url, ok: true };
    } catch (error) {
      return { url, ok: false, error: error.message };
    }
  }));
  for (const result of results) {
    if (result.ok) {
      passed++;
      console.log('PASS', result.url);
    } else {
      failures.push(result);
      console.error('FAIL', result.url, result.error);
    }
  }
}

console.log('Production sitemap-wide route, canonical and indexability checks: ' + passed + '/31 passed; ' + failures.length + ' failed');
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
