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
async function fill(selector, value) { await page.locator(selector).fill(String(value)); }
async function calculate() { await page.locator('#calculate').click(); }
async function resultText() { return (await page.locator('#result').innerText()).replace(/\s+/g, ' '); }
async function errorText() { return (await page.locator('#error').innerText()).trim(); }
async function reset() { await page.locator('#reset').click(); await page.waitForTimeout(50); }

try {
  await page.goto('http://127.0.0.1:4173/fence-calculator/', { waitUntil: 'domcontentloaded' });
  await check('Page loads with canonical URL and calculator heading', async () => {
    assert.match(await page.title(), /Fence Material Calculator/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/fence-calculator/');
    await page.getByRole('heading', { name: 'Build Your Fence Plan' }).waitFor();
  });

  await check('Default 100 ft run calculates expected posts and sections', async () => {
    await reset(); await calculate();
    const text = await resultText();
    assert.match(text, /total posts\s+14/i);
    assert.match(text, /13 post-spacing sections/);
  });

  await check('Separate short runs round materials independently', async () => {
    await reset(); await fill('#run1', 4); await page.locator('#addRun').click(); await fill('#run2', 4); await calculate();
    const text = await resultText();
    assert.match(text, /total fence runs\s+8/i);
    assert.match(text, /total posts\s+4/i);
  });

  await check('Shared corner reduces one physical line post', async () => {
    await fill('#sharedCorners', 1); await calculate();
    assert.match(await resultText(), /total posts\s+3/i);
  });

  await check('Fractional shared-corner value is rejected', async () => {
    await fill('#sharedCorners', 1.5); await calculate();
    assert.match(await errorText(), /whole number of shared corners/i);
  });

  await check('Negative run length is rejected', async () => {
    await reset(); await fill('#run1', -1); await calculate();
    assert.match(await errorText(), /cannot be negative/i);
  });

  await check('Fractional gate count is rejected', async () => {
    await reset(); await fill('#gates', 1.5); await calculate();
    assert.match(await errorText(), /whole number of gates/i);
  });

  await check('Gate opening equal to or greater than total run is rejected', async () => {
    await reset(); await fill('#gates', 1); await fill('#gateWidth', 100); await calculate();
    assert.match(await errorText(), /must be shorter than the total fence run/i);
    await fill('#gateWidth', 101); await calculate();
    assert.match(await errorText(), /must be shorter than the total fence run/i);
  });

  await check('Panel mode calculates panels per run', async () => {
    await reset(); await fill('#run1', 4); await page.locator('#addRun').click(); await fill('#run2', 4);
    await page.locator('#style').selectOption('panel'); await fill('#panelWidth', 8); await calculate();
    assert.match(await resultText(), /panels\s+3/i);
  });

  await check('Picket mode calculates boards per run', async () => {
    await reset(); await fill('#run1', 4); await page.locator('#addRun').click(); await fill('#run2', 4);
    await page.locator('#style').selectOption('picket'); await fill('#picketWidth', 3.5); await fill('#picketGap', 1.5); await calculate();
    assert.match(await resultText(), /pickets \/ boards\s+22/i);
  });

  await check('Imperial to metric and back preserves run length and preset labels', async () => {
    await reset(); await fill('#run1', 100);
    await page.locator('#units').selectOption('metric');
    assert.equal(await page.locator('#run1').inputValue(), '30.48');
    assert.equal(await page.locator('.preset[data-target="postSpacing"]').first().innerText(), '1.8 m');
    await page.locator('#units').selectOption('imperial');
    assert.equal(await page.locator('#run1').inputValue(), '100');
    assert.equal(await page.locator('.preset[data-target="postSpacing"]').first().innerText(), '6 ft');
  });

  await check('Reset restores one imperial 100 ft run from metric mode', async () => {
    await page.locator('#units').selectOption('metric'); await page.locator('#reset').click();
    assert.equal(await page.locator('#units').inputValue(), 'imperial');
    assert.equal(await page.locator('#run1').inputValue(), '100');
    assert.equal(await page.locator('input[data-run]').count(), 1);
    assert.match(await resultText(), /total posts\s+14/i);
  });

  await check('Square post-hole diagonal fit is enforced', async () => {
    await reset(); await fill('#holeDiameter', 4); await fill('#postWidth', 3.5); await page.locator('#postShape').selectOption('square'); await calculate();
    assert.match(await errorText(), /diagonal of the square post/i);
  });

  await check('Round post fit accepts diameter-sized hole', async () => {
    await page.locator('#postShape').selectOption('round'); await fill('#holeDiameter', 4); await fill('#postWidth', 3.5); await calculate();
    assert.equal(await errorText(), '');
    assert.match(await resultText(), /Project material estimate/);
  });

  await check('Negative gravel base is rejected', async () => {
    await fill('#gravelBase', -1); await calculate();
    assert.match(await errorText(), /cannot be negative/i);
  });

  await check('Concrete estimates render with and without gravel base', async () => {
    await reset(); await fill('#gravelBase', 0); await calculate();
    const without = await resultText();
    assert.match(without, /concrete bags\s+[1-9]/i);
    await fill('#gravelBase', 3); await calculate();
    const withBase = await resultText();
    assert.match(withBase, /concrete bags\s+[1-9]/i);
  });

  await check('Copy summary writes the calculated estimate to clipboard', async () => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('#copyResult').click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    assert.match(copied, /Fence material estimate/);
    assert.match(copied, /Posts: 14/);
  });

  await check('Mobile viewport has no horizontal page overflow', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(dimensions.scroll <= dimensions.width + 1, JSON.stringify(dimensions));
    await page.locator('#calculate').isVisible();
  });

  await check('Desktop viewport has no horizontal page overflow', async () => {
    await page.setViewportSize({ width: 1365, height: 900 });
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(dimensions.scroll <= dimensions.width + 1, JSON.stringify(dimensions));
  });
} finally {
  await browser.close();
}

console.log(`Browser checks: ${passed} passed, ${failures.length} failed`);
if (failures.length) process.exitCode = 1;
