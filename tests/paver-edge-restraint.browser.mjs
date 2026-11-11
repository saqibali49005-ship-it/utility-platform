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
  await page.locator('#edgeForm').evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}
async function fresh() {
  await page.goto('http://127.0.0.1:4173/paver-edge-restraint-calculator/', { waitUntil: 'domcontentloaded' });
  await page.locator('#edgeForm').waitFor();
}

try {
  await fresh();
  await check('Page loads with canonical URL and estimate', async () => {
    assert.match(await page.title(), /Paver Edge Restraint Calculator/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/paver-edge-restraint-calculator/');
    assert.match(await page.locator('#result').innerText(), /Your edge restraint estimate/);
  });

  await check('Negative already-restrained edge is rejected', async () => {
    await fresh();
    await page.locator('#restrained').fill('-2');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /cannot be negative/i);
  });

  await check('Negative curved edge length is rejected', async () => {
    await fresh();
    await page.locator('#curved').fill('-2');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /curved edge length cannot be negative/i);
  });

  await check('Waste above 50 percent is rejected instead of clamped', async () => {
    await fresh();
    await page.locator('#waste').fill('51');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /between 0% and 50%/i);
  });

  await check('Negative optional stock price is rejected', async () => {
    await fresh();
    await page.locator('#price').fill('-1');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /non-negative stock price/i);
  });
} finally {
  await browser.close();
}
console.log('Paver edge restraint browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
