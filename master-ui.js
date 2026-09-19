(function(){'use strict';
const m=document.getElementById('menuBtn'),n=document.getElementById('mobileNav'),s=document.getElementById('searchBtn'),p=document.getElementById('searchPanel'),i=document.getElementById('siteSearch'),f=document.getElementById('siteSearchForm');
const navItems=[['index.html','Home'],['tools.html','All Tools'],['math-science.html','Math & Science'],['digital-developer.html','Digital & Developer'],['home-construction.html','Home & Construction'],['energy-electrical.html','Energy & Electrical']];
function syncNav(el){if(!el)return;const current=location.pathname.split('/').pop()||'index.html';el.innerHTML=navItems.map(([href,label])=>'<a '+(href===current?'aria-current="page" ':'')+'href="'+href+'">'+label+'</a>').join('');}
syncNav(document.querySelector('.top-nav'));syncNav(n);
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
initSearch();
})();