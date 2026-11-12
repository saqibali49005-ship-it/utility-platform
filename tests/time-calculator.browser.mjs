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
async function openAdd() {
  await page.locator('#addTab').click();
}
const durationText = () => page.locator('#durationResult').innerText();
const addText = () => page.locator('#addResult').innerText();

try {
  await fresh();
  await check('Page loads with canonical URL and correct default 7h45m duration', async () => {
    assert.match(await page.title(), /Time Calculator/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/time-calculator/');
    assert.match(await durationText(), /7 hours 45 minutes/);
    assert.match(await durationText(), /465 minutes/);
    assert.match(await durationText(), /7.75 decimal hours/);
  });

  await check('Next-day option calculates a duration crossing midnight', async () => {
    await fresh();
    await page.locator('#startTime').fill('23:30:00');
    await page.locator('#endTime').fill('01:15:00');
    await page.locator('#nextDay').check();
    await page.locator('#calcDuration').click();
    assert.match(await durationText(), /1 hour 45 minutes/);
    assert.match(await durationText(), /105 minutes/);
  });

  await check('Earlier end time without next-day option shows a clear validation message', async () => {
    await fresh();
    await page.locator('#startTime').fill('23:30:00');
    await page.locator('#endTime').fill('01:15:00');
    await page.locator('#calcDuration').click();
    assert.match(await durationText(), /End time is earlier than start time/i);
  });

  await check('Add mode normalizes hours, minutes and seconds correctly', async () => {
    await fresh();
    await openAdd();
    await page.locator('#baseTime').fill('10:30:00');
    await page.locator('#operation').selectOption('add');
    await page.locator('#addHours').fill('2');
    await page.locator('#addMinutes').fill('30');
    await page.locator('#addSeconds').fill('45');
    await page.locator('#calcAdd').click();
    assert.match(await addText(), /^13:00:45/);
  });

  await check('Subtracting across midnight reports the previous day', async () => {
    await fresh();
    await openAdd();
    await page.locator('#baseTime').fill('01:30:00');
    await page.locator('#operation').selectOption('subtract');
    await page.locator('#addHours').fill('2');
    await page.locator('#addMinutes').fill('0');
    await page.locator('#addSeconds').fill('0');
    await page.locator('#calcAdd').click();
    assert.match(await addText(), /^23:30:00 \(previous day\)/);
  });

  await check('Adding more than 48 hours reports the full day offset', async () => {
    await fresh();
    await openAdd();
    await page.locator('#baseTime').fill('10:30:00');
    await page.locator('#operation').selectOption('add');
    await page.locator('#addHours').fill('50');
    await page.locator('#addMinutes').fill('0');
    await page.locator('#addSeconds').fill('0');
    await page.locator('#calcAdd').click();
    assert.match(await addText(), /^12:30:00 \(2 days later\)/);
  });

  await check('Fractional duration values are rejected instead of silently rounded', async () => {
    await fresh();
    await openAdd();
    await page.locator('#addMinutes').fill('1.5');
    await page.locator('#calcAdd').click();
    assert.match(await addText(), /whole-number duration values/i);
  });

  await check('Reset restores duration and add/subtract defaults and clears results', async () => {
    await fresh();
    await page.locator('#startTime').fill('08:00:00');
    await page.locator('#endTime').fill('09:00:00');
    await page.locator('#calcDuration').click();
    await page.locator('#resetDuration').click();
    assert.equal(await page.locator('#startTime').inputValue(), '09:30:00');
    assert.equal(await page.locator('#endTime').inputValue(), '17:15:00');
    assert.equal(await durationText(), '');

    await openAdd();
    await page.locator('#baseTime').fill('23:00:00');
    await page.locator('#calcAdd').click();
    await page.locator('#resetAdd').click();
    assert.equal(await page.locator('#baseTime').inputValue(), '10:30:00');
    assert.equal(await page.locator('#operation').inputValue(), 'add');
    assert.equal(await page.locator('#addHours').inputValue(), '2');
    assert.equal(await page.locator('#addMinutes').inputValue(), '30');
    assert.equal(await page.locator('#addSeconds').inputValue(), '0');
    assert.equal(await addText(), '');
  });
} finally {
  await browser.close();
}
console.log('Time calculator browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
