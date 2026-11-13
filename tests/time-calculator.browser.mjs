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
  await page.goto('http://127.0.0.1:4173/time-calculator/', { waitUntil: 'domcontentloaded' });
  await page.locator('#calcDuration').waitFor();
}

try {
  await fresh();
  await check('Page loads with canonical URL and extracted engine', async () => {
    assert.match(await page.title(), /Time Calculator/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/time-calculator/');
    assert.equal(await page.evaluate(() => typeof window.ZemToolsTimeEngine.calculateDuration), 'function');
  });

  await check('Default duration retains 7 hours 45 minutes and decimal hours', async () => {
    await fresh();
    const result = await page.locator('#durationResult').innerText();
    assert.match(result, /7 hours 45 minutes/);
    assert.match(result, /465 minutes/);
    assert.match(result, /27,900 seconds/);
    assert.match(result, /7\.75 decimal hours/);
  });

  await check('Cross-midnight duration requires next-day setting', async () => {
    await fresh();
    await page.locator('#startTime').fill('23:30:00');
    await page.locator('#endTime').fill('01:15:00');
    await page.locator('#calcDuration').click();
    assert.match(await page.locator('#durationResult').innerText(), /End time is earlier than start time/i);
    await page.locator('#nextDay').check();
    await page.locator('#calcDuration').click();
    assert.match(await page.locator('#durationResult').innerText(), /1 hour 45 minutes/);
  });

  await check('Invalid duration time keeps the existing validation message', async () => {
    await fresh();
    await page.locator('#startTime').fill('');
    await page.locator('#calcDuration').click();
    assert.match(await page.locator('#durationResult').innerText(), /Enter valid start and end times/i);
  });

  await check('Add operation calculates and wraps after midnight correctly', async () => {
    await fresh();
    await page.locator('#addTab').click();
    await page.locator('#baseTime').fill('23:30:00');
    await page.locator('#addHours').fill('2');
    await page.locator('#addMinutes').fill('30');
    await page.locator('#addSeconds').fill('0');
    await page.locator('#operation').selectOption('add');
    await page.locator('#calcAdd').click();
    assert.match(await page.locator('#addResult').innerText(), /02:00:00 \(next day\)/);
    assert.match(await page.locator('#addResult').innerText(), /2 hours 30 minutes/);
  });

  await check('Subtract operation wraps to the previous day correctly', async () => {
    await fresh();
    await page.locator('#addTab').click();
    await page.locator('#baseTime').fill('00:30:00');
    await page.locator('#addHours').fill('1');
    await page.locator('#addMinutes').fill('15');
    await page.locator('#operation').selectOption('subtract');
    await page.locator('#calcAdd').click();
    assert.match(await page.locator('#addResult').innerText(), /23:15:00 \(previous day\)/);
  });

  await check('Fractional duration input is rejected', async () => {
    await fresh();
    await page.locator('#addTab').click();
    await page.locator('#addHours').fill('1.5');
    await page.locator('#calcAdd').click();
    assert.match(await page.locator('#addResult').innerText(), /valid base time and whole-number duration values/i);
  });

  await check('Reset controls restore the documented default values', async () => {
    await fresh();
    await page.locator('#startTime').fill('12:00:00');
    await page.locator('#nextDay').check();
    await page.locator('#resetDuration').click();
    assert.equal(await page.locator('#startTime').inputValue(), '09:30:00');
    assert.equal(await page.locator('#endTime').inputValue(), '17:15:00');
    assert.equal(await page.locator('#nextDay').isChecked(), false);
    await page.locator('#addTab').click();
    await page.locator('#baseTime').fill('12:00:00');
    await page.locator('#resetAdd').click();
    assert.equal(await page.locator('#baseTime').inputValue(), '10:30:00');
    assert.equal(await page.locator('#addHours').inputValue(), '2');
    assert.equal(await page.locator('#addMinutes').inputValue(), '30');
  });
} finally {
  await browser.close();
}
console.log('Time calculator browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
