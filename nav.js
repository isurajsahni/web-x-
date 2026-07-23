/* =====================================================================
   Web{X} — Global Floating Glass Navigation
   Single source of truth for the header across every page.
   Include on any page with:  <script src="nav.js" defer></script>
   Injects its own CSS + markup, then wires scroll / active-link /
   mobile menu / Resources mega-dropdown behaviour.
   ===================================================================== */
(function () {
  if (window.__wxNavLoaded) return;
  window.__wxNavLoaded = true;

  /* ------------------------------------------------------------------ */
  /* 1. Styles                                                          */
  /* ------------------------------------------------------------------ */
  var CSS = `
  .wx-nav-container {
    position: fixed;
    top: 24px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: min(94vw, 1280px);
    z-index: 9000;
    pointer-events: none;
    transition: top 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    border-radius: 40px !important;
  }

  /* Full-width transparent bar: logo left, links pill center, socials right */
  .wx-navbar {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    pointer-events: none;
    transform-origin: 100% 0;
    transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease;
  }
  /* Each piece collapses individually toward the top-right as we scroll */
  .wx-navbar .wx-nav-logo,
  .wx-navbar .wx-nav-links-wrap,
  .wx-navbar .wx-nav-cta-wrap {
    transition: background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease,
                opacity 0.35s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Shared glass surface for floating pieces */
  .wx-nav-logo,
  .wx-nav-links-wrap,
  .wx-nav-socials {
    pointer-events: auto;
    background: rgba(10, 10, 12, 0.35);
    -webkit-backdrop-filter: blur(20px) saturate(195%);
    backdrop-filter: blur(20px) saturate(195%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05);
    border-radius: 40px;
    transition: background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
  }

  .wx-navbar.wx-scrolled .wx-nav-logo,
  .wx-navbar.wx-scrolled .wx-nav-links-wrap,
  .wx-navbar.wx-scrolled .wx-nav-socials {
    background: rgba(8, 8, 10, 0.75);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 12px 45px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
  }

  /* Logo */
  .wx-nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 22px;
    text-decoration: none;
    font-family: 'Satoshi', sans-serif;
    font-weight: 700;
    font-size: 19px;
    color: #EDEDED;
  }
  .wx-nav-logo:hover { transform: scale(1.02); }
  .wx-nav-logo-svg { animation: wx-spin 6s linear infinite; color: #9D5CFF; }
  .wx-logo-purple { color: #9D5CFF; }
  @keyframes wx-spin { to { transform: rotate(360deg); } }

  /* Center links pill */
  .wx-nav-links-wrap {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px;
  }
  .wx-nav-item { position: relative; display: flex; }

  .wx-nav-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Satoshi', sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    padding: 9px 18px;
    border-radius: 22px;
    white-space: nowrap;
    transition: color 0.25s ease, background-color 0.25s ease;
  }
  .wx-nav-link:hover { color: #ffffff; background: rgba(255, 255, 255, 0.07); }

  /* Active / current page — filled light pill */
  .wx-nav-link.wx-current {
    color: #0b0b0d;
    background: rgba(255, 255, 255, 0.92);
    font-weight: 600;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4);
  }
  .wx-nav-link.wx-current:hover { background: #ffffff; color: #0b0b0d; }

  .wx-nav-caret { transition: transform 0.3s ease; opacity: 0.7; }
  .wx-nav-item.wx-open .wx-nav-caret { transform: rotate(180deg); }

  /* ---------- Resources mega dropdown ---------- */
  .wx-mega {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    margin-top: 16px;
    width: min(92vw, 640px);
    padding: 10px;
    background: rgba(9, 9, 11, 0.94);
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    backdrop-filter: blur(30px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 22px;
    box-shadow: 0 30px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.16,1,0.3,1), visibility 0.28s;
    z-index: 9001;
  }
  /* invisible hover bridge across the gap */
  .wx-mega::before {
    content: "";
    position: absolute;
    top: -18px;
    left: 0;
    right: 0;
    height: 18px;
  }
  .wx-nav-item.wx-open .wx-mega {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateX(-50%) translateY(0);
  }

  .wx-mega-card {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 16px;
    border-radius: 15px;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    text-decoration: none;
    transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
  }
  .wx-mega-card:hover {
    background: #ffffff;
    border-color: rgba(157, 92, 255, 0.55);
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(124, 58, 237, 0.25);
  }
  .wx-mega-cat {
    font-family: 'Satoshi', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #7c3aed;
  }
  .wx-mega-title {
    font-family: 'Satoshi', sans-serif;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.25;
    color: #0e0e12;
  }
  .wx-mega-desc {
    font-family: 'Satoshi', sans-serif;
    font-size: 14px;
    line-height: 1.45;
    color: #55555f;
  }
  .wx-mega-foot {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 2px;
    padding: 14px 16px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    text-decoration: none;
    color: #0e0e12;
    font-family: 'Satoshi', sans-serif;
    font-size: 15px;
    font-weight: 700;
    transition: background 0.25s ease, box-shadow 0.25s ease;
  }
  .wx-mega-foot:hover { background: #ffffff; box-shadow: 0 10px 26px rgba(0,0,0,0.35); }
  .wx-mega-foot svg { transition: transform 0.25s ease; }
  .wx-mega-foot:hover svg { transform: translateX(4px); }

  /* Right social cluster */
  .wx-nav-cta-wrap { display: flex; align-items: center; gap: 12px; }
  .wx-nav-socials { display: flex; align-items: center; gap: 4px; padding: 6px 10px; }
  .wx-nav-social {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    transition: color 0.25s ease, background 0.25s ease, transform 0.25s ease;
  }
  .wx-nav-social svg { width: 16px; height: 16px; }
  .wx-nav-social:hover { color: #fff; background: rgba(157, 92, 255, 0.18); transform: translateY(-2px); }

  /* Hamburger */
  .wx-nav-hamburger {
    display: none;
    pointer-events: auto;
    flex-direction: column;
    justify-content: space-between;
    width: 22px;
    height: 14px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 9005;
  }
  .wx-nav-hamburger span {
    width: 100%;
    height: 2px;
    background: #ffffff;
    border-radius: 2px;
    transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease;
  }

  /* ---------- Scroll-triggered compact state + FAB ---------- */
  /* When scrolled, the pill nav collapses toward the top-right and the
     hamburger FAB grows out of that same corner — reads as one morph. */
  .wx-navbar.wx-nav-away { pointer-events: none; }
  .wx-navbar.wx-nav-away .wx-nav-logo {
    opacity: 0;
    transform: translateX(-34px) scale(0.9);
  }
  .wx-navbar.wx-nav-away .wx-nav-links-wrap {
    opacity: 0;
    transform: translateY(-20px) scale(0.85);
  }
  .wx-navbar.wx-nav-away .wx-nav-cta-wrap {
    opacity: 0;
    transform: translateX(30px) scale(0.6);
  }

  .wx-fab {
    position: fixed;
    top: 22px;
    right: clamp(16px, 4vw, 36px);
    width: 54px;
    height: 54px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(12, 12, 15, 0.55);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 10px 30px rgba(0,0,0,0.35);
    cursor: pointer;
    padding: 0;
    z-index: 9402;
    opacity: 0;
    transform: scale(0.3) rotate(-110deg);
    pointer-events: none;
    transition: opacity 0.35s ease, transform 0.55s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease;
  }
  .wx-fab.wx-show {
    opacity: 1;
    transform: none;
    pointer-events: auto;
    transition-delay: 0.12s;
  }
  .wx-fab:hover { background: rgba(157, 92, 255, 0.35); }

  .wx-fab-lines { position: relative; width: 22px; height: 14px; }
  .wx-fab-lines span {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    background: #ffffff;
    border-radius: 2px;
    transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease;
  }
  .wx-fab-lines span:nth-child(1) { top: 0; }
  .wx-fab-lines span:nth-child(2) { top: 6px; }
  .wx-fab-lines span:nth-child(3) { top: 12px; }
  .wx-fab.wx-open .wx-fab-lines span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
  .wx-fab.wx-open .wx-fab-lines span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .wx-fab.wx-open .wx-fab-lines span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

  /* Backdrop */
  .wx-drawer-scrim {
    position: fixed;
    inset: 0;
    background: rgba(6, 6, 8, 0.55);
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
    z-index: 9400;
  }
  .wx-drawer-scrim.wx-open { opacity: 1; pointer-events: auto; }

  /* Right-side sliding drawer */
  .wx-drawer {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: min(86vw, 380px);
    display: flex;
    flex-direction: column;
    padding: 104px 38px 40px;
    background: rgba(12, 12, 15, 0.96);
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    backdrop-filter: blur(30px) saturate(180%);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: -30px 0 80px rgba(0,0,0,0.5);
    transform: translateX(100%);
    transition: transform 0.55s cubic-bezier(0.16,1,0.3,1);
    z-index: 9401;
  }
  .wx-drawer.wx-open { transform: translateX(0); }

  .wx-drawer-eyebrow {
    font-family: 'Satoshi', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #9D5CFF;
    margin-bottom: 22px;
  }
  .wx-drawer-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    font-family: 'Satoshi', sans-serif;
    font-size: 26px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    opacity: 0;
    transform: translateX(24px);
    transition: color 0.25s ease, opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1);
  }
  .wx-drawer.wx-open .wx-drawer-link {
    opacity: 1;
    transform: translateX(0);
  }
  .wx-drawer.wx-open .wx-drawer-link:nth-child(2) { transition-delay: 0.06s; }
  .wx-drawer.wx-open .wx-drawer-link:nth-child(3) { transition-delay: 0.12s; }
  .wx-drawer.wx-open .wx-drawer-link:nth-child(4) { transition-delay: 0.18s; }
  .wx-drawer.wx-open .wx-drawer-link:nth-child(5) { transition-delay: 0.24s; }
  .wx-drawer.wx-open .wx-drawer-link:nth-child(6) { transition-delay: 0.30s; }
  .wx-drawer-link:hover { color: #ffffff; }
  .wx-drawer-link .wx-drawer-arrow { color: #9D5CFF; opacity: 0; transform: translateX(-8px); transition: opacity 0.25s ease, transform 0.25s ease; }
  .wx-drawer-link:hover .wx-drawer-arrow { opacity: 1; transform: translateX(0); }
  .wx-drawer-link.wx-current { color: #ffffff; }
  .wx-drawer-link.wx-current .wx-drawer-arrow { opacity: 1; transform: translateX(0); }

  .wx-drawer-socials {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: auto;
    padding-top: 30px;
  }
  .wx-drawer-socials a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    color: rgba(255,255,255,0.65);
    border: 1px solid rgba(255,255,255,0.1);
    transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease;
  }
  .wx-drawer-socials a svg { width: 18px; height: 18px; }
  .wx-drawer-socials a:hover { color: #fff; background: rgba(157,92,255,0.2); border-color: rgba(157,92,255,0.45); }

  /* ---------- Mobile ---------- */
  @media (max-width: 820px) {
    .wx-nav-container { top: 16px; }
    .wx-navbar { padding: 0; }
    .wx-nav-logo { padding: 10px 18px; font-size: 17px; }

    .wx-navbar .wx-nav-socials { display: none !important; }

    .wx-nav-cta-wrap {
      pointer-events: auto;
      padding: 13px 15px;
      background: rgba(10, 10, 12, 0.35);
      -webkit-backdrop-filter: blur(20px) saturate(195%);
      backdrop-filter: blur(20px) saturate(195%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 40px;
    }
    .wx-nav-hamburger { display: flex; }

    .wx-mega { display: none !important; }
    .wx-nav-caret { display: none; }

    .wx-nav-links-wrap {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 12px;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      padding: 16px;
      border-radius: 24px;
      background: rgba(10, 10, 12, 0.95);
      -webkit-backdrop-filter: blur(30px);
      backdrop-filter: blur(30px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
      transform: translateY(-15px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease;
      z-index: 9001;
    }
    .wx-nav-links-wrap.wx-active { transform: translateY(0); opacity: 1; pointer-events: auto; }
    .wx-nav-item { width: 100%; }
    .wx-nav-link {
      width: 100%;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
      padding: 12px 0;
      color: rgba(255, 255, 255, 0.75);
    }

    .wx-nav-hamburger.wx-active span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
    .wx-nav-hamburger.wx-active span:nth-child(2) { transform: translateY(-6px) rotate(-45deg); }
  }
  `;

  /* ------------------------------------------------------------------ */
  /* 2. Markup                                                          */
  /* ------------------------------------------------------------------ */
  var HTML = `
  <header class="wx-nav-container" data-header>
    <div class="wx-navbar" id="wx-navbar">
      <a href="index.html" class="wx-nav-logo">
        <svg width="18" height="18" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="wx-nav-logo-svg">
          <circle cx="2" cy="7" r="1.2" fill="currentColor"/><circle cx="7" cy="2" r="1.2" fill="currentColor"/>
          <circle cx="12" cy="7" r="1.2" fill="currentColor"/><circle cx="7" cy="12" r="1.2" fill="currentColor"/>
          <circle cx="3.5" cy="3.5" r="1.2" fill="currentColor"/><circle cx="10.5" cy="3.5" r="1.2" fill="currentColor"/>
          <circle cx="3.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="10.5" cy="10.5" r="1.2" fill="currentColor"/>
        </svg>
        <span>Web<span class="wx-logo-purple">{X}</span></span>
      </a>

      <div class="wx-nav-links-wrap" id="wx-nav-links-wrap">
        <div class="wx-nav-item"><a href="index.html" class="wx-nav-link" data-nav="home">Home</a></div>
        <div class="wx-nav-item"><a href="work.html" class="wx-nav-link" data-nav="work">Work</a></div>
        <div class="wx-nav-item"><a href="studio.html" class="wx-nav-link" data-nav="about">About</a></div>
        <div class="wx-nav-item" id="wx-res-item">
          <a href="blog.html" class="wx-nav-link" data-nav="resources">
            Resources
            <svg class="wx-nav-caret" width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <div class="wx-mega" id="wx-mega">
            <a class="wx-mega-card" href="blog-core-web-vitals.html">
              <span class="wx-mega-cat">Site speed &amp; SEO</span>
              <span class="wx-mega-title">Core Web Vitals in 2026</span>
              <span class="wx-mega-desc">LCP, INP &amp; CLS in plain English — and the fixes that pass Google.</span>
            </a>
            <a class="wx-mega-card" href="blog-website-cost.html">
              <span class="wx-mega-cat">Pricing</span>
              <span class="wx-mega-title">What a Website Costs in 2026</span>
              <span class="wx-mega-desc">Transparent pricing in INR &amp; USD, and what really drives it.</span>
            </a>
            <a class="wx-mega-card" href="blog-landing-page-vs-website.html">
              <span class="wx-mega-cat">Strategy</span>
              <span class="wx-mega-title">Landing Page vs Website</span>
              <span class="wx-mega-desc">Which does your business need — and how choosing wrong loses leads.</span>
            </a>
            <a class="wx-mega-card" href="blog-choosing-web-design-agency.html">
              <span class="wx-mega-cat">Hiring</span>
              <span class="wx-mega-title">Choosing a Web Design Agency</span>
              <span class="wx-mega-desc">Questions to ask and red flags to avoid when hiring globally.</span>
            </a>
            <a class="wx-mega-foot" href="blog.html">
              <span>Browse all resources</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div>
        <div class="wx-nav-item"><a href="contact.html" class="wx-nav-link" data-nav="contact">Contact us</a></div>
      </div>

      <div class="wx-nav-cta-wrap">
        <div class="wx-nav-socials">
          <a href="https://www.instagram.com/thewebx.official" target="_blank" rel="noopener" class="wx-nav-social" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg>
          </a>
          <a href="https://x.com/theWebxOfficial" target="_blank" rel="noopener" class="wx-nav-social" aria-label="X (Twitter)">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.9 2.5h3.3l-7.2 8.24L23.5 21.5h-6.63l-5.2-6.79-5.94 6.79H2.42l7.7-8.8L1.5 2.5h6.8l4.7 6.2 5.9-6.2Zm-1.16 17.02h1.83L7.34 4.38H5.38l12.36 15.14Z"/></svg>
          </a>
          <a href="https://www.linkedin.com/company/webxstudio" target="_blank" rel="noopener" class="wx-nav-social" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6.94 5.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.4 8.4h3.06V21H3.4V8.4Zm5.02 0h2.93v1.72h.04c.41-.77 1.4-1.58 2.89-1.58 3.09 0 3.66 2.03 3.66 4.68V21h-3.05v-5.58c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94V21H8.42V8.4Z"/></svg>
          </a>
          <a href="https://dribbble.com/hello-webx" target="_blank" rel="noopener" class="wx-nav-social" aria-label="Dribbble">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="1.8"/><path d="M5 8.5c3.8 1 8.9 1.2 13-.4M3.4 13.4c4-1 7.9-.5 11 1.8M9 3.6c3 3.6 5.4 8 6.2 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </a>
        </div>
        <button class="wx-nav-hamburger" id="wx-nav-hamburger" aria-label="Toggle Navigation Menu">
          <span></span><span></span>
        </button>
      </div>
    </div>
  </header>

  <button class="wx-fab" id="wx-fab" aria-label="Open menu" aria-expanded="false">
    <span class="wx-fab-lines"><span></span><span></span><span></span></span>
  </button>

  <div class="wx-drawer-scrim" id="wx-drawer-scrim"></div>

  <aside class="wx-drawer" id="wx-drawer" aria-hidden="true">
    <span class="wx-drawer-eyebrow">Menu</span>
    <a href="index.html" class="wx-drawer-link" data-nav="home">Home <span class="wx-drawer-arrow">&#8599;</span></a>
    <a href="work.html" class="wx-drawer-link" data-nav="work">Work <span class="wx-drawer-arrow">&#8599;</span></a>
    <a href="studio.html" class="wx-drawer-link" data-nav="about">About <span class="wx-drawer-arrow">&#8599;</span></a>
    <a href="blog.html" class="wx-drawer-link" data-nav="resources">Resources <span class="wx-drawer-arrow">&#8599;</span></a>
    <a href="contact.html" class="wx-drawer-link" data-nav="contact">Contact us <span class="wx-drawer-arrow">&#8599;</span></a>
    <div class="wx-drawer-socials">
      <a href="https://www.instagram.com/thewebx.official" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg></a>
      <a href="https://x.com/theWebxOfficial" target="_blank" rel="noopener" aria-label="X (Twitter)"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.9 2.5h3.3l-7.2 8.24L23.5 21.5h-6.63l-5.2-6.79-5.94 6.79H2.42l7.7-8.8L1.5 2.5h6.8l4.7 6.2 5.9-6.2Zm-1.16 17.02h1.83L7.34 4.38H5.38l12.36 15.14Z"/></svg></a>
      <a href="https://www.linkedin.com/company/webxstudio" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6.94 5.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.4 8.4h3.06V21H3.4V8.4Zm5.02 0h2.93v1.72h.04c.41-.77 1.4-1.58 2.89-1.58 3.09 0 3.66 2.03 3.66 4.68V21h-3.05v-5.58c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94V21H8.42V8.4Z"/></svg></a>
      <a href="https://dribbble.com/hello-webx" target="_blank" rel="noopener" aria-label="Dribbble"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="1.8"/><path d="M5 8.5c3.8 1 8.9 1.2 13-.4M3.4 13.4c4-1 7.9-.5 11 1.8M9 3.6c3 3.6 5.4 8 6.2 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></a>
    </div>
  </aside>`;

  /* ------------------------------------------------------------------ */
  /* 3. Init                                                            */
  /* ------------------------------------------------------------------ */
  function init() {
    // Inject CSS
    var style = document.createElement('style');
    style.setAttribute('data-wx-nav', '');
    style.textContent = CSS;
    document.head.appendChild(style);

    // Insert markup (header + FAB + scrim + drawer)
    var tmp = document.createElement('div');
    tmp.innerHTML = HTML.trim();
    var nodes = Array.prototype.slice.call(tmp.children);
    var header = nodes[0];
    var existing = document.querySelector('header[data-header]');
    if (existing) existing.replaceWith(header);
    else document.body.insertBefore(header, document.body.firstChild);
    // append the remaining pieces (fab, scrim, drawer) to the body
    for (var i = 1; i < nodes.length; i++) document.body.appendChild(nodes[i]);

    var navbar = header.querySelector('#wx-navbar');
    var hamburger = header.querySelector('#wx-nav-hamburger');
    var linksWrap = header.querySelector('#wx-nav-links-wrap');
    var fab = document.getElementById('wx-fab');
    var drawer = document.getElementById('wx-drawer');
    var scrim = document.getElementById('wx-drawer-scrim');

    // -- Active link highlight --
    var file = (window.location.pathname.split('/').pop() || '').split('?')[0].split('#')[0].toLowerCase();
    if (file === '' || file === './') file = 'index.html';
    if (file && file.indexOf('.') === -1) file += '.html';

    var match = 'home';
    if (file === 'index.html') match = 'home';
    else if (file === 'work.html' || file.indexOf('case-study') === 0) match = 'work';
    else if (file === 'studio.html') match = 'about';
    else if (file === 'blog.html' || file.indexOf('blog-') === 0) match = 'resources';
    else if (file === 'contact.html') match = 'contact';
    else match = null;

    if (match) {
      var active = linksWrap.querySelector('.wx-nav-link[data-nav="' + match + '"]');
      if (active) active.classList.add('wx-current');
      var activeDrawer = drawer && drawer.querySelector('.wx-drawer-link[data-nav="' + match + '"]');
      if (activeDrawer) activeDrawer.classList.add('wx-current');
    }

    // -- Scroll: darken pills, then hand off to the floating FAB --
    var revealAt = function () { return Math.min(window.innerHeight * 0.7, 620); };
    if (navbar) {
      var onScroll = function () {
        var y = window.scrollY;
        if (y > 20) navbar.classList.add('wx-scrolled');
        else navbar.classList.remove('wx-scrolled');

        if (y > revealAt()) {
          navbar.classList.add('wx-nav-away');
          if (fab) fab.classList.add('wx-show');
        } else {
          navbar.classList.remove('wx-nav-away');
          if (fab) fab.classList.remove('wx-show');
          closeDrawer();
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // -- Floating FAB drawer --
    function openDrawer() {
      if (!drawer) return;
      drawer.classList.add('wx-open');
      scrim.classList.add('wx-open');
      fab.classList.add('wx-open');
      fab.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      if (!drawer || !drawer.classList.contains('wx-open')) return;
      drawer.classList.remove('wx-open');
      scrim.classList.remove('wx-open');
      fab.classList.remove('wx-open');
      fab.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    if (fab) {
      fab.addEventListener('click', function () {
        if (drawer.classList.contains('wx-open')) closeDrawer();
        else openDrawer();
      });
      scrim.addEventListener('click', closeDrawer);
      drawer.querySelectorAll('.wx-drawer-link').forEach(function (l) {
        l.addEventListener('click', closeDrawer);
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
    }

    // -- Resources mega dropdown (desktop hover) --
    var resItem = header.querySelector('#wx-res-item');
    if (resItem) {
      var closeTimer = null;
      var open = function () { clearTimeout(closeTimer); resItem.classList.add('wx-open'); };
      var close = function () { closeTimer = setTimeout(function () { resItem.classList.remove('wx-open'); }, 160); };
      resItem.addEventListener('mouseenter', open);
      resItem.addEventListener('mouseleave', close);
      resItem.addEventListener('focusin', open);
      resItem.addEventListener('focusout', close);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') resItem.classList.remove('wx-open'); });
    }

    // -- Mobile menu toggle --
    if (hamburger && linksWrap) {
      hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('wx-active');
        linksWrap.classList.toggle('wx-active');
      });
      linksWrap.querySelectorAll('.wx-nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
          hamburger.classList.remove('wx-active');
          linksWrap.classList.remove('wx-active');
        });
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
