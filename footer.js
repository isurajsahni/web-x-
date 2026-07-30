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
  .wx-footer {
    border-top: 1px solid rgba(255,255,255,.08);
    padding: clamp(60px,10vh,110px) clamp(20px,5vw,72px) 40px;
    background: #000000;
    position: relative;
  }
  .wx-footer-inner { max-width: 1500px; margin: 0 auto; }

  /* ---- Top row ---- */
  .wx-footer-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(24px, 4vw, 56px);
    padding-bottom: clamp(30px, 5vh, 52px);
    border-bottom: 1px solid rgba(255,255,255,.08);
    flex-wrap: wrap;
  }
  .wx-footer-brand {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .wx-footer-logo-text {
    font-family: 'Satoshi', sans-serif;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, #9bb0ff 0%, #9D5CFF 50%, #c061ff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin: 0;
    width: fit-content;
    user-select: none;
  }
  .wx-footer-address {
    font-family: 'Satoshi', sans-serif;
    font-size: 13px;
    line-height: 1.5;
    color: #8E8E93;
    margin: 0;
    flex: 1;
    min-width: 200px;
    text-align: center;
  }
  .wx-footer-top-contact {
    display: flex;
    align-items: center;
    gap: clamp(16px, 2vw, 28px);
    padding-left: clamp(24px, 3vw, 48px);
    border-left: 1px solid rgba(255,255,255,.08);
    flex-shrink: 0;
  }
  .wx-footer-contact-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Satoshi', sans-serif;
    font-size: 14px;
    text-decoration: none;
    color: #9D5CFF;
    transition: opacity 0.3s ease, color 0.3s ease;
  }
  .wx-footer-contact-item svg { flex-shrink: 0; }
  .wx-footer-contact-item .wx-c-label {
    background: linear-gradient(135deg, #9bb0ff 0%, #9D5CFF 50%, #c061ff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    transition: color 0.3s ease;
  }
  .wx-footer-contact-item:hover { color: #ffffff; }
  .wx-footer-contact-item:hover .wx-c-label { background: none; color: #ffffff; }

  /* ---- Main two-part row ---- */
  .wx-footer-main {
    display: grid;
    grid-template-columns: 0.85fr 1.5fr;
    gap: clamp(40px, 5vw, 80px);
    padding: clamp(40px, 6vh, 64px) 0;
  }
  .wx-footer-left { max-width: 420px; }
  .wx-footer-desc {
    font-family: 'Satoshi', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #8E8E93;
    margin: 0;
  }
  .wx-footer-socials {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
  }
  .wx-social-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.08);
    color: #8E8E93;
    transition: color 0.3s ease, background 0.3s ease, border-color 0.3s ease;
  }
  .wx-social-btn:hover {
    color: #ffffff;
    background: rgba(255,255,255,.08);
    border-color: rgba(255,255,255,.2);
  }
  .wx-footer-cols {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(24px, 3vw, 48px);
  }
  .wx-footer-col { display: flex; flex-direction: column; gap: 12px; }
  .wx-footer-heading {
    font-family: 'Satoshi', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }
  .wx-footer-link {
    font-family: 'Satoshi', sans-serif;
    font-size: 14px;
    color: #8E8E93;
    text-decoration: none;
    transition: color 0.3s ease, transform 0.3s ease;
    width: fit-content;
  }
  .wx-footer-link:hover { color: #ffffff; transform: translateX(2px); }

  /* ---- Bottom bar ---- */
  .wx-footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-family: 'Satoshi', sans-serif;
    font-size: 12px;
    color: #5A5A62;
  }
  .wx-footer-bottom-meta { color: #5A5A62; }

  @media (max-width: 1024px) {
    .wx-footer-top { flex-direction: column; align-items: flex-start; gap: 24px; }
    .wx-footer-address { flex: none; text-align: left; }
    .wx-footer-top-contact { padding-left: 0; border-left: none; flex-wrap: wrap; }
    .wx-footer-main { grid-template-columns: 1fr; gap: 40px; }
    .wx-footer-left { max-width: 100%; }
  }
  @media (max-width: 640px) {
    .wx-footer-cols { grid-template-columns: 1fr 1fr; gap: 28px; }
    .wx-footer-top-contact { flex-direction: column; align-items: flex-start; gap: 12px; }
    .wx-footer-bottom { flex-direction: column; align-items: flex-start; }
  }`;

  /* ------------------------------------------------------------------ */
  /* 2. Markup                                                          */
  /* ------------------------------------------------------------------ */
  var HTML = `
  <footer class="wx-footer" data-wx-footer>
    <div class="wx-footer-inner">

      <div class="wx-footer-top">
        <a href="index.html" class="wx-footer-brand">
          <img src="logo-white.svg" alt="Web{X}" width="40" height="40" style="border-radius:10px;display:block;" />
          <span class="wx-footer-logo-text">Web{X}</span>
        </a>
        <p class="wx-footer-address">Model Town Tech District, Ludhiana, Punjab 141002, India</p>
        <div class="wx-footer-top-contact">
          <a href="mailto:hello@thewebx.in" class="wx-footer-contact-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"></rect><polyline points="22,6 12,13 2,6"></polyline></svg>
            <span class="wx-c-label">hello@thewebx.in</span>
          </a>
          <a href="tel:+917973386875" class="wx-footer-contact-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span class="wx-c-label">+91 79733 86875</span>
          </a>
        </div>
      </div>

      <div class="wx-footer-main">
        <div class="wx-footer-left">
          <p class="wx-footer-desc">
            Web{X} is a digital design &amp; development agency specializing in high-performance web applications, custom products, and SEO.
          </p>
          <div class="wx-footer-socials">
            <a href="https://www.instagram.com/thewebx.official" target="_blank" rel="noopener" class="wx-social-btn" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://x.com/theWebxOfficial" target="_blank" rel="noopener" class="wx-social-btn" aria-label="X (Twitter)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"></path></svg>
            </a>
            <a href="https://www.linkedin.com/company/webxstudio" target="_blank" rel="noopener" class="wx-social-btn" aria-label="LinkedIn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S.02 4.88.02 3.5 1.13 1 2.5 1s2.48 1.12 2.48 2.5zM.25 8.5h4.5V23H.25V8.5zM8.5 8.5h4.3v1.98h.06c.6-1.13 2.06-2.32 4.24-2.32 4.54 0 5.38 2.99 5.38 6.87V23h-4.5v-6.42c0-1.53-.03-3.5-2.13-3.5-2.13 0-2.46 1.66-2.46 3.38V23H8.5V8.5z"></path></svg>
            </a>
            <a href="https://dribbble.com/hello-webx" target="_blank" rel="noopener" class="wx-social-btn" aria-label="Dribbble">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"></path></svg>
            </a>
          </div>
        </div>

        <div class="wx-footer-cols">
          <div class="wx-footer-col">
            <span class="wx-footer-heading">Company</span>
            <a data-transition href="./" class="wx-footer-link">Home</a>
            <a data-transition href="studio" class="wx-footer-link">About us</a>
            <a data-transition href="work" class="wx-footer-link">Work</a>
          </div>

          <div class="wx-footer-col">
            <span class="wx-footer-heading">Services</span>
            <a data-transition href="services" class="wx-footer-link">All services</a>
            <a data-transition href="figma-to-webflow" class="wx-footer-link">Figma to Webflow</a>
            <a data-transition href="figma-to-wordpress" class="wx-footer-link">Figma to WordPress</a>
            <a data-transition href="work" class="wx-footer-link">Case studies</a>
          </div>

          <div class="wx-footer-col">
            <span class="wx-footer-heading">Contact</span>
            <a data-transition href="contact" class="wx-footer-link">Contact us</a>
            <a data-transition href="blog" class="wx-footer-link">Blog</a>
          </div>
        </div>
      </div>

      <div class="wx-footer-bottom">
        <span>© 2026 Web{X} Studio - All rights reserved.</span>
        <span class="wx-footer-bottom-meta">Designed &amp; built in-house · Ludhiana, India</span>
      </div>

    </div>

    <div aria-hidden="true" style="overflow:hidden;line-height:0;padding:clamp(40px,8vh,90px) clamp(16px,3vw,40px) 0;margin:0 calc(-1 * clamp(20px,5vw,72px)) calc(-1 * 40px)">
      <div style="font-family:'Satoshi',sans-serif;font-weight:700;font-size:clamp(72px,24vw,360px);line-height:.85;letter-spacing:-.05em;text-align:center;white-space:nowrap;background:linear-gradient(180deg,#9bb0ff 0%,#9D5CFF 42%,#c061ff 72%,rgba(157,92,255,.06) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;user-select:none">Web{X}</div>
    </div>
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
