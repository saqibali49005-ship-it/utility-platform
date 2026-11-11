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
  await page.locator('#blockForm').evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}
async function fresh() {
  await page.goto('http://127.0.0.1:4173/deck-joist-blocking-calculator/', { waitUntil: 'domcontentloaded' });
  await page.locator('#blockForm').waitFor();
  await calculate();
}

try {
  await fresh();
  await check('Page loads with canonical URL and default blocking estimate', async () => {
    assert.match(await page.title(), /Deck Joist Blocking Calculator/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/deck-joist-blocking-calculator/');
    assert.match(await page.locator('#result').innerText(), /12/);
  });

  await check('Fractional joist count is rejected rather than rounded down', async () => {
    await fresh();
    await page.locator('#joistCount').fill('12.5');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /whole number of at least 2 joists/i);
  });

  await check('Fractional blocking-row count is rejected', async () => {
    await fresh();
    await page.locator('#blockingRows').fill('1.5');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /whole number of at least 1 blocking row/i);
  });

  await check('Fractional extra-block quantity is rejected', async () => {
    await fresh();
    await page.locator('#extraBlocks').fill('2.5');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /extra blocking pieces must be a whole number/i);
  });

  await check('Fractional fastener count is rejected', async () => {
    await fresh();
    await page.locator('#fastenersPerBlock').fill('1.5');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /fasteners per blocking piece must be a whole number/i);
  });

  await check('Waste above 50 percent is rejected instead of clamped', async () => {
    await fresh();
    await page.locator('#waste').fill('51');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /between 0% and 50%/i);
  });

  await check('Negative optional joist run length is rejected', async () => {
    await fresh();
    await page.locator('#joistRun').fill('-10');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /positive joist run length/i);
  });

  await check('Negative optional stock price is rejected', async () => {
    await fresh();
    await page.locator('#stockPrice').fill('-1');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /non-negative stock board price/i);
  });
} finally {
  await browser.close();
}
console.log('Deck joist blocking browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
