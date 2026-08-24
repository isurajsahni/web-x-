/* =====================================================================
   Web{X} — Global Footer
   Single source of truth for the footer across every page.
   Include on any page with:  <script src="footer.js" defer></script>
   Injects its own CSS + markup, then appends the footer to <body>.
   ===================================================================== */
(function () {
  if (window.__wxFooterLoaded) return;
  window.__wxFooterLoaded = true;

  /* ------------------------------------------------------------------ */
  /* 1. Styles                                                          */
  /* ------------------------------------------------------------------ */
  var CSS = `
  /* Ground is a violet-biased near-black rather than pure #000 — it seats
     better against the light sections above it. Type stays on Satoshi, which
     webx.css loads on every page; Manrope is only linked on the homepage, so
     using it here would silently fall back to system sans site-wide. */
  .wx-footer {
    --ink: #0A0810;
    --raise: #15121F;
    --line: rgba(255,255,255,.09);
    --text: #F2F0F7;
    --muted: #8A8598;
    --dim: #56525F;
    --brand: #9D5CFF;
    --brand-lo: #9BB0FF;
    --brand-hi: #C061FF;
    position: relative;
    background: var(--ink);
    color: var(--text);
    border-top: 1px solid var(--line);
    padding: clamp(56px,8vh,96px) 20px 34px;
    overflow: hidden;
    font-family: 'Satoshi', sans-serif;
  }
  .wx-footer-inner { max-width: 1340px; margin: 0 auto; }


  /* ---- Main ---- */
  .wx-footer-main {
    display: grid;
    grid-template-columns: 1.25fr 2fr;
    gap: clamp(36px,5vw,80px);
    padding-bottom: clamp(34px,5vh,54px);
    border-bottom: 1px solid var(--line);
  }
  .wx-footer-brand {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: var(--text);
    font-size: 21px;
    font-weight: 700;
    letter-spacing: -.02em;
  }
  .wx-footer-brand img { display: block; border-radius: 10px; }
  .wx-footer-brand em { color: var(--brand); font-style: normal; }
  .wx-footer-desc {
    margin: 20px 0 26px;
    font-size: 14.5px;
    line-height: 1.7;
    color: var(--muted);
    max-width: 38ch;
  }
  .wx-footer-socials { display: flex; gap: 10px; }
  .wx-social-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--line);
    background: rgba(255,255,255,.03);
    color: var(--muted);
    transition: color .25s ease, background-color .25s ease, border-color .25s ease, transform .25s ease;
  }
  .wx-social-btn:hover { color: #fff; background: var(--brand); border-color: var(--brand); transform: translateY(-2px); }

  .wx-footer-cols {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: clamp(20px,3vw,40px);
  }
  .wx-footer-col { display: flex; flex-direction: column; gap: 13px; align-items: flex-start; }
  .wx-footer-heading {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .15em;
    text-transform: uppercase;
    color: var(--dim);
    margin-bottom: 3px;
  }
  .wx-footer-link {
    font-size: 14.5px;
    color: var(--muted);
    text-decoration: none;
    transition: color .2s ease, transform .2s ease;
  }
  .wx-footer-link:hover { color: var(--text); transform: translateX(3px); }

  /* ---- Contact row ---- */
  /* Email pinned left, phone pinned right */
  .wx-footer-contact {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px clamp(18px,4vw,64px);
    padding: clamp(26px,4vh,38px) 0;
    border-bottom: 1px solid var(--line);
  }
  .wx-footer-contact-item { display: flex; gap: 13px; align-items: flex-start; text-decoration: none; }
  .wx-c-ico {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex: 0 0 auto;
    border-radius: 10px;
    background: rgba(157,92,255,.14);
    color: var(--brand);
  }
  .wx-c-ico svg { flex-shrink: 0; }
  .wx-c-key {
    display: block;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .15em;
    text-transform: uppercase;
    color: var(--dim);
    margin-bottom: 4px;
  }
  .wx-c-val {
    display: block;
    font-size: 14.5px;
    font-weight: 600;
    color: var(--text);
    font-variant-numeric: tabular-nums;
    transition: color .2s ease;
  }
  .wx-footer-contact-item:hover .wx-c-val { color: var(--brand); }

  /* ---- Legal bar ---- */
  .wx-footer-bottom {
    padding-top: 26px;
    text-align: center;
    font-size: 12.5px;
    color: var(--dim);
  }

  /* ---- Closing wordmark ---- */
  .wx-footer-mega {
    margin-top: clamp(26px,5vh,54px);
    font-family: 'Satoshi', sans-serif;
    font-weight: 700;
    font-size: clamp(72px,23vw,340px);
    line-height: .82;
    letter-spacing: -.055em;
    text-align: center;
    white-space: nowrap;
    user-select: none;
    background: linear-gradient(180deg, var(--brand-lo) 0%, var(--brand) 42%, var(--brand-hi) 72%, rgba(157,92,255,.05) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .wx-footer a:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 3px;
    border-radius: 4px;
  }
  @media (prefers-reduced-motion: reduce) {
    .wx-footer * { transition: none !important; }
  }
  @media (max-width: 900px) {
    .wx-footer-main { grid-template-columns: 1fr; }
    .wx-footer-cols { grid-template-columns: 1fr 1fr; gap: 30px 20px; }
  }
  @media (max-width: 560px) {
    /* Side-by-side contact would squeeze both to a couple of words per line */
    .wx-footer-contact { justify-content: flex-start; }
  }`;

  /* ------------------------------------------------------------------ */
  /* 2. Markup                                                          */
  /* ------------------------------------------------------------------ */
  var HTML = `
  <footer class="wx-footer" data-wx-footer>
    <div class="wx-footer-inner">

      <div class="wx-footer-main">
        <div class="wx-footer-left">
          <a href="index.html" class="wx-footer-brand">
            <img src="logo-white.svg" alt="Web{X}" width="40" height="40" />
            Web<em>{X}</em> Studio
          </a>
          <p class="wx-footer-desc">
            A digital design &amp; development agency building high-performance websites, custom products, and the SEO that keeps them found.
          </p>
          <div class="wx-footer-socials">
            <a href="https://www.instagram.com/thewebx.studio" target="_blank" rel="noopener" class="wx-social-btn" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://x.com/theWebxOfficial" target="_blank" rel="noopener" class="wx-social-btn" aria-label="X (Twitter)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"></path></svg>
            </a>
            <a href="https://dribbble.com/hello-webx" target="_blank" rel="noopener" class="wx-social-btn" aria-label="Dribbble">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"></path></svg>
            </a>
          </div>
        </div>

        <nav class="wx-footer-cols" aria-label="Footer">
          <div class="wx-footer-col">
            <span class="wx-footer-heading">Company</span>
            <a data-transition href="./" class="wx-footer-link">Home</a>
            <a data-transition href="studio" class="wx-footer-link">About us</a>
            <a data-transition href="work" class="wx-footer-link">Work</a>
            <a data-transition href="careers" class="wx-footer-link">Careers</a>
          </div>

          <div class="wx-footer-col">
            <span class="wx-footer-heading">Services</span>
            <a data-transition href="services" class="wx-footer-link">All services</a>
            <a data-transition href="figma-to-webflow" class="wx-footer-link">Figma to Webflow</a>
            <a data-transition href="figma-to-wordpress" class="wx-footer-link">Figma to WordPress</a>
            <a data-transition href="figma-to-shopify" class="wx-footer-link">Figma to Shopify</a>
          </div>

          <div class="wx-footer-col">
            <span class="wx-footer-heading">Resources</span>
            <a data-transition href="blog" class="wx-footer-link">Blog</a>
            <a data-transition href="work" class="wx-footer-link">Case studies</a>
            <a data-transition href="blog-website-cost" class="wx-footer-link">What a website costs</a>
            <a data-transition href="blog-core-web-vitals" class="wx-footer-link">Core Web Vitals</a>
          </div>

          <div class="wx-footer-col">
            <span class="wx-footer-heading">Get in touch</span>
            <a data-transition href="contact" class="wx-footer-link">Contact us</a>
            <a data-transition href="contact" class="wx-footer-link">Start a project</a>
            <a href="mailto:hello@thewebxstudio.com" class="wx-footer-link">Email us</a>
          </div>
        </nav>
      </div>

      <div class="wx-footer-contact">
        <a href="mailto:hello@thewebxstudio.com" class="wx-footer-contact-item">
          <span class="wx-c-ico" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><polyline points="22,6 12,13 2,6"></polyline></svg>
          </span>
          <span>
            <span class="wx-c-key">Email</span>
            <span class="wx-c-val">hello@thewebxstudio.com</span>
          </span>
        </a>
        <a href="tel:+919780651142" class="wx-footer-contact-item">
          <span class="wx-c-ico" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </span>
          <span>
            <span class="wx-c-key">Phone</span>
            <span class="wx-c-val">+91 97806 51142</span>
          </span>
        </a>
      </div>

      <div class="wx-footer-bottom">
        <span>&copy; 2026 Web{X} Studio &mdash; All rights reserved.</span>
      </div>

    </div>

    <div class="wx-footer-mega" aria-hidden="true">Web{X}</div>
  </footer>`;

  /* ------------------------------------------------------------------ */
  /* 3. Init                                                            */
  /* ------------------------------------------------------------------ */
  function init() {
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
