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
    const result = await page.locator('#result').innerText();
    assert.match(result, /Total staples\\s+44/);
    assert.match(result, /Packages\\s+1 × 100 staples/);
    assert.match(result, /40 base \\+ 0 edge \\+ 0 seam = 40 before 10% extra allowance/);
    assert.match(await page.locator('body').innerText(), /Sod Staple Calculator Example/);
  });

  await check('Metric conversion preserves the same staple estimate', async () => {
    await fresh();
    const imperial = await page.locator('#result').innerText();
    await page.locator('#units').selectOption('metric');
    const metric = await page.locator('#result').innerText();
    assert.match(metric, /Total staples\\s+44/);
    assert.match(metric, /40 base \\+ 0 edge \\+ 0 seam = 40 before 10% extra allowance/);
    await page.locator('#units').selectOption('imperial');
    assert.match(await page.locator('#result').innerText(), /Total staples\\s+44/);
    assert.match(imperial, /Total staples\\s+44/);
  });

  await check('Edge and seam allowances are added before extra percentage and packages', async () => {
    await fresh();
    await page.locator('#edgeLength').fill('10');
    await page.locator('#seamLength').fill('10');
    await calculate();
    const result = await page.locator('#result').innerText();
    assert.match(result, /Total staples\\s+66/);
    assert.match(result, /40 base \\+ 10 edge \\+ 10 seam = 60 before 10% extra allowance/);
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
