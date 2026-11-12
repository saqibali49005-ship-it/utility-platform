/* ZemTools — one sitewide navigation controller.
   Contract: one .site-header, one .brand[href="/"], one primary .top-nav,
   one search toggle, one menu toggle. Legacy page handlers are intercepted
   in capture phase so they cannot double-toggle shared controls. */
(function(){
 'use strict';
 if(window.__ZEMTOOLS_NAV_V1__)return;
 window.__ZEMTOOLS_NAV_V1__=true;

 const css=`
.site-header{position:sticky!important;top:0!important;z-index:1000!important;overflow:visible!important}
.site-header .header-inner{position:relative!important;overflow:visible!important}
.site-header .zt-nav-toggle{width:42px!important;height:42px!important;min-width:42px!important;min-height:42px!important;display:grid!important;place-items:center!important;flex:0 0 42px!important;padding:0!important;border:1px solid #d8e5f3!important;border-radius:12px!important;background:#fff!important;color:#12345d!important;cursor:pointer!important;line-height:0!important}
.site-header .zt-nav-toggle:hover{background:#f4f8fd!important;border-color:#9dbfe2!important}
.site-header .zt-nav-toggle:focus-visible{outline:3px solid rgba(37,99,235,.25)!important;outline-offset:2px!important}
.site-header .zt-nav-toggle svg{width:20px!important;height:20px!important;display:block!important;fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important}
.site-header .zt-nav-actions{display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;margin-left:auto!important;flex:0 0 auto!important}
.site-header .zt-nav-menu-toggle{display:grid!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}
.site-header .zt-nav-menu-panel{display:none!important;position:absolute!important;top:calc(100% + 8px)!important;right:12px!important;left:auto!important;z-index:10020!important;width:min(320px,calc(100vw - 24px))!important;max-width:calc(100vw - 24px)!important;max-height:min(70vh,560px)!important;overflow:auto!important;margin:0!important;padding:8px!important;gap:5px!important;border:1px solid #dfe6ef!important;border-radius:14px!important;background:#fff!important;box-shadow:0 14px 34px rgba(15,23,42,.16)!important;pointer-events:none!important}
.site-header .zt-nav-menu-panel:not(.zt-nav-open){display:none!important}
.site-header .zt-nav-menu-panel.zt-nav-open{display:grid!important;pointer-events:auto!important}
.site-header .zt-nav-menu-panel a{display:flex!important;align-items:center!important;min-height:42px!important;padding:10px 12px!important;border:1px solid transparent!important;border-radius:9px!important;background:#f7f9fc!important;color:#334155!important;text-decoration:none!important;font-size:14px!important;font-weight:750!important}
.site-header .zt-nav-menu-panel a:hover,.site-header .zt-nav-menu-panel a:focus-visible{background:#eff6ff!important;border-color:#cfe0ff!important;color:#1d4ed8!important}
.site-header .zt-nav-menu-panel a[aria-current="page"]{background:#eaf2ff!important;color:#1d4ed8!important}
.site-header .zt-nav-search-panel{display:none!important;position:absolute!important;top:calc(100% + 8px)!important;right:12px!important;left:auto!important;z-index:10021!important;width:min(460px,calc(100vw - 24px))!important;max-width:calc(100vw - 24px)!important;max-height:min(70vh,560px)!important;overflow:auto!important;margin:0!important;padding:12px!important;border:1px solid #dfe6ef!important;border-radius:14px!important;background:#fff!important;box-shadow:0 14px 34px rgba(15,23,42,.16)!important}
.site-header .zt-nav-search-panel:not(.zt-nav-open){display:none!important}
.site-header .zt-nav-search-panel.zt-nav-open{display:block!important}
.site-header .zt-nav-search-panel form{display:flex!important;align-items:stretch!important;gap:8px!important;margin:0!important}
.site-header .zt-nav-search-panel input[type="search"],.site-header .zt-nav-search-panel input[type="text"]{display:block!important;flex:1 1 auto!important;width:100%!important;min-width:0!important;min-height:44px!important;margin:0!important;padding:10px 12px!important;border:1px solid #cbd5e1!important;border-radius:10px!important;background:#fff!important;color:#111827!important;font:inherit!important;font-size:15px!important}
.site-header .zt-nav-search-panel button[type="submit"]{min-height:44px!important;padding:9px 15px!important;border:0!important;border-radius:10px!important;background:#1767e7!important;color:#fff!important;font-weight:800!important;cursor:pointer!important}
.site-header .zt-nav-search-panel .tool-header-empty,.site-header .zt-nav-search-panel .category-header-search-empty{padding:10px;color:#64748b;font-size:13px}
@media(max-width:980px){.site-header .top-nav{display:none!important}.site-header .zt-nav-menu-toggle{display:grid!important}}
@media(min-width:981px){.site-header .top-nav{display:flex!important}.site-header .zt-nav-menu-toggle{display:grid!important}}
@media(max-width:430px){.site-header .zt-nav-toggle{width:39px!important;height:39px!important;min-width:39px!important;min-height:39px!important;flex-basis:39px!important}.site-header .zt-nav-actions{gap:6px!important}}
@media(prefers-reduced-motion:reduce){.site-header .zt-nav-menu-panel,.site-header .zt-nav-search-panel{scroll-behavior:auto!important;transition:none!important}}
`;
 const style=document.createElement('style');
 style.id='zemtools-navigation-v1';
 style.textContent=css;
 document.head.appendChild(style);

 const header=document.querySelector('.site-header');
 if(!header){window.__ZEMTOOLS_NAV_READY=true;return;}
 const inner=header.querySelector('.header-inner')||header;
 const brand=header.querySelector('a.brand');
 if(brand){brand.setAttribute('href','/');brand.setAttribute('aria-label','ZemTools home');}
 const topNav=header.querySelector('.top-nav');
 if(topNav){
  topNav.querySelectorAll('a[href]').forEach(a=>{
   const raw=a.getAttribute('href')||'';
   if(raw&&!/^(?:[a-z]+:|\/|#)/i.test(raw))a.setAttribute('href','/'+raw.replace(/^\.\//,''));
  });
 }
 function actionContainer(){
  let el=header.querySelector('.header-actions,.home-header-controls,.tools-header-controls,.category-header-controls,.math-header-controls,.digital-header-controls');
  if(!el){el=document.createElement('div');el.className='header-actions zt-nav-actions';inner.appendChild(el);}
  el.classList.add('zt-nav-actions');
  return el;
 }
 const actions=actionContainer();
 function makeButton(kind){
  const b=document.createElement('button');
  b.type='button';
  b.className='icon-btn zt-nav-toggle zt-nav-'+kind+'-toggle';
  b.setAttribute('aria-label',kind==='menu'?'Open menu':'Open site search');
  b.setAttribute('aria-expanded','false');
  b.title=kind==='menu'?'Menu':'Search';
  b.innerHTML=kind==='menu'
   ?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>'
   :'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.2"></circle><path d="M15.4 15.4L20 20"></path></svg>';
  return b;
 }
 let menuButtons=[...header.querySelectorAll('button[id$="Menu"],button.menu-btn,[data-zt-nav-toggle="menu"]')];
 let menuBtn=menuButtons[0];
 if(!menuBtn){menuBtn=makeButton('menu');actions.appendChild(menuBtn);}
 menuButtons.slice(1).forEach(b=>b.remove());
 menuBtn.classList.add('zt-nav-toggle','zt-nav-menu-toggle');
 menuBtn.type='button';

 let searchButtons=[...header.querySelectorAll('button[id$="Search"],[data-zt-nav-toggle="search"]')];
 let searchBtn=searchButtons[0];
 if(!searchBtn){searchBtn=makeButton('search');if(menuBtn.parentElement===actions)actions.insertBefore(searchBtn,menuBtn);else actions.appendChild(searchBtn);}
 searchButtons.slice(1).forEach(b=>b.remove());
 searchBtn.classList.add('zt-nav-toggle','zt-nav-search-toggle');
 searchBtn.type='button';

 function menuPanelFor(button){
  const known={infoHeaderMenu:'infoMobileNav',notFoundMenu:'notFoundMobileNav'};
  const id=button.getAttribute('aria-controls')||known[button.id]||button.id.replace(/Menu$/,'MenuPanel');
  let panel=id?document.getElementById(id):null;
  if(!panel){
   panel=document.createElement('nav');
   panel.id=id||'ztNavMenuPanel';
   panel.setAttribute('aria-label','Mobile navigation');
   panel.innerHTML='<a href="/">Home</a><a href="/tools/">All Tools</a><a href="/math-science/">Math &amp; Science</a><a href="/digital-developer/">Digital &amp; Developer</a><a href="/home-construction/">Home &amp; Construction</a><a href="/energy-electrical/">Energy &amp; Electrical</a>';
   inner.appendChild(panel);
  }
  button.setAttribute('aria-controls',panel.id);
  panel.classList.add('zt-nav-menu-panel');
  panel.classList.remove('zt-nav-open','is-open','open');
  panel.setAttribute('aria-hidden','true');
  panel.querySelectorAll('a[href]').forEach(a=>{
   const raw=a.getAttribute('href')||'';
   if(raw&&!/^(?:[a-z]+:|\/|#)/i.test(raw))a.setAttribute('href','/'+raw.replace(/^\.\//,''));
  });
  return panel;
 }
 const menuPanel=menuPanelFor(menuBtn);

 function searchPanelFor(button){
  const known={toolHeaderSearch:'toolHeaderSearchPanel',categoryHeaderSearch:'categoryHeaderSearchPanel',mathHeaderSearch:'mathLocalSearch',digitalHeaderSearch:'digitalLocalSearch'};
  const id=button.getAttribute('aria-controls')||known[button.id]||button.id.replace(/Search$/,'SearchPanel');
  let panel=id?document.getElementById(id):null;
  if(!panel)return null;
  button.setAttribute('aria-controls',panel.id);
  panel.classList.add('zt-nav-search-panel');
  panel.classList.remove('zt-nav-open','is-open','open');
  panel.setAttribute('aria-hidden','true');
  return panel;
 }
 let searchPanel=searchPanelFor(searchBtn);
 // Preserve the shared catalogue-backed live search on calculator/tool pages.
 if(searchPanel&&searchPanel.id==='toolHeaderSearchPanel'){
  const form=searchPanel.querySelector('#toolHeaderSearchForm');
  const input=searchPanel.querySelector('#toolHeaderSearchInput');
  const results=searchPanel.querySelector('#toolHeaderSearchResults');
  const catalog=Array.isArray(window.UTILITY_TOOLS)?window.UTILITY_TOOLS:[];
  function renderToolMatches(query){
   if(!results)return;
   const term=String(query||'').trim().toLowerCase();
   const matches=(term?catalog.filter(t=>(t.title+' '+(t.description||'')+' '+(Array.isArray(t.keywords)?t.keywords.join(' '):'')).toLowerCase().includes(term)):catalog).slice(0,8);
   results.innerHTML=matches.length?matches.map(t=>'<a href="'+(String(t.href||'').startsWith('/')?t.href:'/'+t.href)+'">'+t.title+'</a>').join(''):'<div class="tool-header-empty">No matching tool found.</div>';
  }
  if(input)input.addEventListener('input',function(){renderToolMatches(input.value);});
  if(form&&input)form.addEventListener('submit',function(e){
   e.preventDefault();
   const query=input.value.trim();
   if(query)location.href='/tools/?q='+encodeURIComponent(query);
  });
  renderToolMatches('');
 }

 function focusTarget(){
  const byId={homeHeaderSearch:'#tool-search',toolsHeaderSearch:'#dir-input',mathHeaderSearch:'#mathLocalSearchInput',digitalHeaderSearch:'#digitalLocalSearchInput'};
  const selector=byId[searchBtn.id];
  return (selector&&document.querySelector(selector))
   ||(searchPanel&&searchPanel.querySelector('input[type="search"],input[type="text"]'))
   ||document.querySelector('.home-search input[type="search"],.directory-search input[type="search"]');
 }
 if(!searchPanel&&!focusTarget()){
  searchPanel=document.createElement('div');
  searchPanel.id='ztNavSearchPanel';
  searchPanel.className='zt-nav-search-panel';
  searchPanel.innerHTML='<form role="search"><label class="sr-only" for="ztNavSearchInput">Search all ZemTools</label><input id="ztNavSearchInput" type="search" placeholder="Search tools, problems or keywords…" autocomplete="off"><button type="submit">Search</button></form>';
  inner.appendChild(searchPanel);
  searchPanel.setAttribute('aria-hidden','true');
  searchBtn.setAttribute('aria-controls',searchPanel.id);
  searchPanel.querySelector('form').addEventListener('submit',function(e){
   e.preventDefault();
   const q=searchPanel.querySelector('input').value.trim();
   if(q)location.href='/tools/?q='+encodeURIComponent(q);
  });
 }
 if(searchPanel)searchPanel.classList.add('zt-nav-search-panel');

 function setOpen(panel,button,open){
  if(!panel||!button)return;
  panel.classList.toggle('zt-nav-open',open);
  panel.classList.toggle('is-open',open);
  panel.classList.toggle('open',open);
  panel.setAttribute('aria-hidden',String(!open));
  button.setAttribute('aria-expanded',String(open));
  button.setAttribute('aria-label',open?'Close '+(button===menuBtn?'menu':'search'):(button===menuBtn?'Open menu':'Open site search'));
 }
 function closeMenu(){setOpen(menuPanel,menuBtn,false);}
 function closeSearch(){if(searchPanel)setOpen(searchPanel,searchBtn,false);}
 function openSearch(){
  closeMenu();
  if(searchPanel){
   const open=!searchPanel.classList.contains('zt-nav-open');
   setOpen(searchPanel,searchBtn,open);
   if(open){const input=searchPanel.querySelector('input[type="search"],input[type="text"]');if(input)input.focus({preventScroll:true});}
  }else{
   const target=focusTarget();
   if(target){target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});target.focus({preventScroll:true});}
  }
 }
 function openMenu(){
  closeSearch();
  setOpen(menuPanel,menuBtn,!menuPanel.classList.contains('zt-nav-open'));
 }
 document.addEventListener('click',function(e){
  const menuClick=e.target.closest&&e.target.closest('.zt-nav-menu-toggle');
  if(menuClick===menuBtn){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openMenu();return;}
  const searchClick=e.target.closest&&e.target.closest('.zt-nav-search-toggle');
  if(searchClick===searchBtn){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openSearch();return;}
  if(menuPanel&&!menuPanel.contains(e.target))closeMenu();
  if(searchPanel&&!searchPanel.contains(e.target))closeSearch();
  if(menuPanel&&menuPanel.contains(e.target)&&e.target.closest('a[href]'))closeMenu();
 },true);
 document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){closeMenu();closeSearch();}
 },true);
 menuBtn.setAttribute('aria-expanded','false');
 searchBtn.setAttribute('aria-expanded','false');
 window.__ZEMTOOLS_NAV_READY=true;
})();