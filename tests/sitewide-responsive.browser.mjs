import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const routes = [
  '/', '/tools/', '/math-science/', '/digital-developer/', '/home-construction/', '/energy-electrical/',
  '/about/', '/contact/', '/privacy/', '/terms/',
  '/aspect-ratio-calculator/', '/business-hours-calculator/', '/calculator/', '/case-converter/',
  '/conduit-fill-calculator/', '/deck-joist-blocking-calculator/', '/duplicate-line-remover/',
  '/fence-calculator/', '/find-replace/', '/gravel-calculator/', '/paint-calculator/',
  '/paver-edge-restraint-calculator/', '/pilot-hole-calculator/', '/remove-line-breaks/',
  '/sod-staple-calculator/', '/sod-staple-spacing-guide/', '/text-cleaner/', '/time-calculator/',
  '/uuid-generator-calculator/', '/wire-size-calculator/', '/word-counter/', '/404.html'
];
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1365, height: 900 }
];
const failures = [];
let passed = 0;
for (const route of routes) {
  for (const viewport of viewports) {
    try {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const response = await page.goto('http://127.0.0.1:4173' + route, { waitUntil: 'domcontentloaded' });
      assert.ok(response && response.status() === 200, `HTTP status: ${response?.status()}`);
      const state = await page.evaluate(() => {
        const header = document.querySelector('.site-header');
        const brand = header?.querySelector('.brand[href="/"]');
        const homeNav = header?.querySelector('.top-nav a[href="/"]');
        return {
          header: Boolean(header),
          brandHome: Boolean(brand),
          brandVisible: Boolean(brand && getComputedStyle(brand).display !== 'none' && brand.getBoundingClientRect().width > 0),
          desktopHomeLink: Boolean(homeNav),
          client: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth,
          offenders: [...document.querySelectorAll('body *')].map(el => {
            const rect = el.getBoundingClientRect();
            const css = getComputedStyle(el);
            return {
              tag: el.tagName.toLowerCase(),
              id: el.id || '',
              className: typeof el.className === 'string' ? el.className : '',
              left: Math.round(rect.left * 10) / 10,
              right: Math.round(rect.right * 10) / 10,
              width: Math.round(rect.width * 10) / 10,
              position: css.position,
              overflowX: css.overflowX
            };
          }).filter(item => item.right > innerWidth + 1 || item.left < -1)
            .sort((a,b) => b.right - a.right).slice(0,10)
        };
      });
      assert.ok(state.header, 'missing shared site header');
      assert.ok(state.brandHome && state.brandVisible, 'header logo is not a visible Home link');
      assert.ok(state.desktopHomeLink, 'primary navigation has no Home link');
      assert.ok(state.scroll <= state.client + 1, `horizontal overflow: ${state.scroll}px > ${state.client}px; offenders: ${JSON.stringify(state.offenders)}`);
      if (viewport.width <= 820) {
        const buttonId = await page.evaluate(() => {
          const panelFor = {
            toolHeaderMenu: 'toolHeaderMenuPanel',
            infoHeaderMenu: 'infoMobileNav',
            notFoundMenu: 'notFoundMobileNav'
          };
          const buttons = [...document.querySelectorAll('.site-header button')]
            .filter(item => /Menu$/.test(item.id));
          const button = buttons.find(item => {
            const panelId = item.getAttribute('aria-controls') || panelFor[item.id] || (item.id + 'Panel');
            const panel = document.getElementById(panelId);
            return panel && panel.querySelector('a[href="/"]');
          });
          return button?.id || null;
        });
        assert.ok(buttonId, 'no mobile menu button controls a panel with Home link');
        await page.locator('#' + buttonId).click();
        const panelId = await page.locator('#' + buttonId).getAttribute('aria-controls')
          || ({ toolHeaderMenu: 'toolHeaderMenuPanel', infoHeaderMenu: 'infoMobileNav', notFoundMenu: 'notFoundMobileNav' }[buttonId])
          || (buttonId + 'Panel');
        const panel = page.locator('#' + panelId);
        assert.equal(await panel.isVisible(), true, 'mobile navigation does not open');
        assert.ok(await panel.locator('a[href="/"]').count(), 'mobile navigation has no Home link');
      }
      passed++;
      console.log('PASS', route, viewport.name);
    } catch (error) {
      failures.push({ route, viewport: viewport.name, error: error.message });
      console.error('FAIL', route, viewport.name, error.message);
    }
  }
}
await browser.close();
console.log(`Sitewide responsive checks: ${passed}/${routes.length * viewports.length} passed; ${failures.length} failed`);
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
