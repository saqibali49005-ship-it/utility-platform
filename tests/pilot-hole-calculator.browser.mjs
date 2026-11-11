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
  await page.goto('http://127.0.0.1:4173/pilot-hole-calculator/', { waitUntil: 'domcontentloaded' });
  await page.locator('#calculate').waitFor();
}
const resultText = () => page.locator('#result').innerText();
const measureText = () => page.locator('#measureResult').innerText();

try {
  await fresh();
  await check('Page loads with canonical URL and default #8 hardwood pilot reference', async () => {
    assert.match(await page.title(), /Pilot Hole Size Calculator/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/pilot-hole-calculator/');
    assert.match(resultText(), /Recommended pilot hole/);
    assert.match(resultText(), /1\/8"/);
    assert.match(resultText(), /3.2 mm/);
  });

  await check('Softwood uses the lower #8 pilot-hole reference', async () => {
    await page.locator('#material').selectOption('soft');
    await page.locator('#calculate').click();
    assert.match(resultText(), /7\/64"/);
    assert.match(resultText(), /2.8 mm/);
  });

  await check('Clearance mode uses the screw shank-clearance reference', async () => {
    await page.locator('#material').selectOption('hard');
    await page.locator('#hole').selectOption('clearance');
    await page.locator('#calculate').click();
    assert.match(resultText(), /Recommended clearance hole/);
    assert.match(resultText(), /11\/64"/);
    assert.match(resultText(), /4.4 mm/);
  });

  await check('Metric countersink mode explains that head diameter must be measured', async () => {
    await page.locator('#screw').selectOption('m40');
    await page.locator('#hole').selectOption('counter');
    await page.locator('#preference').selectOption('calculated');
    await page.locator('#calculate').click();
    assert.match(resultText(), /3 mm/);
    assert.match(resultText(), /metric wood-screw head diameters vary/i);
  });

  await check('A valid measured root diameter is used as the pilot starting point', async () => {
    await page.locator('#major').fill('4.2');
    await page.locator('#root').fill('2.8');
    await page.locator('#measure').click();
    assert.match(measureText(), /Suggested starting pilot: 2.8 mm/);
    assert.match(measureText(), /Your measured root diameter was used/i);
  });

  await check('Negative root diameter is rejected instead of silently replaced by an estimate', async () => {
    await page.locator('#major').fill('4.2');
    await page.locator('#root').fill('-1');
    await page.locator('#measure').click();
    assert.match(measureText(), /Root diameter must be at least 0.2 mm/i);
  });

  await check('Zero root diameter is rejected as an invalid supplied measurement', async () => {
    await page.locator('#major').fill('4.2');
    await page.locator('#root').fill('0');
    await page.locator('#measure').click();
    assert.match(measureText(), /Root diameter must be at least 0.2 mm/i);
  });

  await check('Root diameter greater than or equal to major diameter is rejected', async () => {
    await page.locator('#major').fill('4.2');
    await page.locator('#root').fill('4.2');
    await page.locator('#measure').click();
    assert.match(measureText(), /Root diameter should be smaller than the major diameter/i);
  });

  await check('Blank root diameter is clearly identified as an approximate 70% estimate', async () => {
    await page.locator('#major').fill('4.2');
    await page.locator('#root').fill('');
    await page.locator('#measure').click();
    assert.match(measureText(), /Suggested starting pilot: 2.94 mm/);
    assert.match(measureText(), /approximate 70% starting value/i);
  });

  await check('Major diameter below the input minimum is rejected', async () => {
    await page.locator('#major').fill('0.3');
    await page.locator('#root').fill('');
    await page.locator('#measure').click();
    assert.match(measureText(), /major diameter of at least 0.5 mm/i);
  });

  await check('Reset restores the default screw, material, hole type and display mode', async () => {
    await page.locator('#screw').selectOption('6');
    await page.locator('#material').selectOption('soft');
    await page.locator('#hole').selectOption('clearance');
    await page.locator('#preference').selectOption('calculated');
    await page.locator('#reset').click();
    assert.equal(await page.locator('#screw').inputValue(), '8');
    assert.equal(await page.locator('#material').inputValue(), 'hard');
    assert.equal(await page.locator('#hole').inputValue(), 'pilot');
    assert.equal(await page.locator('#preference').inputValue(), 'common');
    assert.match(resultText(), /1\/8"/);
  });
} finally {
  await browser.close();
}
console.log('Pilot-hole calculator browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
