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
async function calculate() { await page.locator('#calculate').click(); }
async function fresh() {
  await page.goto('http://127.0.0.1:4173/paint-calculator/', { waitUntil: 'domcontentloaded' });
  await page.locator('#calculate').waitFor();
}

try {
  await fresh();
  await check('Page loads with canonical URL and room input', async () => {
    assert.match(await page.title(), /Paint Calculator/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/paint-calculator/');
    assert.equal(await page.locator('.room-card').count(), 1);
  });

  await check('Default room estimate matches the wall, ceiling, openings, coats and overage formula', async () => {
    await fresh();
    await calculate();
    assert.equal(await page.locator('#coveredArea').innerText(), '428 sq ft');
    assert.equal(await page.locator('#coatedArea').innerText(), '856 sq ft');
    assert.equal(await page.locator('#paintResult').innerText(), '2.40 gal · 9.1 L');
  });

  await check('Fractional door count is rejected', async () => {
    await fresh();
    await page.locator('.room-card [data-r="doors"]').fill('1.5');
    await calculate();
    assert.match(await page.locator('#resultSub').innerText(), /door and window counts must be whole numbers/i);
    assert.equal(await page.locator('#paintResult').innerText(), '—');
  });

  await check('Negative window area is rejected', async () => {
    await fresh();
    await page.locator('.room-card [data-r="windowArea"]').fill('-12');
    await calculate();
    assert.match(await page.locator('#resultSub').innerText(), /areas cannot be negative/i);
  });

  await check('Opening area larger than wall surface is rejected', async () => {
    await fresh();
    await page.locator('.room-card [data-r="doors"]').fill('20');
    await calculate();
    assert.match(await page.locator('#resultSub').innerText(), /openings cannot exceed the room wall area/i);
  });

  await check('Fractional coats are rejected rather than silently accepted', async () => {
    await fresh();
    await page.locator('#coats').fill('2.5');
    await calculate();
    assert.match(await page.locator('#resultSub').innerText(), /whole number between 1 and 10/i);
  });

  await check('Waste above 50 percent is rejected rather than clamped', async () => {
    await fresh();
    await page.locator('#waste').fill('51');
    await calculate();
    assert.match(await page.locator('#resultSub').innerText(), /between 0% and 50%/i);
  });

  await check('Equivalent metric dimensions and coverage produce the same paint volume', async () => {
    await fresh();
    await page.locator('#units').selectOption('metric');
    const room=page.locator('.room-card').first();
    await room.locator('[data-r="length"]').fill('3.6576');
    await room.locator('[data-r="width"]').fill('3.048');
    await room.locator('[data-r="height"]').fill('2.4384');
    await room.locator('[data-r="doorArea"]').fill('1.85806');
    await room.locator('[data-r="windowArea"]').fill('1.11484');
    await page.locator('#coverage').fill('9.2');
    await page.locator('#coverageUnit').selectOption('sqm');
    await calculate();
    assert.equal(await page.locator('#coveredArea').innerText(), '39.8 m²');
    assert.equal(await page.locator('#paintLitres').innerText(), '9.1 L');
  });
} finally {
  await browser.close();
}
console.log('Paint calculator browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
