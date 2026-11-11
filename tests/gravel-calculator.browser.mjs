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
  await page.goto('http://127.0.0.1:4173/gravel-calculator/', { waitUntil: 'domcontentloaded' });
  await page.locator('#calculate').waitFor();
}
async function setImperialThirdYard() {
  await page.locator('#units').selectOption('imperial');
  const area = page.locator('.area-card').first();
  await area.locator('[data-role="length"]').fill('3');
  await area.locator('[data-role="width"]').fill('3');
  await area.locator('[data-role="depth"]').fill('1');
  await area.locator('[data-role="depthUnit"]').selectOption('ft');
}

try {
  await fresh();
  await check('Page loads with canonical URL and project inputs', async () => {
    assert.match(await page.title(), /Gravel Calculator/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/gravel-calculator/');
    assert.equal(await page.locator('.area-card').count(), 1);
  });

  await check('Imperial preset density converts US short tons consistently', async () => {
    await fresh();
    await setImperialThirdYard();
    await page.locator('#material').selectOption('pea');
    await page.locator('#calculate').click();
    assert.equal(await page.locator('#rVolume').innerText(), '0.33 yd³');
    assert.equal(await page.locator('#rWeight').innerText(), '0.45 US tons');
  });

  await check('Custom imperial density uses US short-ton conversion', async () => {
    await fresh();
    await setImperialThirdYard();
    await page.locator('#material').selectOption('custom');
    await page.locator('#customDensity').fill('1.35');
    await page.locator('#calculate').click();
    assert.equal(await page.locator('#rWeight').innerText(), '0.45 US tons');
  });

  await check('Equivalent metric volume produces matching mass', async () => {
    await fresh();
    await page.locator('#units').selectOption('metric');
    const area = page.locator('.area-card').first();
    await area.locator('[data-role="length"]').fill('0.9144');
    await area.locator('[data-role="width"]').fill('0.9144');
    await area.locator('[data-role="depth"]').fill('0.3048');
    await area.locator('[data-role="depthUnit"]').selectOption('m');
    await page.locator('#material').selectOption('pea');
    await page.locator('#calculate').click();
    assert.equal(await page.locator('#rWeight').innerText(), '408 kg');
  });

  await check('Invalid area dimensions do not produce a material estimate', async () => {
    await fresh();
    const area = page.locator('.area-card').first();
    await area.locator('[data-role="length"]').fill('0');
    await page.locator('#calculate').click();
    assert.match(await page.locator('#error').innerText(), /valid positive dimensions/i);
  });
} finally {
  await browser.close();
}
console.log('Gravel calculator browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
