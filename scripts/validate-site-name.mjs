import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('index.html', 'utf8');
const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
const websiteNodes = blocks.map(([, raw]) => JSON.parse(raw)).filter(node => node['@type'] === 'WebSite');

assert.equal(websiteNodes.length, 1, 'Homepage must contain exactly one WebSite JSON-LD node');
const website = websiteNodes[0];
assert.equal(website.name, 'ZemTools', 'WebSite.name must match the public brand');
assert.equal(website.url, 'https://zemtools.com/', 'WebSite.url must use the HTTPS canonical homepage');
assert.ok(Array.isArray(website.alternateName), 'WebSite.alternateName must be an array');
assert.ok(website.alternateName.includes('Zem Tools'), 'WebSite alternateName should include the spaced brand form');
assert.ok(website.alternateName.includes('zemtools.com'), 'WebSite alternateName should include the lowercase domain fallback');
assert.match(html, /<meta\s+property=["']og:site_name["']\s+content=["']ZemTools["']/i, 'Homepage must publish matching og:site_name');
assert.match(html, /<link\s+rel=["']canonical["']\s+href=["']https:\/\/zemtools\.com\//i, 'Homepage canonical must be the HTTPS apex URL');

console.log('Homepage site-name SEO validation passed.');
