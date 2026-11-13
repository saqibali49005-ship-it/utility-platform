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
  await page.goto('http://127.0.0.1:4173/aspect-ratio-calculator/', { waitUntil: 'domcontentloaded' });
  await page.locator('#findRatio').waitFor();
}

try {
  await fresh();
  await check('Page loads with canonical URL and browser calculation engine', async () => {
    assert.match(await page.title(), /Aspect Ratio Calculator/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://zemtools.com/aspect-ratio-calculator/');
    assert.equal(await page.evaluate(() => typeof window.ZemToolsAspectRatioEngine.calculateRatio), 'function');
  });

  await check('Default dimensions reduce to 16:9', async () => {
    await fresh();
    await page.locator('#findRatio').click();
    assert.match(await page.locator('#ratioResult').innerText(), /^16:9/);
    assert.equal(await page.locator('#previewLabel').innerText(), '16:9');
  });

  await check('Preset ratio applies matching dimensions and ratio result', async () => {
    await fresh();
    await page.locator('[data-ratio="9:16"]').click();
    assert.equal(await page.locator('#width').inputValue(), '1080');
    assert.equal(await page.locator('#height').inputValue(), '1920');
    assert.match(await page.locator('#ratioResult').innerText(), /^9:16/);
  });

  await check('Missing height is solved proportionally', async () => {
    await fresh();
    await page.locator('#ratioW').fill('16');
    await page.locator('#ratioH').fill('9');
    await page.locator('#knownDimension').selectOption('width');
    await page.locator('#knownValue').fill('1280');
    await page.locator('#solveSize').click();
    assert.match(await page.locator('#sizeResult').innerText(), /1,280 × 720 px/);
  });

  await check('Missing width is solved proportionally', async () => {
    await fresh();
    await page.locator('#ratioW').fill('16');
    await page.locator('#ratioH').fill('9');
    await page.locator('#knownDimension').selectOption('height');
    await page.locator('#knownValue').fill('720');
    await page.locator('#solveSize').click();
    assert.match(await page.locator('#sizeResult').innerText(), /1,280 × 720 px/);
  });

  await check('Resize by target width preserves original ratio', async () => {
    await fresh();
    await page.locator('#origW').fill('1920');
    await page.locator('#origH').fill('1080');
    await page.locator('#targetDimension').selectOption('width');
    await page.locator('#targetValue').fill('1280');
    await page.locator('#resize').click();
    assert.match(await page.locator('#resizeResult').innerText(), /1,280 × 720 px/);
    assert.match(await page.locator('#resizeResult').innerText(), /66\.67%/);
  });

  await check('Resize by target height preserves original ratio', async () => {
    await fresh();
    await page.locator('#origW').fill('1920');
    await page.locator('#origH').fill('1080');
    await page.locator('#targetDimension').selectOption('height');
    await page.locator('#targetValue').fill('720');
    await page.locator('#resize').click();
    assert.match(await page.locator('#resizeResult').innerText(), /1,280 × 720 px/);
    assert.match(await page.locator('#resizeResult').innerText(), /66\.67%/);
  });

  await check('Invalid width is rejected with the existing guidance', async () => {
    await fresh();
    await page.locator('#width').fill('0');
    await page.locator('#findRatio').click();
    assert.match(await page.locator('#ratioResult').innerText(), /positive width and height/i);
  });

  await check('Swap dimensions updates the simplified ratio', async () => {
    await fresh();
    await page.locator('#swap').click();
    assert.equal(await page.locator('#width').inputValue(), '1080');
    assert.equal(await page.locator('#height').inputValue(), '1920');
    assert.match(await page.locator('#ratioResult').innerText(), /^9:16/);
  });
} finally {
  await browser.close();
}
console.log('Aspect ratio calculator browser checks: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exitCode = 1;
