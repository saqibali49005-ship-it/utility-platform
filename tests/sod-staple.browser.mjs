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
async function calculate() {
  await page.locator('#sodForm').evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}
async function fresh() {
  await page.goto('http://127.0.0.1:4173/sod-staple-calculator/', { waitUntil: 'domcontentloaded' });
  await page.locator('#sodForm').waitFor();
}

try {
  await fresh();
  await check('Page loads with canonical URL and default staple estimate', async () => {
    assert.match(await page.title(), /Sod Staple Calculator/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/sod-staple-calculator/');
    assert.match(await page.locator('#result').innerText(), /Your sod staple estimate/);
  });

  await check('Negative edge length is rejected', async () => {
    await fresh();
    await page.locator('#edgeLength').fill('-2');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /edge and seam lengths cannot be negative/i);
  });

  await check('Negative seam length is rejected', async () => {
    await fresh();
    await page.locator('#seamLength').fill('-2');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /edge and seam lengths cannot be negative/i);
  });

  await check('Extra allowance above 100 percent is rejected instead of clamped', async () => {
    await fresh();
    await page.locator('#extra').fill('101');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /between 0% and 100%/i);
  });

  await check('Fractional package quantity is rejected instead of rounded down', async () => {
    await fresh();
    await page.locator('#packSize').fill('100.5');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /whole number of at least 1/i);
  });
} finally {
  await browser.close();
}
console.log('Sod staple browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
