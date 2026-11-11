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
async function fresh() {
  await page.goto('http://127.0.0.1:4173/conduit-fill-calculator/', { waitUntil: 'domcontentloaded' });
  await page.locator('#calculateBtn').waitFor();
}
async function value(id) { return page.locator('#' + id).innerText(); }
async function limitText(expected) {
  assert.ok((await value('recommendedSub')).includes(expected), 'expected fill limit ' + expected);
}

try {
  await fresh();
  await check('Page loads with canonical URL and calculator', async () => {
    assert.match(await page.title(), /Conduit Fill Calculator/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/conduit-fill-calculator/');
    await page.getByRole('heading', { name: 'Size Your Raceway' }).waitFor();
    assert.equal(await page.locator('#tradeSize').inputValue(), '1/2"');
  });

  await check('Actual fill percentage uses total raceway area, not allowable fill area', async () => {
    await page.locator('#calculateBtn').click();
    assert.equal(await value('totalArea'), '0.0610 in²');
    assert.equal(await value('fillPct'), '20.1%');
    assert.equal(await value('allowedArea'), '0.1216 in²');
    assert.equal(await value('remaining'), '0.0606 in²');
    await limitText('40% fill limit');
    assert.match(await page.locator('#comparison thead').innerText(), /Actual fill[\s\S]*Limit/i);
  });

  await check('Single-conductor rule applies 53 percent', async () => {
    await fresh();
    await page.locator('.conductor-row').nth(1).locator('.remove-row').click();
    await page.locator('.wire-qty').first().fill('1');
    await page.locator('#calculateBtn').click();
    await limitText('53% fill limit');
    assert.match(await value('status'), /PASS/);
    assert.equal(await value('fillPct'), '4.4%');
  });

  await check('Two-conductor rule applies 31 percent', async () => {
    await fresh();
    await page.locator('.conductor-row').nth(1).locator('.remove-row').click();
    await page.locator('.wire-qty').first().fill('2');
    await page.locator('#calculateBtn').click();
    await limitText('31% fill limit');
    assert.equal(await value('fillPct'), '8.8%');
    assert.match(await value('status'), /PASS/);
  });

  await check('Three-or-more conductor rule applies 40 percent', async () => {
    await fresh();
    await page.locator('#calculateBtn').click();
    await limitText('40% fill limit');
    assert.match(await value('status'), /PASS/);
  });

  await check('Qualifying nipple option applies 60 percent limit', async () => {
    await fresh();
    await page.locator('#nipple').check();
    await page.locator('#calculateBtn').click();
    await limitText('60% fill limit');
    assert.match(await value('status'), /PASS/);
  });

  await check('Conductor reference areas match listed Table 5 and stranded bare values', async () => {
    await fresh();
    await page.locator('.conductor-row').nth(1).locator('.remove-row').click();
    const row = page.locator('.conductor-row').first();
    await row.locator('.wire-qty').fill('1');
    await row.locator('.wire-ins').selectOption({ label: 'XHHW-2' });
    assert.equal(await row.locator('.row-area').innerText(), '0.0181 in²');
    await row.locator('.wire-ins').selectOption({ label: 'TW/THW/THHW/THW-2' });
    assert.equal(await row.locator('.row-area').innerText(), '0.0181 in²');
    await row.locator('.wire-ins').selectOption({ label: 'Bare (stranded)' });
    assert.equal(await row.locator('.row-area').innerText(), '0.0060 in²');
    await page.locator('#calculateBtn').click();
    assert.equal(await value('totalArea'), '0.0060 in²');
  });

  await check('Minimum-size mode finds the first passing trade size', async () => {
    await fresh();
    await page.locator('.wire-qty').first().fill('30');
    await page.locator('.wire-qty').nth(1).fill('1');
    await page.locator('[data-mode="minimum"]').click();
    assert.equal(await value('recommended'), '1-1/4"');
    assert.match(await value('status'), /PASS/);
  });

  await check('Minimum-size mode reports no listed size when all sizes fail', async () => {
    await fresh();
    await page.locator('.wire-size').first().selectOption('4/0');
    await page.locator('.wire-ins').first().selectOption({ label: 'TW/THW/THHW/THW-2' });
    await page.locator('.wire-qty').first().fill('30000');
    await page.locator('[data-mode="minimum"]').click();
    assert.equal(await value('recommended'), 'No listed size');
    assert.match(await value('recommendedSub'), /Largest available: 4"/);
    assert.match(await value('status'), /NO FIT/);
    assert.ok(parseFloat((await value('fillPct')).replace('%', '')) > 40);
  });

  await check('Blank, zero, negative and fractional conductor quantities are rejected', async () => {
    for (const invalid of ['', '0', '-1', '1.5']) {
      await fresh();
      await page.locator('.wire-qty').first().fill(invalid);
      await page.locator('#calculateBtn').click();
      assert.match(await value('status'), /whole number of at least 1/i, 'quantity ' + JSON.stringify(invalid));
      assert.equal(await value('recommended'), '—');
    }
  });

  await check('Raceway change refreshes internal area and allowable capacity', async () => {
    await fresh();
    await page.locator('#raceway').selectOption('pvc80');
    await page.locator('#calculateBtn').click();
    assert.match(await value('recommendedSub'), /internal area 0\.217 in²/);
    assert.equal(await value('allowedArea'), '0.0868 in²');
    assert.equal(await value('fillPct'), '28.1%');
  });

  await check('Mobile layout has no horizontal page overflow', async () => {
    await fresh();
    await page.setViewportSize({ width: 390, height: 844 });
    const d = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(d.scroll <= d.client + 1, JSON.stringify(d));
    await page.locator('#calculateBtn').isVisible();
  });
} finally {
  await browser.close();
}
console.log(`Conduit-fill browser checks: ${passed} passed, ${failures.length} failed`);
if (failures.length) process.exitCode = 1;
