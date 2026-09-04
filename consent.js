/* =====================================================================
   Web{X} — Cookie consent & preference centre
   Single source of truth for what is allowed to load on every page.

   Include as the FIRST script in <head>, without defer:

       <script src="consent.js"></script>

   Ordering matters. This file replaces the inline Google Tag Manager and
   Microsoft Clarity snippets that used to sit at the top of every page.
   Those snippets fired on page one of a visit, before anyone had been
   asked anything — which is exactly the thing a banner is supposed to
   prevent. Here the tags do not exist until there is a stored choice
   that allows them, so declining actually means nothing loads.

   Categories
     necessary  — always on: the site itself, the form handler, fonts,
                  and the record of this choice. Never gated.
     analytics  — Google Tag Manager / Google Analytics.
     behaviour  — Microsoft Clarity: heatmaps and session replay.

   The choice lives in localStorage on the visitor's own device. It is
   never sent to us, and it expires after 12 months so the question gets
   asked again rather than being answered once forever.
   ===================================================================== */
(function () {
  'use strict';

  if (window.__wxConsentLoaded) return;
  window.__wxConsentLoaded = true;

  /* ------------------------------------------------------------------ */
  /* 1. Configuration                                                   */
  /* ------------------------------------------------------------------ */
  var GTM_ID     = 'GTM-M6TBLLFK';
  var CLARITY_ID = 'xzhktb4dc0';
  var STORE_KEY  = 'wx-consent';
  var STORE_VER  = 1;
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;   /* re-ask after 12 months */
  var POLICY_URL = 'privacy-policy';

  /* Whether the preference switches open already ticked, before any choice
     has been made. Set true on request.

     Worth knowing what it costs: pre-ticked consent boxes are not valid
     consent under the GDPR. The CJEU settled it in Planet49 (C-673/17) —
     consent needs an active choice, and a box the visitor merely left alone
     is not one. India's DPDP Act 2023 uses the same language: "clear
     affirmative action". So for EU, UK and Indian visitors this weakens the
     legal basis for analytics, even though the tags still wait for a click.

     What this does NOT do is grant anything on its own. Nothing loads until
     Accept all, Necessary only, or Save preferences is pressed, and closing
     the panel stores nothing — that part is unchanged. The exposure is
     narrower than a normal pre-ticked banner, but it is not zero.

     Set to false to return to opt-in defaults. Nothing else needs editing. */
  var PRESELECT  = true;

  /* ------------------------------------------------------------------ */
  /* 2. Stored choice                                                   */
  /* ------------------------------------------------------------------ */
  /* Every read is wrapped: private windows, cleared site data and
     browsers set to block storage all throw here rather than returning
     null, and a throw must mean "no choice yet", not a broken page. */
  function read() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      if (!v || v.v !== STORE_VER) return null;
      if (!v.ts || (Date.now() - v.ts) > MAX_AGE_MS) return null;
      return v;
    } catch (e) { return null; }
  }

  function write(analytics, behaviour) {
    var v = { v: STORE_VER, ts: Date.now(), analytics: !!analytics, behaviour: !!behaviour };
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch (e) {}
    return v;
  }

  var choice = read();

  /* ------------------------------------------------------------------ */
  /* 3. Google Consent Mode v2                                          */
  /* ------------------------------------------------------------------ */
  /* Declared before anything else so that if a tag ever does load, it
     starts in the denied state rather than inheriting a default grant. */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    personalization_storage: 'denied',
    wait_for_update: 500
  });

  /* ------------------------------------------------------------------ */
  /* 4. Tag loaders — called only once a category is granted            */
  /* ------------------------------------------------------------------ */
  var loaded = { gtm: false, clarity: false };

  function loadGTM() {
    if (loaded.gtm) return;
    loaded.gtm = true;
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }

  /* Declared before any tag loads so a queued consent call is waiting for
     whichever copy of Clarity arrives — ours, or the one the GTM container
     fires on its own (its request carries ?ref=gtm). Without this stub, a
     visitor who allowed analytics but refused behaviour still got recorded,
     because GTM injected Clarity behind our back. */
  function clarityStub() {
    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    return window.clarity;
  }

  function loadClarity() {
    allowClarity = true;
    clarityStub()('consent');
    if (loaded.clarity) return;
    loaded.clarity = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.clarity.ms/tag/' + CLARITY_ID;
    s.setAttribute('data-wx-consented', '');
    document.head.appendChild(s);
  }

  /* Revoking cannot unload a script already in the page, but it does stop
     collection, and it reaches a container-fired Clarity too. */
  function denyClarity() {
    try { clarityStub()('consent', false); } catch (e) {}
  }

  /* ---- Script guard --------------------------------------------------
     clarity('consent', false) is not enough on its own. The GTM container
     carries its own Microsoft Clarity tag (its request arrives with
     ?ref=gtm), and a Clarity told to run without consent drops to
     cookieless mode but KEEPS posting to z.clarity.ms/collect — measured,
     not assumed. So allowing analytics alone would still record sessions,
     and the behaviour switch would be decoration.

     The real fix belongs in the GTM workspace: delete the Clarity tag, or
     block it on the wx_consent_behaviour dataLayer variable this file
     pushes. Until that happens the guard below refuses the insertion in
     the browser, so the promise the banner makes is kept either way.
     It is deliberately narrow: script elements only, one hostname only,
     and only while the behaviour category is refused. */
  var allowClarity = false;
  var guarded = false;

  function guardScripts() {
    if (guarded) return;
    guarded = true;
    ['appendChild', 'insertBefore'].forEach(function (fn) {
      var orig = Node.prototype[fn];
      Node.prototype[fn] = function (node) {
        if (!allowClarity && node && node.tagName === 'SCRIPT' &&
            !node.hasAttribute('data-wx-consented') &&
            typeof node.src === 'string' && node.src.indexOf('clarity.ms') !== -1) {
          /* Returning the node keeps the DOM contract the caller expects;
             it simply never enters the document. */
          return node;
        }
        return orig.apply(this, arguments);
      };
    });
  }

  /* Applies a decision: updates Consent Mode, then loads whatever is now
     permitted. Withdrawal cannot un-ring the bell on a script already in
     the page — it stops collection and takes full effect on the next
     page view, which is what the policy tells people. */
  function apply(c) {
    gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied'
    });
    window.dataLayer.push({
      event: 'wx_consent_update',
      wx_consent_analytics: !!c.analytics,
      wx_consent_behaviour: !!c.behaviour
    });

    /* Order matters: the category decision has to be expressed before GTM
       is allowed to load, never after. */
    if (c.behaviour) {
      loadClarity();
    } else {
      allowClarity = false;
      guardScripts();
      denyClarity();
    }

    if (c.analytics) loadGTM();

    document.documentElement.setAttribute('data-wx-consent',
      (c.analytics ? 'a' : '') + (c.behaviour ? 'b' : '') || 'none');
  }

  if (choice) apply(choice);

  /* ------------------------------------------------------------------ */
  /* 5. Styles                                                          */
  /* ------------------------------------------------------------------ */
  var CSS = `
  .wx-ck, .wx-ck * { box-sizing: border-box; }
  /* ---- Launcher: the collapsed state ---------------------------------
     A full banner on first paint covers the thing the visitor came to
     read. Nothing loads until a choice is made, so the question does not
     have to shout — a quiet pill is enough, and it opens the panel.
     Bottom-LEFT deliberately: nav.js pins the WhatsApp button at
     right:24px / bottom:24px, and two floating controls in one corner
     would fight each other. */
  .wx-ck-pill {
    position: fixed; z-index: 2147483000; left: 20px; bottom: 20px;
    display: inline-flex; align-items: center; gap: 9px;
    padding: 10px 17px 10px 14px; border-radius: 100px;
    border: 1px solid rgba(26,20,48,.10);
    background: rgba(255,255,255,.86);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
            backdrop-filter: blur(20px) saturate(160%);
    box-shadow: 0 14px 32px -14px rgba(26,20,48,.40), inset 0 1px 0 rgba(255,255,255,.6);
    font-family: 'Satoshi', system-ui, -apple-system, sans-serif;
    font-size: 13px; font-weight: 600; color: #1A1A1A; cursor: pointer;
    transform: translateY(calc(100% + 28px)); opacity: 0;
    transition: transform .45s cubic-bezier(.16,1,.3,1), opacity .3s ease,
                background .2s ease, box-shadow .2s ease;
  }
  .wx-ck-pill.is-on { transform: translateY(0); opacity: 1; }
  .wx-ck-pill:hover { background: rgba(255,255,255,.97);
                      box-shadow: 0 18px 38px -14px rgba(26,20,48,.46), inset 0 1px 0 rgba(255,255,255,.7); }
  .wx-ck-pill:focus-visible { outline: 2px solid #9D5CFF; outline-offset: 3px; }
  .wx-ck-pill svg { flex: 0 0 auto; color: #9D5CFF; }

  /* ---- Panel: the expanded state ---- */
  .wx-ck {
    position: fixed; z-index: 2147483000; left: 20px; bottom: 20px;
    width: calc(100vw - 40px); max-width: 392px; padding: 20px 22px;
    border-radius: 18px; border: 1px solid rgba(26,20,48,.10);
    background: rgba(255,255,255,.88);
    -webkit-backdrop-filter: blur(22px) saturate(160%);
            backdrop-filter: blur(22px) saturate(160%);
    box-shadow: 0 26px 60px -22px rgba(26,20,48,.42), inset 0 1px 0 rgba(255,255,255,.6);
    font-family: 'Satoshi', system-ui, -apple-system, sans-serif; color: #3D3D46;
    /* Grows out of the same corner the pill sits in, so the expansion
       reads as one control opening rather than two separate things. */
    transform-origin: 0 100%;
    transform: translateY(calc(100% + 28px)) scale(.94); opacity: 0;
    transition: transform .5s cubic-bezier(.16,1,.3,1), opacity .35s ease;
  }
  .wx-ck.is-on { transform: translateY(0) scale(1); opacity: 1; }
  .wx-ck h2 { margin: 0 0 7px; padding-right: 26px;
              font-family: 'Manrope', system-ui, sans-serif;
              font-size: 16px; font-weight: 700; letter-spacing: -.02em; color: #1A1A1A; }

  /* Collapses back to the pill without answering — dismissing the
     question is not the same as consenting to anything. */
  .wx-ck-x { position: absolute; top: 13px; right: 13px; width: 26px; height: 26px;
             display: grid; place-items: center; padding: 0; border: 0; border-radius: 50%;
             background: transparent; color: #8A879A; cursor: pointer;
             transition: background .2s ease, color .2s ease; }
  .wx-ck-x:hover { background: rgba(26,20,48,.06); color: #1A1A1A; }
  .wx-ck-x:focus-visible { outline: 2px solid #9D5CFF; outline-offset: 2px; }
  .wx-ck p { margin: 0 0 15px; font-size: 13px; line-height: 1.6; }
  .wx-ck a { color: #7B3FE4; text-decoration: underline; text-underline-offset: 2px; }
  .wx-ck-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }

  .wx-ck-btn { flex: 0 0 auto; padding: 10px 17px; border-radius: 100px; border: 1px solid transparent;
               font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer;
               transition: background .2s ease, border-color .2s ease, transform .2s ease; }
  .wx-ck-btn:hover { transform: translateY(-1px); }
  .wx-ck-btn--yes { background: #9D5CFF; color: #FFFFFF; }
  .wx-ck-btn--yes:hover { background: #8A45F0; }
  .wx-ck-btn--no { background: #FFFFFF; color: #1A1A1A; border-color: rgba(26,20,48,.16); }
  .wx-ck-btn--no:hover { border-color: rgba(26,20,48,.34); }
  .wx-ck-btn--ghost { background: transparent; color: #55555F; padding: 11px 8px;
                      text-decoration: underline; text-underline-offset: 3px; }
  .wx-ck-btn--ghost:hover { color: #9D5CFF; }

  /* ---- Preference centre ---- */
  .wx-ck-mask { position: fixed; inset: 0; z-index: 2147483001; display: none;
                align-items: center; justify-content: center; padding: 20px;
                background: rgba(18,12,34,.44);
                -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px); }
  .wx-ck-mask.is-on { display: flex; }
  .wx-ck-modal { width: 100%; max-width: 560px; max-height: 86vh; overflow-y: auto;
                 padding: 28px; border-radius: 20px; background: #FFFFFF;
                 box-shadow: 0 40px 90px -30px rgba(26,20,48,.5);
                 font-family: 'Satoshi', system-ui, -apple-system, sans-serif; color: #3D3D46; }
  .wx-ck-modal h2 { margin: 0 0 8px; font-family: 'Manrope', system-ui, sans-serif;
                    font-size: 21px; font-weight: 700; letter-spacing: -.03em; color: #1A1A1A; }
  .wx-ck-modal > p { margin: 0 0 22px; font-size: 13.5px; line-height: 1.6; }

  .wx-ck-item { display: flex; gap: 14px; align-items: flex-start; padding: 16px 0;
                border-top: 1px solid rgba(26,20,48,.09); }
  .wx-ck-item b { display: block; font-size: 14.5px; font-weight: 600; color: #1A1A1A; margin: 0 0 4px; }
  .wx-ck-item span { display: block; font-size: 13px; line-height: 1.55; }
  .wx-ck-item em { font-style: normal; color: #9D5CFF; font-weight: 600; font-size: 12px; }

  /* Switch. A real checkbox underneath, visually hidden but focusable,
     so keyboard and screen readers get the native control. */
  .wx-ck-sw { flex: 0 0 auto; position: relative; width: 44px; height: 26px; margin-top: 2px; }
  .wx-ck-sw input { position: absolute; inset: 0; width: 100%; height: 100%;
                    margin: 0; opacity: 0; cursor: pointer; }
  .wx-ck-sw i { position: absolute; inset: 0; border-radius: 100px; background: #D9D8E2;
                transition: background .22s ease; pointer-events: none; }
  .wx-ck-sw i::after { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px;
                       border-radius: 50%; background: #FFFFFF; box-shadow: 0 1px 3px rgba(0,0,0,.28);
                       transition: transform .22s cubic-bezier(.16,1,.3,1); }
  .wx-ck-sw input:checked + i { background: #9D5CFF; }
  .wx-ck-sw input:checked + i::after { transform: translateX(18px); }
  .wx-ck-sw input:focus-visible + i { outline: 2px solid #9D5CFF; outline-offset: 3px; }
  .wx-ck-sw input:disabled { cursor: not-allowed; }
  .wx-ck-sw input:disabled + i { background: #C9B6F5; }

  .wx-ck-foot { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px;
                padding-top: 20px; border-top: 1px solid rgba(26,20,48,.09); }

  @media (max-width: 560px) {
    .wx-ck { left: 12px; bottom: 12px; width: calc(100vw - 24px); max-width: none; padding: 18px 20px; }
    .wx-ck-pill { left: 12px; bottom: 12px; }
    .wx-ck-row .wx-ck-btn { flex: 1 1 auto; }
    .wx-ck-foot .wx-ck-btn { flex: 1 1 auto; }
  }
  @media (prefers-reduced-motion: reduce) {
    .wx-ck, .wx-ck-pill { transition: none; }
    .wx-ck-sw i, .wx-ck-sw i::after { transition: none; }
  }`;

  /* ------------------------------------------------------------------ */
  /* 6. Markup                                                          */
  /* ------------------------------------------------------------------ */
  var BANNER = `
  <button type="button" class="wx-ck-pill" data-wx-pill aria-expanded="false" aria-controls="wx-ck-panel" hidden>
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10 4.2 4.2 0 0 1-5-5 4.2 4.2 0 0 1-5-5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <circle cx="9" cy="10" r="1.15" fill="currentColor"/><circle cx="14" cy="14.5" r="1.15" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.15" fill="currentColor"/>
    </svg>
    <span>Cookie settings</span>
  </button>

  <div class="wx-ck" id="wx-ck-panel" role="dialog" aria-modal="false" aria-labelledby="wx-ck-t" data-wx-banner hidden>
    <button type="button" class="wx-ck-x" data-wx-collapse aria-label="Close, and leave optional cookies off">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
    </button>
    <h2 id="wx-ck-t">We use a few cookies</h2>
    <p>Necessary ones keep the site working. Beyond that, we would like to measure which
       pages are useful and watch anonymised replays of how the layout gets used &mdash;
       only if you are happy with it. See the
       <a href="${POLICY_URL}">Privacy Policy</a>.</p>
    <div class="wx-ck-row">
      <button type="button" class="wx-ck-btn wx-ck-btn--yes" data-wx-accept>Accept all</button>
      <button type="button" class="wx-ck-btn wx-ck-btn--no" data-wx-reject>Necessary only</button>
      <button type="button" class="wx-ck-btn wx-ck-btn--ghost" data-wx-open-prefs>Manage preferences</button>
    </div>
  </div>

  <div class="wx-ck-mask" data-wx-mask>
    <div class="wx-ck-modal" role="dialog" aria-modal="true" aria-labelledby="wx-ck-mt">
      <h2 id="wx-ck-mt">Cookie preferences</h2>
      <p>Switch a category off and the tag behind it does not load. Your choice is stored
         on this device only, and we will ask again in 12 months.</p>

      <div class="wx-ck-item">
        <label class="wx-ck-sw">
          <input type="checkbox" checked disabled aria-label="Strictly necessary cookies — always on">
          <i aria-hidden="true"></i>
        </label>
        <span>
          <b>Strictly necessary <em>&middot; always on</em></b>
          <span>Runs the site, delivers your contact form, loads our fonts, and remembers
                the choice you make here. No tracking.</span>
        </span>
      </div>

      <div class="wx-ck-item">
        <label class="wx-ck-sw">
          <input type="checkbox" data-wx-cat="analytics" aria-label="Analytics cookies">
          <i aria-hidden="true"></i>
        </label>
        <span>
          <b>Analytics</b>
          <span>Google Analytics, via Tag Manager. Aggregate numbers on which pages get
                read and where visitors arrive from. Helps us write better pages.</span>
        </span>
      </div>

      <div class="wx-ck-item">
        <label class="wx-ck-sw">
          <input type="checkbox" data-wx-cat="behaviour" aria-label="Behaviour and session recording cookies">
          <i aria-hidden="true"></i>
        </label>
        <span>
          <b>Behaviour &amp; session recording</b>
          <span>Microsoft Clarity. Heatmaps and anonymised replays of scrolling and clicks,
                with form fields masked. Shows us layout that confuses people.</span>
        </span>
      </div>

      <div class="wx-ck-foot">
        <button type="button" class="wx-ck-btn wx-ck-btn--yes" data-wx-save>Save preferences</button>
        <button type="button" class="wx-ck-btn wx-ck-btn--no" data-wx-accept>Accept all</button>
        <button type="button" class="wx-ck-btn wx-ck-btn--ghost" data-wx-close>Cancel</button>
      </div>
    </div>
  </div>`;

  /* ------------------------------------------------------------------ */
  /* 7. Init                                                            */
  /* ------------------------------------------------------------------ */
  function init() {
    var style = document.createElement('style');
    style.setAttribute('data-wx-consent-css', '');
    style.textContent = CSS;
    document.head.appendChild(style);

    var host = document.createElement('div');
    host.innerHTML = BANNER;
    while (host.firstChild) document.body.appendChild(host.firstChild);

    var banner = document.querySelector('[data-wx-banner]');
    var pill   = document.querySelector('[data-wx-pill]');
    var mask   = document.querySelector('[data-wx-mask]');
    var boxes  = document.querySelectorAll('[data-wx-cat]');
    var lastFocus = null;

    /* Two frames: the element must be laid out in its parked state before
       the class that animates it out of that state lands. The timeout is
       the fallback — rAF never fires in a background or throttled tab,
       which would leave the element in the DOM but parked off-screen. */
    function slideIn(el) {
      el.hidden = false;
      var reveal = function () { el.classList.add('is-on'); };
      requestAnimationFrame(function () { requestAnimationFrame(reveal); });
      setTimeout(reveal, 400);
    }

    function slideOut(el, ms) {
      el.classList.remove('is-on');
      setTimeout(function () { el.hidden = true; }, ms);
    }

    function showPill() { slideIn(pill); }
    function hideBanner() {
      slideOut(banner, 500);
      pill.setAttribute('aria-expanded', 'false');
    }

    /* The pill drops away as the panel grows out of the same corner. */
    function expand() {
      pill.setAttribute('aria-expanded', 'true');
      slideOut(pill, 260);
      slideIn(banner);
      var first = banner.querySelector('.wx-ck-btn');
      if (first) setTimeout(function () { first.focus(); }, 120);
    }

    function collapse() {
      slideOut(banner, 420);
      showPill();
      pill.setAttribute('aria-expanded', 'false');
      pill.focus();
    }

    /* Once a choice exists the switches mirror it exactly. Before that they
       open pre-selected — see PRESELECT above for why that is a decision
       with legal weight, not a styling default. */
    function syncBoxes() {
      var c = read();
      boxes.forEach(function (b) {
        b.checked = c ? !!c[b.getAttribute('data-wx-cat')] : PRESELECT;
      });
    }

    function openPrefs() {
      lastFocus = document.activeElement;
      syncBoxes();
      mask.classList.add('is-on');
      var first = mask.querySelector('input:not([disabled])');
      if (first) first.focus();
    }

    function closePrefs() {
      mask.classList.remove('is-on');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function decide(analytics, behaviour) {
      apply(write(analytics, behaviour));
      closePrefs();
      hideBanner();
      slideOut(pill, 420);
    }

    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-wx-accept],[data-wx-reject],[data-wx-save],[data-wx-open-prefs],[data-wx-close],[data-wx-pill],[data-wx-collapse]') : null;
      if (!t) return;
      e.preventDefault();
      if (t.hasAttribute('data-wx-pill'))       return expand();
      if (t.hasAttribute('data-wx-collapse'))   return collapse();
      if (t.hasAttribute('data-wx-accept'))     return decide(true, true);
      if (t.hasAttribute('data-wx-reject'))     return decide(false, false);
      if (t.hasAttribute('data-wx-open-prefs')) return openPrefs();
      if (t.hasAttribute('data-wx-close'))      return closePrefs();
      if (t.hasAttribute('data-wx-save')) {
        var v = { analytics: false, behaviour: false };
        boxes.forEach(function (b) { v[b.getAttribute('data-wx-cat')] = b.checked; });
        return decide(v.analytics, v.behaviour);
      }
    });

    /* Clicking the dimmed ground closes, as every modal on the web does. */
    mask.addEventListener('click', function (e) { if (e.target === mask) closePrefs(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      /* Topmost layer first, so one press does not close both. */
      if (mask.classList.contains('is-on')) return closePrefs();
      if (banner.classList.contains('is-on')) return collapse();
    });

    /* First visit opens on the pill, not the panel. */
    if (!choice) showPill();
  }

  /* The banner needs <body>; the consent defaults above did not, which is
     why they ran the moment this file was parsed. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Lets any page reopen the centre: window.wxConsent.open() */
  window.wxConsent = {
    open: function () {
      var m = document.querySelector('[data-wx-mask]');
      if (m) document.querySelector('[data-wx-open-prefs]').click();
    },
    get: read
  };
})();
