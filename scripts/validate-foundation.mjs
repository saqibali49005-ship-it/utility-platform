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

for(const t of entries){
  if(!fs.existsSync(path.join(root,t.href))) fail.push('Missing tool file: '+t.href);
  if(!sitemap.includes('<loc>https://saqibali49005-ship-it.github.io/utility-platform/'+t.href+'</loc>')) fail.push('Missing sitemap URL: '+t.href);
}

const categoryIds=[...catalog.matchAll(/\{id:"([^"]+)",title:"/g)].map(m=>m[1]);
for(const t of entries) if(!categoryIds.includes(t.category)) fail.push('Unknown category: '+t.category);

if(fail.length){
  console.error(fail.map(x=>'FAIL: '+x).join(String.fromCharCode(10)));
  process.exit(1);
}
console.log('Foundation check passed: '+entries.length+' catalog tools validated.');
