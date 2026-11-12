import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const base = 'http://127.0.0.1:4173';
const localTrackingScript = await readFile(new URL('../master-ui.js', import.meta.url), 'utf8');
await page.route('https://zemtools.com/master-ui.js*', route => route.fulfill({
  status: 200,
  contentType: 'application/javascript; charset=utf-8',
  body: localTrackingScript
}));
await page.route('https://www.googletagmanager.com/gtag/js*', route => route.abort());

async function fresh(route) {
  await page.goto(base + route, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.gtag === 'function');
}

async function recordedEvents() {
  return page.evaluate(() => (window.dataLayer || [])
    .map(args => Array.from(args))
    .filter(args => args[0] === 'event'));
}

async function assertEvent(expectedName, expectedAction, expectedPath) {
  const events = await recordedEvents();
  const matches = events.filter(args => args[1] === expectedName);
  assert.equal(matches.length, 1, 'expected exactly one ' + expectedName + ' event');
  const params = matches[0][2] || {};
  assert.equal(params.action_type, expectedAction);
  assert.equal(params.tool_path, expectedPath);
  assert.ok(params.tool_name, 'tool_name should be populated');
  assert.ok(params.button_label, 'button_label should be populated');
}

try {
  await fresh('/paint-calculator/');
  await page.locator('#calculate').click();
  await assertEvent('tool_calculate', 'calculate', '/paint-calculator/');

  await fresh('/business-hours-calculator/');
  await page.locator('#calculateDeadline').click();
  await assertEvent('tool_calculate', 'calculate', '/business-hours-calculator/');

  await fresh('/aspect-ratio-calculator/');
  const faqQuestion = page.locator('.faq button').filter({ hasText: /calculate/i }).first();
  assert.equal(await faqQuestion.count(), 1, 'expected an FAQ question containing the word calculate');
  await faqQuestion.click();
  assert.equal((await recordedEvents()).length, 0, 'FAQ clicks must not be recorded as calculator use');
  await page.locator('#findRatio').click();
  await assertEvent('tool_calculate', 'calculate', '/aspect-ratio-calculator/');

  await fresh('/uuid-generator-calculator/');
  await page.locator('#generate').click();
  await assertEvent('tool_generate', 'generate', '/uuid-generator-calculator/');

  console.log('GA4 tool tracking checks: 4 scenarios passed; calculation, business-hours, FAQ exclusion, UUID generation.');
} finally {
  await browser.close();
}
