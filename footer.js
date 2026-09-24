/* =====================================================================
   Web{X} — Global Footer
   Single source of truth for the footer across every page.
   Include on any page with:  <script src="footer.js" defer></script>
   Injects its own fonts + CSS + markup, then appends the footer to <body>.

   This is home-v3's footer, promoted to the whole site. Two things that
   made it page-local had to be solved before it could travel:

   1. It was written against home-v3's :root tokens (--v3-ink, --v3-accent,
      --v3-line and friends) and against .v3-wrap / .v3-txt / .v3-btn. None
      of those exist on the other 45 pages, so every one is redeclared below,
      scoped to .v3-foot. Scoping matters both ways: it stops these generic
      names leaking onto pages that have their own, and it keeps the footer
      identical on the three pages that DO define them.

   2. It sets headings in Instrument Serif and the brand name in Manrope.
      Manrope is linked on some pages, Instrument Serif on only three — so
      the font link is injected here rather than assumed. That is the exact
      trap the previous version of this file avoided by staying on Satoshi;
      loading the faces ourselves is what makes the richer footer portable.
   ===================================================================== */
(function () {
  if (window.__wxFooterLoaded) return;
  window.__wxFooterLoaded = true;

  /* ------------------------------------------------------------------ */
  /* 1. Fonts                                                           */
  /* ------------------------------------------------------------------ */
  /* Non-blocking: parsed as print, promoted to all once it lands, so it
     never delays first paint. Skipped when the page already links them. */
  function loadFonts() {
    var need = ['Manrope', 'Instrument+Serif'];
    var links = [].slice.call(document.querySelectorAll('link[href*="fonts.googleapis.com"]'));
    var have = links.map(function (l) { return l.getAttribute('href') || ''; }).join(' ');
    if (need.every(function (f) { return have.indexOf(f) > -1; })) return;

    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap';
    l.media = 'print';
    l.onload = function () { this.media = 'all'; };
    document.head.appendChild(l);
  }

  /* ------------------------------------------------------------------ */
  /* 2. Styles                                                          */
  /* ------------------------------------------------------------------ */
  var CSS = [
    /* Every token the footer needs, declared on the footer itself. */
    '.v3-foot {',
    '  --v3-ink:      #000000;',
    '  --v3-body:     rgba(0,0,0,.8);',
    '  --v3-dim:      rgba(0,0,0,.7);',
    '  --v3-line:     #E6E6E6;',
    '  --v3-accent:   #9D5CFF;',
    '  --v3-accent-w: rgba(157,92,255,.18);',
    /* White on #9D5CFF is 3.88:1 and fails AA for a 16px/400 label, so the
       button uses this darkened twin and the accent stays put elsewhere. */
    '  --v3-cta:      #8438EE;',
    '  --v3-lg:       clamp(16px,1.39vw,20px);',
    '  --v3-txt:      clamp(15px,1.25vw,18px);',
    '  --v3-sm:       clamp(14px,1.11vw,16px);',
    '  background: #FFFFFF; padding: clamp(64px,9vw,120px) 0 0;',
    /* The footer is injected as a plain static block, so it paints in the
       normal flow — below any positioned layer. contact.html parks an opaque
       white .contact-mesh-bg (fixed, inset 0, z-index 0) behind its content
       and lifts its own sections to z-index 2 to clear it; the footer never
       got that treatment and was painted over completely. Lifting it here
       fixes contact and inoculates the footer against any other page that
       adds a fixed backdrop. Stays well under nav (9000) and the overlays. */
    '  position: relative; z-index: 1;',
    '}',

    /* Scoped copies of the three shared components the markup leans on. */
    '.v3-foot .v3-wrap { max-width: 1460px; margin: 0 auto; padding: 0 30px; }',
    '.v3-foot .v3-txt { font-family: \'Satoshi\', sans-serif; font-size: var(--v3-txt); font-weight: 400;',
    '                   line-height: 1.45; letter-spacing: -.01em; color: var(--v3-body); margin: 0; }',
    /* Padding/gap deliberately match the page-level .v3-btn (index.html and
       the service pages) so the footer pill is the same object as every
       other CTA on the site. Change both together or not at all. */
    '.v3-foot .v3-btn { display: inline-flex; align-items: center; gap: 16px; background: var(--v3-cta);',
    '                   color: #FFFFFF; border-radius: 99px; padding: 8px 8px 8px 24px; text-decoration: none;',
    '                   font-family: \'Satoshi\', sans-serif; font-size: var(--v3-txt); font-weight: 400;',
    '                   line-height: 1.45; box-shadow: 0 18px 34px -20px rgba(23,18,54,.55);',
    '                   transition: transform .25s cubic-bezier(.16,1,.3,1); }',
    '.v3-foot .v3-btn:hover { transform: translateY(-2px); }',
    '.v3-foot .v3-btn-ico { width: 40px; height: 40px; flex: 0 0 auto; border-radius: 40px; background: #FFFFFF;',
    '                       color: var(--v3-ink); display: grid; place-items: center; }',
    '.v3-foot .v3-btn-ico svg { transition: transform .38s cubic-bezier(.16,1,.3,1); }',
    '.v3-foot .v3-btn:hover .v3-btn-ico svg,',
    '.v3-foot .v3-btn:focus-visible .v3-btn-ico svg { transform: rotate(45deg); }',

    '.v3-foot-inner { display: grid; grid-template-columns: 1.35fr 1.75fr .85fr .8fr;',
    '                 gap: clamp(32px,4.4vw,64px); align-items: start; }',

    /* ---- Brand block ---- */
    '.v3-foot-brand { display: flex; flex-direction: column; align-items: flex-start; }',
    '.v3-foot-mark { display: inline-flex; text-decoration: none; }',
    '.v3-foot-mark img { display: block; width: 46px; height: auto; }',
    '.v3-foot-name { font-family: \'Manrope\', sans-serif; font-size: var(--v3-lg); font-weight: 500;',
    '                line-height: 1.2; letter-spacing: -.01em; color: var(--v3-ink); margin: 26px 0 0; }',
    /* Must out-specify '.v3-foot .v3-txt { margin: 0 }' above: this paragraph
       carries both classes, and at 0-1-0 the bare .v3-foot-desc lost, so the
       margin silently never applied and the CTA sat flush against the copy
       with a 0px gap. Scoping it to .v3-foot makes it 0-2-0 and later, so it
       wins. Keep the .v3-foot prefix if you touch this rule. */
    '.v3-foot .v3-foot-desc { max-width: 310px; margin: 14px 0 34px; }',

    /* ---- Link columns: Services runs two sub-columns, the rest single files ---- */
    '.v3-foot-col { display: flex; flex-direction: column; }',
    '.v3-foot-h { font-family: \'Instrument Serif\', Georgia, serif; font-style: italic; font-weight: 400;',
    '             font-size: clamp(20px,1.6vw,23px); line-height: 1.1; color: var(--v3-ink);',
    '             margin: 0 0 clamp(30px,3vw,44px); }',
    '.v3-foot-list { display: grid; grid-template-columns: 1fr; gap: 22px 30px; }',
    '.v3-foot-list--2 { grid-template-columns: 1fr 1fr; grid-auto-flow: column; grid-template-rows: repeat(6,auto); }',
    '.v3-foot-list a { text-decoration: none; color: var(--v3-body); font-family: \'Satoshi\', sans-serif;',
    '                  font-size: var(--v3-txt); line-height: 1.3; letter-spacing: -.01em; width: fit-content;',
    '                  transition: color .2s ease; }',
    '.v3-foot-list a:hover { color: var(--v3-accent); }',

    /* ---- Contact row: badge, tiny key, bold value — spread across the width ---- */
    '.v3-foot-contact { margin-top: clamp(48px,6vw,86px); border-top: .8px solid var(--v3-line);',
    '                   border-bottom: .8px solid var(--v3-line); padding: clamp(24px,3vw,34px) 0;',
    '                   display: flex; align-items: center; justify-content: space-between;',
    '                   gap: 20px clamp(18px,4vw,64px); flex-wrap: wrap; }',
    '.v3-foot-c { display: flex; align-items: flex-start; gap: 13px; text-decoration: none; }',
    '.v3-foot-c i { width: 36px; height: 36px; flex: 0 0 auto; border-radius: 10px; display: grid; place-items: center;',
    '               background: var(--v3-accent-w); color: var(--v3-accent); }',
    '.v3-foot-c b { display: block; font-family: \'Satoshi\', sans-serif; font-size: 10.5px; font-weight: 700;',
    '               letter-spacing: .15em; text-transform: uppercase; color: var(--v3-dim); margin-bottom: 4px; }',
    '.v3-foot-c span span { display: block; font-family: \'Satoshi\', sans-serif; font-size: 14.5px; font-weight: 600;',
    '                       color: var(--v3-ink); font-variant-numeric: tabular-nums; transition: color .2s ease; }',
    '.v3-foot-c:hover span span { color: var(--v3-accent); }',

    '.v3-foot-copy { display: flex; flex-wrap: wrap; align-items: center; justify-content: center;',
    '                gap: 8px 18px; text-align: center; padding: 26px 0 0; margin: 0;',
    '                font-family: \'Satoshi\', sans-serif; font-size: var(--v3-sm); color: var(--v3-dim); }',
    /* The preferences button carries the same data-wx-open-prefs hook the
       banner uses, so consent.js finds it through its delegated listener. */
    '.v3-foot-legal { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 18px; }',
    '.v3-foot-legal a, .v3-foot-legal button { padding: 0; border: 0; background: none; cursor: pointer;',
    '                  font-family: inherit; font-size: inherit; color: var(--v3-dim);',
    '                  text-decoration: none; transition: color .2s ease; }',
    '.v3-foot-legal a:hover, .v3-foot-legal button:hover { color: var(--v3-accent); }',

    /* ---- Closing wordmark: gradient clipped to the type, fading out at the foot ---- */
    '.v3-foot-mega { opacity: .2; margin-top: clamp(22px,4vw,46px); font-family: \'Manrope\', sans-serif; font-weight: 700;',
    '                font-size: clamp(72px,23vw,340px); line-height: .82; letter-spacing: -.055em;',
    '                text-align: center; white-space: nowrap; user-select: none; overflow: hidden;',
    '                background: linear-gradient(180deg, #9BB0FF 0%, var(--v3-accent) 42%, #C061FF 72%, rgba(157,92,255,.05) 100%);',
    '                -webkit-background-clip: text; background-clip: text; color: transparent; }',

    /* ---- Responsive, carried over from home-v3 ---- */
    '@media (max-width: 1180px) {',
    '  .v3-foot-inner { grid-template-columns: repeat(3,1fr); }',
    '  .v3-foot-brand { grid-column: 1 / -1; margin-bottom: clamp(20px,3vw,36px); }',
    '}',
    '@media (max-width: 720px) {',
    '  .v3-foot .v3-wrap { padding-inline: 15px; }',
    /* Tighter rows, but each link keeps a 44px-tall tap target via padding. */
    '  .v3-foot-list { gap: 2px 30px; }',
    '  .v3-foot-list a { padding: 12px 0; }',
    '  .v3-foot-inner { grid-template-columns: 1fr 1fr; gap: 40px 24px; }',
    '  .v3-foot-list--2 { grid-template-columns: 1fr; grid-auto-flow: row; grid-template-rows: none; }',
    /* Three contact items would each get a sliver on a phone — stack them. */
    '  .v3-foot-contact { flex-direction: column; align-items: flex-start; gap: 18px; }',
    '  .v3-foot-c { padding-block: 3px; }',
    '}',
    '@media (prefers-reduced-motion: reduce) {',
    '  .v3-foot .v3-btn, .v3-foot .v3-btn-ico svg { transition: none; }',
    '  .v3-foot .v3-btn:hover { transform: none; }',
    '}'
  ].join('\n');

  /* ------------------------------------------------------------------ */
  /* 3. Markup                                                          */
  /* ------------------------------------------------------------------ */
  /* Root-relative hrefs throughout: this file is included from pages at the
     site root today, but a relative "contact" would break the moment one
     lives in a subdirectory. */
  var HTML = [
    '<footer class="v3-foot" data-wx-footer aria-label="Site footer">',
    '  <div class="v3-wrap v3-foot-inner">',

    '    <div class="v3-foot-brand">',
    '      <a class="v3-foot-mark" href="/" aria-label="Web{X} Studio — home">',
    '        <img src="/logo-black.svg" alt="Web{X} Studio" width="46" height="46">',
    '      </a>',
    '      <p class="v3-foot-name">Web{X} Studio</p>',
    '      <p class="v3-txt v3-foot-desc">A digital design &amp; development agency building high-performance websites, custom products, and the SEO that keeps them found.</p>',
    '      <a class="v3-btn" href="/contact">Start a project',
    '        <span class="v3-btn-ico"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 17 17 7M17 7H9M17 7v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>',
    '      </a>',
    '    </div>',

    '    <nav class="v3-foot-col" aria-label="Services">',
    '      <h2 class="v3-foot-h">Services</h2>',
    '      <div class="v3-foot-list v3-foot-list--2">',
    '        <a href="/web-design">Web design</a>',
    '        <a href="/web-development">Web development</a>',
    '        <a href="/web-apps">Web apps</a>',
    '        <a href="/figma-to-shopify">Ecommerce</a>',
    '        <a href="/ui-ux-design">UI/UX design</a>',
    '        <a href="/graphic-design">Graphic design</a>',
    '        <a href="/landing-page-design">Landing page</a>',
    '        <a href="/figma-to-webflow">Webflow</a>',
    '        <a href="/figma-to-wordpress">WordPress</a>',
    '        <a href="/figma-to-shopify">Shopify</a>',
    '        <a href="/services">All services</a>',
    '      </div>',
    '    </nav>',

    '    <nav class="v3-foot-col" aria-label="Quick links">',
    '      <h2 class="v3-foot-h">Quick Links</h2>',
    '      <div class="v3-foot-list">',
    '        <a href="/work">Case studies</a>',
    '        <a href="/studio">About</a>',
    '        <a href="/blog-website-cost">Pricing</a>',
    '        <a href="/careers">Careers</a>',
    '        <a href="/blog">Blog</a>',
    '        <a href="/web-development-agency-ludhiana">Ludhiana web development</a>',
    '        <a href="/web-design-company-punjab">Web design in Punjab</a>',
    '        <a href="/contact">Contact</a>',
    '      </div>',
    '    </nav>',

    '    <nav class="v3-foot-col" aria-label="Follow us">',
    '      <h2 class="v3-foot-h">Follow Us</h2>',
    '      <div class="v3-foot-list">',
    '        <a href="https://www.instagram.com/thewebx.studio" target="_blank" rel="noopener">Instagram</a>',
    '        <a href="https://x.com/Thewebxstudio" target="_blank" rel="noopener">(X) Twitter</a>',
    '        <a href="https://dribbble.com/hello-webx" target="_blank" rel="noopener">Dribbble</a>',
    '        <a href="mailto:hello@thewebxstudio.com">Email us</a>',
    '        <a href="tel:+919780651142">+91 97806 51142</a>',
    '      </div>',
    '    </nav>',

    '  </div>',
    '  <div class="v3-wrap">',
    '    <div class="v3-foot-contact">',
    '      <a class="v3-foot-c" href="mailto:hello@thewebxstudio.com">',
    '        <i aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg></i>',
    '        <span><b>Email</b><span>hello@thewebxstudio.com</span></span>',
    '      </a>',
    '      <a class="v3-foot-c" href="https://wa.me/919780651142?text=Hi%20Web%7BX%7D%2C%20I%27d%20like%20to%20talk%20about%20a%20project." target="_blank" rel="noopener">',
    '        <i aria-hidden="true"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.23 8.23 0 0 1 0 16.47Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z"/></svg></i>',
    '        <span><b>WhatsApp</b><span>+91 97806 51142</span></span>',
    '      </a>',
    '      <a class="v3-foot-c" href="tel:+919780651142">',
    '        <i aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></i>',
    '        <span><b>Phone</b><span>+91 97806 51142</span></span>',
    '      </a>',
    '    </div>',
    '    <p class="v3-foot-copy">',
    '      <span>&copy; 2026 Web{X} Studio &mdash; All rights reserved.</span>',
    '      <span class="v3-foot-legal">',
    '        <a href="/privacy-policy">Privacy Policy</a>',
    '        <a href="/terms-and-conditions">Terms &amp; Conditions</a>',
    '        <button type="button" data-wx-open-prefs>Cookie preferences</button>',
    '      </span>',
    '    </p>',
    '  </div>',

    '  <div class="v3-foot-mega" aria-hidden="true">Web{X}</div>',
    '</footer>'
  ].join('\n');

  /* ------------------------------------------------------------------ */
  /* 4. Init                                                            */
  /* ------------------------------------------------------------------ */
  function init() {
    loadFonts();

    var style = document.createElement('style');
    style.setAttribute('data-wx-footer-css', '');
    style.textContent = CSS;
    document.head.appendChild(style);

    var tmp = document.createElement('div');
    tmp.innerHTML = HTML.trim();
    var footer = tmp.firstElementChild;

    var existing = document.querySelector('footer[data-wx-footer]');
    if (existing) existing.replaceWith(footer);
    else document.body.appendChild(footer);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
