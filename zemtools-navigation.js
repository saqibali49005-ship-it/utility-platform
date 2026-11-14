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

/* Footer-only update: preserve the live header and use the approved branded footer. */
html body>footer.zt-global-footer{
 box-sizing:border-box!important;display:block!important;position:relative!important;float:none!important;clear:both!important;
 width:100%!important;max-width:none!important;min-width:0!important;min-height:112px!important;height:112px!important;
 margin:30px 0 0!important;padding:0!important;left:auto!important;right:auto!important;transform:none!important;
 overflow:hidden!important;background:linear-gradient(105deg,#0a2e62 0%,#064783 100%)!important;
 border:0!important;border-top:1px solid rgba(255,255,255,.12)!important;border-radius:0!important;color:#fff!important;
 text-align:left!important;box-shadow:none!important;line-height:normal!important;
}
html body>footer.zt-global-footer::before,html body>footer.zt-global-footer::after{content:none!important;display:none!important}
html body>footer.zt-global-footer *{box-sizing:border-box!important}
html body>footer.zt-global-footer>div.zt-footer-inner{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:18px!important;
 width:100%!important;max-width:1120px!important;height:72px!important;min-height:72px!important;margin:0 auto!important;padding:12px 18px!important}
html body>footer.zt-global-footer .zt-footer-brand{display:flex!important;align-items:center!important;gap:9px!important;flex:0 0 auto!important;margin:0!important;padding:0!important;color:#fff!important;text-decoration:none!important}
html body>footer.zt-global-footer .zt-footer-mark{display:grid!important;place-items:center!important;width:36px!important;height:36px!important;flex:0 0 36px!important;border-radius:11px!important;background:rgba(255,255,255,.12)!important;color:#fff!important;font:900 17px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important}
html body>footer.zt-global-footer .zt-footer-name{display:block!important;color:#fff!important;font:850 15px/1.1 system-ui,-apple-system,"Segoe UI",sans-serif!important}
html body>footer.zt-global-footer .zt-footer-links{display:flex!important;align-items:center!important;justify-content:flex-end!important;flex-wrap:nowrap!important;gap:18px!important;margin:0!important;padding:0!important;list-style:none!important}
html body>footer.zt-global-footer .zt-footer-links a{display:inline-flex!important;align-items:center!important;min-height:32px!important;margin:0!important;padding:4px 0!important;background:transparent!important;border:0!important;color:rgba(255,255,255,.92)!important;text-decoration:none!important;font:650 13px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif!important;white-space:nowrap!important}
html body>footer.zt-global-footer .zt-footer-links a:hover,html body>footer.zt-global-footer .zt-footer-links a:focus-visible{color:#fff!important;text-decoration:underline!important;text-underline-offset:3px!important}
html body>footer.zt-global-footer .zt-footer-copyright{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:39px!important;min-height:39px!important;margin:0!important;padding:0 16px!important;border-top:1px solid rgba(255,255,255,.16)!important;color:rgba(255,255,255,.78)!important;text-align:center!important;font:400 11px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif!important}
@media(max-width:650px){
 html body>footer.zt-global-footer{height:150px!important;min-height:150px!important;margin-top:24px!important}
 html body>footer.zt-global-footer>div.zt-footer-inner{height:110px!important;min-height:110px!important;flex-direction:column!important;justify-content:center!important;gap:9px!important;padding:11px 12px!important}
 html body>footer.zt-global-footer .zt-footer-links{justify-content:center!important;flex-wrap:wrap!important;gap:4px 17px!important}
 html body>footer.zt-global-footer .zt-footer-links a{min-height:27px!important;font-size:12px!important}
 html body>footer.zt-global-footer .zt-footer-copyright{height:39px!important;min-height:39px!important}
}


/* Approved ZemTools compact desktop navigation and responsive mobile drawer. */
.site-header{position:sticky!important;top:0!important;z-index:1000!important;overflow:visible!important;background:rgba(255,255,255,.97)!important}
.site-header .header-inner{
 width:min(calc(100% - 40px),1180px)!important;max-width:1180px!important;min-height:76px!important;
 margin:0 auto!important;padding:10px 0!important;display:flex!important;flex-direction:row!important;
 align-items:center!important;justify-content:space-between!important;gap:22px!important;flex-wrap:nowrap!important;
 position:relative!important;overflow:visible!important
}
.site-header .brand{display:flex!important;align-items:center!important;gap:11px!important;flex:0 0 190px!important;min-width:190px!important;padding:0!important;color:#101d33!important;text-decoration:none!important;white-space:nowrap!important}
.site-header .brand .brand-mark{width:42px!important;height:42px!important;display:grid!important;place-items:center!important;flex:0 0 42px!important;border-radius:13px!important;background:linear-gradient(145deg,#1d4ed8,#0785c8)!important;color:#fff!important;font-size:21px!important;font-weight:900!important;box-shadow:0 6px 15px rgba(29,78,216,.18)!important}
.site-header .brand .brand-copy{display:flex!important;flex-direction:column!important;gap:2px!important;min-width:0!important;line-height:1.12!important}
.site-header .brand .brand-copy strong{display:block!important;color:#111c30!important;font-size:17px!important;font-weight:850!important;letter-spacing:-.4px!important}
.site-header .brand .brand-copy small{display:block!important;color:#718096!important;font-size:10px!important;font-weight:600!important;letter-spacing:.1px!important}
.site-header .brand::before,.site-header .brand::after{content:none!important;display:none!important}
.site-header .top-nav{
 display:flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;
 flex:1 1 auto!important;min-width:0!important;margin:0!important;padding:4px!important;
 background:#f7f9fc!important;border:1px solid #e1e7ef!important;border-radius:14px!important;
 box-shadow:inset 0 1px 0 rgba(255,255,255,.95)!important;flex-wrap:nowrap!important;overflow:visible!important
}
.site-header .top-nav>a,.site-header .zt-category-toggle{
 display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;
 min-height:40px!important;padding:8px 13px!important;margin:0!important;border:1px solid transparent!important;
 border-radius:10px!important;background:transparent!important;color:#475569!important;text-decoration:none!important;
 font:750 13px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important;white-space:nowrap!important;cursor:pointer!important
}
.site-header .top-nav>a:hover,.site-header .zt-category-toggle:hover{background:#fff!important;color:#164db6!important;border-color:#d7e0eb!important}
.site-header .top-nav>a[aria-current=page]{background:#eaf2ff!important;color:#1d4ed8!important;border-color:#cfe0ff!important}
.site-header .zt-category-toggle span{font-size:16px!important;line-height:1!important;transition:transform .18s ease!important}
.site-header .zt-category-toggle[aria-expanded=true] span{transform:rotate(180deg)!important}
.site-header .zt-nav-actions{display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;margin-left:auto!important;flex:0 0 auto!important}
.site-header .zt-nav-toggle{width:42px!important;height:42px!important;min-width:42px!important;min-height:42px!important;display:grid!important;place-items:center!important;flex:0 0 42px!important;padding:0!important;border:1px solid #d8e5f3!important;border-radius:12px!important;background:#fff!important;color:#12345d!important;cursor:pointer!important;line-height:0!important}
.site-header .zt-nav-toggle:hover{background:#f4f8fd!important;border-color:#9dbfe2!important}
.site-header .zt-nav-toggle svg{width:20px!important;height:20px!important;display:block!important;fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important}
.site-header .zt-nav-search-toggle{display:grid!important}
.site-header .zt-nav-menu-toggle{display:none!important}
.site-header .zt-nav-categories-panel{
 display:none!important;position:absolute!important;top:calc(100% - 1px)!important;left:190px!important;right:0!important;
 z-index:10020!important;padding:20px 22px 22px!important;background:#fff!important;
 border:1px solid #e1e8f1!important;border-radius:0 0 18px 18px!important;box-shadow:0 18px 36px rgba(15,35,65,.14)!important
}
.site-header .zt-nav-categories-panel.zt-nav-open{display:block!important}
.site-header .zt-category-panel-heading{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:16px!important;margin-bottom:14px!important}
.site-header .zt-category-panel-heading>div{display:grid!important;gap:3px!important}
.site-header .zt-category-panel-heading strong{font-size:15px!important;color:#16253b!important}
.site-header .zt-category-panel-heading span{font-size:12px!important;color:#718096!important}
.site-header .zt-category-panel-heading>a{color:#1d5bc2!important;text-decoration:none!important;font-size:12px!important;font-weight:750!important}
.site-header .zt-category-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
.site-header .zt-category-grid>a{display:flex!important;align-items:center!important;gap:11px!important;min-width:0!important;padding:12px!important;border:1px solid #e8edf4!important;border-radius:12px!important;color:#25364e!important;text-decoration:none!important}
.site-header .zt-category-grid>a:hover{background:#f7faff!important;border-color:#c8daf4!important}
.site-header .zt-category-grid>a[aria-current=page]{background:#edf4ff!important;border-color:#d6e6ff!important}
.site-header .zt-category-icon{width:38px!important;height:38px!important;display:grid!important;place-items:center!important;flex:0 0 38px!important;border-radius:11px!important;background:#edf4ff!important;color:#1d5bc2!important;font-size:18px!important;font-weight:800!important}
.site-header .zt-category-copy{display:grid!important;gap:3px!important;min-width:0!important}
.site-header .zt-category-copy strong{font-size:13px!important;font-weight:750!important;color:#20324b!important}
.site-header .zt-category-copy small{font-size:11px!important;color:#78869a!important}
.site-header .zt-category-arrow{margin-left:auto!important;color:#8a9bb0!important;font-size:17px!important}
.site-header .zt-nav-menu-label{padding:13px 12px 6px!important;color:#8190a4!important;font-size:10px!important;font-weight:850!important;letter-spacing:.1em!important;text-transform:uppercase!important}
.site-header .zt-nav-menu-panel a span{margin-left:auto!important;color:#8795a8!important;font-size:11px!important}
.site-header .zt-nav-menu-panel a{pointer-events:auto!important;position:relative!important;z-index:1!important}
@media(max-width:1050px) and (min-width:981px){
 .site-header .header-inner{gap:14px!important}
 .site-header .brand{flex-basis:175px!important;min-width:175px!important}
 .site-header .top-nav>a,.site-header .zt-category-toggle{padding-left:9px!important;padding-right:9px!important;font-size:12px!important}
}
@media(min-width:981px){
 .site-header .zt-nav-menu-toggle{display:none!important}
 .site-header .top-nav{display:flex!important}
 .site-header .zt-nav-categories-panel{display:none!important}
 .site-header .zt-nav-categories-panel.zt-nav-open{display:block!important}
}
@media(max-width:980px){
 .site-header .header-inner{width:calc(100% - 28px)!important;max-width:none!important;min-height:66px!important;padding:9px 0!important;gap:10px!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;flex-wrap:nowrap!important}
 .site-header .brand{flex:1 1 auto!important;min-width:0!important;gap:9px!important}
 .site-header .brand .brand-mark{width:39px!important;height:39px!important;flex-basis:39px!important;border-radius:12px!important;font-size:19px!important}
 .site-header .brand .brand-copy strong{font-size:16px!important}
 .site-header .brand .brand-copy small{font-size:9.5px!important}
 .site-header .top-nav{display:none!important;visibility:hidden!important}
 .site-header .zt-nav-actions{display:flex!important;gap:7px!important;margin-left:auto!important;flex:0 0 auto!important}
 .site-header .zt-nav-toggle{width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;flex-basis:40px!important}
 .site-header .zt-nav-menu-toggle{display:grid!important}
 .site-header .zt-nav-categories-panel{display:none!important}
 .site-header .zt-nav-menu-panel{
  display:none!important;position:absolute!important;top:100%!important;left:0!important;right:0!important;
  z-index:12000!important;width:auto!important;max-width:none!important;max-height:calc(100dvh - 74px)!important;
  overflow:auto!important;margin:0!important;padding:9px!important;gap:5px!important;
  border:1px solid #dfe6ef!important;border-radius:0 0 16px 16px!important;background:#fff!important;
  box-shadow:0 18px 30px rgba(15,23,42,.14)!important;pointer-events:none!important
 }
 .site-header .zt-nav-menu-panel.zt-nav-open{display:grid!important;pointer-events:auto!important}
 .site-header .zt-nav-menu-panel a{display:flex!important;align-items:center!important;min-height:42px!important;padding:11px 12px!important;border-radius:9px!important;background:#f7f9fc!important;color:#334155!important;text-decoration:none!important;font-size:14px!important;font-weight:700!important;pointer-events:auto!important}
 .site-header .zt-nav-menu-panel a:hover,.site-header .zt-nav-menu-panel a:focus-visible{background:#eff6ff!important;color:#1d4ed8!important}
 .site-header .zt-nav-search-panel{position:absolute!important;top:100%!important;left:0!important;right:0!important;width:100%!important;max-width:none!important}
}
@media(max-width:420px){.site-header .header-inner{width:calc(100% - 24px)!important}.site-header .brand .brand-copy small{font-size:9px!important}}

html body>footer.zt-global-footer .zt-footer-copy{display:grid!important;gap:2px!important;min-width:0!important}
html body>footer.zt-global-footer .zt-footer-tagline{display:block!important;color:rgba(255,255,255,.76)!important;font:600 10px/1.15 system-ui,-apple-system,"Segoe UI",sans-serif!important;white-space:nowrap!important}

html body.category-page .site-header .brand::before,
html body.category-page .site-header .brand::after,
html body.info-page-shell .site-header .brand::before,
html body.info-page-shell .site-header .brand::after,
html body.category-page .site-header .brand .brand-mark,
html body.info-page-shell .site-header .brand .brand-mark,
html body .site-header .brand .brand-mark{display:grid!important;visibility:visible!important;opacity:1!important;width:42px!important;height:42px!important;flex:0 0 42px!important;place-items:center!important;border-radius:13px!important;background:linear-gradient(145deg,#1d4ed8,#0785c8)!important;color:#fff!important;font-size:21px!important;font-weight:900!important;box-shadow:0 6px 15px rgba(29,78,216,.18)!important}
html body .site-header .brand::before,
html body .site-header .brand::after{content:none!important;display:none!important}

.site-header .zt-brand{display:flex!important;align-items:center!important;gap:11px!important;flex:0 0 190px!important;min-width:190px!important;padding:0!important;color:#101d33!important;text-decoration:none!important;white-space:nowrap!important}
.site-header .zt-brand .brand-mark{width:42px!important;height:42px!important;display:grid!important;place-items:center!important;flex:0 0 42px!important;border-radius:13px!important;background:linear-gradient(145deg,#1d4ed8,#0785c8)!important;color:#fff!important;font-size:21px!important;font-weight:900!important;box-shadow:0 6px 15px rgba(29,78,216,.18)!important}
.site-header .zt-brand .brand-copy{display:flex!important;flex-direction:column!important;gap:2px!important;min-width:0!important;line-height:1.12!important}
.site-header .zt-brand .brand-copy strong{display:block!important;color:#111c30!important;font-size:17px!important;font-weight:850!important;letter-spacing:-.4px!important}
.site-header .zt-brand .brand-copy small{display:block!important;color:#718096!important;font-size:10px!important;font-weight:600!important;letter-spacing:.1px!important}
@media(max-width:1050px) and (min-width:981px){.site-header .zt-brand{flex-basis:175px!important;min-width:175px!important}}
@media(max-width:980px){
 .site-header .zt-brand{flex:1 1 auto!important;min-width:0!important;gap:9px!important}
 .site-header .zt-brand .brand-mark{width:39px!important;height:39px!important;flex-basis:39px!important;border-radius:12px!important;font-size:19px!important}
 .site-header .zt-brand .brand-copy strong{font-size:16px!important}
 .site-header .zt-brand .brand-copy small{font-size:9.5px!important}
}
@media(max-width:420px){.site-header .zt-brand .brand-copy small{font-size:9px!important}}
`;
 const style=document.createElement('style');
 style.id='zemtools-navigation-v1';
 style.textContent=css;
 document.head.appendChild(style);

 const header=document.querySelector('.site-header');
 if(!header){window.__ZEMTOOLS_NAV_READY=true;return;}
 const inner=header.querySelector('.header-inner')||header;
 const brand=header.querySelector('a.brand');
 if(brand){
  brand.setAttribute('href','/');
  brand.setAttribute('aria-label','ZemTools home');
  brand.classList.remove('brand');
  brand.classList.add('zt-brand');
  brand.innerHTML='<span class="brand-mark" aria-hidden="true">Z</span><span class="brand-copy"><strong>ZemTools</strong><small>Practical online tools</small></span>';
 }
 const topNav=header.querySelector('.top-nav');
 const currentPath=location.pathname.replace(/\/+$/,'')||'/';
 const categories=Array.isArray(window.UTILITY_CATEGORIES)?window.UTILITY_CATEGORIES:[
  {id:'math-science',title:'Math & Science',href:'math-science/',icon:'∑'},
  {id:'home-construction',title:'Home & Construction',href:'home-construction/',icon:'⌂'},
  {id:'energy-electrical',title:'Energy & Electrical',href:'energy-electrical/',icon:'ϟ'},
  {id:'digital-developer',title:'Digital & Developer',href:'digital-developer/',icon:'<>'}
 ];
 const catalog=Array.isArray(window.UTILITY_TOOLS)?window.UTILITY_TOOLS:[];
 const activeCategories=categories.filter(c=>c.href&&(!catalog.length||catalog.some(t=>t.category===c.id)));
 const countFor=id=>catalog.filter(t=>t.category===id).length;
 const categoryHref=c=>'/'+String(c.href||'').replace(/^\/+/, '');
 const categoryCards=activeCategories.map(c=>{
  const count=countFor(c.id);
  const href=categoryHref(c);
  const active=currentPath===href.replace(/\/+$/,'');
  return '<a href="'+href+'"'+(active?' aria-current="page"':'')+'><span class="zt-category-icon" aria-hidden="true">'+(c.icon||'•')+'</span><span class="zt-category-copy"><strong>'+c.title+'</strong><small>'+(catalog.length?count+' '+(count===1?'tool':'tools'):'Browse tools')+'</small></span><span class="zt-category-arrow" aria-hidden="true">→</span></a>';
 }).join('');
 if(topNav){
  topNav.innerHTML='<a href="/"'+(currentPath==='/'?' aria-current="page"':'')+'>Home</a><a href="/tools/"'+(currentPath==='/tools'?' aria-current="page"':'')+'>All Tools</a><button class="zt-category-toggle" id="ztCategoryToggle" type="button" aria-expanded="false" aria-controls="ztCategoryPanel">Categories <span aria-hidden="true">⌄</span></button>';

 }
 let categoryPanel=header.querySelector('#ztCategoryPanel');
 if(!categoryPanel){
  categoryPanel=document.createElement('section');
  categoryPanel.id='ztCategoryPanel';
  categoryPanel.className='zt-nav-categories-panel';
  categoryPanel.setAttribute('aria-label','Browse tool categories');
  categoryPanel.innerHTML='<div class="zt-category-panel-heading"><div><strong>Explore categories</strong><span>Find the right tool for the job</span></div><a href="/tools/">Browse all tools →</a></div><div class="zt-category-grid">'+categoryCards+'</div>';
  if(topNav)topNav.insertAdjacentElement('afterend',categoryPanel);else inner.appendChild(categoryPanel);
 }
 const categoryButton=header.querySelector('#ztCategoryToggle');

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
 menuPanel.innerHTML='<a href="/"'+(currentPath==='/'?' aria-current="page"':'')+'>Home</a><a href="/tools/"'+(currentPath==='/tools'?' aria-current="page"':'')+'>All Tools</a><div class="zt-nav-menu-label">Categories</div>'+activeCategories.map(c=>'<a href="'+categoryHref(c)+'"'+(currentPath===categoryHref(c).replace(/\/+$/,'')?' aria-current="page"':'')+'>'+c.title+' <span>'+(catalog.length?countFor(c.id):'')+'</span></a>').join('');

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
  const kind=button===menuBtn?'menu':(button===categoryButton?'categories':'search');
  button.setAttribute('aria-label',open?'Close '+kind:(kind==='categories'?'Open categories':(kind==='menu'?'Open menu':'Open site search')));
 }
 function closeMenu(){setOpen(menuPanel,menuBtn,false);}
 function closeSearch(){if(searchPanel)setOpen(searchPanel,searchBtn,false);}
 function closeCategories(){if(categoryPanel&&categoryButton)setOpen(categoryPanel,categoryButton,false);}
 function openSearch(){
  closeMenu();
  closeCategories();
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
  closeCategories();
  setOpen(menuPanel,menuBtn,!menuPanel.classList.contains('zt-nav-open'));
 }
 function openCategories(){
  closeMenu();
  closeSearch();
  if(categoryPanel&&categoryButton)setOpen(categoryPanel,categoryButton,!categoryPanel.classList.contains('zt-nav-open'));
 }
 document.addEventListener('click',function(e){
  const categoryClick=e.target.closest&&e.target.closest('.zt-category-toggle');
  if(categoryClick===categoryButton){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openCategories();return;}
  const menuClick=e.target.closest&&e.target.closest('.zt-nav-menu-toggle');
  if(menuClick===menuBtn){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openMenu();return;}
  const searchClick=e.target.closest&&e.target.closest('.zt-nav-search-toggle');
  if(searchClick===searchBtn){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openSearch();return;}
  if(menuPanel&&!menuPanel.contains(e.target))closeMenu();
  if(searchPanel&&!searchPanel.contains(e.target))closeSearch();
  if(categoryPanel&&!categoryPanel.contains(e.target)&&!categoryButton?.contains(e.target))closeCategories();
  if(menuPanel&&menuPanel.contains(e.target)&&e.target.closest('a[href]'))closeMenu();
  if(categoryPanel&&categoryPanel.contains(e.target)&&e.target.closest('a[href]'))closeCategories();
 },true);
 document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){closeMenu();closeSearch();closeCategories();}
 },true);
 menuBtn.setAttribute('aria-expanded','false');
 searchBtn.setAttribute('aria-expanded','false');
 if(categoryButton)categoryButton.setAttribute('aria-expanded','false');

 function createFooter(){
  let footer=document.querySelector('footer');
  if(!footer)footer=document.createElement('footer');
  footer.className='zt-global-footer';
  footer.removeAttribute('style');
  footer.innerHTML='';
  const inner=document.createElement('div');inner.className='zt-footer-inner';
  const brand=document.createElement('a');brand.className='zt-footer-brand';brand.href='/';brand.setAttribute('aria-label','ZemTools home');
  const mark=document.createElement('span');mark.className='zt-footer-mark';mark.textContent='Z';mark.setAttribute('aria-hidden','true');
  const copy=document.createElement('span');copy.className='zt-footer-copy';
  const name=document.createElement('span');name.className='zt-footer-name';name.textContent='ZemTools';
  const tagline=document.createElement('span');tagline.className='zt-footer-tagline';tagline.textContent='Practical online tools';
  copy.append(name,tagline);
  brand.append(mark,copy);
  const nav=document.createElement('nav');nav.className='zt-footer-links';nav.setAttribute('aria-label','Footer navigation');
  [{label:'About',href:'/about/'},{label:'Contact',href:'/contact/'},{label:'Privacy',href:'/privacy/'},{label:'Terms',href:'/terms/'}].forEach(item=>{
   const a=document.createElement('a');a.href=item.href;a.textContent=item.label;nav.appendChild(a);
  });
  inner.append(brand,nav);
  const copyright=document.createElement('div');copyright.className='zt-footer-copyright';copyright.textContent='© 2026 ZemTools';
  footer.append(inner,copyright);
  document.body.appendChild(footer);
 }
 createFooter();
 window.__ZEMTOOLS_NAV_READY=true;
})();