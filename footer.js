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
  .wx-footer-grid {
    display: grid;
    grid-template-columns: 1.8fr 1fr 1fr 1fr 1fr;
    gap: clamp(30px, 4vw, 60px);
    padding-bottom: clamp(40px, 6vh, 80px);
    max-width: 1500px;
    margin: 0 auto;
  }
  .wx-footer-col { display: flex; flex-direction: column; gap: 12px; }
  .wx-footer-brand-col { gap: 20px; max-width: 340px; }
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
  .wx-footer-desc {
    font-family: 'Satoshi', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #8E8E93;
    margin: 0;
  }
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
  .wx-footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    max-width: 1500px;
    margin: 0 auto;
    font-family: 'Satoshi', sans-serif;
    font-size: 12px;
    color: #5A5A62;
  }
  .wx-footer-bottom-meta { color: #5A5A62; }
  @media (max-width: 1024px) {
    .wx-footer-grid { grid-template-columns: 1fr 1fr 1fr; gap: 40px; }
    .wx-footer-brand-col { grid-column: span 3; max-width: 100%; margin-bottom: 20px; }
  }
  @media (max-width: 640px) {
    .wx-footer-grid { grid-template-columns: 1fr 1fr; gap: 30px; }
    .wx-footer-brand-col { grid-column: span 2; }
  }`;

  /* ------------------------------------------------------------------ */
  /* 2. Markup                                                          */
  /* ------------------------------------------------------------------ */
  var HTML = `
  <footer class="wx-footer" data-wx-footer>
    <div class="wx-footer-grid">

      <div class="wx-footer-col wx-footer-brand-col">
        <a href="index.html" style="display:inline-flex;align-items:center;gap:12px;text-decoration:none;">
          <img src="logo-white.svg" alt="Web{X}" width="40" height="40" style="border-radius:10px;display:block;" />
          <h3 class="wx-footer-logo-text" style="margin:0;">Web{X}</h3>
        </a>
        <p class="wx-footer-desc">
          Web{X} is a digital design &amp; development agency specializing in high-performance web applications, custom products, and SEO.
        </p>
      </div>

      <div class="wx-footer-col">
        <span class="wx-footer-heading">Company</span>
        <a data-transition href="./" class="wx-footer-link">Home</a>
        <a data-transition href="studio" class="wx-footer-link">About us</a>
        <a data-transition href="work" class="wx-footer-link">Work</a>
        <a data-transition href="contact" class="wx-footer-link">Contact us</a>
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
        <a data-transition href="blog" class="wx-footer-link">Blog</a>
        <a href="mailto:hello@thewebx.in" class="wx-footer-link">hello@thewebx.in</a>
        <a href="tel:+917973386875" class="wx-footer-link">+91 79733 86875</a>
      </div>

      <div class="wx-footer-col">
        <span class="wx-footer-heading">Social</span>
        <a href="https://www.instagram.com/thewebx.official" target="_blank" rel="noopener" class="wx-footer-link">Instagram</a>
        <a href="https://x.com/theWebxOfficial" target="_blank" rel="noopener" class="wx-footer-link">Twitter / X</a>
        <a href="https://www.linkedin.com/company/webxstudio" target="_blank" rel="noopener" class="wx-footer-link">LinkedIn</a>
        <a href="https://dribbble.com/hello-webx" target="_blank" rel="noopener" class="wx-footer-link">Dribbble</a>
      </div>

    </div>

    <div class="wx-footer-bottom">
      <span>© 2026 Web{X} Studio - All rights reserved.</span>
      <span class="wx-footer-bottom-meta">Designed &amp; built in-house · Ludhiana, India</span>
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
