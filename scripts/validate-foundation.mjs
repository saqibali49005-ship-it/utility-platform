#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const catalog = fs.readFileSync(path.join(root, 'tools-data.js'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

const entries = [...catalog.matchAll(/\{slug:"([^"]+)",title:"([^"]+)",href:"([^"]+)",category:"([^"]+)",description:"([^"]*)",addedOrder:(\d+),keywords:\[([^\]]*)\]\}/g)]
  .map(m => ({ slug: m[1], title: m[2], href: m[3], category: m[4], order: Number(m[6]) }));

if (!entries.length) throw new Error('No catalog entries parsed.');

const fail = [];
const unique = values => new Set(values).size === values.length;
if (!unique(entries.map(x => x.slug))) fail.push('Duplicate catalog slug');
if (!unique(entries.map(x => x.href))) fail.push('Duplicate catalog href');
if (!unique(entries.map(x => x.order))) fail.push('Duplicate addedOrder');
if (entries.some(x => !Number.isInteger(x.order) || x.order < 1)) fail.push('addedOrder must be positive integers');

const requiredNav = ['/', 'tools/', 'math-science/', 'digital-developer/', 'home-construction/', 'energy-electrical/'];
const categoryIds = [...catalog.matchAll(/\{id:"([^"]+)",title:"/g)].map(m => m[1]);

for (const tool of entries) {
  const filePath = path.join(root, tool.href, 'index.html');
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    fail.push('Missing tool page: ' + tool.href);
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const canonical = 'https://zemtools.com/' + tool.href;
  if (!html.includes(canonical)) fail.push('Missing ZemTools canonical URL: ' + tool.href);
  if (!sitemap.includes('<loc>' + canonical + '</loc>')) fail.push('Missing sitemap URL: ' + tool.href);
const homepageSitemapEntry = sitemap.match(/<url>\s*<loc>https:\/\/zemtools\.com\/\s*<\/loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>\s*<\/url>/);
if (!homepageSitemapEntry) fail.push('Homepage sitemap entry must include an accurate lastmod date.');

  if (!/class=["'][^"']*top-nav/.test(html)) fail.push('Missing desktop navigation: ' + tool.href);
  if (!/id=["']toolHeaderMenuPanel["']/.test(html)) fail.push('Missing mobile navigation: ' + tool.href);
  for (const href of requiredNav) {
    if (!html.includes('href="' + href + '"') && !html.includes("href='" + href + "'")) {
      fail.push('Missing main navigation link ' + href + ': ' + tool.href);
    }
  }
  if (!/id=["']toolHeaderSearchPanel["']/.test(html)) fail.push('Missing search panel: ' + tool.href);
  if (!/id=["']toolHeaderSearchForm["']/.test(html)) fail.push('Missing tool search form: ' + tool.href);
  if (!/id=["']toolHeaderSearchInput["']/.test(html)) fail.push('Missing tool search input: ' + tool.href);
  if (!/class=["'][^"']*crumbs/.test(html)) fail.push('Missing visible breadcrumbs: ' + tool.href);
  if (!categoryIds.includes(tool.category)) fail.push('Unknown category: ' + tool.category);
}

if (fail.length) {
  console.error(fail.map(message => 'FAIL: ' + message).join('\n'));
  process.exit(1);
}
console.log('Foundation check passed: ' + entries.length + ' catalog tools validated against ZemTools URLs and page structure.');
