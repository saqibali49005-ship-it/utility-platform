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
function loadSharedNavigation(){
 if(window.__zemtoolsNavigationRequested)return;
 window.__zemtoolsNavigationRequested=true;
 var script=document.createElement('script');
 script.src='/zemtools-navigation.js';
 script.async=true;
 script.onload=function(){window.__zemtoolsNavigationLoaded=true;};
 script.onerror=function(){window.__zemtoolsNavigationError=true;};
 document.head.appendChild(script);
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
initPreviewNavigation();
loadSharedNavigation();
initReport();
initToolCalculateTracking();
})();
