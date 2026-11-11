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
async function between(start, end) {
  await page.locator('#betweenTab').click();
  await page.locator('#betweenStart').fill(start);
  await page.locator('#betweenEnd').fill(end);
  await page.locator('#calculateBetween').click();
}
async function fresh() {
  await page.goto('http://127.0.0.1:4173/business-hours-calculator/', { waitUntil: 'domcontentloaded' });
  await page.locator('#calculateBetween').waitFor();
}
const resultValue = () => page.locator('#resultArea .result-value').innerText();

try {
  await fresh();
  await check('Page loads with canonical URL and default business-hours result', async () => {
    assert.match(await page.title(), /Business Hours Calculator/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/business-hours-calculator/');
    assert.match(await resultValue(), /40 hours/);
  });

  await check('One Monday workday counts eight hours', async () => {
    await fresh();
    await between('2026-11-09T09:00', '2026-11-09T17:00');
    assert.equal(await resultValue(), '8 hours');
  });

  await check('Two working periods on one day count the scheduled total', async () => {
    await fresh();
    await page.locator('#day-0-start1').fill('09:00');
    await page.locator('#day-0-end1').fill('12:00');
    await page.locator('#day-0-start2').fill('13:00');
    await page.locator('#day-0-end2').fill('17:00');
    await between('2026-11-09T09:00', '2026-11-09T17:00');
    assert.equal(await resultValue(), '7 hours');
  });

  await check('Partial first work period is rejected even if the second period is complete', async () => {
    await fresh();
    await page.locator('#day-0-start1').fill('09:00');
    await page.locator('#day-0-end1').fill('');
    await page.locator('#day-0-start2').fill('13:00');
    await page.locator('#day-0-end2').fill('17:00');
    await between('2026-11-09T09:00', '2026-11-09T17:00');
    assert.match(await resultValue(), /Monday has an incomplete time period/i);
  });

  await check('Partial second work period is rejected rather than silently ignored', async () => {
    await fresh();
    await page.locator('#day-0-start2').fill('13:00');
    await page.locator('#day-0-end2').fill('');
    await between('2026-11-09T09:00', '2026-11-09T17:00');
    assert.match(await resultValue(), /Monday has an incomplete time period/i);
  });

  await check('Holiday date excludes the matching workday', async () => {
    await fresh();
    await page.locator('#holidayDates').fill('2026-11-09');
    await between('2026-11-09T09:00', '2026-11-09T17:00');
    assert.equal(await resultValue(), '0 hours');
    assert.match(await page.locator('#resultArea').innerText(), /Holidays excluded\s+1/i);
  });

  await check('Cross-weekend range counts Friday and Monday work only', async () => {
    await fresh();
    await between('2026-11-13T16:00', '2026-11-16T10:00');
    assert.equal(await resultValue(), '2 hours');
  });

  await check('Deadline add carries remaining business time into the next workday', async () => {
    await fresh();
    await page.locator('#deadlineTab').click();
    await page.locator('#deadlineBase').fill('2026-11-13T16:00');
    await page.locator('#deadlineOperation').selectOption('add');
    await page.locator('#deadlineHours').fill('2');
    await page.locator('#deadlineMinutes').fill('0');
    await page.locator('#calculateDeadline').click();
    assert.match(await resultValue(), /Nov 16, 2026/i);
    assert.match(await resultValue(), /10:00 AM/i);
  });
} finally {
  await browser.close();
}
console.log('Business-hours calculator browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
