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

/* Professional shared header system — one layout across all page types. */
html body .site-header{
 box-sizing:border-box!important;position:sticky!important;top:0!important;z-index:10000!important;width:100%!important;
 min-height:76px!important;height:76px!important;max-height:76px!important;
 margin:0!important;padding:0!important;background:rgba(255,255,255,.97)!important;
 border:0!important;border-bottom:1px solid #e2eaf3!important;
 box-shadow:0 5px 22px rgba(15,23,42,.055)!important;
 backdrop-filter:saturate(160%) blur(12px)!important;
}
html body .site-header .header-inner{
 box-sizing:border-box!important;position:relative!important;display:flex!important;align-items:center!important;justify-content:space-between!important;
 gap:20px!important;width:100%!important;max-width:1200px!important;height:76px!important;min-height:76px!important;
 margin:0 auto!important;padding:0 22px!important;overflow:visible!important;flex-wrap:nowrap!important;
}
html body .site-header .brand{
 display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;
 flex:0 0 auto!important;min-width:0!important;margin:0!important;padding:0!important;
 color:#0b1e36!important;text-decoration:none!important;white-space:nowrap!important;
}
html body .site-header .brand .brand-mark{
 display:grid!important;place-items:center!important;width:42px!important;height:42px!important;flex:0 0 42px!important;
 margin:0!important;border:0!important;border-radius:13px!important;
 background:linear-gradient(135deg,#1767e7 0%,#10a6dc 100%)!important;
 color:#fff!important;font:900 20px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important;
 box-shadow:0 7px 18px rgba(23,103,231,.20)!important;
}
html body .site-header .zt-brand-copy{
 display:flex!important;flex-direction:column!important;justify-content:center!important;gap:3px!important;
 min-width:0!important;margin:0!important;padding:0!important;
}
html body .site-header .zt-brand-copy strong{
 display:block!important;margin:0!important;padding:0!important;color:#0b1e36!important;
 font:850 16px/1.05 system-ui,-apple-system,"Segoe UI",sans-serif!important;letter-spacing:-.3px!important;
}
html body .site-header .zt-brand-copy small{
 display:block!important;margin:0!important;padding:0!important;color:#718096!important;
 font:500 10.5px/1.1 system-ui,-apple-system,"Segoe UI",sans-serif!important;letter-spacing:.05px!important;
}
html body .site-header .top-nav{
 position:relative!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;
 gap:5px!important;flex:1 1 auto!important;min-width:0!important;margin:0 0 0 16px!important;padding:0!important;
 border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;
 overflow:visible!important;
}
html body .site-header .top-nav>a,
html body .site-header .zt-category-toggle{
 display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;
 min-height:42px!important;margin:0!important;padding:9px 12px!important;border:1px solid transparent!important;
 border-radius:10px!important;background:transparent!important;color:#40536b!important;
 text-decoration:none!important;white-space:nowrap!important;
 font:750 13px/1.1 system-ui,-apple-system,"Segoe UI",sans-serif!important;
 cursor:pointer!important;box-shadow:none!important;
}
html body .site-header .top-nav>a:hover,
html body .site-header .zt-category-toggle:hover{
 background:#f5f8fc!important;border-color:#e5ecf4!important;color:#0f2f55!important;
}
html body .site-header .top-nav>a[aria-current="page"]{
 background:#edf4ff!important;border-color:#d9e8ff!important;color:#145fc8!important;
}
html body .site-header .zt-category-toggle[aria-expanded="true"]{
 background:#edf4ff!important;border-color:#d9e8ff!important;color:#145fc8!important;
}
html body .site-header .zt-category-toggle svg{
 width:15px!important;height:15px!important;display:block!important;fill:none!important;stroke:currentColor!important;
 stroke-width:2!important;stroke-linecap:round!important;stroke-linejoin:round!important;
}
html body .site-header .header-actions,
html body .site-header .home-header-controls,
html body .site-header .tools-header-controls,
html body .site-header .category-header-controls,
html body .site-header .math-header-controls,
html body .site-header .digital-header-controls,
html body .site-header .zt-nav-actions{
 display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;
 flex:0 0 auto!important;margin:0 0 0 auto!important;padding:0!important;
}
html body .site-header .zt-nav-search-toggle{
 display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;
 width:166px!important;min-width:166px!important;max-width:166px!important;height:42px!important;min-height:42px!important;
 flex:0 0 166px!important;margin:0!important;padding:0 11px!important;
 border:1px solid #d9e4f0!important;border-radius:11px!important;background:#f8fafc!important;color:#40536b!important;
 box-shadow:inset 0 1px 0 rgba(255,255,255,.95)!important;cursor:pointer!important;
 font:650 12.5px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important;
}
html body .site-header .zt-nav-search-toggle:hover{
 background:#fff!important;border-color:#a9c6e8!important;color:#174d88!important;
 box-shadow:0 4px 14px rgba(27,83,139,.08)!important;
}
html body .site-header .zt-nav-search-toggle svg{
 display:block!important;width:18px!important;height:18px!important;flex:0 0 18px!important;
 fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important;
}
html body .site-header .zt-search-label{display:block!important;white-space:nowrap!important}
html body .site-header .zt-search-shortcut{
 display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:19px!important;height:21px!important;
 margin-left:auto!important;padding:0 5px!important;border:1px solid #e2e8f0!important;border-radius:5px!important;
 background:#fff!important;color:#8290a2!important;font:650 11px/1 ui-monospace,SFMono-Regular,Consolas,monospace!important;
}
html body .site-header .zt-nav-menu-toggle{
 display:none!important;place-items:center!important;width:42px!important;height:42px!important;min-width:42px!important;
 min-height:42px!important;flex:0 0 42px!important;margin:0!important;padding:0!important;
 border:1px solid #d9e4f0!important;border-radius:11px!important;background:#fff!important;color:#12345d!important;cursor:pointer!important;
}
html body .site-header .zt-nav-menu-toggle svg{
 display:block!important;width:20px!important;height:20px!important;fill:none!important;stroke:currentColor!important;
 stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important;
}
html body .site-header .zt-category-panel{
 display:none!important;position:absolute!important;top:calc(100% + 12px)!important;left:50%!important;right:auto!important;
 z-index:10030!important;transform:translateX(-50%)!important;width:min(540px,calc(100vw - 32px))!important;
 max-width:calc(100vw - 32px)!important;padding:15px!important;margin:0!important;
 grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;
 border:1px solid #dce6f1!important;border-radius:16px!important;background:#fff!important;
 box-shadow:0 18px 42px rgba(10,35,67,.17)!important;
}
html body .site-header .zt-category-panel.zt-category-open{display:grid!important}
html body .site-header .zt-category-panel-heading{
 grid-column:1/-1!important;display:flex!important;flex-direction:column!important;gap:3px!important;
 margin:0 0 4px!important;padding:2px 3px 9px!important;border-bottom:1px solid #edf1f6!important;
}
html body .site-header .zt-category-panel-heading strong{
 color:#102b4d!important;font:850 14px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif!important;
}
html body .site-header .zt-category-panel-heading small{
 color:#7a899a!important;font:450 11px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif!important;
}
html body .site-header .zt-category-card{
 display:flex!important;align-items:center!important;gap:10px!important;min-width:0!important;min-height:68px!important;
 margin:0!important;padding:10px!important;border:1px solid #edf1f6!important;border-radius:11px!important;
 background:#fff!important;color:#233d5c!important;text-decoration:none!important;
}
html body .site-header .zt-category-card:hover,
html body .site-header .zt-category-card:focus-visible{
 border-color:#c7dcf7!important;background:#f6faff!important;color:#145fc8!important;
}
html body .site-header .zt-category-card[aria-current="page"]{
 border-color:#c7dcf7!important;background:#edf4ff!important;color:#145fc8!important;
}
html body .site-header .zt-category-icon{
 display:grid!important;place-items:center!important;width:36px!important;height:36px!important;flex:0 0 36px!important;
 border-radius:10px!important;background:#edf4ff!important;color:#1767d5!important;
 font:850 16px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important;
}
html body .site-header .zt-category-copy{display:flex!important;flex-direction:column!important;gap:3px!important;min-width:0!important}
html body .site-header .zt-category-copy strong{
 display:block!important;color:inherit!important;font:800 12px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif!important;
}
html body .site-header .zt-category-copy small{
 display:block!important;color:#8492a3!important;font:450 10px/1.25 system-ui,-apple-system,"Segoe UI",sans-serif!important;
}
html body .site-header .zt-category-arrow{
 margin-left:auto!important;color:#9aa8b8!important;font:700 14px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important;
}
html body .site-header .zt-nav-menu-panel{
 display:none!important;position:absolute!important;top:calc(100% + 8px)!important;right:12px!important;left:auto!important;
 z-index:10031!important;width:min(390px,calc(100vw - 24px))!important;max-width:calc(100vw - 24px)!important;
 max-height:min(76vh,620px)!important;overflow:auto!important;margin:0!important;padding:12px!important;gap:6px!important;
 border:1px solid #dce6f1!important;border-radius:16px!important;background:#fff!important;
 box-shadow:0 18px 42px rgba(10,35,67,.17)!important;pointer-events:none!important;
}
html body .site-header .zt-nav-menu-panel.zt-nav-open{display:grid!important;pointer-events:auto!important}
html body .site-header .zt-mobile-menu-primary{display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important;margin:0!important}
html body .site-header .zt-mobile-menu-primary a{
 display:flex!important;align-items:center!important;min-height:42px!important;margin:0!important;padding:10px 11px!important;
 border:1px solid #e7edf5!important;border-radius:10px!important;background:#f8fafc!important;color:#294564!important;
 text-decoration:none!important;font:750 12px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif!important;
}
html body .site-header .zt-mobile-menu-heading{
 margin:10px 2px 3px!important;padding:5px 0!important;color:#74849a!important;
 font:800 10px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important;letter-spacing:.09em!important;text-transform:uppercase!important;
}
html body .site-header .zt-mobile-category-grid{
 display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important;
}
html body .site-header .zt-mobile-category-grid a{
 display:flex!important;align-items:center!important;min-width:0!important;min-height:50px!important;gap:8px!important;
 margin:0!important;padding:8px!important;border:1px solid #e8eef5!important;border-radius:10px!important;
 background:#fff!important;color:#34506f!important;text-decoration:none!important;
 font:750 11px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif!important;
}
html body .site-header .zt-mobile-category-grid a[aria-current="page"]{
 border-color:#c7dcf7!important;background:#edf4ff!important;color:#145fc8!important;
}
html body .site-header .zt-mobile-category-grid .zt-category-icon{width:29px!important;height:29px!important;flex-basis:29px!important;font-size:13px!important}
html body .site-header .zt-mobile-menu-footer{
 display:flex!important;align-items:center!important;gap:17px!important;margin:8px 2px 0!important;padding:9px 0 1px!important;
 border-top:1px solid #edf1f6!important;
}
html body .site-header .zt-mobile-menu-footer a{
 color:#718096!important;text-decoration:none!important;font:650 11px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif!important;
}
html body .site-header .zt-nav-search-panel{
 display:none!important;position:absolute!important;top:calc(100% + 10px)!important;right:18px!important;left:auto!important;
 z-index:10032!important;width:min(460px,calc(100vw - 28px))!important;max-width:calc(100vw - 28px)!important;
 max-height:min(70vh,560px)!important;overflow:auto!important;margin:0!important;padding:14px!important;
 border:1px solid #dce6f1!important;border-radius:15px!important;background:#fff!important;
 box-shadow:0 18px 42px rgba(10,35,67,.17)!important;pointer-events:none!important;
}
html body .site-header .zt-nav-search-panel.zt-nav-open{display:block!important;pointer-events:auto!important}
html body .site-header .zt-nav-search-panel form{
 display:flex!important;align-items:stretch!important;gap:8px!important;width:100%!important;margin:0!important;padding:0!important;
}
html body .site-header .zt-nav-search-panel input[type="search"],
html body .site-header .zt-nav-search-panel input[type="text"]{
 display:block!important;flex:1 1 auto!important;width:100%!important;min-width:0!important;min-height:46px!important;
 margin:0!important;padding:11px 13px!important;border:1px solid #cbd8e7!important;border-radius:10px!important;
 background:#fff!important;color:#102b4d!important;font:450 14px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif!important;
 box-shadow:none!important;
}
html body .site-header .zt-nav-search-panel button[type="submit"]{
 display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:46px!important;
 margin:0!important;padding:10px 16px!important;border:0!important;border-radius:10px!important;
 background:#1767e7!important;color:#fff!important;font:800 13px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important;cursor:pointer!important;
}
html body .site-header .zt-nav-search-panel .tool-header-empty,
html body .site-header .zt-nav-search-panel .zt-search-empty{
 margin-top:9px!important;padding:8px!important;color:#718096!important;font-size:12px!important;
}
html body main .zt-category-search-inline{
 display:block!important;position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;
 width:min(720px,100%)!important;max-width:720px!important;height:auto!important;min-height:0!important;
 margin:14px 0 24px!important;padding:0!important;border:0!important;background:transparent!important;
 box-shadow:none!important;opacity:1!important;visibility:visible!important;transform:none!important;
}
html body main .zt-category-search-inline form{
 display:flex!important;align-items:stretch!important;gap:8px!important;width:100%!important;margin:0!important;padding:0!important;
}
html body main .zt-category-search-inline input[type="search"],
html body main .zt-category-search-inline input[type="text"]{
 display:block!important;flex:1 1 auto!important;width:100%!important;min-width:0!important;min-height:48px!important;
 margin:0!important;padding:11px 14px!important;border:1px solid #cbd8e7!important;border-radius:12px!important;
 background:#fff!important;color:#102b4d!important;font:450 14px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif!important;
 box-shadow:0 5px 18px rgba(15,42,74,.045)!important;
}
html body main .zt-category-search-inline button[type="submit"]{
 display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:48px!important;
 margin:0!important;padding:10px 16px!important;border:0!important;border-radius:11px!important;
 background:#1767e7!important;color:#fff!important;font:800 13px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important;
}
@media(max-width:1100px){
 html body .site-header{min-height:68px!important;height:68px!important;max-height:68px!important}
 html body .site-header .header-inner{max-width:none!important;height:68px!important;min-height:68px!important;padding:0 18px!important;gap:10px!important}
 html body .site-header .top-nav{display:none!important}
 html body .site-header .zt-nav-menu-toggle{display:grid!important}
 html body .site-header .zt-nav-search-toggle{width:42px!important;min-width:42px!important;max-width:42px!important;flex-basis:42px!important;justify-content:center!important;padding:0!important}
 html body .site-header .zt-search-label,
 html body .site-header .zt-search-shortcut{display:none!important}
 html body .site-header .zt-nav-search-panel{right:12px!important}
}
@media(max-width:650px){
 html body .site-header{min-height:64px!important;height:64px!important;max-height:64px!important}
 html body .site-header .header-inner{height:64px!important;min-height:64px!important;padding:0 12px!important;gap:8px!important}
 html body .site-header .brand{gap:8px!important}
 html body .site-header .brand .brand-mark{width:36px!important;height:36px!important;flex-basis:36px!important;border-radius:11px!important;font-size:17px!important}
 html body .site-header .zt-brand-copy strong{font-size:15.5px!important}
 html body .site-header .zt-brand-copy small{display:none!important}
 html body .site-header .zt-nav-search-toggle,
 html body .site-header .zt-nav-menu-toggle{width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;flex-basis:40px!important}
 html body .site-header .header-actions,
 html body .site-header .home-header-controls,
 html body .site-header .tools-header-controls,
 html body .site-header .category-header-controls,
 html body .site-header .math-header-controls,
 html body .site-header .digital-header-controls,
 html body .site-header .zt-nav-actions{gap:7px!important}
 html body .site-header .zt-nav-menu-panel{right:8px!important;width:calc(100vw - 16px)!important;max-width:calc(100vw - 16px)!important}
 html body .site-header .zt-nav-search-panel{right:8px!important;width:calc(100vw - 16px)!important;max-width:calc(100vw - 16px)!important;padding:11px!important}
 html body .site-header .zt-nav-search-panel form,
 html body main .zt-category-search-inline form{gap:7px!important}
 html body main .zt-category-search-inline{margin:12px 0 20px!important}
 html body main .zt-category-search-inline button[type="submit"]{padding:10px 12px!important}
}
@media(prefers-reduced-motion:reduce){
 html body .site-header .zt-category-panel,
 html body .site-header .zt-nav-menu-panel,
 html body .site-header .zt-nav-search-panel{transition:none!important;animation:none!important;scroll-behavior:auto!important}
}

`;
 const style=document.createElement('style');
 style.id='zemtools-navigation-v1';
 style.textContent=css;
 document.head.appendChild(style);


 const header=document.querySelector('.site-header');
 if(!header){window.__ZEMTOOLS_NAV_READY=true;return;}
 const inner=header.querySelector('.header-inner')||header;
 const normalizeHref=value=>{
  const raw=String(value||'').trim();
  if(!raw)return '/';
  if(/^(?:[a-z]+:|#|\/)/i.test(raw))return raw;
  return '/'+raw.replace(/^\.\//,'');
 };
 const brand=header.querySelector('a.brand');
 if(brand){
  brand.setAttribute('href','/');
  brand.setAttribute('aria-label','ZemTools home');
  let mark=brand.querySelector('.brand-mark');
  if(!mark){mark=document.createElement('span');mark.className='brand-mark';mark.textContent='Z';}
  const copy=document.createElement('span');copy.className='zt-brand-copy';
  const brandName=document.createElement('strong');brandName.textContent='ZemTools';
  const tagline=document.createElement('small');tagline.textContent='Practical online tools';
  copy.append(brandName,tagline);
  brand.replaceChildren(mark,copy);
 }
 
 /* Keep each page's useful category search, but put it in the page content.
    The global header search button will focus this contextual field. */
 const contextualSearch=document.querySelector('#mathLocalSearch,#digitalLocalSearch,#categoryHeaderSearchPanel');
 if(contextualSearch){
  contextualSearch.classList.remove('category-header-panel','zt-nav-search-panel','zt-nav-open','is-open','open');
  contextualSearch.classList.add('zt-category-search-inline');
  contextualSearch.removeAttribute('aria-hidden');
  contextualSearch.style.setProperty('display','block','important');
  contextualSearch.style.setProperty('position','relative','important');
  contextualSearch.style.setProperty('top','auto','important');
  contextualSearch.style.setProperty('right','auto','important');
  contextualSearch.style.setProperty('left','auto','important');
  contextualSearch.style.setProperty('width','100%','important');
  contextualSearch.style.setProperty('max-width','720px','important');
  contextualSearch.style.setProperty('height','auto','important');
  const main=document.querySelector('main');
  if(main&&!main.contains(contextualSearch)){
   const heading=main.querySelector('.heading')||main.querySelector('.category-intro');
   const h1=main.querySelector('h1');
   if(heading&&heading!==contextualSearch){
    heading.insertAdjacentElement('afterend',contextualSearch);
   }else if(h1&&h1!==contextualSearch){
    h1.insertAdjacentElement('afterend',contextualSearch);
   }else{
    main.insertBefore(contextualSearch,main.firstChild);
   }
  }
 }
 
 let topNav=header.querySelector('.top-nav');
 if(!topNav){
  topNav=document.createElement('nav');topNav.className='top-nav';
  topNav.setAttribute('aria-label','Primary navigation');
  inner.appendChild(topNav);
 }
 const oldLinks=[...topNav.querySelectorAll('a[href]')];
 const findLink=(predicate,fallbackLabel,fallbackHref)=>{
  const found=oldLinks.find(a=>predicate(normalizeHref(a.getAttribute('href')),a.textContent||''));
  if(found)return found;
  const a=document.createElement('a');a.href=fallbackHref;a.textContent=fallbackLabel;return a;
 };
 const homeLink=findLink(href=>href==='/', 'Home','/');
 const toolsLink=findLink(href=>href.replace(/\/+$/,'')==='/tools', 'All Tools','/tools/');
 const categoryMeta=[
  {href:'/math-science/',label:'Math & Science',icon:'∑',description:'Math, time and measurement calculators'},
  {href:'/digital-developer/',label:'Digital & Developer',icon:'</>',description:'Text, web and developer utilities'},
  {href:'/home-construction/',label:'Home & Construction',icon:'⌂',description:'Materials, layout and project planning'},
  {href:'/energy-electrical/',label:'Energy & Electrical',icon:'ϟ',description:'Wiring, circuits and electrical tools'}
 ];
 const categoryLinks=categoryMeta.map(meta=>{
  const original=oldLinks.find(a=>normalizeHref(a.getAttribute('href'))===meta.href);
  const link=original||document.createElement('a');
  link.href=meta.href;
  link.textContent=meta.label;
  link.classList.remove('zt-category-card');
  if(original?.getAttribute('aria-current')==='page')link.setAttribute('aria-current','page');
  return {...meta,link};
 });
 [homeLink,toolsLink,...categoryLinks.map(x=>x.link)].forEach(a=>a.href=normalizeHref(a.getAttribute('href')));
 
 topNav.classList.add('zt-primary-nav');
 topNav.setAttribute('aria-label','Primary navigation');
 const categoryButton=document.createElement('button');
 categoryButton.type='button';categoryButton.className='zt-category-toggle';
 categoryButton.setAttribute('aria-label','Browse categories');
 categoryButton.setAttribute('aria-haspopup','true');
 categoryButton.setAttribute('aria-expanded','false');
 categoryButton.innerHTML='<span>Categories</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>';
 const categoryPanel=document.createElement('div');
 categoryPanel.className='zt-category-panel';
 categoryPanel.id='ztCategoryPanel';
 categoryPanel.setAttribute('role','region');
 categoryPanel.setAttribute('aria-label','Browse tool categories');
 categoryPanel.setAttribute('aria-hidden','true');
 const categoryHeading=document.createElement('div');categoryHeading.className='zt-category-panel-heading';
 const categoryHeadingTitle=document.createElement('strong');categoryHeadingTitle.textContent='Browse categories';
 const categoryHeadingSub=document.createElement('small');categoryHeadingSub.textContent='Choose an area to find the right tool';
 categoryHeading.append(categoryHeadingTitle,categoryHeadingSub);categoryPanel.appendChild(categoryHeading);
 categoryLinks.forEach(meta=>{
  const a=meta.link.cloneNode(true);a.className='zt-category-card';
  const icon=document.createElement('span');icon.className='zt-category-icon';icon.textContent=meta.icon;icon.setAttribute('aria-hidden','true');
  const copy=document.createElement('span');copy.className='zt-category-copy';
  const title=document.createElement('strong');title.textContent=meta.label;
  const desc=document.createElement('small');desc.textContent=meta.description;
  copy.append(title,desc);
  const arrow=document.createElement('span');arrow.className='zt-category-arrow';arrow.textContent='›';arrow.setAttribute('aria-hidden','true');
  a.replaceChildren(icon,copy,arrow);categoryPanel.appendChild(a);
 });
 categoryButton.setAttribute('aria-controls',categoryPanel.id);
 topNav.replaceChildren(homeLink,toolsLink,categoryButton,categoryPanel);
 
 function actionContainer(){
  let el=header.querySelector('.header-actions,.home-header-controls,.tools-header-controls,.category-header-controls,.math-header-controls,.digital-header-controls');
  if(!el){el=document.createElement('div');el.className='header-actions';inner.appendChild(el);}
  el.classList.add('zt-nav-actions');
  return el;
 }
 const actions=actionContainer();
 function makeButton(kind){
  const b=document.createElement('button');b.type='button';
  b.className='icon-btn zt-nav-toggle zt-nav-'+kind+'-toggle';
  b.setAttribute('aria-label',kind==='menu'?'Open menu':'Search tools');b.setAttribute('aria-expanded','false');
  b.title=kind==='menu'?'Menu':'Search tools';
  b.innerHTML=kind==='menu'
   ?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>'
   :'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.2"></circle><path d="M15.4 15.4L20 20"></path></svg>';
  return b;
 }
 let menuButtons=[...header.querySelectorAll('button[id$="Menu"],button.menu-btn,[data-zt-nav-toggle="menu"]')];
 let menuBtn=menuButtons[0];
 if(!menuBtn){menuBtn=makeButton('menu');actions.appendChild(menuBtn);}
 menuButtons.slice(1).forEach(b=>b.remove());
 menuBtn.classList.add('zt-nav-toggle','zt-nav-menu-toggle');menuBtn.type='button';
 menuBtn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>';
 menuBtn.setAttribute('aria-label','Open menu');menuBtn.title='Menu';
 const menuBreakpoint=window.matchMedia('(max-width: 1100px)');
 const syncMenuVisibility=()=>menuBtn.style.setProperty('display',menuBreakpoint.matches?'grid':'none','important');
 syncMenuVisibility();
 if(typeof menuBreakpoint.addEventListener==='function')menuBreakpoint.addEventListener('change',syncMenuVisibility);
 
 let searchButtons=[...header.querySelectorAll('button[id$="Search"],[data-zt-nav-toggle="search"]')];
 let searchBtn=searchButtons[0];
 if(!searchBtn){searchBtn=makeButton('search');actions.insertBefore(searchBtn,menuBtn);}
 searchButtons.slice(1).forEach(b=>b.remove());
 searchBtn.classList.add('zt-nav-toggle','zt-nav-search-toggle');searchBtn.type='button';
 searchBtn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.2"></circle><path d="M15.4 15.4L20 20"></path></svg><span class="zt-search-label">Search tools</span><kbd class="zt-search-shortcut">/</kbd>';
 searchBtn.setAttribute('aria-label','Search tools');searchBtn.title='Search tools';
 actions.append(searchBtn,menuBtn);
 
 function menuPanelFor(button){
  const known={infoHeaderMenu:'infoMobileNav',notFoundMenu:'notFoundMobileNav'};
  const id=button.getAttribute('aria-controls')||known[button.id]||button.id.replace(/Menu$/,'MenuPanel');
  let panel=id?document.getElementById(id):null;
  if(!panel){panel=document.createElement('nav');panel.id=id||'ztNavMenuPanel';inner.appendChild(panel);}
  button.setAttribute('aria-controls',panel.id);
  panel.className='zt-nav-menu-panel';panel.setAttribute('aria-label','Site navigation');
  panel.innerHTML='';
  const primary=document.createElement('div');primary.className='zt-mobile-menu-primary';
  [homeLink,toolsLink].forEach(source=>{const a=source.cloneNode(true);a.removeAttribute('class');primary.appendChild(a);});
  const heading=document.createElement('div');heading.className='zt-mobile-menu-heading';heading.textContent='Categories';
  const grid=document.createElement('div');grid.className='zt-mobile-category-grid';
  categoryLinks.forEach(meta=>{
   const a=meta.link.cloneNode(true);a.className='';
   const icon=document.createElement('span');icon.className='zt-category-icon';icon.textContent=meta.icon;icon.setAttribute('aria-hidden','true');
   const title=document.createElement('span');title.textContent=meta.label;
   a.replaceChildren(icon,title);grid.appendChild(a);
  });
  const foot=document.createElement('div');foot.className='zt-mobile-menu-footer';
  [['About','/about/'],['Contact','/contact/']].forEach(item=>{const a=document.createElement('a');a.href=item[1];a.textContent=item[0];foot.appendChild(a);});
  panel.append(primary,heading,grid,foot);
  panel.classList.remove('zt-nav-open','is-open','open');panel.setAttribute('aria-hidden','true');
  return panel;
 }
 const menuPanel=menuPanelFor(menuBtn);
 
 function searchPanelFor(button){
  const known={toolHeaderSearch:'toolHeaderSearchPanel',categoryHeaderSearch:'categoryHeaderSearchPanel',mathHeaderSearch:'mathLocalSearch',digitalHeaderSearch:'digitalLocalSearch'};
  const id=button.getAttribute('aria-controls')||known[button.id]||button.id.replace(/Search$/,'SearchPanel');
  let panel=id?document.getElementById(id):null;
  if(!panel||panel.classList.contains('zt-category-search-inline'))return null;
  button.setAttribute('aria-controls',panel.id);
  panel.classList.add('zt-nav-search-panel');
  panel.classList.remove('zt-nav-open','is-open','open');
  panel.setAttribute('aria-hidden','true');
  return panel;
 }
 let searchPanel=searchPanelFor(searchBtn);
 /* Keep the shared catalogue-backed live search on calculator/tool pages. */
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
   e.preventDefault();const query=input.value.trim();
   if(query)location.href='/tools/?q='+encodeURIComponent(query);
  });
  renderToolMatches('');
 }
 function focusTarget(){
  const byId={homeHeaderSearch:'#tool-search',toolsHeaderSearch:'#dir-input',mathHeaderSearch:'#mathLocalSearchInput',digitalHeaderSearch:'#digitalLocalSearchInput',categoryHeaderSearch:'#categoryHeaderSearchInput'};
  const selector=byId[searchBtn.id];
  return (selector&&document.querySelector(selector))
   ||(searchPanel&&searchPanel.querySelector('input[type="search"],input[type="text"]'))
   ||document.querySelector('main .zt-category-search-inline input[type="search"],main .zt-category-search-inline input[type="text"]')
   ||document.querySelector('.home-search input[type="search"],.directory-search input[type="search"]');
 }
 if(!searchPanel&&!focusTarget()){
  searchPanel=document.createElement('div');searchPanel.id='ztNavSearchPanel';
  searchPanel.className='zt-nav-search-panel';
  searchPanel.innerHTML='<form role="search" action="/tools/" method="get"><label class="sr-only" for="ztNavSearchInput">Search all ZemTools tools</label><input id="ztNavSearchInput" name="q" type="search" placeholder="Search calculators, tools or tasks…" autocomplete="off"><button type="submit">Search</button></form>';
  inner.appendChild(searchPanel);searchPanel.setAttribute('aria-hidden','true');
 }
 if(searchPanel){searchPanel.classList.add('zt-nav-search-panel');searchBtn.setAttribute('aria-controls',searchPanel.id);}
 
 let lastTrigger=null;
 function setOpen(panel,button,open,openClass){
  if(!panel||!button)return;
  panel.classList.toggle(openClass,open);
  panel.classList.toggle('is-open',open);
  panel.classList.toggle('open',open);
  panel.setAttribute('aria-hidden',String(!open));
  button.setAttribute('aria-expanded',String(open));
  button.setAttribute('aria-label',open?'Close '+(button===menuBtn?'menu':button===categoryButton?'categories':'search'):(button===menuBtn?'Open menu':button===categoryButton?'Browse categories':'Search tools'));
 }
 function closeMenu(){setOpen(menuPanel,menuBtn,false,'zt-nav-open');}
 function closeSearch(){if(searchPanel)setOpen(searchPanel,searchBtn,false,'zt-nav-open');}
 function closeCategories(){categoryPanel.classList.remove('zt-category-open');categoryPanel.setAttribute('aria-hidden','true');categoryButton.setAttribute('aria-expanded','false');}
 function openSearch(){
  closeMenu();closeCategories();
  if(searchPanel){
   const open=!searchPanel.classList.contains('zt-nav-open');
   setOpen(searchPanel,searchBtn,open,'zt-nav-open');lastTrigger=searchBtn;
   if(open){const input=searchPanel.querySelector('input[type="search"],input[type="text"]');if(input)input.focus({preventScroll:true});}
  }else{
   const target=focusTarget();
   if(target){target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});target.focus({preventScroll:true});}
  }
 }
 function openMenu(){closeSearch();closeCategories();const open=!menuPanel.classList.contains('zt-nav-open');setOpen(menuPanel,menuBtn,open,'zt-nav-open');lastTrigger=menuBtn;}
 function openCategories(){
  closeMenu();closeSearch();
  const open=!categoryPanel.classList.contains('zt-category-open');
  categoryPanel.classList.toggle('zt-category-open',open);
  categoryPanel.setAttribute('aria-hidden',String(!open));
  categoryButton.setAttribute('aria-expanded',String(open));
  lastTrigger=categoryButton;
 }
 categoryButton.addEventListener('click',openCategories);
 document.addEventListener('click',function(e){
  const menuClick=e.target.closest&&e.target.closest('.zt-nav-menu-toggle');
  if(menuClick===menuBtn){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openMenu();return;}
  const searchClick=e.target.closest&&e.target.closest('.zt-nav-search-toggle');
  if(searchClick===searchBtn){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openSearch();return;}
  const categoryClick=e.target.closest&&e.target.closest('.zt-category-toggle');
  if(categoryClick===categoryButton){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openCategories();return;}
  if(menuPanel&&!menuPanel.contains(e.target))closeMenu();
  if(searchPanel&&!searchPanel.contains(e.target))closeSearch();
  if(categoryPanel&&!categoryPanel.contains(e.target)&&!categoryButton.contains(e.target))closeCategories();
  if((menuPanel&&menuPanel.contains(e.target)&&e.target.closest('a[href]'))||
     (categoryPanel&&categoryPanel.contains(e.target)&&e.target.closest('a[href]')))closeMenu(),closeCategories();
 },true);
 document.addEventListener('keydown',function(e){
  const active=document.activeElement;
  const typing=active&&(active.matches('input,textarea,select,[contenteditable="true"]'));
  if(!typing&&((e.key==='/')||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'))){
   e.preventDefault();searchBtn.click();return;
  }
  if(e.key==='Escape'){
   const wasOpen=menuPanel.classList.contains('zt-nav-open')||
    Boolean(searchPanel&&searchPanel.classList.contains('zt-nav-open'))||categoryPanel.classList.contains('zt-category-open');
   closeMenu();closeSearch();closeCategories();
   if(wasOpen&&lastTrigger){lastTrigger.focus({preventScroll:true});lastTrigger=null;}
  }
 },true);
 menuBtn.setAttribute('aria-expanded','false');searchBtn.setAttribute('aria-expanded','false');
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