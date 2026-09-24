/* =====================================================================
   Web{X} — Global Floating Glass Navigation
   Single source of truth for the header across every page.
   Include on any page with:  <script src="nav.js" defer></script>
   Injects its own CSS + markup, then wires scroll / active-link /
   mobile menu / mega-dropdown behaviour (Services + Resources).
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

  /* ---------- Mega panels (Services, Resources) ----------
     Full-width light panels under the whole bar, after orbix.studio. The
     panel lives inside its .wx-nav-item so keyboard focus order stays right,
     but the links pill has a backdrop-filter, which makes it the containing
     block for anything absolutely positioned inside it. So the pill is made
     position:relative on purpose, items go static, and placeMega() in the
     script sets left / width / top to span the full navbar each time a
     panel opens. The ::before strip bridges the gap under the pill so the
     pointer can travel down without the panel closing. */
  .wx-nav-links-wrap { position: relative; }
  .wx-nav-item[data-mega] { position: static; }

  .wx-mega {
    position: absolute;
    top: calc(100% + 18px);
    left: 0;
    width: min(92vw, 1340px);
    max-height: calc(100vh - 130px);
    overflow: auto;
    overscroll-behavior: contain;
    padding: 12px;
    background: #FFFFFF;
    border: 1px solid rgba(23, 18, 54, 0.08);
    border-radius: 28px;
    box-shadow: 0 40px 90px -34px rgba(23, 18, 54, 0.42), 0 2px 6px rgba(23, 18, 54, 0.04);
    display: grid;
    gap: 12px;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(12px) scale(0.985);
    transform-origin: 50% 0;
    transition: opacity 0.3s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s;
    z-index: 9001;
    text-align: left;
    scrollbar-width: thin;
  }
  .wx-mega::before {
    content: "";
    position: absolute;
    top: calc(-1 * var(--wx-bridge-h, 24px));
    left: var(--wx-bridge-l, 0);
    width: var(--wx-bridge-w, 100%);
    height: var(--wx-bridge-h, 24px);
  }
  .wx-nav-item.wx-open .wx-mega {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: none;
  }

  /* Children rise in one after another as the panel opens */
  .wx-mega [data-i] {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.4s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
                background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.35s ease;
  }
  .wx-nav-item.wx-open .wx-mega [data-i] {
    opacity: 1;
    transform: none;
    transition-delay: calc(var(--i, 0) * 40ms + 60ms), calc(var(--i, 0) * 40ms + 60ms), 0s, 0s, 0s;
  }

  /* ---- Services ---- */
  .wx-mega--svc { grid-template-columns: minmax(0, 3fr) minmax(0, 1.08fr); }
  .wx-mega-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }

  .wx-mcard {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 28px;
    min-height: 210px;
    padding: 20px;
    border-radius: 20px;
    background: #F5F4F9;
    border: 1px solid transparent;
    text-decoration: none;
    color: #1A1A1A;
  }
  .wx-mcard:hover, .wx-mcard:focus-visible {
    background: #FFFFFF;
    border-color: rgba(157, 92, 255, 0.35);
    box-shadow: 0 18px 40px -22px rgba(124, 58, 237, 0.45);
    outline: none;
  }
  .wx-mcard-head { display: flex; align-items: flex-start; gap: 14px; padding-right: 34px; }
  .wx-mcard-ic, .wx-mrow-ic {
    flex: 0 0 auto;
    width: 44px; height: 44px;
    display: grid; place-items: center;
    border-radius: 50%;
    background: #FFFFFF;
    color: #7C3AED;
    box-shadow: 0 1px 2px rgba(23, 18, 54, 0.06);
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  .wx-mcard-ic svg, .wx-mrow-ic svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  .wx-mcard:hover .wx-mcard-ic { background: #9D5CFF; color: #FFFFFF; }
  .wx-mcard-txt, .wx-mrow-txt { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .wx-mcard-txt b, .wx-mrow-txt b {
    font-family: 'Manrope', 'Satoshi', sans-serif;
    font-size: 18px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; color: #1A1A1A;
  }
  .wx-mcard-txt small, .wx-mrow-txt small {
    font-family: 'Satoshi', sans-serif; font-size: 13.5px; line-height: 1.4; color: #6B6B75;
  }
  .wx-marr {
    position: absolute; top: 16px; right: 16px;
    width: 30px; height: 30px; border-radius: 50%;
    display: grid; place-items: center;
    background: #FFFFFF; color: #1A1A1A;
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .wx-marr svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .wx-mcard:hover .wx-marr, .wx-mrow:hover .wx-marr { background: #1A1A1A; color: #FFFFFF; transform: rotate(45deg); }
  .wx-mcard-tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .wx-mcard-tags i {
    font-style: normal;
    font-family: 'Satoshi', sans-serif; font-size: 12.5px; font-weight: 500; line-height: 1;
    color: #43434D;
    padding: 8px 12px;
    border-radius: 100px;
    background: #FFFFFF;
    border: 1px solid rgba(23, 18, 54, 0.07);
    transition: border-color 0.3s ease, background-color 0.3s ease;
  }
  .wx-mcard:hover .wx-mcard-tags i { background: #F6F2FF; border-color: rgba(157, 92, 255, 0.22); }

  .wx-mega-side {
    display: flex; flex-direction: column;
    padding: 8px 10px;
    border-radius: 20px;
    background: #F5F4F9;
  }
  .wx-mega-side-h {
    font-family: 'Satoshi', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase; color: #7C3AED;
    padding: 12px 10px 6px;
  }
  .wx-mrow {
    position: relative;
    display: flex; align-items: center; gap: 14px;
    padding: 12px 48px 12px 10px;
    border-radius: 16px;
    text-decoration: none;
  }
  .wx-mrow + .wx-mrow { border-top: 1px solid rgba(23, 18, 54, 0.07); }
  .wx-mrow:hover + .wx-mrow, .wx-mrow:hover { border-top-color: transparent; }
  .wx-mrow:hover, .wx-mrow:focus-visible { background: #FFFFFF; outline: none; box-shadow: 0 12px 28px -18px rgba(124, 58, 237, 0.4); }
  .wx-mrow-ic { width: 40px; height: 40px; }
  .wx-mrow-ic img { width: 20px; height: 20px; object-fit: contain; }
  .wx-mrow-txt b { font-size: 15.5px; }
  .wx-mrow-txt small { font-size: 12.5px; }
  .wx-mrow .wx-marr { top: 50%; right: 10px; margin-top: -15px; }
  .wx-mrow--all { margin-top: auto; }
  .wx-mrow--all .wx-mrow-txt b { color: #7C3AED; }

  /* ---- Resources ---- */
  .wx-mega--res { grid-template-columns: minmax(0, 1.05fr) repeat(3, minmax(0, 1fr)); }
  .wx-mega-intro {
    display: flex; flex-direction: column;
    padding: 22px 18px 16px 18px;
  }
  .wx-mega-big {
    margin: 0 0 16px;
    font-family: 'Manrope', 'Satoshi', sans-serif;
    font-size: clamp(34px, 3.3vw, 50px); font-weight: 700; line-height: 0.98; letter-spacing: -0.045em;
    color: #1A1A1A;
  }
  .wx-mega-big em { font-style: normal; color: #9D5CFF; }
  .wx-mega-lead {
    margin: 0 0 22px;
    font-family: 'Satoshi', sans-serif; font-size: 15px; line-height: 1.6; color: #55555F;
  }
  .wx-mega-quick { display: flex; flex-direction: column; gap: 10px; }
  .wx-mega-quick a {
    font-family: 'Satoshi', sans-serif; font-size: 14.5px; font-weight: 600;
    color: #1A1A1A; text-decoration: none; width: max-content;
    background: linear-gradient(currentColor, currentColor) 0 100% / 0 1.5px no-repeat;
    transition: background-size 0.35s ease, color 0.25s ease;
  }
  .wx-mega-quick a:hover { color: #7C3AED; background-size: 100% 1.5px; }
  .wx-mega-browse {
    margin-top: auto;
    padding-top: 26px;
    display: inline-flex; align-items: center; gap: 14px;
    font-family: 'Manrope', 'Satoshi', sans-serif; font-size: 19px; font-weight: 700; letter-spacing: -0.02em;
    color: #1A1A1A; text-decoration: none;
  }
  .wx-mega-browse .wx-marr { position: static; width: 46px; height: 46px; border: 1px solid rgba(23, 18, 54, 0.12); }
  .wx-mega-browse:hover .wx-marr { background: #9D5CFF; border-color: #9D5CFF; color: #FFFFFF; transform: rotate(45deg); }
  .wx-mega-browse .wx-marr svg { width: 15px; height: 15px; }

  .wx-acard {
    position: relative;
    display: flex; flex-direction: column;
    min-height: 430px;
    border-radius: 20px;
    overflow: hidden;
    background: #F5F4F9;
    border: 1px solid transparent;
    text-decoration: none;
    color: #1A1A1A;
    cursor: pointer;
  }
  .wx-acard:hover, .wx-acard:focus-visible { border-color: rgba(157, 92, 255, 0.35); outline: none; }
  .wx-acard-body { padding: 22px 22px 18px; display: flex; flex-direction: column; gap: 10px; }
  .wx-acard-cat {
    font-family: 'Satoshi', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase; color: #7C3AED;
  }
  .wx-acard b {
    font-family: 'Manrope', 'Satoshi', sans-serif; font-size: 19px; font-weight: 700;
    letter-spacing: -0.02em; line-height: 1.22;
  }
  .wx-acard small { font-family: 'Satoshi', sans-serif; font-size: 14px; line-height: 1.55; color: #55555F; }
  .wx-acard-img { margin-top: auto; height: 200px; overflow: hidden; background: #ECEAF3; }
  .wx-acard-img img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transform: scale(1.001);
    transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
    opacity: 0;
  }
  .wx-acard-img img.is-loaded { opacity: 1; }
  .wx-acard:hover .wx-acard-img img { transform: scale(1.06); }
  /* "Read article" pill that follows the pointer across the card */
  .wx-acard-pill {
    position: absolute; left: var(--px, 50%); top: var(--py, 62%);
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 6px 6px 14px;
    border-radius: 100px;
    background: rgba(26, 26, 26, 0.86);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    color: #FFFFFF;
    font-family: 'Satoshi', sans-serif; font-size: 12.5px; font-weight: 600; white-space: nowrap;
    box-shadow: 0 14px 30px -12px rgba(0, 0, 0, 0.45);
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 2;
  }
  .wx-acard-pill span {
    width: 24px; height: 24px; border-radius: 50%;
    display: grid; place-items: center;
    background: #FFFFFF; color: #1A1A1A;
  }
  .wx-acard-pill svg { width: 11px; height: 11px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .wx-acard:hover .wx-acard-pill, .wx-acard:focus-visible .wx-acard-pill { opacity: 1; transform: translate(-50%, -50%) scale(1); }

  @media (max-width: 1180px) {
    .wx-mega--svc { grid-template-columns: 1fr; }
    .wx-mcard { min-height: 0; gap: 20px; padding: 16px; }
    .wx-mcard-txt b { font-size: 16.5px; }
    .wx-mcard-tags { gap: 6px; }
    .wx-mcard-tags i { font-size: 12px; padding: 7px 10px; }
    .wx-mega-side { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; }
    .wx-mega-side-h { grid-column: 1 / -1; }
    .wx-mrow + .wx-mrow { border-top: 0; }
    .wx-mega--res { grid-template-columns: minmax(0, 1fr) repeat(2, minmax(0, 1fr)); }
    .wx-mega--res .wx-acard:last-child { display: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .wx-mega, .wx-mega [data-i], .wx-acard-img img, .wx-marr { transition: opacity 0.2s ease !important; transform: none !important; }
    .wx-acard-pill { left: 50%; top: 62%; }
  }

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
  /* Staggered line lengths that even out on hover, then cross into an X */
  .wx-burger-lines span { right: 0; left: auto; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease, width 0.35s cubic-bezier(0.16,1,0.3,1); }
  .wx-burger-lines span:nth-child(2) { width: 68%; }
  .wx-burger-lines span:nth-child(3) { width: 42%; }
  .wx-nav-hamburger:hover .wx-burger-lines span,
  .wx-nav-hamburger.wx-open .wx-burger-lines span { width: 100%; }
  .wx-nav-hamburger:focus-visible { outline: 2px solid #1A1A1A; outline-offset: 3px; }
  .wx-nav-hamburger.wx-open { background: #1A1A1A; border-color: rgba(255,255,255,0.18); box-shadow: 0 12px 30px -10px rgba(0,0,0,0.5); }

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
    background: rgba(23, 18, 54, 0.32);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.45s ease, visibility 0s linear 0.45s;
    z-index: 9400;
  }
  .wx-drawer-scrim.wx-open { opacity: 1; visibility: visible; pointer-events: auto; transition: opacity 0.45s ease, visibility 0s; }

  /* Drawer — an inset light panel that matches the mega menus. The burger
     sits over its top-right corner and doubles as the close button, so the
     top row leaves room for it. */
  .wx-drawer {
    position: fixed;
    top: 12px;
    right: 12px;
    bottom: 12px;
    width: min(460px, calc(100vw - 24px));
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 28px 22px 20px;
    background: #FFFFFF;
    border: 1px solid rgba(23, 18, 54, 0.08);
    border-radius: 28px;
    /* No shadow while closed: parked off-screen right, a leftward shadow
       would bleed back onto the page down the whole right edge. */
    box-shadow: none;
    transform: translateX(calc(100% + 24px));
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease;
    z-index: 9401;
    /* Scrolls on short screens. data-lenis-prevent on the element is what
       lets wheel events reach it past webx.js's Lenis smooth scroll. */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    scrollbar-width: none;
  }
  .wx-drawer::-webkit-scrollbar { display: none; }
  /* A flex column shrinks its children once content overflows; the drawer
     scrolls instead, so nothing inside it may be squashed. */
  .wx-drawer > * { flex-shrink: 0; }
  .wx-drawer.wx-open {
    transform: none;
    box-shadow: 0 40px 100px -30px rgba(23, 18, 54, 0.5);
  }

  /* Everything inside rises in on open, one row after another */
  .wx-drawer [data-d] {
    opacity: 0;
    transform: translateX(26px);
    transition: opacity 0.45s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .wx-drawer.wx-open [data-d] {
    opacity: 1;
    transform: none;
    transition-delay: calc(var(--d, 0) * 45ms + 120ms);
  }

  .wx-drawer-top {
    display: flex; align-items: center; gap: 12px;
    min-height: 48px;
    padding: 0 70px 0 10px;
  }
  .wx-drawer-eyebrow {
    font-family: 'Satoshi', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
    color: #7C3AED;
    padding: 7px 12px;
    border-radius: 100px;
    background: #F6F2FF;
  }
  .wx-drawer-clock {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: 'Satoshi', sans-serif; font-size: 12.5px; font-weight: 500; color: #6B6B75;
  }
  .wx-drawer-clock i {
    width: 7px; height: 7px; border-radius: 50%; background: #22C55E;
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
    animation: wx-pulse 2.2s ease-out infinite;
  }
  @keyframes wx-pulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.45); } 70%, 100% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); } }

  /* Primary links */
  .wx-drawer-nav { display: flex; flex-direction: column; }
  .wx-drawer-link {
    position: relative;
    flex: 1;
    display: flex; align-items: center; gap: 16px;
    padding: 13px 10px;
    border-radius: 18px;
    text-decoration: none;
    color: #1A1A1A;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  .wx-dl-n {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 12px; color: #A09FB0;
    width: 22px;
    transition: color 0.3s ease;
  }
  .wx-dl-t {
    font-family: 'Manrope', 'Satoshi', sans-serif;
    font-size: clamp(26px, 3.2vw, 32px); font-weight: 700; letter-spacing: -0.035em; line-height: 1;
    transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .wx-drawer-arrow {
    margin-left: auto;
    width: 38px; height: 38px; border-radius: 50%;
    display: grid; place-items: center;
    border: 1px solid rgba(23, 18, 54, 0.1);
    color: #1A1A1A;
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .wx-drawer-arrow svg, .wx-dl-toggle svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .wx-drawer-link:hover, .wx-drawer-link:focus-visible { background: #F5F4F9; outline: none; }
  .wx-drawer-link:hover .wx-dl-t, .wx-drawer-link:focus-visible .wx-dl-t { transform: translateX(6px); }
  .wx-drawer-link:hover .wx-dl-n { color: #7C3AED; }
  .wx-drawer-link:hover .wx-drawer-arrow { background: #1A1A1A; border-color: #1A1A1A; color: #FFFFFF; transform: rotate(45deg); }
  .wx-drawer-link.wx-current .wx-dl-t { color: #7C3AED; }
  .wx-drawer-link.wx-current .wx-dl-n { color: #7C3AED; }
  .wx-drawer-link.wx-current .wx-drawer-arrow { background: #9D5CFF; border-color: #9D5CFF; color: #FFFFFF; }

  /* Services row: the link navigates, the + beside it expands the list */
  .wx-dl-row { display: flex; align-items: center; gap: 6px; }
  .wx-dl-row .wx-drawer-arrow { display: none; }
  .wx-dl-toggle {
    flex: 0 0 auto;
    width: 38px; height: 38px; margin-right: 10px; border-radius: 50%;
    display: grid; place-items: center;
    border: 1px solid rgba(23, 18, 54, 0.1);
    background: #FFFFFF; color: #1A1A1A;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .wx-dl-toggle:hover { background: #F6F2FF; color: #7C3AED; }
  .wx-dl-toggle:focus-visible { outline: 2px solid #9D5CFF; outline-offset: 2px; }
  .wx-dl-group.is-open .wx-dl-toggle { transform: rotate(45deg); background: #9D5CFF; border-color: #9D5CFF; color: #FFFFFF; }

  .wx-drawer-sub {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .wx-dl-group.is-open .wx-drawer-sub { grid-template-rows: 1fr; }
  .wx-dsub-in { overflow: hidden; min-height: 0; }
  .wx-dsub-pad { padding: 6px 4px 10px; }
  .wx-dsub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .wx-drawer-sublink {
    display: flex; align-items: center; gap: 10px;
    padding: 10px;
    border-radius: 14px;
    background: #F5F4F9;
    font-family: 'Satoshi', sans-serif; font-size: 14px; font-weight: 600; line-height: 1.2;
    color: #1A1A1A; text-decoration: none;
    border: 1px solid transparent;
    transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease;
  }
  .wx-drawer-sublink:hover, .wx-drawer-sublink:focus-visible { background: #FFFFFF; border-color: rgba(157, 92, 255, 0.35); outline: none; }
  .wx-drawer-sublink.wx-current { color: #7C3AED; border-color: rgba(157, 92, 255, 0.35); background: #F6F2FF; }
  .wx-dsub-ic {
    flex: 0 0 auto; width: 30px; height: 30px; border-radius: 50%;
    display: grid; place-items: center; background: #FFFFFF; color: #7C3AED;
  }
  .wx-dsub-ic svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .wx-dsub-ic img { width: 15px; height: 15px; object-fit: contain; }
  .wx-dsub-h {
    display: block; margin: 14px 6px 8px;
    font-family: 'Satoshi', sans-serif; font-size: 10.5px; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase; color: #7C3AED;
  }
  .wx-dsub-tools { display: flex; flex-wrap: wrap; gap: 6px; }
  .wx-dsub-tools .wx-drawer-sublink { padding: 6px 12px 6px 6px; border-radius: 100px; font-size: 13px; }
  .wx-dsub-tools .wx-dsub-ic { width: 24px; height: 24px; }
  .wx-dsub-tools .wx-dsub-ic img { width: 13px; height: 13px; }

  /* Project card */
  .wx-drawer-cta {
    position: relative; overflow: hidden;
    margin-top: auto;
    padding: 22px;
    border-radius: 22px;
    background: #1A1A1A;
    color: #FFFFFF;
  }
  .wx-drawer-cta::before {
    content: ""; position: absolute; right: -60px; top: -80px; width: 220px; height: 220px; border-radius: 50%;
    background: radial-gradient(circle, rgba(157, 92, 255, 0.55), transparent 65%);
    pointer-events: none;
  }
  .wx-dcta-k {
    position: relative; margin: 0 0 6px;
    font-family: 'Satoshi', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #C4A6FF;
  }
  .wx-dcta-t {
    position: relative; margin: 0 0 18px;
    font-family: 'Manrope', 'Satoshi', sans-serif; font-size: 21px; font-weight: 700; letter-spacing: -0.025em; line-height: 1.2;
  }
  .wx-dcta-row { position: relative; display: flex; gap: 8px; flex-wrap: wrap; }
  .wx-dcta-btn, .wx-dcta-wa {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 7px 7px 7px 16px;
    border-radius: 100px;
    font-family: 'Satoshi', sans-serif; font-size: 14px; font-weight: 700;
    text-decoration: none;
    transition: transform 0.3s ease, background-color 0.3s ease;
  }
  .wx-dcta-btn { background: #9D5CFF; color: #FFFFFF; }
  .wx-dcta-btn:hover { background: #8A4AE6; transform: translateY(-2px); }
  .wx-dcta-wa { background: rgba(255, 255, 255, 0.1); color: #FFFFFF; padding-right: 16px; padding-left: 12px; }
  .wx-dcta-wa:hover { background: rgba(255, 255, 255, 0.18); transform: translateY(-2px); }
  .wx-dcta-btn span {
    width: 30px; height: 30px; border-radius: 50%; background: #FFFFFF; color: #1A1A1A;
    display: grid; place-items: center;
  }
  .wx-dcta-btn svg, .wx-dcta-wa svg { width: 14px; height: 14px; }
  .wx-dcta-btn svg { fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .wx-dcta-wa svg { width: 16px; height: 16px; fill: currentColor; }
  .wx-dcta-mail {
    position: relative; display: inline-block; margin-top: 16px;
    font-family: 'Satoshi', sans-serif; font-size: 13.5px; color: rgba(255, 255, 255, 0.72); text-decoration: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  }
  .wx-dcta-mail:hover { color: #FFFFFF; border-color: #FFFFFF; }

  .wx-drawer-foot {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 0 6px;
    font-family: 'Satoshi', sans-serif; font-size: 12.5px; color: #8A8A96;
  }
  .wx-drawer-socials { display: flex; align-items: center; gap: 8px; }
  .wx-drawer-socials a {
    display: flex; align-items: center; justify-content: center;
    width: 38px; height: 38px; border-radius: 50%;
    color: #43434D;
    border: 1px solid rgba(23, 18, 54, 0.1);
    transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
  }
  .wx-drawer-socials a svg { width: 16px; height: 16px; }
  .wx-drawer-socials a:hover { color: #FFFFFF; background: #9D5CFF; border-color: #9D5CFF; transform: translateY(-2px); }

  @media (prefers-reduced-motion: reduce) {
    .wx-drawer, .wx-drawer [data-d], .wx-drawer-sub, .wx-dl-t, .wx-drawer-arrow { transition: opacity 0.2s ease !important; transform: none !important; }
    .wx-drawer:not(.wx-open) { visibility: hidden; }
    .wx-drawer-clock i { animation: none; }
  }

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
    /* Smaller on phones — 56px is sized for the desktop condensed state, where
       it stands alone as the whole nav. */
    .wx-nav-hamburger { display: flex !important; width: 46px; height: 46px; }
    .wx-burger-lines { width: 20px; height: 13px; }
    .wx-burger-lines span { height: 2px; }
    .wx-burger-lines span:nth-child(2) { top: 5.5px; }
    .wx-burger-lines span:nth-child(3) { top: 11px; }
    .wx-nav-hamburger.wx-open .wx-burger-lines span:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
    .wx-nav-hamburger.wx-open .wx-burger-lines span:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }
    .wx-nav-links-wrap { display: none !important; }
    .wx-mega { display: none !important; }
    .wx-nav-caret { display: none; }

    /* Drawer fills the screen inside the same 12px inset as the bar, and
       its top row drops below the logo + close button that float over it. */
    .wx-drawer { padding-top: 80px; }
    /* A white strip pinned to the drawer's top edge: content scrolling up
       fades under it instead of sliding visibly behind the floating logo
       and close button. It sits in the top padding, so it costs no space. */
    .wx-drawer::before {
      content: "";
      position: sticky; top: -80px; z-index: 3; /* offsets are measured from the padding edge */
      display: block; flex-shrink: 0;
      height: 84px; margin: -80px -22px -18px;
      background: linear-gradient(#FFFFFF 72%, rgba(255,255,255,0));
      pointer-events: none;
    }
    .wx-drawer-top { padding-right: 10px; }
  }

  /* Phones: the drawer fills the screen inside the bar's 12px inset.
     Tablets keep the 460px side panel. */
  @media (max-width: 560px) {
    .wx-drawer { left: 12px; width: auto; }
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
  /* Floating buttons step aside while the drawer is open; the drawer has its
     own WhatsApp button. The cookie pill comes from consent.js. */
  .wx-wa-fab { transition: opacity 0.3s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease; }
  html.wx-drawer-open .wx-wa-fab,
  html.wx-drawer-open .wx-ck-pill { opacity: 0 !important; pointer-events: none !important; }
  .wx-wa-fab:hover { transform: scale(1.08); box-shadow: 0 12px 30px rgba(157, 92, 255, 0.6); }
  @media (max-width: 820px) {
    .wx-wa-fab { width: 52px; height: 52px; right: 16px; bottom: 16px; }
    .wx-wa-fab svg { width: 27px; height: 27px; }
  }

  /* ==================================================================
     Bar treatment promoted from home-v3, where it lived as a page-local
     override. It used to need an \`html\` prefix to outrank the rules
     above, because nav.js appended its <style> after the page's own —
     now that it IS those rules, ordinary specificity is enough.
     ================================================================== */

  /* Tighter than the 24px the floating header sat at before. */
  @media (min-width: 821px) { .wx-nav-container { top: 10px; } }

  /* Mobile: one inset rounded panel holding the mark and the burger,
     instead of the edge-to-edge translucent strip. */
  @media (max-width: 820px) {
    .wx-nav-container {
      top: 12px;
      width: min(100% - 24px, 1340px);
      border-radius: 22px !important;
    }
    .wx-navbar {
      padding: 9px 9px 9px 12px;
      border-radius: 22px !important;
      background: #F4F5FD !important;
      border: 1px solid rgba(0,0,0,.05) !important;
      box-shadow: 0 10px 30px -12px rgba(23,18,54,.30) !important;
      /* The panel is opaque now, so the blur behind it costs a paint for
         nothing — and on iOS it tints the solid fill slightly grey. */
      -webkit-backdrop-filter: none; backdrop-filter: none;
    }
    .wx-navbar.wx-scrolled {
      background: #F4F5FD !important;
      box-shadow: 0 14px 34px -12px rgba(23,18,54,.36) !important;
    }
    /* With the drawer open the bar goes bare, so the logo and close button
       sit straight on the drawer instead of a panel edge cutting across it. */
    .wx-nav-container.wx-menu-open .wx-navbar {
      background: transparent !important;
      border-color: transparent !important;
      box-shadow: none !important;
    }
    .wx-nav-logo-svg { width: 46px; height: 46px; }
    /* Rounded square rather than a circle, echoing the mark's own tile. */
    .wx-nav-hamburger {
      width: 46px; height: 46px; border-radius: 14px;
      box-shadow: 0 8px 20px -8px rgba(157,92,255,.85), inset 0 1px 0 rgba(255,255,255,.25);
    }
  }
  `;

  /* ------------------------------------------------------------------ */
  /* 2. Markup                                                          */
  /* ------------------------------------------------------------------ */
  var HTML = `
  <header class="wx-nav-container" data-header>
    <div class="wx-navbar" id="wx-navbar">
      <a href="/" class="wx-nav-logo">
        <img src="logo-black.svg" alt="Web{X}" class="wx-nav-logo-svg" width="50" height="50" />
        <span class="wx-nav-logo-word">Web<span class="wx-logo-purple">{X}</span></span>
      </a>

      <div class="wx-nav-links-wrap" id="wx-nav-links-wrap">
        <div class="wx-nav-item"><a href="/" class="wx-nav-link" data-nav="home">Home</a></div>
        <div class="wx-nav-item" id="wx-svc-item" data-mega="services">
          <a href="/services" class="wx-nav-link" data-nav="services">
            Services
            <svg class="wx-nav-caret" width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <div class="wx-mega wx-mega--svc" id="wx-mega-services">
            <div class="wx-mega-grid">
              <a class="wx-mcard" href="/web-design" data-i style="--i:0">
                <span class="wx-mcard-head"><span class="wx-mcard-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg></span><span class="wx-mcard-txt"><b>Web Design</b><small>Websites that read clearly and sell</small></span></span>
                <span class="wx-mcard-tags"><i>Business websites</i><i>Redesigns</i><i>Responsive layouts</i><i>Conversion design</i></span>
                <span class="wx-marr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
              </a>
              <a class="wx-mcard" href="/web-development" data-i style="--i:1">
                <span class="wx-mcard-head"><span class="wx-mcard-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg></span><span class="wx-mcard-txt"><b>Web Development</b><small>Custom builds, fast and yours to own</small></span></span>
                <span class="wx-mcard-tags"><i>Custom code</i><i>Ecommerce</i><i>CMS setup</i><i>Speed &amp; SEO</i></span>
                <span class="wx-marr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
              </a>
              <a class="wx-mcard" href="/ui-ux-design" data-i style="--i:2">
                <span class="wx-mcard-head"><span class="wx-mcard-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg></span><span class="wx-mcard-txt"><b>UI/UX Design</b><small>Product design for SaaS &amp; B2B teams</small></span></span>
                <span class="wx-mcard-tags"><i>User flows</i><i>Dashboards</i><i>Design systems</i><i>Prototypes</i></span>
                <span class="wx-marr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
              </a>
              <a class="wx-mcard" href="/web-apps" data-i style="--i:3">
                <span class="wx-mcard-head"><span class="wx-mcard-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></span><span class="wx-mcard-txt"><b>Web Apps &amp; ERP</b><small>Portals and tools with real data behind them</small></span></span>
                <span class="wx-mcard-tags"><i>Customer portals</i><i>Internal tools</i><i>Custom ERP</i><i>Logins &amp; roles</i></span>
                <span class="wx-marr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
              </a>
              <a class="wx-mcard" href="/landing-page-design" data-i style="--i:4">
                <span class="wx-mcard-head"><span class="wx-mcard-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/></svg></span><span class="wx-mcard-txt"><b>Landing Pages</b><small>Pages built for paid campaigns</small></span></span>
                <span class="wx-mcard-tags"><i>Paid campaigns</i><i>Launches</i><i>Lead generation</i><i>A/B-ready</i></span>
                <span class="wx-marr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
              </a>
              <a class="wx-mcard" href="/graphic-design" data-i style="--i:5">
                <span class="wx-mcard-head"><span class="wx-mcard-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3Z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7.5" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/></svg></span><span class="wx-mcard-txt"><b>Graphic Design</b><small>Brand visuals that hold up everywhere</small></span></span>
                <span class="wx-mcard-tags"><i>Brand identity</i><i>Logo design</i><i>Packaging</i><i>Marketing graphics</i></span>
                <span class="wx-marr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
              </a>
            </div>
            <div class="wx-mega-side">
              <span class="wx-mega-side-h" data-i style="--i:6">Build from your Figma</span>
              <a class="wx-mrow" href="/figma-to-webflow" data-i style="--i:7"><span class="wx-mrow-ic"><img src="/images/tools/webflow.png" alt="" width="20" height="20" loading="lazy" decoding="async"></span><span class="wx-mrow-txt"><b>Figma to Webflow</b><small>CMS-ready, editable without code</small></span><span class="wx-marr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
              <a class="wx-mrow" href="/figma-to-wordpress" data-i style="--i:8"><span class="wx-mrow-ic"><img src="/images/tools/wordpress.png" alt="" width="20" height="20" loading="lazy" decoding="async"></span><span class="wx-mrow-txt"><b>Figma to WordPress</b><small>Custom themes your team can edit</small></span><span class="wx-marr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
              <a class="wx-mrow" href="/figma-to-shopify" data-i style="--i:9"><span class="wx-mrow-ic"><img src="/images/tools/shopify.png" alt="" width="20" height="20" loading="lazy" decoding="async"></span><span class="wx-mrow-txt"><b>Figma to Shopify</b><small>Online Store 2.0 storefronts</small></span><span class="wx-marr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
              <a class="wx-mrow" href="/figma-to-framer" data-i style="--i:10"><span class="wx-mrow-ic"><img src="/images/tools/framer.svg" alt="" width="20" height="20" loading="lazy" decoding="async"></span><span class="wx-mrow-txt"><b>Figma to Framer</b><small>Motion-rich, fast marketing sites</small></span><span class="wx-marr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
              <a class="wx-mrow" href="/figma-to-unbounce" data-i style="--i:11"><span class="wx-mrow-ic"><img src="/images/tools/unbounce.png" alt="" width="20" height="20" loading="lazy" decoding="async"></span><span class="wx-mrow-txt"><b>Figma to Unbounce</b><small>A/B-ready campaign pages</small></span><span class="wx-marr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
              <a class="wx-mrow wx-mrow--all" href="/services" data-i style="--i:12"><span class="wx-mrow-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg></span><span class="wx-mrow-txt"><b>All services</b><small>Everything we design and build</small></span><span class="wx-marr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
            </div>
          </div>
        </div>
        <div class="wx-nav-item"><a href="/work" class="wx-nav-link" data-nav="work">Work</a></div>
        <div class="wx-nav-item"><a href="/studio" class="wx-nav-link" data-nav="about">About</a></div>
        <div class="wx-nav-item" id="wx-res-item" data-mega="resources">
          <a href="/blog" class="wx-nav-link" data-nav="resources">
            Resources
            <svg class="wx-nav-caret" width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <div class="wx-mega wx-mega--res" id="wx-mega">
            <div class="wx-mega-intro" data-i style="--i:0">
              <p class="wx-mega-big">The <em>Journal</em></p>
              <p class="wx-mega-lead">Practical guides on design, development and SEO &mdash; the parts of a website that decide whether it earns its keep.</p>
              <div class="wx-mega-quick"><a href="/blog-website-cost">What a website costs</a><a href="/blog-core-web-vitals">Core Web Vitals, explained</a><a href="/work">Case studies</a></div>
              <a class="wx-mega-browse" href="/blog">Browse all articles <span class="wx-marr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
            </div>
            <a class="wx-acard" href="/blog-what-is-website-development" data-i style="--i:1">
              <span class="wx-acard-body"><span class="wx-acard-cat">Web Development</span><b>What Is Website Development?</b><small>Meaning, types, the 7 stages, timelines and costs, in plain English.</small></span>
              <span class="wx-acard-img"><img data-src="/images/mega/what-is-website-development.jpg" alt="" width="640" height="440" decoding="async"></span>
              <span class="wx-acard-pill" aria-hidden="true">Read article <span><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></span>
            </a>
            <a class="wx-acard" href="/blog-website-development-process" data-i style="--i:2">
              <span class="wx-acard-body"><span class="wx-acard-cat">Process</span><b>The Website Development Process</b><small>Seven stages from discovery to launch, with a flowchart and timeline.</small></span>
              <span class="wx-acard-img"><img data-src="/images/mega/website-development-process.jpg" alt="" width="640" height="440" decoding="async"></span>
              <span class="wx-acard-pill" aria-hidden="true">Read article <span><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></span>
            </a>
            <a class="wx-acard" href="/blog-landing-page-best-practices" data-i style="--i:3">
              <span class="wx-acard-body"><span class="wx-acard-cat">Conversion</span><b>Landing Page Best Practices</b><small>The 11 elements that decide whether a landing page converts.</small></span>
              <span class="wx-acard-img"><img data-src="/images/mega/landing-page-best-practices.jpg" alt="" width="640" height="440" decoding="async"></span>
              <span class="wx-acard-pill" aria-hidden="true">Read article <span><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></span>
            </a>
          </div>
        </div>
        <div class="wx-nav-item"><a href="/contact" class="wx-nav-link" data-nav="contact">Contact us</a></div>
      </div>

      <div class="wx-nav-cta-wrap">
        <div class="wx-nav-socials">
          <a href="https://www.instagram.com/thewebx.studio" target="_blank" rel="noopener" class="wx-nav-social" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg>
          </a>
          <a href="https://x.com/Thewebxstudio" target="_blank" rel="noopener" class="wx-nav-social" aria-label="X (Twitter)">
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

  <aside class="wx-drawer" id="wx-drawer" aria-hidden="true" aria-label="Site menu" inert data-lenis-prevent>
    <div class="wx-drawer-top" data-d style="--d:0">
      <span class="wx-drawer-eyebrow">Menu</span>
      <span class="wx-drawer-clock"><i aria-hidden="true"></i>Ludhiana&nbsp;<time data-wx-clock>IST</time></span>
    </div>
    <nav class="wx-drawer-nav" aria-label="Mobile">
      <a href="/" class="wx-drawer-link" data-nav="home" data-d style="--d:1"><span class="wx-dl-n">01</span><span class="wx-dl-t">Home</span><span class="wx-drawer-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
      <div class="wx-dl-group" data-d style="--d:2">
        <div class="wx-dl-row">
          <a href="/services" class="wx-drawer-link" data-nav="services"><span class="wx-dl-n">02</span><span class="wx-dl-t">Services</span><span class="wx-drawer-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
          <button type="button" class="wx-dl-toggle" aria-expanded="false" aria-controls="wx-drawer-sub" aria-label="Show all services"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
        </div>
        <div class="wx-drawer-sub" id="wx-drawer-sub">
          <div class="wx-dsub-in"><div class="wx-dsub-pad">
            <div class="wx-dsub-grid">
              <a href="/web-design" class="wx-drawer-sublink" data-sub="web-design.html"><span class="wx-dsub-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg></span>Web design</a>
              <a href="/web-development" class="wx-drawer-sublink" data-sub="web-development.html"><span class="wx-dsub-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg></span>Web development</a>
              <a href="/ui-ux-design" class="wx-drawer-sublink" data-sub="ui-ux-design.html"><span class="wx-dsub-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg></span>UI/UX design</a>
              <a href="/web-apps" class="wx-drawer-sublink" data-sub="web-apps.html"><span class="wx-dsub-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></span>Web apps &amp; ERP</a>
              <a href="/landing-page-design" class="wx-drawer-sublink" data-sub="landing-page-design.html"><span class="wx-dsub-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/></svg></span>Landing pages</a>
              <a href="/graphic-design" class="wx-drawer-sublink" data-sub="graphic-design.html"><span class="wx-dsub-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3Z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7.5" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/></svg></span>Graphic design</a>
            </div>
            <span class="wx-dsub-h">Build from your Figma</span>
            <div class="wx-dsub-tools">
              <a href="/figma-to-webflow" class="wx-drawer-sublink" data-sub="figma-to-webflow.html"><span class="wx-dsub-ic"><img src="/images/tools/webflow.png" alt="" width="13" height="13" loading="lazy" decoding="async"></span>Webflow</a>
              <a href="/figma-to-wordpress" class="wx-drawer-sublink" data-sub="figma-to-wordpress.html"><span class="wx-dsub-ic"><img src="/images/tools/wordpress.png" alt="" width="13" height="13" loading="lazy" decoding="async"></span>WordPress</a>
              <a href="/figma-to-shopify" class="wx-drawer-sublink" data-sub="figma-to-shopify.html"><span class="wx-dsub-ic"><img src="/images/tools/shopify.png" alt="" width="13" height="13" loading="lazy" decoding="async"></span>Shopify</a>
              <a href="/figma-to-framer" class="wx-drawer-sublink" data-sub="figma-to-framer.html"><span class="wx-dsub-ic"><img src="/images/tools/framer.svg" alt="" width="13" height="13" loading="lazy" decoding="async"></span>Framer</a>
              <a href="/figma-to-unbounce" class="wx-drawer-sublink" data-sub="figma-to-unbounce.html"><span class="wx-dsub-ic"><img src="/images/tools/unbounce.png" alt="" width="13" height="13" loading="lazy" decoding="async"></span>Unbounce</a>
            </div>
          </div></div>
        </div>
      </div>
      <a href="/work" class="wx-drawer-link" data-nav="work" data-d style="--d:3"><span class="wx-dl-n">03</span><span class="wx-dl-t">Work</span><span class="wx-drawer-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
      <a href="/studio" class="wx-drawer-link" data-nav="about" data-d style="--d:4"><span class="wx-dl-n">04</span><span class="wx-dl-t">About</span><span class="wx-drawer-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
      <a href="/blog" class="wx-drawer-link" data-nav="resources" data-d style="--d:5"><span class="wx-dl-n">05</span><span class="wx-dl-t">Resources</span><span class="wx-drawer-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
      <a href="/contact" class="wx-drawer-link" data-nav="contact" data-d style="--d:6"><span class="wx-dl-n">06</span><span class="wx-dl-t">Contact</span><span class="wx-drawer-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
    </nav>
    <div class="wx-drawer-cta" data-d style="--d:7">
      <p class="wx-dcta-k">Have a project in mind?</p>
      <p class="wx-dcta-t">Tell us what you&rsquo;re building &mdash; get a fixed quote within 48 hours.</p>
      <div class="wx-dcta-row">
        <a href="/contact" class="wx-dcta-btn">Start a project <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
        <a href="https://wa.me/919780651142?text=Hi%20Web%7BX%7D%2C%20I%27d%20like%20to%20talk%20about%20a%20project." class="wx-dcta-wa" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm4.52 12c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74 1.49.64 2.07.7 2.81.59.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z"/></svg>WhatsApp</a>
      </div>
      <a href="mailto:hello@thewebxstudio.com" class="wx-dcta-mail">hello@thewebxstudio.com</a>
    </div>
    <div class="wx-drawer-foot" data-d style="--d:8">
      <span>&copy; Web{X} Studio</span>
      <div class="wx-drawer-socials">
        <a href="https://www.instagram.com/thewebx.studio" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg></a>
        <a href="https://x.com/Thewebxstudio" target="_blank" rel="noopener" aria-label="X (Twitter)"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.9 2.5h3.3l-7.2 8.24L23.5 21.5h-6.63l-5.2-6.79-5.94 6.79H2.42l7.7-8.8L1.5 2.5h6.8l4.7 6.2 5.9-6.2Zm-1.16 17.02h1.83L7.34 4.38H5.38l12.36 15.14Z"/></svg></a>
        <a href="https://dribbble.com/hello-webx" target="_blank" rel="noopener" aria-label="Dribbble"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="1.8"/><path d="M5 8.5c3.8 1 8.9 1.2 13-.4M3.4 13.4c4-1 7.9-.5 11 1.8M9 3.6c3 3.6 5.4 8 6.2 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></a>
      </div>
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

    // Individual service pages live under the Services dropdown, so they light
    // up the Services nav item rather than nothing.
    var SERVICE_PAGES = [
      'web-design.html',
      'web-development.html',
      'ui-ux-design.html',
      'graphic-design.html',
      'web-apps.html',
      'landing-page-design.html'
    ];

    var match = 'home';
    if (file === 'index.html') match = 'home';
    else if (file === 'services.html' || SERVICE_PAGES.indexOf(file) !== -1 || file.indexOf('figma-to') === 0) match = 'services';
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

    // Mark the current page inside the drawer's nested service list. Compared
    // rather than fed into a selector, since `file` comes from the URL.
    if (drawer) {
      drawer.querySelectorAll('.wx-drawer-sublink').forEach(function (l) {
        if (l.getAttribute('data-sub') === file) l.classList.add('wx-current');
      });
      // On a service page, open the Services list so the current one shows.
      if (drawer.querySelector('.wx-drawer-sublink.wx-current')) {
        var grp = drawer.querySelector('.wx-dl-group');
        var tgl = drawer.querySelector('.wx-dl-toggle');
        if (grp) grp.classList.add('is-open');
        if (tgl) tgl.setAttribute('aria-expanded', 'true');
      }
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
    // Studio time in the drawer's top row, ticking only while it is open.
    var clockEl = drawer && drawer.querySelector('[data-wx-clock]');
    var clockTimer = null;
    function tickClock() {
      if (!clockEl) return;
      try {
        clockEl.textContent = new Intl.DateTimeFormat('en-IN', {
          hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'
        }).format(new Date()).toUpperCase() + ' IST';
      } catch (e) { clockEl.textContent = 'IST'; }
    }

    function openDrawer() {
      if (!drawer) return;
      tickClock();
      document.documentElement.classList.add('wx-drawer-open');
      clearInterval(clockTimer);
      clockTimer = setInterval(tickClock, 20000);
      drawer.classList.add('wx-open');
      scrim.classList.add('wx-open');
      header.classList.add('wx-menu-open');
      hamburger.classList.add('wx-open');
      hamburger.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      drawer.removeAttribute('inert');
      document.body.style.overflow = 'hidden';
      if (navbar && navbar.wxSyncCondense) navbar.wxSyncCondense();
    }
    function closeDrawer() {
      if (!drawer || !drawer.classList.contains('wx-open')) return;
      clearInterval(clockTimer);
      document.documentElement.classList.remove('wx-drawer-open');
      drawer.classList.remove('wx-open');
      scrim.classList.remove('wx-open');
      header.classList.remove('wx-menu-open');
      hamburger.classList.remove('wx-open');
      hamburger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      drawer.setAttribute('inert', '');
      document.body.style.overflow = '';
      if (navbar && navbar.wxSyncCondense) navbar.wxSyncCondense();
    }
    if (hamburger && drawer) {
      hamburger.addEventListener('click', function () {
        if (drawer.classList.contains('wx-open')) closeDrawer();
        else openDrawer();
      });
      scrim.addEventListener('click', closeDrawer);
      drawer.querySelectorAll('a').forEach(function (l) {
        l.addEventListener('click', closeDrawer);
      });
      // Services: the link navigates, the + beside it expands the list.
      var svcToggle = drawer.querySelector('.wx-dl-toggle');
      if (svcToggle) svcToggle.addEventListener('click', function () {
        var grp = svcToggle.closest('.wx-dl-group');
        var on = !grp.classList.contains('is-open');
        grp.classList.toggle('is-open', on);
        svcToggle.setAttribute('aria-expanded', on ? 'true' : 'false');
        svcToggle.setAttribute('aria-label', on ? 'Hide services' : 'Show all services');
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
      // Rotating to landscape / resizing past the breakpoint must not strand
      // the drawer open with body scroll locked.
      window.addEventListener('resize', function () {
        if (window.innerWidth > 820) closeDrawer();
      });
    }

    // -- Mega panels, Services + Resources (desktop hover / keyboard focus) --
    //    Driven off [data-mega] so both menus share one implementation. Each
    //    gets its own closeTimer via the closure, otherwise moving between them
    //    would cancel the other's hover-intent delay.
    var megaItems = Array.prototype.slice.call(header.querySelectorAll('.wx-nav-item[data-mega]'));
    var linksWrap = document.getElementById('wx-nav-links-wrap');

    // The panel is positioned inside the links pill (its containing block, see
    // the CSS note), so stretch it back out to the full navbar from there.
    function placeMega(panel) {
      if (!linksWrap) return;
      var nb = navbar.getBoundingClientRect();
      var lw = linksWrap.getBoundingClientRect();
      var top = nb.bottom - lw.top + 14;
      panel.style.left = (nb.left - lw.left) + 'px';
      panel.style.width = nb.width + 'px';
      panel.style.top = top + 'px';
      panel.style.maxHeight = (window.innerHeight - nb.bottom - 28) + 'px';
      // Hover bridge: covers the gap under the links pill only.
      panel.style.setProperty('--wx-bridge-h', (top - lw.height + 2) + 'px');
      panel.style.setProperty('--wx-bridge-l', (lw.left - nb.left) + 'px');
      panel.style.setProperty('--wx-bridge-w', lw.width + 'px');
    }

    // Article thumbnails only download the first time the panel opens.
    function wakeImages(panel) {
      panel.querySelectorAll('img[data-src]').forEach(function (img) {
        img.onload = function () { img.classList.add('is-loaded'); };
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      });
    }

    megaItems.forEach(function (item) {
      var panel = item.querySelector('.wx-mega');
      var closeTimer = null;
      var open = function () {
        clearTimeout(closeTimer);
        if (navbar.classList.contains('wx-condensed')) return;
        // Only one menu open at a time — hovering Services must dismiss Resources.
        megaItems.forEach(function (other) { if (other !== item) other.classList.remove('wx-open'); });
        if (panel && !item.classList.contains('wx-open')) { placeMega(panel); wakeImages(panel); }
        item.classList.add('wx-open');
      };
      var close = function () { closeTimer = setTimeout(function () { item.classList.remove('wx-open'); }, 180); };
      item.addEventListener('mouseenter', open);
      item.addEventListener('mouseleave', close);
      item.addEventListener('focusin', open);
      item.addEventListener('focusout', close);
      // Following a link out of the panel should not leave it hanging open
      // behind the page transition.
      if (panel) panel.addEventListener('click', function (e) {
        if (e.target.closest('a')) item.classList.remove('wx-open');
      });
    });

    // "Read article" pill tracks the pointer inside each article card.
    header.querySelectorAll('.wx-acard').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--px', (e.clientX - r.left) + 'px');
        card.style.setProperty('--py', (e.clientY - r.top) + 'px');
      });
    });

    if (megaItems.length) {
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        megaItems.forEach(function (item) { item.classList.remove('wx-open'); });
      });
      window.addEventListener('resize', function () {
        megaItems.forEach(function (item) {
          var panel = item.querySelector('.wx-mega');
          if (panel && item.classList.contains('wx-open')) placeMega(panel);
        });
      });
      // The bar condenses into the burger on scroll; take any open panel with it.
      window.addEventListener('scroll', function () {
        if (!navbar.classList.contains('wx-condensed')) return;
        megaItems.forEach(function (item) { item.classList.remove('wx-open'); });
      }, { passive: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
