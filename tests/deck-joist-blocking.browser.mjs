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
    const result = await page.locator('#result').innerText();
    assert.match(result, /BLOCKING PIECES\s+12/i);
    assert.match(result, /14\.5 in/);
    assert.match(result, /14\.5 ft/);
    assert.match(result, /2 × 8 ft/);
    assert.match(result, /12 bays per row × 1 row = 12 base pieces/);
    assert.match(await page.locator('body').innerText(), /Deck Joist Blocking Calculator: Worked Example/);
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
  await check('Metric mode converts dimensions and preserves the block cut length', async () => {
    await fresh();
    await page.locator('#units').selectOption('metric');
    assert.equal(await page.locator('#joistSpacing').inputValue(), '406.4');
    assert.equal(await page.locator('#joistThickness').inputValue(), '38.1');
    await page.locator('#joistRun').fill('4.8');
    const result = await page.locator('#result').innerText();
    assert.match(result, /368\.3 mm/);
    assert.match(result, /2 × 2\.44 m/);
    assert.match(result, /4\.80 m at 406\.4 mm OC implies about 13 joists/);
  });

  await check('Multiple blocking rows, extra pieces and fasteners are counted correctly', async () => {
    await fresh();
    await page.locator('#blockingRows').fill('2');
    await page.locator('#extraBlocks').fill('2');
    await page.locator('#fastenersPerBlock').fill('2');
    await calculate();
    const result = await page.locator('#result').innerText();
    assert.match(result, /BLOCKING PIECES\s+26/i);
    assert.match(result, /Fasteners\s+52/);
    assert.match(result, /STOCK BOARDS\s+5 × 8 ft/i);
    assert.match(result, /12 bays per row × 2 rows = 24 base pieces/);
  });

  await check('Spacing that does not exceed joist thickness is rejected', async () => {
    await fresh();
    await page.locator('#joistSpacing').fill('1.5');
    await calculate();
    assert.match(await page.locator('#error').innerText(), /spacing must be greater than actual joist thickness/i);
  });

} finally {
  await browser.close();
}
console.log('Deck joist blocking browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
