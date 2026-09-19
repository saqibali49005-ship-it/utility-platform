#!/usr/bin/env node
const fs=require('fs');
const path=require('path');

const root=process.cwd();
const catalogPath=path.join(root,'tools-data.js');
const sitemapPath=path.join(root,'sitemap.xml');
const catalog=fs.readFileSync(catalogPath,'utf8');
const sitemap=fs.readFileSync(sitemapPath,'utf8');

const entries=[...catalog.matchAll(/\{slug:"([^"]+)",title:"([^"]+)",href:"([^"]+)",category:"([^"]+)",description:"([^"]*)",addedOrder:(\d+),keywords:\[([^\]]*)\]\}/g)]
  .map(m=>({slug:m[1],title:m[2],href:m[3],category:m[4],order:Number(m[6])}));

if(!entries.length) throw new Error('No catalog entries parsed.');

const fail=[];
const unique=(arr)=>new Set(arr).size===arr.length;
if(!unique(entries.map(x=>x.slug))) fail.push('Duplicate catalog slug');
if(!unique(entries.map(x=>x.href))) fail.push('Duplicate catalog href');
if(!unique(entries.map(x=>x.order))) fail.push('Duplicate addedOrder');

for(const t of entries){
  if(!fs.existsSync(path.join(root,t.href))) fail.push('Missing tool file: '+t.href);
  if(!sitemap.includes('<loc>https://saqibali49005-ship-it.github.io/utility-platform/'+t.href+'</loc>')) fail.push('Missing sitemap URL: '+t.href);
}

const categoryIds=[...catalog.matchAll(/\{id:"([^"]+)",title:"/g)].map(m=>m[1]);
for(const t of entries) if(!categoryIds.includes(t.category)) fail.push('Unknown category: '+t.category);

const orders=entries.map(x=>x.order).sort((a,b)=>b-a);
for(let i=0;i<orders.length;i++) if(orders[i]!==entries.length-i) fail.push('addedOrder should be a continuous 1..N sequence');

if(fail.length){console.error(fail.map(x=>'FAIL: '+x).join('
'));process.exit(1);}
console.log('Foundation check passed: '+entries.length+' catalog tools validated.');
