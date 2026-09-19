#!/usr/bin/env node
const fs=require('fs');
const path=require('path');

const root=process.cwd();
const catalog=fs.readFileSync(path.join(root,'tools-data.js'),'utf8');
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');

const entries=[...catalog.matchAll(/\{slug:"([^"]+)",title:"([^"]+)",href:"([^"]+)",category:"([^"]+)",description:"([^"]*)",addedOrder:(\d+),keywords:\[([^\]]*)\]\}/g)]
  .map(m=>({slug:m[1],title:m[2],href:m[3],category:m[4],order:Number(m[6])}));

if(!entries.length) throw new Error('No catalog entries parsed.');

const fail=[];
const unique=a=>new Set(a).size===a.length;
if(!unique(entries.map(x=>x.slug))) fail.push('Duplicate catalog slug');
if(!unique(entries.map(x=>x.href))) fail.push('Duplicate catalog href');
if(!unique(entries.map(x=>x.order))) fail.push('Duplicate addedOrder');
if(entries.some(x=>!Number.isInteger(x.order)||x.order<1)) fail.push('addedOrder must be positive integers');

const requiredNav=[
  'index.html',
  'tools.html',
  'math-science.html',
  'digital-developer.html',
  'home-construction.html',
  'energy-electrical.html'
];

for(const t of entries){
  const filePath=path.join(root,t.href);
  if(!fs.existsSync(filePath)){
    fail.push('Missing tool file: '+t.href);
    continue;
  }
  if(!sitemap.includes('<loc>https://saqibali49005-ship-it.github.io/utility-platform/'+t.href+'</loc>')) fail.push('Missing sitemap URL: '+t.href);

  const html=fs.readFileSync(filePath,'utf8');
  if(!/<nav[^>]*class=["']top-nav["'][^>]*>[\\s\\S]*?<\\/nav>/i.test(html)) fail.push('Missing desktop navigation: '+t.href);
  if(!/<nav[^>]*id=["']mobileNav["'][^>]*>[\\s\\S]*?<\\/nav>/i.test(html)) fail.push('Missing mobile navigation: '+t.href);
  for(const href of requiredNav){
    if(!html.includes('href="'+href+'"') && !html.includes("href='"+href+"'"))
      fail.push('Missing main navigation link '+href+': '+t.href);
  }
  if(!/id=["']searchPanel["']/i.test(html)) fail.push('Missing search panel: '+t.href);
  if(!/(id=["']siteSearchForm["']|id=["']headerSearch["'])/i.test(html)) fail.push('Missing tool search form: '+t.href);
  if(!/(id=["']siteSearch["']|id=["']headerSearchInput["'])/i.test(html)) fail.push('Missing tool search input: '+t.href);
  if(!/<nav[^>]*class=["']crumbs["']/i.test(html)) fail.push('Missing visible breadcrumbs: '+t.href);
}

const categoryIds=[...catalog.matchAll(/\{id:"([^"]+)",title:"/g)].map(m=>m[1]);
for(const t of entries) if(!categoryIds.includes(t.category)) fail.push('Unknown category: '+t.category);

if(fail.length){
  console.error(fail.map(x=>'FAIL: '+x).join(String.fromCharCode(10)));
  process.exit(1);
}
console.log('Foundation check passed: '+entries.length+' catalog tools validated.');
