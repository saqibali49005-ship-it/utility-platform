(function(){'use strict';
const m=document.getElementById('menuBtn'),n=document.getElementById('mobileNav'),s=document.getElementById('searchBtn'),p=document.getElementById('searchPanel'),i=document.getElementById('siteSearch'),f=document.getElementById('siteSearchForm');
const navItems=[['index.html','Home'],['tools.html','All Tools'],['math-science.html','Math & Science'],['digital-developer.html','Digital & Developer'],['home-construction.html','Home & Construction'],['energy-electrical.html','Energy & Electrical']];
function syncNav(el){if(!el)return;const current=location.pathname.split('/').pop()||'index.html';el.innerHTML=navItems.map(([href,label])=>'<a '+(href===current?'aria-current="page" ':'')+'href="'+href+'">'+label+'</a>').join('');}
syncNav(document.querySelector('.top-nav'));syncNav(n);
if(m&&n)m.onclick=()=>{const o=n.classList.toggle('open');m.setAttribute('aria-expanded',o)};
if(s&&p)s.onclick=()=>{const o=p.classList.toggle('open');s.setAttribute('aria-expanded',o);if(o&&i)i.focus();if(n)n.classList.remove('open')};
if(f&&i)f.onsubmit=e=>{e.preventDefault();const q=i.value.trim();if(q)location.href='tools.html?q='+encodeURIComponent(q)};
})();