(function(){'use strict';
if(!window.__zemtoolsGa4Loaded){
 window.__zemtoolsGa4Loaded=true;
 var gaScript=document.createElement('script');
 gaScript.async=true;
 gaScript.src='https://www.googletagmanager.com/gtag/js?id=G-LX61P24FYK';
 document.head.appendChild(gaScript);
 window.dataLayer=window.dataLayer||[];
 window.gtag=function(){window.dataLayer.push(arguments);};
 window.gtag('js',new Date());
 window.gtag('config','G-LX61P24FYK');
}

 // Privacy-conscious Mixpanel analytics. Use the official browser SDK module from a
 // general-purpose CDN because tracker-blocking lists can block cdn.mxpnl.com.
 // No calculator field values, textarea contents, or calculated results are sent.
 (function initZemToolsMixpanel(){
  if(window.__zemtoolsMixpanelLoaded)return;
  window.__zemtoolsMixpanelLoaded=true;
  import('https://cdn.jsdelivr.net/npm/mixpanel-browser@2.85.0/dist/mixpanel.module.js')
   .then(function(module){
    var mixpanel=module&&module.default;
    if(!mixpanel||typeof mixpanel.init!=='function')throw new Error('Mixpanel SDK unavailable');
    mixpanel.init('d20a7eedae0ea7140b9bb609e20418e6',{autocapture:false,track_pageview:false,ip:false,persistence:'localStorage',record_sessions_percent:0});
    window.mixpanel=mixpanel;
    var pagePath=location.pathname;
    var heading=document.querySelector('main h1');
    var toolName=document.body.classList.contains('tool-page')&&heading?heading.textContent.trim():'';
    var pageProps={page_path:pagePath,page_type:toolName?'tool':(document.body.classList.contains('home-page')?'home':'content')};
    mixpanel.track('Page Viewed',pageProps);
    if(toolName)mixpanel.track('Tool Opened',{tool_name:toolName,page_path:pagePath});
    document.addEventListener('click',function(event){
     var button=event.target&&event.target.closest?event.target.closest('button'):null;
     if(!button||button.disabled)return;
     var label=(button.getAttribute('aria-label')||button.textContent||'').trim().toLowerCase();
     var action='';
     if(/\b(calculate|convert|generate|check result)\b/.test(label))action='calculate';
     else if(/\b(copy|copy result|copy output)\b/.test(label))action='copy';
     else if(/\b(download|export)\b/.test(label))action='download';
     if(!action)return;
     mixpanel.track('Tool Action',{action:action,tool_name:toolName||'none',page_path:pagePath});
    },true);
   })
   .catch(function(error){
    window.__zemtoolsMixpanelLoaded=false;
    if(window.console&&console.warn)console.warn('ZemTools analytics could not load.',error);
   });
 })();

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
 function closeMenu(){if(menu)menu.classList.remove('is-open');if(menuBtn)menuBtn.setAttribute('aria-expanded','false');}
 render('');
 if(searchBtn&&searchPanel){
  searchBtn.addEventListener('click',function(e){e.stopPropagation();const open=!searchPanel.classList.contains('open');closeMenu();searchPanel.classList.toggle('open',open);searchBtn.setAttribute('aria-expanded',String(open));if(open&&searchInput)searchInput.focus();});
 }
 if(searchInput)searchInput.addEventListener('input',function(){render(searchInput.value);});
 if(searchForm&&searchInput)searchForm.addEventListener('submit',function(e){e.preventDefault();const q=searchInput.value.trim();if(q)location.href='tools/?q='+encodeURIComponent(q);});
 if(menuBtn&&menu){
  menuBtn.addEventListener('click',function(e){e.stopPropagation();const open=!menu.classList.contains('is-open');closeSearch();menu.classList.toggle('is-open',open);menuBtn.setAttribute('aria-expanded',String(open));});
 }
 document.addEventListener('click',function(e){
  if(!e.target.closest('#toolHeaderSearchPanel')&&!e.target.closest('#toolHeaderSearch'))closeSearch();
  if(!e.target.closest('#toolHeaderMenuPanel')&&!e.target.closest('#toolHeaderMenu'))closeMenu();
 });
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
