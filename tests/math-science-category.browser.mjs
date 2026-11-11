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
    assert.equal(await page.title(), 'Math & Science Calculators | Time Math | ZemTools');
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/math-science/');
    assert.match(await page.locator('meta[name="description"]').getAttribute('content'), /time differences.*clock-time addition and subtraction.*significant figures/i);
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

  await check('Guide links remain normal readable text instead of collapsing into narrow tool cards', async () => {
    for (const width of [390, 689, 768]) {
      await fresh({ width, height: 900 });
      const guide = await page.locator('.category-guide > p').evaluate(el => ({
        display: getComputedStyle(el).display,
        fontSize: getComputedStyle(el).fontSize,
        links: [...el.querySelectorAll(':scope > a')].map(a => ({
          text: a.textContent.trim(),
          display: getComputedStyle(a).display,
          width: Math.round(a.getBoundingClientRect().width)
        }))
      }));
      assert.equal(guide.display, 'block', `guide paragraph must remain a paragraph at ${width}px: ${JSON.stringify(guide)}`);
      assert.ok(guide.links.every(link => link.display === 'inline'),
        `guide links must remain inline at ${width}px: ${JSON.stringify(guide.links)}`);
      const columns = await page.locator('.category-guide-grid').evaluate(el =>
        getComputedStyle(el).gridTemplateColumns.trim().split(/\\s+/).length
      );
      assert.equal(columns, 1, `guide content should stack into one column at ${width}px`);
      const dimensions = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth
      }));
      assert.ok(dimensions.scroll <= dimensions.client + 1,
        `guide causes horizontal overflow at ${width}px: ${JSON.stringify(dimensions)}`);
    }
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
    const dimensions = await page.evaluate(() => {
      const offenders = [...document.querySelectorAll('body *')].map(el => {
        const r = el.getBoundingClientRect();
        const css = getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          className: typeof el.className === 'string' ? el.className : '',
          left: Math.round(r.left * 10) / 10,
          right: Math.round(r.right * 10) / 10,
          width: Math.round(r.width * 10) / 10,
          position: css.position,
          overflowX: css.overflowX
        };
      }).filter(x => x.right > innerWidth + 1 || x.left < -1)
        .sort((a,b) => b.right - a.right)
        .slice(0,20);
      return { client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, offenders };
    });
    assert.ok(dimensions.scroll <= dimensions.client + 1,
      `horizontal overflow: ${dimensions.scroll}px > ${dimensions.client}px; offenders: ${JSON.stringify(dimensions.offenders)}`);
  });
} finally {
  await browser.close();
}
console.log('Math & Science category browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
