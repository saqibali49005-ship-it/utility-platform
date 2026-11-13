import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const BASE = 'http://127.0.0.1:4173';
const PAGES = [
  '/', '/tools/', '/math-science/', '/digital-developer/', '/home-construction/',
  '/energy-electrical/', '/about/', '/contact/', '/privacy/', '/terms/',
  '/aspect-ratio-calculator/', '/business-hours-calculator/', '/calculator/',
  '/case-converter/', '/conduit-fill-calculator/', '/deck-joist-blocking-calculator/',
  '/duplicate-line-remover/', '/fence-calculator/', '/find-replace/', '/gravel-calculator/',
  '/paint-calculator/', '/paver-edge-restraint-calculator/', '/pilot-hole-calculator/',
  '/remove-line-breaks/', '/sod-staple-calculator/', '/sod-staple-spacing-guide/',
  '/text-cleaner/', '/time-calculator/', '/uuid-generator-calculator/',
  '/wire-size-calculator/', '/word-counter/'
];
const FOOTER_LINKS = ['About', 'Contact', 'Privacy', 'Terms'];
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
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

async function waitForShell() {
  await page.waitForFunction(() => window.__ZEMTOOLS_NAV_READY === true, { timeout: 12000 });
  await page.locator('header.zt-global-header .zt-header-inner').waitFor({ state: 'visible' });
  await page.locator('body > footer.zt-global-footer').waitFor({ state: 'visible' });
}

async function inspectGeometry(path, viewportName, expectedHeaderHeight, expectedFooterHeight) {
  const metrics = await page.evaluate(() => {
    const rect = selector => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const footer = document.querySelector('body > footer.zt-global-footer');
    const footerLinks = [...footer.querySelectorAll('.zt-footer-links a')].map(a => a.textContent.trim());
    return {
      header: rect('header.zt-global-header'),
      inner: rect('.zt-header-inner'),
      brand: rect('.zt-brand'),
      controls: rect('.zt-header-controls'),
      search: rect('.zt-search-toggle'),
      menu: rect('.zt-menu-toggle'),
      footer: rect('body > footer.zt-global-footer'),
      footerInner: rect('.zt-footer-inner'),
      copyright: rect('.zt-footer-copyright'),
      footerLinks,
      headerCount: document.querySelectorAll('header.zt-global-header').length,
      footerCount: document.querySelectorAll('body > footer.zt-global-footer').length,
      overflow: { client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }
    };
  });

  assert.equal(metrics.headerCount, 1, path + ' should have one shared header');
  assert.equal(metrics.footerCount, 1, path + ' should have one shared body-level footer');
  assert.equal(metrics.header.height, expectedHeaderHeight, path + ' header height');
  assert.equal(metrics.footer.height, expectedFooterHeight, path + ' footer height');
  assert.equal(metrics.search.width, 40, path + ' search button width');
  assert.equal(metrics.search.height, 40, path + ' search button height');
  assert.equal(metrics.menu.width, 40, path + ' menu button width');
  assert.equal(metrics.menu.height, 40, path + ' menu button height');
  assert.deepEqual(metrics.footerLinks, FOOTER_LINKS, path + ' footer link order');
  assert.equal(metrics.overflow.scroll, metrics.overflow.client, path + ' must not overflow horizontally');

  const expectedInnerWidth = Math.min(viewportName === 'mobile' ? 390 : 1440, 1120);
  assert.equal(metrics.inner.width, expectedInnerWidth, path + ' shared header inner width');
  assert.equal(metrics.footerInner.width, expectedInnerWidth, path + ' shared footer inner width');
  return metrics;
}

async function inspectInteractions(path, viewportName) {
  const menu = page.locator('#ztGlobalMenuToggle');
  const menuPanel = page.locator('#ztGlobalMenuPanel');
  const search = page.locator('#ztGlobalSearchToggle');
  const searchPanel = page.locator('#ztGlobalSearchPanel');
  const searchInput = page.locator('#ztGlobalSearchInput');

  await menu.click();
  await menuPanel.waitFor({ state: 'visible' });
  assert.equal(await menu.getAttribute('aria-expanded'), 'true', path + ' menu expanded');
  assert.equal(await menuPanel.locator('a').count(), 6, path + ' menu has six navigation links');
  const menuBox = await menuPanel.boundingBox();
  const width = viewportName === 'mobile' ? 390 : 1440;
  assert.ok(menuBox.x >= 0 && menuBox.x + menuBox.width <= width, path + ' menu fits viewport');
  await page.keyboard.press('Escape');
  await menuPanel.waitFor({ state: 'hidden' });
  assert.equal(await menu.getAttribute('aria-expanded'), 'false', path + ' Escape closes menu');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'ztGlobalMenuToggle', path + ' Escape restores menu focus');

  await search.click();
  await searchPanel.waitFor({ state: 'visible' });
  assert.equal(await search.getAttribute('aria-expanded'), 'true', path + ' search expanded');
  assert.equal(await searchInput.evaluate(el => el === document.activeElement), true, path + ' search input receives focus');
  const searchBox = await searchPanel.boundingBox();
  assert.ok(searchBox.x >= 0 && searchBox.x + searchBox.width <= width, path + ' search panel fits viewport');
  await searchInput.fill('time');
  assert.ok(await page.locator('#ztGlobalSearchResults').count() === 1, path + ' search results region exists');
  await page.keyboard.press('Escape');
  await searchPanel.waitFor({ state: 'hidden' });
  assert.equal(await search.getAttribute('aria-expanded'), 'false', path + ' Escape closes search');
}

try {
  for (const path of PAGES) {
    await page.setViewportSize({ width: 1440, height: 900 });
    const response = await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    assert.ok(response && response.ok(), path + ' must load successfully');
    await waitForShell();

    await check(path + ' desktop shared header/footer geometry', async () => {
      await inspectGeometry(path, 'desktop', 72, 112);
    });
    await check(path + ' desktop menu and search interactions', async () => {
      await inspectInteractions(path, 'desktop');
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(60);
    await check(path + ' mobile shared header/footer geometry', async () => {
      await inspectGeometry(path, 'mobile', 64, 150);
    });
    await check(path + ' mobile menu and search interactions', async () => {
      await inspectInteractions(path, 'mobile');
    });
  }
} finally {
  await browser.close();
}

console.log('Unified header/footer browser audit: ' + passed + ' passed, ' + failures.length + ' failed across ' + PAGES.length + ' pages at desktop and mobile widths.');
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
