(function(){'use strict';
if(!window.__zemtoolsGa4Loaded){
 window.__zemtoolsGa4Loaded=true;
 window.dataLayer=window.dataLayer||[];
 window.gtag=function(){window.dataLayer.push(arguments);};
 window.gtag('js',new Date());
 window.gtag('config','G-LX61P24FYK');
 // Queue analytics immediately, but fetch the third-party library after the browser has idle time.
 var loadGaScript=function(){
  var gaScript=document.createElement('script');
  gaScript.async=true;
  gaScript.src='https://www.googletagmanager.com/gtag/js?id=G-LX61P24FYK';
  document.head.appendChild(gaScript);
 };
 if(typeof window.requestIdleCallback==='function'){
  window.requestIdleCallback(loadGaScript,{timeout:2000});
 }else if(document.readyState==='complete'){
  window.setTimeout(loadGaScript,500);
 }else{
  window.addEventListener('load',function(){window.setTimeout(loadGaScript,500);},{once:true});
 }
}
function initPreviewNavigation(){
 const host=location.hostname.toLowerCase();
 if(!host.endsWith('.pages.dev')&&host!=='preview.zemtools.com')return;
 function keepLinksOnPreview(root){
  const links=[];
  if(root&&root.matches&&root.matches('a[href]'))links.push(root);
  if(root&&root.querySelectorAll)links.push(...root.querySelectorAll('a[href]'));
  links.forEach(link=>{
   try{
    const url=new URL(link.href,location.href);
    if(url.hostname==='zemtools.com'||url.hostname==='www.zemtools.com'){
     link.href=location.origin+url.pathname+url.search+url.hash;
    }
   }catch(_){}
  });
 }
 keepLinksOnPreview(document);
 document.addEventListener('click',function(e){
  const link=e.target.closest&&e.target.closest('a[href]');
  if(link)keepLinksOnPreview(link);
 },true);
}
function initToolCalculateTracking(){
 if(!document.body.classList.contains('tool-page'))return;
 const calculateIds=/^(calculate|calculatebtn|calculatebetween|calculatedeadline|calcduration|calcadd|findratio|solvesize|resize|measure)$/i;
 document.addEventListener('click',function(e){
  const button=e.target.closest('button, input[type="button"], input[type="submit"]');
  if(!button||button.disabled||button.closest('.faq, .faq-card, [data-analytics-ignore]'))return;
  const label=String(button.textContent||button.value||'').replace(/\s+/g,' ').trim();
  const id=String(button.id||'').trim();
  const isGenerate=/^generate(?:\s|$)/i.test(label)||/^generate$/i.test(id);
  const isCalculate=/^calculate(?:\s|$)/i.test(label)||/^find business-time result$/i.test(label)||calculateIds.test(id);
  if(!isGenerate&&!isCalculate)return;
  if(typeof window.gtag!=='function')return;
  const heading=(document.querySelector('main h1, h1')?.textContent||document.title||'Unknown tool').trim();
  const actionType=isGenerate?'generate':'calculate';
  window.gtag('event',isGenerate?'tool_generate':'tool_calculate',{
   action_type:actionType,
   tool_name:heading,
   tool_path:location.pathname,
   button_id:id||'(none)',
   button_label:label.slice(0,100)
  });
 },true);
}
function initUnifiedHeader(){
 const header=document.querySelector('header.site-header');
 if(!header||header.dataset.zemUnified==='1')return;
 header.style.visibility='hidden';
 header.innerHTML='';
 const path=location.pathname.replace(/\/+$/,'')||'/';
 const categories=Array.isArray(window.UTILITY_CATEGORIES)?window.UTILITY_CATEGORIES:[];
 const tools=Array.isArray(window.UTILITY_TOOLS)?window.UTILITY_TOOLS:[];
 const active=categories.filter(c=>c.href&&tools.some(t=>t.category===c.id));
 const countFor=id=>tools.filter(t=>t.category===id).length;
 const categoryLinks=active.map(c=>'<a href="/'+c.href.replace(/^\//,'')+'"'+(path==='/'+c.href.replace(/^\//,'').replace(/\/$/,'')?' aria-current="page"':'')+'><span class="zem-category-icon" aria-hidden="true">'+(c.icon||'•')+'</span><span class="zem-category-copy"><strong>'+c.title+'</strong><small>'+countFor(c.id)+' '+(countFor(c.id)===1?'tool':'tools')+'</small></span><span class="zem-category-arrow" aria-hidden="true">→</span></a>').join('');
 const links='<a href="/"'+(path==='/'?' aria-current="page"':'')+'>Home</a><a href="/tools/"'+(path==='/tools'?' aria-current="page"':'')+'>All Tools</a>';
 header.innerHTML='<div class="header-inner"><a class="brand" href="/" aria-label="ZemTools home"><span class="brand-mark" aria-hidden="true">Z</span><span class="brand-copy"><strong>ZemTools</strong><small>Practical online tools</small></span></a><nav class="top-nav" aria-label="Primary navigation">'+links+'<button class="nav-categories-toggle" id="zemCategoriesToggle" type="button" aria-expanded="false" aria-controls="zemCategoriesPanel">Categories <span aria-hidden="true">⌄</span></button></nav><div class="header-actions" aria-label="Header actions"><button class="icon-btn" id="toolHeaderSearch" type="button" aria-label="Search tools" aria-expanded="false" aria-controls="toolHeaderSearchPanel" title="Search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.2"></circle><path d="M15.4 15.4L20 20"></path></svg></button><button class="icon-btn menu-btn" id="toolHeaderMenu" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="toolHeaderMenuPanel" title="Menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg></button></div><div class="search-panel" id="toolHeaderSearchPanel"><form id="toolHeaderSearchForm" role="search"><label class="sr-only" for="toolHeaderSearchInput">Search tools</label><input id="toolHeaderSearchInput" type="search" placeholder="Search calculators and tools…" autocomplete="off" aria-label="Search tools"><button type="submit">Search</button></form><div id="toolHeaderSearchResults" class="zem-search-results" aria-live="polite"></div></div><section class="zem-categories-panel" id="zemCategoriesPanel" aria-label="Browse tool categories"><div class="zem-panel-heading"><div><strong>Explore categories</strong><span>Find the right tool for the job</span></div><a href="/tools/">Browse all tools →</a></div><div class="zem-category-grid">'+categoryLinks+'</div></section><nav class="mobile-nav" id="toolHeaderMenuPanel" aria-label="Mobile navigation"><a href="/">Home</a><a href="/tools/">All Tools</a><div class="mobile-nav-label">Categories</div>'+active.map(c=>'<a href="/'+c.href.replace(/^\//,'')+'">'+c.title+' <span>'+countFor(c.id)+'</span></a>').join('')+'</nav></div>';
 let link=document.querySelector('link[rel="stylesheet"][href*="master-header.css"]');
 if(!link){link=document.createElement('link');link.rel='stylesheet';document.head.appendChild(link);}
 function revealUnifiedHeader(){const prepaint=document.getElementById('zem-header-prepaint');if(prepaint)prepaint.remove();header.dataset.zemUnified='1';header.style.visibility='visible';}
 link.addEventListener('load',revealUnifiedHeader,{once:true});
 link.addEventListener('error',revealUnifiedHeader,{once:true});
 link.href='/master-header.css?v=20261114-5';
 const toggle=header.querySelector('#zemCategoriesToggle'),panel=header.querySelector('#zemCategoriesPanel');
 if(toggle&&panel){toggle.addEventListener('click',e=>{e.stopPropagation();const open=!panel.classList.contains('is-open');panel.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));});}
 document.addEventListener('click',e=>{if(!e.target.closest('#zemCategoriesPanel')&&!e.target.closest('#zemCategoriesToggle')){panel?.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){panel?.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');}});
}

function initSearch(){
 const searchBtn=document.getElementById('toolHeaderSearch');
 const searchPanel=document.getElementById('toolHeaderSearchPanel');
 const searchForm=document.getElementById('toolHeaderSearchForm');
 const searchInput=document.getElementById('toolHeaderSearchInput');
 const searchResults=document.getElementById('toolHeaderSearchResults');
 const menuBtn=document.getElementById('toolHeaderMenu');
 const menu=document.getElementById('toolHeaderMenuPanel');
 if(!searchBtn&&!menuBtn)return;
 const tools=Array.isArray(window.UTILITY_TOOLS)?window.UTILITY_TOOLS:[];
 function render(q){
  if(!searchResults)return;
  const term=String(q||'').trim().toLowerCase();
  const matches=(term?tools.filter(t=>(t.title+' '+(t.description||'')+' '+(Array.isArray(t.keywords)?t.keywords.join(' '):'')).toLowerCase().includes(term)):tools).slice(0,8);
  searchResults.innerHTML=matches.length?matches.map(t=>'<a href="'+t.href+'">'+t.title+'</a>').join(''):'<div class="tool-header-empty">No matching tool found.</div>';
 }
 function closeSearch(){if(searchPanel)searchPanel.classList.remove('open');if(searchBtn)searchBtn.setAttribute('aria-expanded','false');}
 function closeMenu(){if(menu)menu.classList.remove('open');if(menuBtn)menuBtn.setAttribute('aria-expanded','false');}
 render('');
 if(searchBtn&&searchPanel){
  searchBtn.addEventListener('click',function(e){e.stopPropagation();const open=!searchPanel.classList.contains('open');closeMenu();searchPanel.classList.toggle('open',open);searchBtn.setAttribute('aria-expanded',String(open));if(open&&searchInput)searchInput.focus();});
 }
 if(searchInput)searchInput.addEventListener('input',function(){render(searchInput.value);});
 if(searchForm&&searchInput)searchForm.addEventListener('submit',function(e){e.preventDefault();const q=searchInput.value.trim();if(q)location.href='/tools/?q='+encodeURIComponent(q);});
 if(menuBtn&&menu){
  menuBtn.addEventListener('click',function(e){e.stopPropagation();const open=!menu.classList.contains('open');closeSearch();menu.classList.toggle('open',open);menuBtn.setAttribute('aria-expanded',String(open));});
 }
 document.addEventListener('click',function(e){
  if(!e.target.closest('#toolHeaderSearchPanel')&&!e.target.closest('#toolHeaderSearch'))closeSearch();
  if(!e.target.closest('#toolHeaderMenuPanel')&&!e.target.closest('#toolHeaderMenu'))closeMenu();
 });
}

function initUnifiedFooter(){
 const footer=document.querySelector('footer');
 if(!footer||footer.dataset.zemUnifiedFooter==='1')return;
 footer.dataset.zemUnifiedFooter='1';
 footer.classList.add('zem-footer');
 footer.innerHTML='<div class="footer-inner foot"><div class="footer-brand"><div class="footer-mark" aria-hidden="true">Z</div><div><strong>ZemTools</strong><span>Practical online tools</span></div></div><nav class="footer-links" aria-label="Footer"><a href="/about/">About</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav></div><div class="copyright">© 2026 ZemTools</div>';
}

function initReport(){
 if(!document.body.classList.contains('tool-page')||document.getElementById('reportProblemBtn'))return;
 if(!document.getElementById('reportProblemStyle')){
  const st=document.createElement('style');st.id='reportProblemStyle';st.textContent='.report-problem-btn{position:fixed;right:16px;bottom:16px;z-index:9998;border:1px solid #c7d7ea;border-radius:999px;background:#fff;color:#0b2f66;padding:10px 14px;box-shadow:0 8px 24px rgba(15,23,42,.14);font:800 13px/1.1 system-ui,-apple-system,Segoe UI,sans-serif;cursor:pointer}.report-problem-btn:hover,.report-problem-btn:focus{background:#f5f9ff;border-color:#8eb5df;outline:none}.report-problem-btn:focus-visible{box-shadow:0 0 0 3px rgba(39,120,234,.2),0 8px 24px rgba(15,23,42,.14)}@media(max-width:650px){.report-problem-btn{right:12px;bottom:12px;padding:9px 12px;font-size:12px}}';document.head.appendChild(st);
 }
 const btn=document.createElement('button');btn.id='reportProblemBtn';btn.className='report-problem-btn';btn.type='button';btn.setAttribute('aria-label','Report a problem with this tool');btn.textContent='⚑ Report a problem';
 btn.addEventListener('click',()=>{
  const title=(document.querySelector('h1')?.textContent||'Utility Platform tool').trim();
  const rows=[];let omittedTextarea=false;
  document.querySelectorAll('main input, main select').forEach(el=>{
   if(el.disabled||el.type==='hidden')return;
   const label=el.id?document.querySelector('label[for="'+CSS.escape(el.id)+'"]'):null;
   const name=(label?.textContent||el.getAttribute('aria-label')||el.name||el.id||el.type||'Field').trim().replace(/\s+/g,' ');
   let value='';
   if(el.tagName==='SELECT') value=el.options[el.selectedIndex]?.text||el.value;
   else if(el.type==='checkbox'||el.type==='radio'){if(!el.checked)return;value='checked'}
   else value=String(el.value||'').trim();
   if(value)rows.push('- '+name+': ['+value.slice(0,160).replace(/\[/g,'\\[').replace(/\]/g,'\\]')+(value.length>160?'…':'')+']');
  });
  document.querySelectorAll('main textarea').forEach(el=>{if(String(el.value||'').trim())omittedTextarea=true});
  const body=[
   '## Problem report','',
   'Tool: '+title,'Page: '+location.href,'',
   '### Inputs captured',rows.length?rows.join('\n'):'- No non-textarea input values captured.',
   omittedTextarea?'\n> Textarea content was not included automatically. Please paste only non-sensitive text needed to reproduce the issue.':'',
   '','### What went wrong','Please describe what you expected and what actually happened.','',
   '### Technical details','Browser: '+navigator.userAgent
  ].join('\n');
  const ok=window.confirm('This opens a public GitHub issue. Do not include passwords, payment details, or other sensitive information. Continue?');
  if(!ok)return;
  const url='https://github.com/saqibali49005-ship-it/utility-platform/issues/new?title='+encodeURIComponent('[Tool Bug] '+title)+'&body='+encodeURIComponent(body);
  window.open(url,'_blank','noopener,noreferrer');
 });
 document.body.appendChild(btn);
}
function initAll(){initUnifiedHeader();initSearch();initUnifiedFooter();initReport();initToolCalculateTracking();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){initPreviewNavigation();initAll();},{once:true});else{initPreviewNavigation();initAll();}
})();
