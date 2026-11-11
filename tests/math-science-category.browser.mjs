import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
const failures = [];
let passed = 0;

async function check(name, fn) {
  try { await fn(); passed++; console.log('PASS', name); }
  catch (error) { failures.push({ name, error: error.message }); console.error('FAIL', name, error.message); }
}
async function fresh(viewport = { width: 1365, height: 900 }) {
  await page.setViewportSize(viewport);
  await page.goto('http://127.0.0.1:4173/math-science/', { waitUntil: 'domcontentloaded' });
  await page.locator('main.wrap h1').waitFor();
}

try {
  await fresh();
  await check('Category page loads with canonical URL and search-focused metadata', async () => {
    assert.match(await page.title(), /Math & Science Calculators.*Time Math.*Significant Figures/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/math-science/');
    assert.match(await page.locator('meta[name="description"]').getAttribute('content'), /time math.*time differences.*significant figures/i);
    assert.equal(await page.locator('main.wrap h1').innerText(), 'Math & Science Tools');
  });

  await check('All three category cards link to their matching calculators', async () => {
    const cards = page.locator('main.wrap > .grid > .card');
    assert.equal(await cards.count(), 3);
    assert.equal(await cards.nth(0).locator('a.button').getAttribute('href'), 'calculator/');
    assert.equal(await cards.nth(1).locator('a.button').getAttribute('href'), 'time-calculator/');
    assert.equal(await cards.nth(2).locator('a.button').getAttribute('href'), 'business-hours-calculator/');
    assert.match(await cards.nth(1).innerText(), /time math.*time difference.*add and subtract/i);
  });

  await check('Category guidance distinguishes clock-time math, business hours and significant figures', async () => {
    const guide = await page.locator('#time-math-title').locator('..').innerText();
    assert.match(guide, /7 hours 45 minutes/);
    assert.match(guide, /customized weekly schedule|configured weekly schedule|configured schedule/i);
    assert.match(guide, /least precise decimal place/);
    assert.match(guide, /fewest significant figures/);
    assert.equal(await page.locator('.category-faq details').count(), 4);
  });

  await check('CollectionPage structured data lists the three calculator URLs', async () => {
    const json = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(json);
    assert.equal(data['@type'], 'CollectionPage');
    const urls = data.mainEntity.itemListElement.map(item => item.url);
    assert.deepEqual(urls, [
      'https://zemtools.com/calculator/',
      'https://zemtools.com/time-calculator/',
      'https://zemtools.com/business-hours-calculator/'
    ]);
  });

  await check('Mobile category search filters the actual listed tools', async () => {
    await fresh({ width: 390, height: 844 });
    await page.locator('#mathHeaderSearch').click();
    assert.equal(await page.locator('#mathLocalSearch').evaluate(el => el.classList.contains('is-open')), true);
    await page.locator('#mathLocalSearchInput').fill('time');
    const results = page.locator('#mathLocalSearchResults a');
    assert.equal(await results.count(), 1);
    assert.match(await page.locator('#mathLocalSearchResults').innerText(), /Time Calculator/);
    assert.doesNotMatch(await page.locator('#mathLocalSearchResults').innerText(), /Business Hours Calculator/);
    await page.locator('#mathLocalSearchInput').fill('business');
    assert.equal(await results.count(), 1);
    assert.match(await page.locator('#mathLocalSearchResults').innerText(), /Business Hours Calculator/);
    await page.locator('#mathLocalSearchInput').fill('significant');
    assert.equal(await results.count(), 1);
    assert.match(await page.locator('#mathLocalSearchResults').innerText(), /Significant Figures Calculator/);
  });

  await check('Mobile menu opens and page has no horizontal overflow', async () => {
    await page.locator('#mathHeaderMenu').click();
    assert.equal(await page.locator('#mathHeaderMenuPanel').isVisible(), true);
    const dimensions = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth
    }));
    assert.ok(dimensions.scroll <= dimensions.client + 1, `horizontal overflow: ${dimensions.scroll}px > ${dimensions.client}px`);
  });
} finally {
  await browser.close();
}
console.log('Math & Science category browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
