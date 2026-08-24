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
    /* Matches the site-wide section wrapper: 1340px cap, 20px gutters. */
    width: min(100% - 40px, 1340px);
    z-index: 9000;
    pointer-events: none;
    transition: top 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    /* The header creates its own stacking context, so the hamburger cannot
       rise above the drawer (9401) on its own — lift the whole header while
       the menu is open, otherwise the close icon paints underneath it. */
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    border-radius: 40px !important;
  }
  .wx-nav-container.wx-menu-open { z-index: 9402; }

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
  .wx-nav-links-wrap,
  .wx-nav-socials {
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.65);
    -webkit-backdrop-filter: blur(20px) saturate(195%);
    backdrop-filter: blur(20px) saturate(195%);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 4px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5);
    border-radius: 40px;
    transition: background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
  }

  .wx-navbar.wx-scrolled .wx-nav-links-wrap,
  .wx-navbar.wx-scrolled .wx-nav-socials {
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(0, 0, 0, 0.1);
    box-shadow: 0 12px 45px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6);
  }

  /* Logo */
  .wx-nav-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    pointer-events: auto;
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
    text-decoration: none;
    font-family: 'Satoshi', sans-serif;
    font-weight: 700;
    color: #1A1A1A;
  }
  .wx-nav-logo:hover { transform: scale(1.02); }
  .wx-nav-logo-svg { width: 50px; height: 50px; display: block; }
  .wx-nav-logo-word { width: 50px; text-align: center; font-size: 15px; line-height: 1; letter-spacing: 0.01em; }
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
    color: rgba(0, 0, 0, 0.55);
    text-decoration: none;
    padding: 9px 18px;
    border-radius: 22px;
    white-space: nowrap;
    transition: color 0.25s ease, background-color 0.25s ease;
  }
  .wx-nav-link:hover { color: #9D5CFF; background: rgba(157, 92, 255, 0.08); }

  /* Active / current page — filled purple pill */
  .wx-nav-link.wx-current {
    color: #ffffff;
    background: #9D5CFF;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(157, 92, 255, 0.3);
  }
  .wx-nav-link.wx-current:hover { background: #8A4AE6; color: #ffffff; }

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
    color: #1A1A1A;
    background: rgba(157, 92, 255, 0.12);
    text-decoration: none;
    transition: color 0.25s ease, background 0.25s ease, transform 0.25s ease;
  }
  .wx-nav-social svg { width: 16px; height: 16px; }
  .wx-nav-social:hover { color: #ffffff; background: #9D5CFF; transform: translateY(-2px); }

  /* Hamburger — lives inside the bar, high-contrast so it reads on dark pages */
  .wx-nav-hamburger {
    display: none;
    pointer-events: auto;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #9D5CFF;
    border: 1px solid rgba(255, 255, 255, 0.28);
    box-shadow: 0 12px 30px -8px rgba(157, 92, 255, 0.75), inset 0 1px 0 rgba(255,255,255,0.25);
    cursor: pointer;
    padding: 0;
    z-index: 9405;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
  }
  .wx-nav-hamburger:active { transform: scale(0.94); }
  .wx-nav-hamburger.wx-open { background: #8247E5; border-color: rgba(255,255,255,0.4); }

  .wx-burger-lines { position: relative; width: 24px; height: 16px; }
  .wx-burger-lines span {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2.5px;
    background: #ffffff;
    border-radius: 3px;
    transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease;
  }
  .wx-burger-lines span:nth-child(1) { top: 0; }
  .wx-burger-lines span:nth-child(2) { top: 6.75px; }
  .wx-burger-lines span:nth-child(3) { top: 13.5px; }
  .wx-nav-hamburger.wx-open .wx-burger-lines span:nth-child(1) { transform: translateY(6.75px) rotate(45deg); }
  .wx-nav-hamburger.wx-open .wx-burger-lines span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .wx-nav-hamburger.wx-open .wx-burger-lines span:nth-child(3) { transform: translateY(-6.75px) rotate(-45deg); }

  /* ---------- Desktop condense ----------
     Past the scroll threshold the whole bar folds up into a single hamburger
     in the top-right. Each piece collapses toward that corner in sequence —
     links first, then the logo, then the socials pill shrinking onto its own
     right edge, which is exactly where the burger pops in — so it reads as the
     navbar turning into the burger rather than one swapping for the other. */
  @media (min-width: 821px) {
    .wx-nav-cta-wrap { position: relative; }

    /* Present but inert until condensed, so it can actually transition
       (a display:none -> flex swap would just snap). */
    .wx-nav-hamburger {
      display: flex;
      position: absolute;
      right: 0;
      top: 50%;
      opacity: 0;
      transform: translateY(-50%) scale(0.4) rotate(-30deg);
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
                  background 0.25s ease, border-color 0.25s ease;
    }
    .wx-nav-hamburger:active { transform: translateY(-50%) scale(0.94); }

    .wx-navbar.wx-condensed .wx-nav-logo,
    .wx-navbar.wx-condensed .wx-nav-links-wrap,
    .wx-navbar.wx-condensed .wx-nav-socials { pointer-events: none; }

    .wx-navbar.wx-condensed .wx-nav-links-wrap {
      opacity: 0;
      transform: translateX(90px) scale(0.72);
      filter: blur(5px);
      transform-origin: 100% 50%;
    }
    .wx-navbar.wx-condensed .wx-nav-logo {
      opacity: 0;
      transform: translate(34px, -8px) scale(0.7);
      transition-delay: 0.05s;
    }
    .wx-navbar.wx-condensed .wx-nav-socials {
      opacity: 0;
      transform: scale(0.5);
      transform-origin: 100% 50%;
      transition-delay: 0.08s;
    }
    .wx-navbar.wx-condensed .wx-nav-hamburger {
      opacity: 1;
      transform: translateY(-50%) scale(1) rotate(0deg);
      pointer-events: auto;
      transition-delay: 0.16s;
    }
    /* Expanding back: burger leaves first, then the bar unfolds */
    .wx-navbar .wx-nav-links-wrap { transition-delay: 0.12s; }
    .wx-navbar .wx-nav-logo { transition-delay: 0.08s; }
    .wx-navbar .wx-nav-socials { transition-delay: 0.05s; }

    /* An open drawer must never leave the bar half-collapsed behind it */
    .wx-nav-container.wx-menu-open .wx-navbar .wx-nav-hamburger {
      opacity: 1;
      transform: translateY(-50%) scale(1);
      pointer-events: auto;
      transition-delay: 0s;
    }

    @media (prefers-reduced-motion: reduce) {
      .wx-navbar .wx-nav-logo,
      .wx-navbar .wx-nav-links-wrap,
      .wx-navbar .wx-nav-socials,
      .wx-nav-hamburger { transition: none; filter: none; }
    }
  }

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
    /* No shadow while closed: the drawer is parked off-screen right, and a
       leftward-cast shadow bleeds ~110px back onto the page down the whole
       right edge. Invisible on dark pages, obvious on light ones. */
    box-shadow: none;
    transform: translateX(100%);
    transition: transform 0.55s cubic-bezier(0.16,1,0.3,1), box-shadow 0.55s ease;
    z-index: 9401;
  }
  .wx-drawer.wx-open {
    transform: translateX(0);
    box-shadow: -30px 0 80px rgba(0,0,0,0.5);
  }

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
    /* Edge-to-edge sticky bar instead of the floating pill */
    .wx-nav-container {
      top: 0;
      width: 100%;
      border-radius: 0 !important;
    }
    .wx-navbar {
      pointer-events: auto;
      padding: 8px 16px;
      padding-left: max(16px, env(safe-area-inset-left));
      padding-right: max(16px, env(safe-area-inset-right));
      background: rgba(255, 255, 255, 0.8) !important;
      -webkit-backdrop-filter: blur(18px) saturate(180%);
      backdrop-filter: blur(18px) saturate(180%);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
    }
    .wx-navbar.wx-scrolled {
      background: rgba(255, 255, 255, 0.92) !important;
      box-shadow: 0 8px 30px rgba(0,0,0,0.08) !important;
    }

    /* Mark only — the wordmark is dropped on mobile to keep the bar slim */
    .wx-nav-logo { flex-direction: row; gap: 8px; padding: 0; }
    .wx-nav-logo-svg { width: 40px; height: 40px; }
    .wx-nav-logo-word { display: none; }

    /* While the drawer is open the bar floats bare over it, so the close
       icon and logo read against the drawer surface, not a second panel. */
    .wx-nav-container.wx-menu-open .wx-navbar {
      background: transparent !important;
      border-bottom-color: transparent !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
    }

    /* Links + socials collapse into the drawer; only the burger stays */
    .wx-navbar .wx-nav-socials { display: none !important; }
    .wx-nav-cta-wrap { display: flex !important; gap: 0; }
    .wx-nav-hamburger { display: flex !important; }
    .wx-nav-links-wrap { display: none !important; }
    .wx-mega { display: none !important; }
    .wx-nav-caret { display: none; }

    /* Drawer clears the bar */
    .wx-drawer { padding-top: 92px; }
  }

  /* WhatsApp floating button (bottom-right, sitewide) */
  .wx-wa-fab {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 9500;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #9D5CFF;
    box-shadow: 0 8px 24px rgba(157, 92, 255, 0.4), 0 2px 8px rgba(0, 0, 0, 0.35);
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .wx-wa-fab svg { width: 30px; height: 30px; display: block; }
  .wx-wa-fab:hover { transform: scale(1.08); box-shadow: 0 12px 30px rgba(157, 92, 255, 0.6); }
  @media (max-width: 820px) {
    .wx-wa-fab { width: 52px; height: 52px; right: 16px; bottom: 16px; }
    .wx-wa-fab svg { width: 27px; height: 27px; }
  }
  `;

  /* ------------------------------------------------------------------ */
  /* 2. Markup                                                          */
  /* ------------------------------------------------------------------ */
  var HTML = `
  <header class="wx-nav-container" data-header>
    <div class="wx-navbar" id="wx-navbar">
      <a href="index.html" class="wx-nav-logo">
        <img src="logo-black.svg" alt="Web{X}" class="wx-nav-logo-svg" width="50" height="50" />
        <span class="wx-nav-logo-word">Web<span class="wx-logo-purple">{X}</span></span>
      </a>

      <div class="wx-nav-links-wrap" id="wx-nav-links-wrap">
        <div class="wx-nav-item"><a href="index.html" class="wx-nav-link" data-nav="home">Home</a></div>
        <div class="wx-nav-item"><a href="services.html" class="wx-nav-link" data-nav="services">Services</a></div>
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
          <a href="https://www.instagram.com/thewebx.studio" target="_blank" rel="noopener" class="wx-nav-social" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg>
          </a>
          <a href="https://x.com/theWebxOfficial" target="_blank" rel="noopener" class="wx-nav-social" aria-label="X (Twitter)">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.9 2.5h3.3l-7.2 8.24L23.5 21.5h-6.63l-5.2-6.79-5.94 6.79H2.42l7.7-8.8L1.5 2.5h6.8l4.7 6.2 5.9-6.2Zm-1.16 17.02h1.83L7.34 4.38H5.38l12.36 15.14Z"/></svg>
          </a>
          <a href="https://dribbble.com/hello-webx" target="_blank" rel="noopener" class="wx-nav-social" aria-label="Dribbble">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="1.8"/><path d="M5 8.5c3.8 1 8.9 1.2 13-.4M3.4 13.4c4-1 7.9-.5 11 1.8M9 3.6c3 3.6 5.4 8 6.2 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </a>
        </div>
        <button class="wx-nav-hamburger" id="wx-nav-hamburger" aria-label="Toggle Navigation Menu" aria-expanded="false">
          <span class="wx-burger-lines"><span></span><span></span><span></span></span>
        </button>
      </div>
    </div>
  </header>

  <div class="wx-drawer-scrim" id="wx-drawer-scrim"></div>

  <aside class="wx-drawer" id="wx-drawer" aria-hidden="true">
    <span class="wx-drawer-eyebrow">Menu</span>
    <a href="index.html" class="wx-drawer-link" data-nav="home">Home <span class="wx-drawer-arrow">&#8599;</span></a>
    <a href="services.html" class="wx-drawer-link" data-nav="services">Services <span class="wx-drawer-arrow">&#8599;</span></a>
    <a href="work.html" class="wx-drawer-link" data-nav="work">Work <span class="wx-drawer-arrow">&#8599;</span></a>
    <a href="studio.html" class="wx-drawer-link" data-nav="about">About <span class="wx-drawer-arrow">&#8599;</span></a>
    <a href="blog.html" class="wx-drawer-link" data-nav="resources">Resources <span class="wx-drawer-arrow">&#8599;</span></a>
    <a href="contact.html" class="wx-drawer-link" data-nav="contact">Contact us <span class="wx-drawer-arrow">&#8599;</span></a>
    <div class="wx-drawer-socials">
      <a href="https://www.instagram.com/thewebx.studio" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg></a>
      <a href="https://x.com/theWebxOfficial" target="_blank" rel="noopener" aria-label="X (Twitter)"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.9 2.5h3.3l-7.2 8.24L23.5 21.5h-6.63l-5.2-6.79-5.94 6.79H2.42l7.7-8.8L1.5 2.5h6.8l4.7 6.2 5.9-6.2Zm-1.16 17.02h1.83L7.34 4.38H5.38l12.36 15.14Z"/></svg></a>
      <a href="https://dribbble.com/hello-webx" target="_blank" rel="noopener" aria-label="Dribbble"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="1.8"/><path d="M5 8.5c3.8 1 8.9 1.2 13-.4M3.4 13.4c4-1 7.9-.5 11 1.8M9 3.6c3 3.6 5.4 8 6.2 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></a>
    </div>
  </aside>

  <a href="https://wa.me/919780651142?text=Hi%20Web%7BX%7D%2C%20I%27d%20like%20to%20talk%20about%20your%20pricing%20plans." class="wx-wa-fab" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp" title="Chat with us on WhatsApp">
    <svg viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.695.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>`;

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
    var drawer = document.getElementById('wx-drawer');
    var scrim = document.getElementById('wx-drawer-scrim');

    // -- Active link highlight --
    var file = (window.location.pathname.split('/').pop() || '').split('?')[0].split('#')[0].toLowerCase();
    if (file === '' || file === './') file = 'index.html';
    if (file && file.indexOf('.') === -1) file += '.html';

    var match = 'home';
    if (file === 'index.html') match = 'home';
    else if (file === 'services.html' || file.indexOf('figma-to') === 0) match = 'services';
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

    // -- Scroll: glass darkens at 20px; past 300px the bar folds into the
    //    hamburger (desktop only — below 820px it is already burger-only).
    //    A 60px hysteresis band stops it flip-flopping when the user hovers
    //    right on the threshold.
    if (navbar) {
      var CONDENSE_IN = 300;
      var CONDENSE_OUT = 240;
      var condensed = false;

      var onScroll = function () {
        var y = window.scrollY;
        if (y > 20) navbar.classList.add('wx-scrolled');
        else navbar.classList.remove('wx-scrolled');

        if (!condensed && y > CONDENSE_IN) condensed = true;
        else if (condensed && y < CONDENSE_OUT) condensed = false;

        /* Stays condensed while the drawer is open: the drawer IS the menu, so
           unfolding the bar behind it would show two menus at once. The burger
           itself is kept visible by the .wx-menu-open rule — it doubles as the
           drawer's close button. */
        navbar.classList.toggle('wx-condensed', condensed);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      /* Re-evaluate when the menu opens/closes so the two states stay in sync */
      navbar.wxSyncCondense = onScroll;
    }

    // -- Drawer, opened from the in-bar hamburger --
    function openDrawer() {
      if (!drawer) return;
      drawer.classList.add('wx-open');
      scrim.classList.add('wx-open');
      header.classList.add('wx-menu-open');
      hamburger.classList.add('wx-open');
      hamburger.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (navbar && navbar.wxSyncCondense) navbar.wxSyncCondense();
    }
    function closeDrawer() {
      if (!drawer || !drawer.classList.contains('wx-open')) return;
      drawer.classList.remove('wx-open');
      scrim.classList.remove('wx-open');
      header.classList.remove('wx-menu-open');
      hamburger.classList.remove('wx-open');
      hamburger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (navbar && navbar.wxSyncCondense) navbar.wxSyncCondense();
    }
    if (hamburger && drawer) {
      hamburger.addEventListener('click', function () {
        if (drawer.classList.contains('wx-open')) closeDrawer();
        else openDrawer();
      });
      scrim.addEventListener('click', closeDrawer);
      drawer.querySelectorAll('.wx-drawer-link').forEach(function (l) {
        l.addEventListener('click', closeDrawer);
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
      // Rotating to landscape / resizing past the breakpoint must not strand
      // the drawer open with body scroll locked.
      window.addEventListener('resize', function () {
        if (window.innerWidth > 820) closeDrawer();
      });
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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
