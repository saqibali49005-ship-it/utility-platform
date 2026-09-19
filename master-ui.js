(function(){'use strict';
const m=document.getElementById('menuBtn'),n=document.getElementById('mobileNav'),s=document.getElementById('searchBtn'),p=document.getElementById('searchPanel'),i=document.getElementById('siteSearch'),f=document.getElementById('siteSearchForm');
const navItems=[['index.html','Home'],['tools.html','All Tools'],['math-science.html','Math & Science'],['digital-developer.html','Digital & Developer'],['home-construction.html','Home & Construction'],['energy-electrical.html','Energy & Electrical']];
function syncNav(el){if(!el)return;const current=location.pathname.split('/').pop()||'index.html';el.innerHTML=navItems.map(([href,label])=>'<a '+(href===current?'aria-current="page" ':'')+'href="'+href+'">'+label+'</a>').join('');}
syncNav(document.querySelector('.top-nav'));syncNav(n);
function initBranding(){
 document.title=document.title.replace(/Utility Platform/g,'ZemTools');
 document.querySelectorAll('meta').forEach(m=>{
  if(m.hasAttribute('content'))m.content=m.content.replace(/Utility Platform/g,'ZemTools');
 });
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 const nodes=[];let node;while(node=walker.nextNode())nodes.push(node);
 nodes.forEach(t=>{if(t.nodeValue.includes('Utility Platform'))t.nodeValue=t.nodeValue.replace(/Utility Platform/g,'ZemTools');});
 const mark='<svg class="zemtools-mark-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M8 13h31L17 46h25l-7 8H7l22-33H8z" fill="#1677f0"/><path d="M29 19h28l-7 8H43v25H31V28H22z" fill="#17212b"/><path d="M15 49h27l-7 7H8z" fill="#0bb7e8"/></svg>';
 const style='.brand-mark,.footer-mark{display:grid!important;place-items:center!important;background:transparent!important;box-shadow:none!important}.zemtools-mark-svg{width:100%;height:100%;display:block}.footer-mark .zemtools-mark-svg{width:34px;height:34px}.brand-wordmark{display:inline-flex;align-items:baseline;letter-spacing:-.35px;font-weight:900}.brand-wordmark .zem{color:#17212b}.brand-wordmark .tools{color:#1677f0}';
 if(!document.getElementById('zemtoolsBrandStyle')){const s=document.createElement('style');s.id='zemtoolsBrandStyle';s.textContent=style;document.head.appendChild(s);}
 document.querySelectorAll('.brand-mark').forEach(m=>{m.innerHTML=mark;m.setAttribute('aria-label','ZemTools logo');});
 document.querySelectorAll('.footer-mark').forEach(m=>{m.innerHTML=mark;m.setAttribute('aria-label','ZemTools logo');});
 document.querySelectorAll('.brand').forEach(b=>{
  const copy=b.querySelector('.brand-copy');
  if(copy){const strong=copy.querySelector('strong');if(strong){strong.innerHTML='<span class="brand-wordmark"><span class="zem">Zem</span><span class="tools">Tools</span></span>';}}
  else{
   const textNodes=[...b.childNodes].filter(x=>x.nodeType===Node.TEXT_NODE&&x.nodeValue.trim());
   textNodes.forEach(t=>{if(t.nodeValue.includes('ZemTools'))t.remove();});
   if(!b.querySelector('.brand-wordmark'))b.insertAdjacentHTML('beforeend','<span class="brand-wordmark"><span class="zem">Zem</span><span class="tools">Tools</span></span>');
  }
 });
 document.querySelectorAll('.footer-brand').forEach(b=>{
  const strong=b.querySelector('strong');if(strong)strong.innerHTML='<span class="brand-wordmark"><span class="zem" style="color:#fff">Zem</span><span class="tools" style="color:#54b5ff">Tools</span></span>';
 });
 document.querySelectorAll('footer').forEach(f=>{
  if(f.querySelector('.footer-brand'))return;
  const brand=document.createElement('div');brand.className='zemtools-footer-brand';
  brand.innerHTML='<span class="zemtools-footer-mark">'+mark+'</span><span class="brand-wordmark"><span class="zem">Zem</span><span class="tools">Tools</span></span>';
  const links=f.querySelector('.footer-links'); if(links) f.insertBefore(brand,links); else f.insertBefore(brand,f.firstChild);
 });
 const sf='.zemtools-footer-brand{display:flex;align-items:center;justify-content:center;gap:9px;margin:0 auto 10px;font-weight:900}.zemtools-footer-mark{width:34px;height:34px;display:grid;place-items:center}.zemtools-footer-mark .zemtools-mark-svg{width:34px;height:34px}.zemtools-footer-brand .zem{color:#17212b}.zemtools-footer-brand .tools{color:#1677f0}footer:not([style]) .zemtools-footer-brand{}';
 if(!document.getElementById('zemtoolsFooterBrandStyle')){const s=document.createElement('style');s.id='zemtoolsFooterBrandStyle';s.textContent=sf;document.head.appendChild(s);}
 document.querySelectorAll('.copyright').forEach(c=>{c.textContent=c.textContent.replace(/Utility Platform/g,'ZemTools')});
}
initBranding();

if(m&&n)m.onclick=()=>{const o=n.classList.toggle('open');m.setAttribute('aria-expanded',o)};
if(s&&p)s.onclick=()=>{const o=p.classList.toggle('open');s.setAttribute('aria-expanded',o);if(o&&i)i.focus();if(n)n.classList.remove('open')};

function initSearch(){
 if(!i||!f)return;
 let box=document.getElementById('siteSearchSuggestions');
 if(!box){box=document.createElement('div');box.id='siteSearchSuggestions';box.className='site-search-suggestions';box.hidden=true;p.appendChild(box);}
 if(!document.getElementById('siteSearchSuggestionStyle')){
  const st=document.createElement('style');st.id='siteSearchSuggestionStyle';st.textContent='.site-search-suggestions{position:relative;margin-top:8px;background:#fff;border:1px solid #dbe3ed;border-radius:12px;box-shadow:0 12px 28px rgba(15,23,42,.12);overflow:hidden;z-index:50}.site-search-suggestions button{display:block;width:100%;padding:10px 12px;border:0;border-bottom:1px solid #eef2f7;background:#fff;text-align:left;cursor:pointer;font:inherit}.site-search-suggestions button:last-child{border-bottom:0}.site-search-suggestions button:hover,.site-search-suggestions button:focus{background:#f5f8fc}.site-search-suggestions strong{display:block;font-size:13px;color:#111827}.site-search-suggestions span{display:block;margin-top:2px;font-size:11px;color:#64748b}';document.head.appendChild(st);
 }
 function catalog(){return window.UTILITY_TOOLS||[]}
 function render(){
  const q=i.value.trim().toLowerCase();const tools=catalog();
  if(!q||!tools.length){box.hidden=true;box.innerHTML='';return}
  const list=tools.filter(t=>[t.title,t.description,t.category,...(t.keywords||[])].join(' ').toLowerCase().includes(q)).slice(0,6);
  box.innerHTML=list.map(t=>'<button type="button" data-href="'+t.href+'"><strong>'+t.title+'</strong><span>Open tool</span></button>').join('');
  box.hidden=list.length===0;
 }
 function loadCatalog(){
  if(window.UTILITY_TOOLS){render();return}
  const sc=document.createElement('script');sc.src='tools-data.js';sc.onload=render;document.head.appendChild(sc);
 }
 i.addEventListener('input',()=>{loadCatalog();render()});
 i.addEventListener('focus',()=>{if(i.value.trim())loadCatalog()});
 box.addEventListener('click',e=>{const b=e.target.closest('[data-href]');if(b)location.href=b.dataset.href});
 f.onsubmit=e=>{e.preventDefault();const q=i.value.trim();if(q)location.href='tools.html?q='+encodeURIComponent(q)};
 document.addEventListener('click',e=>{if(!p.contains(e.target))box.hidden=true});
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
initSearch();
initReport();
})();