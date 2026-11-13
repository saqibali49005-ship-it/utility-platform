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
      assert.ok(response && response.status() === 200, 'HTTP status: ' + (response?.status()));
      await page.waitForFunction(() => window.__ZEMTOOLS_NAV_READY === true, null, { timeout: 5000 });

      const state = await page.evaluate(() => {
        const header = document.querySelector('.site-header');
        const brand = header?.querySelector('.brand[href="/"]');
        const homeNav = header?.querySelector('.top-nav a[href="/"]');
        const allToolsNav = header?.querySelector('.top-nav a[href="/tools/"]');
        const categoryToggle = header?.querySelectorAll('.zt-category-toggle');
        const search = header?.querySelectorAll('.zt-nav-search-toggle');
        const menu = header?.querySelectorAll('.zt-nav-menu-toggle');
        const contextualSearch = document.querySelectorAll('main .zt-category-search-inline');
        return {
          header: Boolean(header),
          brandHome: Boolean(brand),
          brandVisible: Boolean(brand && getComputedStyle(brand).display !== 'none' && brand.getBoundingClientRect().width > 0),
          brandName: brand?.querySelector('.zt-brand-copy strong')?.textContent || '',
          brandTagline: brand?.querySelector('.zt-brand-copy small')?.textContent || '',
          desktopHomeLink: Boolean(homeNav),
          allToolsLink: Boolean(allToolsNav),
          sticky: header ? getComputedStyle(header).position : '',
          headerHeight: header?.getBoundingClientRect().height || 0,
          categoryCount: categoryToggle?.length || 0,
          searchCount: search?.length || 0,
          menuCount: menu?.length || 0,
          searchVisible: Boolean(search?.[0] && getComputedStyle(search[0]).display !== 'none' && search[0].getBoundingClientRect().width > 0),
          menuVisible: Boolean(menu?.[0] && getComputedStyle(menu[0]).display !== 'none' && menu[0].getBoundingClientRect().width > 0),
          contextualSearchInMain: contextualSearch.length,
          client: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth
        };
      });
      assert.ok(state.header, 'missing shared site header');
      assert.ok(state.brandHome && state.brandVisible, 'header logo is not a visible Home link');
      assert.equal(state.brandName, 'ZemTools', 'brand name is inconsistent');
      assert.equal(state.brandTagline, 'Practical online tools', 'brand tagline is missing or inconsistent');
      assert.ok(state.desktopHomeLink, 'primary navigation has no Home link');
      assert.ok(state.allToolsLink, 'primary navigation has no All Tools link');
      assert.equal(state.sticky, 'sticky', 'header is not sticky');
      assert.equal(state.categoryCount, 1, 'expected exactly one Categories control');
      assert.equal(state.searchCount, 1, 'expected exactly one Search tools control');
      assert.equal(state.menuCount, 1, 'expected exactly one mobile menu button');
      assert.ok(state.searchVisible, 'Search tools control is not visible');
      assert.equal(state.menuVisible, viewport.width <= 1100, 'menu button visibility does not match responsive breakpoint');
      const expectedHeight = viewport.width <= 650 ? 64 : viewport.width <= 1100 ? 68 : 76;
      assert.equal(Math.round(state.headerHeight), expectedHeight, 'unexpected header height ' + state.headerHeight + 'px');
      if (['/math-science/', '/digital-developer/', '/home-construction/', '/energy-electrical/'].includes(route)) {
        assert.equal(state.contextualSearchInMain, 1, 'category search is not placed in main content');
      }
      assert.ok(state.scroll <= state.client + 1, 'horizontal overflow: ' + state.scroll + 'px > ' + state.client + 'px');

      if (viewport.width > 1100) {
        const categoryButton = page.locator('.zt-category-toggle');
        await categoryButton.click();
        const categoryPanel = page.locator('.zt-category-panel');
        await categoryPanel.waitFor({ state: 'visible' });
        assert.equal(await categoryPanel.locator('.zt-category-card').count(), 4, 'desktop category menu must show all four active categories');
        await page.keyboard.press('Escape');
        await categoryPanel.waitFor({ state: 'hidden' });
        assert.equal(await categoryButton.getAttribute('aria-expanded'), 'false');
      } else {
        const menuButton = page.locator('.zt-nav-menu-toggle');
        await menuButton.click();
        const menuPanel = page.locator('.zt-nav-menu-panel');
        await menuPanel.waitFor({ state: 'visible' });
        assert.ok(await menuPanel.locator('a[href="/"]').count(), 'mobile menu has no Home link');
        assert.ok(await menuPanel.locator('a[href="/tools/"]').count(), 'mobile menu has no All Tools link');
        assert.equal(await menuPanel.locator('.zt-mobile-category-grid a').count(), 4, 'mobile menu must show all four active categories');
        await page.keyboard.press('Escape');
        await menuPanel.waitFor({ state: 'hidden' });
        assert.equal(await menuButton.getAttribute('aria-expanded'), 'false');
      }

      await page.locator('.zt-nav-search-toggle').click();
      const searchResult = await page.evaluate(() => {
        const active = document.activeElement;
        const panel = document.querySelector('.zt-nav-search-panel.zt-nav-open');
        return Boolean((panel && getComputedStyle(panel).display !== 'none') ||
          (active && active.matches('input[type="search"], input[type="text"]')));
      });
      assert.ok(searchResult, 'Search tools neither opens the search panel nor focuses the relevant search field');

      passed++;
      console.log('PASS', route, viewport.name);
    } catch (error) {
      failures.push({ route, viewport: viewport.name, error: error.message });
      console.error('FAIL', route, viewport.name, error.message);
    }
  }
}
await browser.close();
console.log('Sitewide header and responsive checks: ' + passed + '/' + (routes.length * viewports.length) + ' passed; ' + failures.length + ' failed');
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
