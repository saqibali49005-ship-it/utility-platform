/* ZemTools unified site shell — one header, one search/menu system, one footer.
   Shared across every published page. Page content and calculator controls are untouched. */
(function(){
 'use strict';
 if(window.__ZEMTOOLS_SHELL_V2__) return;
 window.__ZEMTOOLS_SHELL_V2__=true;

 const css=`
/* Shared header geometry */
html body>header.site-header.zt-global-header{
 box-sizing:border-box!important;display:block!important;position:sticky!important;top:0!important;z-index:10000!important;
 width:100%!important;height:72px!important;min-height:72px!important;max-height:72px!important;
 margin:0!important;padding:0!important;overflow:visible!important;background:rgba(255,255,255,.98)!important;
 border:0!important;border-bottom:1px solid #dfe6ef!important;box-shadow:0 5px 22px rgba(15,23,42,.055)!important;
 backdrop-filter:saturate(160%) blur(10px)!important;
}
html body>header.site-header.zt-global-header *,
html body>footer.zt-global-footer *{box-sizing:border-box!important}
.zt-header-inner{position:relative!important;display:flex!important;align-items:center!important;gap:14px!important;
 width:100%!important;max-width:1120px!important;height:72px!important;min-height:72px!important;
 margin:0 auto!important;padding:0 18px!important;overflow:visible!important}
.zt-brand{display:flex!important;align-items:center!important;gap:9px!important;flex:0 0 auto!important;
 min-width:0!important;margin:0!important;padding:0!important;color:#0b1220!important;text-decoration:none!important;
 white-space:nowrap!important;font:850 16px/1.1 system-ui,-apple-system,"Segoe UI",sans-serif!important;letter-spacing:-.25px!important}
.zt-brand-mark{display:grid!important;place-items:center!important;width:38px!important;height:38px!important;flex:0 0 38px!important;
 border-radius:12px!important;background:linear-gradient(135deg,#2563eb,#0ea5e9)!important;color:#fff!important;
 box-shadow:0 7px 18px rgba(37,99,235,.20)!important;font:900 18px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important}
.zt-brand-name{display:block!important;color:#0b1220!important;font:850 16px/1.1 system-ui,-apple-system,"Segoe UI",sans-serif!important;letter-spacing:-.25px!important}
.zt-primary-nav{display:flex!important;align-items:center!important;justify-content:center!important;flex:1 1 auto!important;gap:3px!important;
 min-width:0!important;min-height:46px!important;margin:0!important;padding:4px!important;overflow:hidden!important;
 background:#f7f9fc!important;border:1px solid #e1e7ef!important;border-radius:13px!important}
.zt-primary-nav a{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 1 auto!important;
 min-width:0!important;min-height:36px!important;margin:0!important;padding:7px 9px!important;border:1px solid transparent!important;
 border-radius:9px!important;background:transparent!important;color:#475569!important;text-decoration:none!important;
 white-space:nowrap!important;font:760 12px/1.15 system-ui,-apple-system,"Segoe UI",sans-serif!important}
.zt-primary-nav a:hover,.zt-primary-nav a:focus-visible{background:#fff!important;border-color:#d7e0eb!important;color:#0b1220!important}
.zt-primary-nav a[aria-current="page"]{background:#eaf2ff!important;border-color:#cfe0ff!important;color:#1d4ed8!important}
.zt-header-controls{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;
 flex:0 0 auto!important;margin:0 0 0 auto!important;padding:0!important}
.zt-header-action{display:grid!important;place-items:center!important;flex:0 0 40px!important;width:40px!important;height:40px!important;
 min-width:40px!important;min-height:40px!important;margin:0!important;padding:0!important;border:1px solid #d8e5f3!important;
 border-radius:11px!important;background:#fff!important;color:#12345d!important;cursor:pointer!important;line-height:0!important;
 box-shadow:none!important}
.zt-header-action:hover{background:#f4f8fd!important;border-color:#9dbfe2!important}
.zt-header-action:focus-visible{outline:3px solid rgba(37,99,235,.25)!important;outline-offset:2px!important}
.zt-header-action svg{display:block!important;width:20px!important;height:20px!important;fill:none!important;stroke:currentColor!important;
 stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important}
.zt-menu-panel,.zt-search-panel{display:none!important;position:absolute!important;top:calc(100% + 8px)!important;right:12px!important;left:auto!important;
 z-index:10020!important;margin:0!important;overflow:auto!important;max-height:min(70vh,560px)!important;
 background:#fff!important;border:1px solid #dfe6ef!important;border-radius:14px!important;box-shadow:0 14px 34px rgba(15,23,42,.16)!important;
 opacity:1!important;pointer-events:none!important}
.zt-menu-panel{width:min(320px,calc(100vw - 24px))!important;max-width:calc(100vw - 24px)!important;padding:8px!important;gap:5px!important}
.zt-search-panel{width:min(460px,calc(100vw - 24px))!important;max-width:calc(100vw - 24px)!important;padding:12px!important}
.zt-menu-panel.zt-panel-open{display:grid!important;pointer-events:auto!important}
.zt-search-panel.zt-panel-open{display:block!important;pointer-events:auto!important}
.zt-menu-panel a{display:flex!important;align-items:center!important;width:100%!important;min-height:42px!important;margin:0!important;padding:10px 12px!important;
 border:1px solid transparent!important;border-radius:9px!important;background:#f7f9fc!important;color:#334155!important;
 text-decoration:none!important;font:750 14px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif!important}
.zt-menu-panel a:hover,.zt-menu-panel a:focus-visible{background:#eff6ff!important;border-color:#cfe0ff!important;color:#1d4ed8!important}
.zt-menu-panel a[aria-current="page"]{background:#eaf2ff!important;color:#1d4ed8!important}
.zt-search-panel form{display:flex!important;align-items:stretch!important;gap:8px!important;width:100%!important;margin:0!important;padding:0!important}
.zt-search-panel label.zt-sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
.zt-search-panel input[type="search"]{display:block!important;flex:1 1 auto!important;width:100%!important;min-width:0!important;min-height:44px!important;
 margin:0!important;padding:10px 12px!important;border:1px solid #cbd5e1!important;border-radius:10px!important;background:#fff!important;
 color:#111827!important;font:400 15px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif!important;box-shadow:none!important}
.zt-search-panel button[type="submit"]{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 auto!important;
 min-height:44px!important;margin:0!important;padding:9px 15px!important;border:0!important;border-radius:10px!important;
 background:#1767e7!important;color:#fff!important;font:800 14px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important;cursor:pointer!important}
.zt-search-results{display:grid!important;gap:4px!important;margin-top:9px!important}
.zt-search-results a{display:block!important;padding:9px 10px!important;border-radius:8px!important;color:#334155!important;
 text-decoration:none!important;font:650 13px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif!important}
.zt-search-results a:hover,.zt-search-results a:focus-visible{background:#f1f5f9!important;color:#1d4ed8!important}
.zt-search-empty{padding:10px!important;color:#64748b!important;font:400 13px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif!important}

/* Shared footer geometry and spacing */
html body>footer.zt-global-footer{
 display:block!important;position:relative!important;float:none!important;clear:both!important;
 width:100%!important;max-width:none!important;min-width:0!important;min-height:112px!important;height:112px!important;
 margin:30px 0 0!important;padding:0!important;left:auto!important;right:auto!important;transform:none!important;
 overflow:hidden!important;background:#fff!important;background-image:none!important;border:0!important;
 border-top:1px solid #dfe6ef!important;border-radius:0!important;color:#526174!important;text-align:left!important;
 box-shadow:none!important;line-height:normal!important;
}
html body>footer.zt-global-footer::before,html body>footer.zt-global-footer::after{content:none!important;display:none!important}
.zt-footer-inner{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:18px!important;
 width:100%!important;max-width:1120px!important;height:72px!important;min-height:72px!important;
 margin:0 auto!important;padding:12px 18px!important}
.zt-footer-brand{display:flex!important;align-items:center!important;gap:9px!important;flex:0 0 auto!important;
 margin:0!important;padding:0!important;color:#0b1220!important;text-decoration:none!important}
.zt-footer-mark{display:grid!important;place-items:center!important;width:36px!important;height:36px!important;flex:0 0 36px!important;
 border-radius:11px!important;background:linear-gradient(135deg,#2563eb,#0ea5e9)!important;color:#fff!important;
 font:900 17px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important}
.zt-footer-name{display:block!important;color:#0b1220!important;font:850 15px/1.1 system-ui,-apple-system,"Segoe UI",sans-serif!important}
.zt-footer-links{display:flex!important;align-items:center!important;justify-content:flex-end!important;flex-wrap:nowrap!important;
 gap:18px!important;margin:0!important;padding:0!important;list-style:none!important}
.zt-footer-links a{display:inline-flex!important;align-items:center!important;min-height:32px!important;margin:0!important;padding:4px 0!important;
 background:transparent!important;border:0!important;color:#475569!important;text-decoration:none!important;
 font:650 13px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif!important;white-space:nowrap!important}
.zt-footer-links a:hover,.zt-footer-links a:focus-visible{color:#1d4ed8!important;text-decoration:underline!important;text-underline-offset:3px!important}
.zt-footer-copyright{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:39px!important;
 min-height:39px!important;margin:0!important;padding:0 16px!important;border-top:1px solid #edf1f5!important;
 color:#718096!important;text-align:center!important;font:400 11px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif!important}
@media(max-width:1100px){
 .zt-header-inner{gap:12px!important}
 .zt-primary-nav{display:none!important}
}
@media(max-width:650px){
 html body>header.site-header.zt-global-header{height:64px!important;min-height:64px!important;max-height:64px!important}
 .zt-header-inner{height:64px!important;min-height:64px!important;padding:0 12px!important;gap:8px!important}
 .zt-brand{gap:8px!important;font-size:15.5px!important}
 .zt-brand-mark{width:36px!important;height:36px!important;flex-basis:36px!important;border-radius:11px!important;font-size:17px!important}
 .zt-brand-name{font-size:15.5px!important}
 .zt-header-controls{gap:7px!important}
 .zt-header-action{width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;flex-basis:40px!important}
 html body>footer.zt-global-footer{height:150px!important;min-height:150px!important;margin-top:24px!important}
 .zt-footer-inner{height:110px!important;min-height:110px!important;flex-direction:column!important;justify-content:center!important;gap:9px!important;padding:11px 12px!important}
 .zt-footer-links{justify-content:center!important;flex-wrap:wrap!important;gap:4px 17px!important}
 .zt-footer-links a{min-height:27px!important;font-size:12px!important}
 .zt-footer-copyright{height:39px!important;min-height:39px!important}
}
@media(prefers-reduced-motion:reduce){
 .zt-menu-panel,.zt-search-panel{scroll-behavior:auto!important;transition:none!important;animation:none!important}
}
`;
 const style=document.createElement('style');
 style.id='zemtools-unified-shell-v2';
 style.textContent=css;
 document.head.appendChild(style);

 const navItems=[
  {label:'Home',href:'/'},{label:'All Tools',href:'/tools/'},{label:'Math & Science',href:'/math-science/'},
  {label:'Digital & Developer',href:'/digital-developer/'},{label:'Home & Construction',href:'/home-construction/'},
  {label:'Energy & Electrical',href:'/energy-electrical/'}
 ];
 const footerItems=[{label:'About',href:'/about/'},{label:'Contact',href:'/contact/'},{label:'Privacy',href:'/privacy/'},{label:'Terms',href:'/terms/'}];
 const isMathPage=document.body.classList.contains('math-science-page');
 const current=location.pathname.replace(/index\.html$/,'').replace(/\/{2,}/g,'/').replace(/\/?$/,'/');
 const linkIsCurrent=href=>current===href;
 const makeLink=(item,cls)=>{
  const a=document.createElement('a');a.href=item.href;a.textContent=item.label;
  if(cls)a.className=cls;
  if(linkIsCurrent(item.href))a.setAttribute('aria-current','page');
  return a;
 };

 function createHeader(){
  let header=document.querySelector('header.site-header')||document.querySelector('header');
  if(!header){header=document.createElement('header');}
  header.className='site-header zt-global-header';
  header.setAttribute('role','banner');
  header.setAttribute('aria-label','ZemTools site header');
  header.innerHTML='';

  const inner=document.createElement('div');inner.className='zt-header-inner';
  const brand=document.createElement('a');brand.className='zt-brand';brand.href='/';brand.setAttribute('aria-label','ZemTools home');
  const mark=document.createElement('span');mark.className='zt-brand-mark';mark.textContent='Z';mark.setAttribute('aria-hidden','true');
  const name=document.createElement('span');name.className='zt-brand-name';name.textContent='ZemTools';
  brand.append(mark,name);

  const primary=document.createElement('nav');primary.className='zt-primary-nav';primary.setAttribute('aria-label','Primary navigation');
  navItems.forEach(item=>primary.appendChild(makeLink(item)));

  const controls=document.createElement('div');controls.className='zt-header-controls';controls.setAttribute('aria-label','Header controls');
  const searchButton=document.createElement('button');searchButton.type='button';searchButton.className='zt-header-action zt-search-toggle zt-nav-toggle zt-nav-search-toggle';
  searchButton.id=isMathPage?'mathHeaderSearch':'ztGlobalSearchToggle';searchButton.setAttribute('aria-label','Open site search');searchButton.setAttribute('aria-expanded','false');searchButton.title='Search';
  searchButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.2"></circle><path d="M15.4 15.4L20 20"></path></svg>';
  const menuButton=document.createElement('button');menuButton.type='button';menuButton.className='zt-header-action zt-menu-toggle zt-nav-toggle zt-nav-menu-toggle';
  menuButton.id=isMathPage?'mathHeaderMenu':'ztGlobalMenuToggle';menuButton.setAttribute('aria-label','Open menu');menuButton.setAttribute('aria-expanded','false');menuButton.title='Menu';
  menuButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>';
  controls.append(searchButton,menuButton);

  const searchPanel=document.createElement('section');searchPanel.className='zt-search-panel zt-nav-search-panel';searchPanel.id=isMathPage?'mathLocalSearch':'ztGlobalSearchPanel';
  searchPanel.setAttribute('aria-label','Search tools');searchPanel.setAttribute('aria-hidden','true');
  const form=document.createElement('form');form.setAttribute('role','search');form.action='/tools/';form.method='get';
  const label=document.createElement('label');label.className='zt-sr-only';label.textContent='Search tools';
  const input=document.createElement('input');input.type='search';input.id=isMathPage?'mathLocalSearchInput':'ztGlobalSearchInput';input.name='q';input.placeholder='Search tools or describe your task…';input.autocomplete='off';input.setAttribute('aria-label','Search tools');
  const submit=document.createElement('button');submit.type='submit';submit.textContent='Search';
  const results=document.createElement('div');results.className='zt-search-results';results.id=isMathPage?'mathLocalSearchResults':'ztGlobalSearchResults';results.setAttribute('aria-live','polite');
  form.append(label,input,submit);searchPanel.append(form,results);

  const menuPanel=document.createElement('nav');menuPanel.className='zt-menu-panel zt-nav-menu-panel';menuPanel.id=isMathPage?'mathHeaderMenuPanel':'ztGlobalMenuPanel';
  menuPanel.setAttribute('aria-label','Site menu');menuPanel.setAttribute('aria-hidden','true');
  searchButton.setAttribute('aria-controls',searchPanel.id);
  menuButton.setAttribute('aria-controls',menuPanel.id);
  label.htmlFor=input.id;
  navItems.forEach(item=>menuPanel.appendChild(makeLink(item)));

  inner.append(brand,primary,controls,searchPanel,menuPanel);
  header.appendChild(inner);
  if(header.parentElement!==document.body)document.body.insertBefore(header,document.body.firstChild);
  else if(document.body.firstElementChild!==header)document.body.insertBefore(header,document.body.firstElementChild);
  return {header,searchButton,menuButton,searchPanel,menuPanel,input,form,results};
 }

 function createFooter(){
  let footer=document.querySelector('footer');
  if(!footer)footer=document.createElement('footer');
  footer.className='zt-global-footer';
  footer.removeAttribute('style');
  footer.innerHTML='';

  const inner=document.createElement('div');inner.className='zt-footer-inner';
  const brand=document.createElement('a');brand.className='zt-footer-brand';brand.href='/';brand.setAttribute('aria-label','ZemTools home');
  const mark=document.createElement('span');mark.className='zt-footer-mark';mark.textContent='Z';mark.setAttribute('aria-hidden','true');
  const name=document.createElement('span');name.className='zt-footer-name';name.textContent='ZemTools';
  brand.append(mark,name);
  const nav=document.createElement('nav');nav.className='zt-footer-links';nav.setAttribute('aria-label','Footer navigation');
  footerItems.forEach(item=>nav.appendChild(makeLink(item)));
  inner.append(brand,nav);
  const copyright=document.createElement('div');copyright.className='zt-footer-copyright';copyright.textContent='© 2026 ZemTools';
  footer.append(inner,copyright);
  document.body.appendChild(footer);
  return footer;
 }

 const shell=createHeader();
 const footer=createFooter();

 const catalog=isMathPage?[
  {title:'Significant Figures Calculator',href:'/calculator/'},
  {title:'Time Calculator',href:'/time-calculator/'},
  {title:'Business Hours Calculator',href:'/business-hours-calculator/'}
 ]:(Array.isArray(window.UTILITY_TOOLS)?window.UTILITY_TOOLS:[]);
 function renderResults(query){
  shell.results.replaceChildren();
  const term=String(query||'').trim().toLowerCase();
  const matches=(term
   ? catalog.filter(tool=>{
      const keywords=Array.isArray(tool.keywords)?tool.keywords.join(' '):'';
      return [tool.title,tool.description,keywords].join(' ').toLowerCase().includes(term);
     })
   : catalog
  ).slice(0,7);
  if(!matches.length){
   const empty=document.createElement('div');empty.className='zt-search-empty';
   empty.textContent=term?'No matching tool found. Try a different phrase.':'Search by a tool name or task.';
   shell.results.appendChild(empty);return;
  }
  matches.forEach(tool=>{
   if(!tool.href||!tool.title)return;
   const a=document.createElement('a');
   const path=String(tool.href);
   a.href=/^(https?:)?\/\//i.test(path)?path:(path.startsWith('/')?path:'/'+path);
   a.textContent=tool.title;
   shell.results.appendChild(a);
  });
 }
 shell.input.addEventListener('input',()=>renderResults(shell.input.value));
 shell.form.addEventListener('submit',event=>{
  event.preventDefault();
  const query=shell.input.value.trim();
  if(query)location.href='/tools/?q='+encodeURIComponent(query);
 });
 renderResults('');

 let lastTrigger=null;
 function setPanel(panel,button,open){
  panel.classList.toggle('zt-panel-open',open);
  panel.classList.toggle('is-open',open);
  panel.classList.toggle('open',open);
  panel.setAttribute('aria-hidden',String(!open));
  button.setAttribute('aria-expanded',String(open));
  button.setAttribute('aria-label',open?'Close '+(button===shell.menuButton?'menu':'search'):'Open '+(button===shell.menuButton?'menu':'site search'));
 }
 function closeMenu(){if(shell.menuPanel.classList.contains('zt-panel-open'))setPanel(shell.menuPanel,shell.menuButton,false);}
 function closeSearch(){if(shell.searchPanel.classList.contains('zt-panel-open'))setPanel(shell.searchPanel,shell.searchButton,false);}
 shell.menuButton.addEventListener('click',()=>{
  const open=!shell.menuPanel.classList.contains('zt-panel-open');
  closeSearch();setPanel(shell.menuPanel,shell.menuButton,open);lastTrigger=shell.menuButton;
 });
 shell.searchButton.addEventListener('click',()=>{
  const open=!shell.searchPanel.classList.contains('zt-panel-open');
  closeMenu();setPanel(shell.searchPanel,shell.searchButton,open);lastTrigger=shell.searchButton;
  if(open){renderResults(shell.input.value);shell.input.focus({preventScroll:true});}
 });
 document.addEventListener('click',event=>{
  const inMenu=shell.menuPanel.contains(event.target)||shell.menuButton.contains(event.target);
  const inSearch=shell.searchPanel.contains(event.target)||shell.searchButton.contains(event.target);
  if(!inMenu)closeMenu();
  if(!inSearch)closeSearch();
  if(shell.menuPanel.contains(event.target)&&event.target.closest('a[href]'))closeMenu();
  if(shell.searchPanel.contains(event.target)&&event.target.closest('.zt-search-results a'))closeSearch();
 });
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const wasOpen=shell.menuPanel.classList.contains('zt-panel-open')||shell.searchPanel.classList.contains('zt-panel-open');
  closeMenu();closeSearch();
  if(wasOpen&&lastTrigger){lastTrigger.focus({preventScroll:true});lastTrigger=null;}
 });

 window.__ZEMTOOLS_NAV_READY=true;
 window.__ZEMTOOLS_SHELL_VERSION='2.0.0';
})();
