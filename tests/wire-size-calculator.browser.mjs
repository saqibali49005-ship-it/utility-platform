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
async function value(id) { return page.locator('#'+id).innerText(); }
async function preset(name) { await page.locator('[data-preset="'+name+'"]').click(); }
try {
  await page.goto('http://127.0.0.1:4173/wire-size-calculator/', { waitUntil: 'domcontentloaded' });

  await check('Page loads with canonical URL and calculator', async () => {
    assert.match(await page.title(), /Wire Size/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/wire-size-calculator/');
    await page.getByRole('heading', { name: 'Size Your Cable' }).waitFor();
  });

  await check('Default DC calculation selects a passing standard size', async () => {
    await page.locator('#calculateBtn').click();
    assert.equal(await value('recommended'), '16 mm²');
    assert.match(await value('status'), /Meets your voltage-drop target/i);
    assert.ok(parseFloat((await value('dropPct')).replace('%','')) <= 2);
  });

  await check('Feet input converts to metres in the calculation', async () => {
    await page.locator('#length').fill('10');
    await page.locator('#lengthUnit').selectOption('ft');
    await page.locator('#calculateBtn').click();
    const ftDrop = parseFloat((await value('dropV')).replace(' V',''));
    await page.locator('#length').fill('3.048');
    await page.locator('#lengthUnit').selectOption('m');
    await page.locator('#calculateBtn').click();
    const mDrop = parseFloat((await value('dropV')).replace(' V',''));
    assert.ok(Math.abs(ftDrop-mDrop) < 0.002, 'ft/metre conversion should preserve voltage drop');
  });

  await check('Copper and aluminium selections affect conductor sizing', async () => {
    await page.locator('#length').fill('30');
    await page.locator('#material').selectOption('cu');
    await page.locator('#calculateBtn').click();
    const copper = await value('recommended');
    await page.locator('#material').selectOption('al');
    await page.locator('#calculateBtn').click();
    const aluminium = await value('recommended');
    assert.ok(parseFloat(aluminium) >= parseFloat(copper));
  });

  await check('Single-phase preset applies circuit and voltage', async () => {
    await preset('home');
    assert.equal(await page.locator('[data-circuit="single"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#voltage').inputValue(), '230');
    assert.match(await value('recommended'), /mm²/);
  });

  await check('Three-phase power-loss formula uses 3 × I² × R × L', async () => {
    await preset('three');
    assert.equal(await page.locator('#voltage').inputValue(), '400');
    const size = parseFloat(await value('recommended'));
    // With the preset's 25 A, 40 m, 400 V, and 3% target, 2.5 mm² is the next standard size.
    assert.equal(size, 2.5);
    const expected = 3 * 25 * 25 * (0.01724 / size) * 40;
    const actual = parseFloat((await value('lossW')).replace(' W',''));
    assert.ok(Math.abs(actual-expected) < 0.02, 'expected '+expected+' W, got '+actual+' W');
  });

  await check('Three-phase watts mode calculates current using √3 × V × PF', async () => {
    await page.locator('[data-load="watts"]').click();
    await page.locator('#watts').fill('17320.508');
    await page.locator('#pf').fill('1');
    await page.locator('#calculateBtn').click();
    const current = parseFloat((await value('resultCurrent')).replace(' A',''));
    assert.ok(Math.abs(current-25) < 0.01);
  });

  await check('Oversized requirement is not falsely presented as a passing size', async () => {
    await page.locator('#voltage').fill('48');
    await page.locator('#watts').fill('100000');
    await page.locator('#length').fill('1000');
    await page.locator('#lengthUnit').selectOption('m');
    await page.locator('#target').selectOption('1');
    await page.locator('#calculateBtn').click();
    assert.equal(await value('recommended'), 'No listed size meets target');
    assert.match(await value('status'), /largest size/i);
    assert.match(await value('recommendedSub'), /Largest listed size/i);
  });

  await check('Zero and negative cable length are rejected', async () => {
    await page.locator('#length').fill('0');
    await page.locator('#calculateBtn').click();
    assert.match(await value('status'), /valid positive/i);
    await page.locator('#length').fill('-5');
    await page.locator('#calculateBtn').click();
    assert.match(await value('status'), /valid positive/i);
  });

  await check('Mobile layout has no horizontal page overflow', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    const d = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(d.scroll <= d.client + 1, JSON.stringify(d));
    await page.locator('#calculateBtn').isVisible();
  });
} finally {
  await browser.close();
}
console.log(`Wire-size browser checks: ${passed} passed, ${failures.length} failed`);
if (failures.length) process.exitCode = 1;
