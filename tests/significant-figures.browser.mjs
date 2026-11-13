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
async function calculateAddition(expression) {
  await page.locator('[data-mode="add"]').click();
  await page.locator('#addInput').fill(expression);
  await page.locator('#calculateBtn').click();
}

try {
  await page.goto('http://127.0.0.1:4173/calculator/', { waitUntil: 'domcontentloaded' });
  await check('Calculation engine is loaded separately from the page adapter', async () => {
    assert.equal(await page.evaluate(() => typeof window.ZemToolsSignificantFiguresEngine.calculate), 'function');
  });

  await check('Page loads with significant-figures calculator', async () => {
    assert.match(await page.title(), /Significant Figures Calculator/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/calculator/');
  });

  await check('Ordinary decimal addition rounds to least precise decimal place', async () => {
    await calculateAddition('12.11 + 18.0');
    assert.equal(await page.locator('#resultValue').innerText(), '30.1');
    assert.equal(await page.locator('#sigCount').innerText(), '3');
  });

  await check('Scientific-notation addition rounds to the correct place value', async () => {
    await calculateAddition('1.2e3 + 1.2e3');
    assert.equal(await page.locator('#resultValue').innerText(), '2.4e+3');
    assert.equal(await page.locator('#resultSub').innerText(), 'rounded to nearest 100');
    assert.equal(await page.locator('#sigCount').innerText(), '2');
  });

  await check('Mixed-scale addition respects the coarsest operand precision', async () => {
    await calculateAddition('1.2e3 + 12');
    assert.equal(await page.locator('#resultValue').innerText(), '1.2e+3');
    assert.equal(await page.locator('#sigCount').innerText(), '2');
  });

  await check('Negative scientific-notation subtraction rounds symmetrically', async () => {
    await calculateAddition('1.2e3 - 1.3e3');
    assert.equal(await page.locator('#resultValue').innerText(), '-1e+2');
    assert.equal(await page.locator('#sigCount').innerText(), '1');
  });

  await check('Multiplication displays trailing zeros to make precision explicit', async () => {
    await page.locator('[data-mode="multiply"]').click();
    await page.locator('#multiplyInput').fill('2.50 × 4.0');
    await page.locator('#calculateBtn').click();
    assert.equal(await page.locator('#resultValue').innerText(), '1.0e+1');
    assert.equal(await page.locator('#sigCount').innerText(), '2');
  });

  await check('Rounding retains requested trailing significant zeros', async () => {
    await page.locator('[data-mode="round"]').click();
    await page.locator('#numberInput').fill('9.996');
    await page.locator('#targetInput').fill('3');
    await page.locator('#calculateBtn').click();
    assert.equal(await page.locator('#resultValue').innerText(), '1.00e+1');
    assert.equal(await page.locator('#sigCount').innerText(), '3');
  });

  await check('Very small scientific-notation values can be rounded without toFixed range errors', async () => {
    await page.locator('#numberInput').fill('1e-200');
    await page.locator('#targetInput').fill('2');
    await page.locator('#calculateBtn').click();
    assert.equal(await page.locator('#resultValue').innerText(), '1.0e-200');
    assert.equal(await page.locator('#sigCount').innerText(), '2');
  });

  await check('Counting significant figures respects trailing decimal zeros', async () => {
    await page.locator('[data-mode="count"]').click();
    await page.locator('#numberInput').fill('0.004560');
    await page.locator('#calculateBtn').click();
    assert.equal(await page.locator('#resultValue').innerText(), '4');
  });
} finally {
  await browser.close();
}
console.log('Significant-figures browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
