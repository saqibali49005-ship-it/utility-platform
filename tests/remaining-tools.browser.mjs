import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
const failures = [];
let passed = 0;

async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log('PASS', name);
  } catch (error) {
    failures.push({ name, error: error.message });
    console.error('FAIL', name, error.message);
  }
}

async function open(route, selector) {
  const response = await page.goto('http://127.0.0.1:4173' + route, { waitUntil: 'domcontentloaded' });
  assert.equal(response?.status(), 200, 'Route should load with HTTP 200');
  await page.locator(selector).waitFor({ state: 'visible' });
}

try {
  await open('/aspect-ratio-calculator/', '#width');
  await check('Aspect ratio simplifies 1920 × 1080 to 16:9', async () => {
    await page.locator('#width').fill('1920');
    await page.locator('#height').fill('1080');
    await page.locator('#findRatio').click();
    assert.match(await page.locator('#ratioResult').innerText(), /16:9/);
  });
  await check('Aspect ratio solves the missing 16:9 dimension correctly', async () => {
    await page.locator('#ratioW').fill('16');
    await page.locator('#ratioH').fill('9');
    await page.locator('#knownDimension').selectOption('width');
    await page.locator('#knownValue').fill('1280');
    await page.locator('#solveSize').click();
    assert.match(await page.locator('#sizeResult').innerText(), /1,280\s*[×x]\s*720/);
  });

  await open('/find-replace/', '#inputText');
  await check('Find/replace respects whole-word matching and ignores case when selected', async () => {
    await page.locator('#inputText').fill('cat Cat cater');
    await page.locator('#findText').fill('cat');
    await page.locator('#replaceText').fill('dog');
    await page.locator('#wholeWord').check();
    await page.locator('#matchCase').uncheck();
    assert.match(await page.locator('#matchCount').innerText(), /2 matches/i);
    await page.locator('#replaceAllBtn').click();
    assert.equal(await page.locator('#inputText').inputValue(), 'dog dog cater');
  });
  await check('Find/replace case-sensitive mode leaves differently cased text unchanged', async () => {
    await page.locator('#inputText').fill('cat Cat');
    await page.locator('#findText').fill('cat');
    await page.locator('#replaceText').fill('x');
    await page.locator('#wholeWord').uncheck();
    await page.locator('#matchCase').check();
    await page.locator('#replaceAllBtn').click();
    assert.equal(await page.locator('#inputText').inputValue(), 'x Cat');
  });

  await open('/word-counter/', '#inputText');
  await check('Word counter reports words, characters, sentences and lines', async () => {
    const sample = 'one two\nthree.';
    await page.locator('#inputText').fill(sample);
    assert.equal(await page.locator('#words').innerText(), '3');
    assert.equal(await page.locator('#chars').innerText(), String(sample.length));
    assert.equal(await page.locator('#sentences').innerText(), '1');
    assert.equal(await page.locator('#lines').innerText(), '2');
  });
  await check('Word counter character-limit preset reports remaining characters', async () => {
    await page.locator('[data-limit="160"]').click();
    assert.match(await page.locator('#limitStatus').innerText(), /146 characters remaining/i);
  });

  await open('/case-converter/', '#inputText');
  await check('Case converter handles multi-line camelCase conversion', async () => {
    await page.locator('#inputText').fill('hello world\nGOOD BYE');
    await page.locator('[data-case="camel"]').click();
    await page.locator('#convertBtn').click();
    assert.equal(await page.locator('#outputText').inputValue(), 'helloWorld\ngoodBye');
  });
  await check('Case converter supports snake_case conversion', async () => {
    await page.locator('[data-case="snake"]').click();
    await page.locator('#convertBtn').click();
    assert.equal(await page.locator('#outputText').inputValue(), 'hello_world\ngood_bye');
  });

  await open('/remove-line-breaks/', '#inputText');
  await check('Line-break remover joins wrapped lines but preserves paragraph gaps', async () => {
    await page.locator('#inputText').fill('one\n two \n\nthree');
    await page.locator('#mode').selectOption('paragraphs');
    await page.locator('#trimLines').check();
    await page.locator('#runBtn').click();
    assert.equal(await page.locator('#outputText').inputValue(), 'one two\n\nthree');
  });
  await check('Line-break remover can replace every line break with a custom separator', async () => {
    await page.locator('#inputText').fill('one\ntwo\nthree');
    await page.locator('#mode').selectOption('replace');
    await page.locator('#replacement').selectOption('custom');
    await page.locator('#customReplacement').fill(' | ');
    await page.locator('#runBtn').click();
    assert.equal(await page.locator('#outputText').inputValue(), 'one | two | three');
  });

  await open('/duplicate-line-remover/', '#inputText');
  await check('Duplicate-line remover keeps first occurrence and normalizes case/whitespace', async () => {
    await page.locator('#inputText').fill('Apple\napple\nBanana\nApple\n banana \n\n');
    await page.locator('#ignoreCase').check();
    await page.locator('#trimWhitespace').check();
    await page.locator('#removeBlanks').check();
    await page.locator('#dedupeBtn').click();
    assert.equal(await page.locator('#outputText').inputValue(), 'Apple\nBanana');
    assert.match(await page.locator('#removedStats').innerText(), /3 duplicates/i);
  });
  await check('Duplicate-line remover keep-last mode retains final duplicate positions', async () => {
    await page.locator('#inputText').fill('A\nB\nA');
    await page.locator('#ignoreCase').uncheck();
    await page.locator('#trimWhitespace').uncheck();
    await page.locator('#removeBlanks').uncheck();
    await page.locator('[data-mode="last"]').click();
    assert.equal(await page.locator('#outputText').inputValue(), 'B\nA');
  });

  await open('/text-cleaner/', '#inputText');
  await check('Text cleaner trims, collapses spaces, removes blanks and deduplicates', async () => {
    await page.locator('#inputText').fill('  alpha   beta  \n\n\n beta \n alpha  ');
    await page.locator('#trimLines').check();
    await page.locator('#extraSpaces').check();
    await page.locator('#duplicateLines').check();
    await page.locator('#blankLines').check();
    await page.locator('#lineBreaks').check();
    await page.locator('#cleanBtn').click();
    assert.equal(await page.locator('#outputText').inputValue(), 'alpha beta\nbeta\nalpha');
  });

  await open('/uuid-generator-calculator/', '#count');
  await check('UUID generator emits the requested count of valid RFC variant v4 UUIDs', async () => {
    await page.locator('#count').fill('3');
    await page.locator('#format').selectOption('standard');
    await page.locator('#generate').click();
    const values = await page.locator('#genOutput .item .mono').allTextContents();
    assert.equal(values.length, 3);
    for (const value of values) assert.match(value, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
  await check('UUID validator recognizes a valid v4 UUID and rejects malformed input', async () => {
    await page.locator('#inspectInput').fill('550e8400-e29b-41d4-a716-446655440000');
    await page.locator('#inspectBtn').click();
    assert.match(await page.locator('#inspectOutput').innerText(), /Valid 128-bit UUID structure/i);
    await page.locator('#inspectInput').fill('not-a-uuid');
    await page.locator('#inspectBtn').click();
    assert.match(await page.locator('#inspectOutput').innerText(), /Enter a valid UUID/i);
  });
  await check('UUID v7 generation uses the v7 version nibble', async () => {
    await page.locator('#versionSeg [data-version="7"]').click();
    await page.locator('#count').fill('2');
    await page.locator('#generate').click();
    const values = await page.locator('#genOutput .item .mono').allTextContents();
    assert.equal(values.length, 2);
    for (const value of values) assert.match(value, /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  await open('/pilot-hole-calculator/', '#calculate');
  await check('Pilot-hole calculator returns the reference starting size for #8 hardwood', async () => {
    await page.locator('#screw').selectOption('8');
    await page.locator('#material').selectOption('hard');
    await page.locator('#hole').selectOption('pilot');
    await page.locator('#preference').selectOption('calculated');
    await page.locator('#calculate').click();
    const output = await page.locator('#result').innerText();
    assert.match(output, /3\.2 mm/);
    assert.match(output, /1\/8"/);
  });
  await check('Pilot-hole measurement mode rejects a root diameter greater than the major diameter', async () => {
    await page.locator('#major').fill('4');
    await page.locator('#root').fill('4.5');
    await page.locator('#measure').click();
    assert.match(await page.locator('#measureResult').innerText(), /Root diameter should be smaller/i);
  });

  await open('/time-calculator/', '#startTime');
  await check('Time calculator computes duration and decimal hours', async () => {
    await page.locator('#startTime').fill('09:00:00');
    await page.locator('#endTime').fill('17:30:00');
    await page.locator('#nextDay').uncheck();
    await page.locator('#calcDuration').click();
    const output = await page.locator('#durationResult').innerText();
    assert.match(output, /8 hours 30 minutes/);
    assert.match(output, /510 minutes/);
    assert.match(output, /8\.5 decimal hours/);
  });
  await check('Time calculator handles midnight rollover and add/subtract', async () => {
    await page.locator('#startTime').fill('23:00:00');
    await page.locator('#endTime').fill('01:30:00');
    await page.locator('#nextDay').check();
    await page.locator('#calcDuration').click();
    assert.match(await page.locator('#durationResult').innerText(), /2 hours 30 minutes/);
    await page.locator('#addTab').click();
    await page.locator('#baseTime').fill('23:30:00');
    await page.locator('#operation').selectOption('add');
    await page.locator('#addHours').fill('1');
    await page.locator('#addMinutes').fill('0');
    await page.locator('#addSeconds').fill('0');
    await page.locator('#calcAdd').click();
    assert.match(await page.locator('#addResult').innerText(), /00:30:00 \(next day\)/);
  });
} finally {
  await browser.close();
}

console.log('Remaining 10-tool browser audit: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
