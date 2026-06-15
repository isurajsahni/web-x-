/* ============================================================
   Web{X} Studio — motion + interaction runtime
   Pure vanilla, self-contained, no framework dependency.
   Auto-boots on DOMContentLoaded and wires every page module
   that is present in the DOM.
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, min, max) { return Math.max(min, Math.min(v, max)); };

  /* ---------- Smooth scroll (Lenis) ----------
     Lenis does *real* scroll, so position:sticky, IntersectionObserver, the
     parallax + pinned process section all keep working. Loaded from CDN on
     demand; skipped entirely under prefers-reduced-motion, and it degrades to
     native scroll if the CDN is unreachable. */
  var lenis = null;
  function initSmoothScroll() {
    if (reduce) return;                       // honour reduced-motion → native scroll
    function setup() {
      var L = window.Lenis; if (!L) return;
      if (L.default) L = L.default;           // UMD/ESM interop
      lenis = new L({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6 });
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      // route the public scrollTo (back-to-top, page transitions) through Lenis
      window.WebX._scrollTo = function (y) { lenis.scrollTo(y, { duration: 1.1 }); };
      // smooth in-page anchors, offset for the fixed header, keep focus for a11y
      document.addEventListener('click', function (e) {
        var a = e.target && e.target.closest && e.target.closest('a[href^="#"]');
        if (!a) return;
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el);                 // honours CSS scroll-margin-top (header offset)
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      });
    }
    if (window.Lenis) { setup(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js';
    s.defer = true;
    s.onload = setup;
    document.head.appendChild(s);          // onerror → native scroll remains
  }

  /* ---------- Custom cursor: dot (invert) + trailing ring + View label + {X} mark ---------- */
  function initCursor() {
    if (matchMedia('(pointer: coarse)').matches) return;
    var dot = document.createElement('div'), ring = document.createElement('div'), label = document.createElement('div');
    Object.assign(dot.style, { position: 'fixed', left: '0', top: '0', width: '8px', height: '8px', borderRadius: '50%', background: '#fff', mixBlendMode: 'difference', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: '99999', transition: 'width .25s ease, height .25s ease' });
    Object.assign(ring.style, { position: 'fixed', left: '0', top: '0', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,.5)', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: '99998', mixBlendMode: 'difference', transition: 'width .3s cubic-bezier(.16,1,.3,1), height .3s cubic-bezier(.16,1,.3,1), background .3s, border-color .3s, opacity .3s' });
    Object.assign(label.style, { position: 'fixed', left: '0', top: '0', transform: 'translate(-50%,-50%) scale(0)', borderRadius: '50%', width: '74px', height: '74px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#9D5CFF', color: '#0A0A0A', fontFamily: "'Space Grotesk', sans-serif", fontWeight: '600', fontSize: '13px', letterSpacing: '.04em', textTransform: 'uppercase', pointerEvents: 'none', zIndex: '99997', transition: 'transform .35s cubic-bezier(.16,1,.3,1)' });
    label.textContent = 'View';
    var xmark = document.createElement('div');
    Object.assign(xmark.style, { position: 'fixed', left: '0', top: '0', transform: 'translate(-50%,-50%)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: '700', fontSize: '13px', letterSpacing: '-.02em', color: '#9D5CFF', pointerEvents: 'none', zIndex: '99996', whiteSpace: 'nowrap', transition: 'opacity .3s ease, transform .3s cubic-bezier(.16,1,.3,1)', textShadow: '0 0 12px rgba(157,92,255,.6)' });
    xmark.innerHTML = '{X}';
    document.body.appendChild(ring); document.body.appendChild(dot); document.body.appendChild(xmark); document.body.appendChild(label);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my, lx = mx, ly = my, magnetEl = null, magX = 0, magY = 0;
    window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
    function frame() {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      lx = lerp(lx, mx, 0.12); ly = lerp(ly, my, 0.12);
      var dotX = mx, dotY = my;
      if (magnetEl) {
        var r = magnetEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        magX = lerp(magX, (mx - cx) * 0.32, 0.2); magY = lerp(magY, (my - cy) * 0.32, 0.2);
        magnetEl.style.transform = 'translate(' + magX + 'px, ' + magY + 'px)';
        dotX = cx + magX; dotY = cy + magY;
      }
      dot.style.left = dotX + 'px'; dot.style.top = dotY + 'px';
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      label.style.left = lx + 'px'; label.style.top = ly + 'px';
      xmark.style.left = (rx + 20) + 'px'; xmark.style.top = (ry + 20) + 'px';
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    function bind() {
      document.querySelectorAll('[data-magnetic]').forEach(function (el) {
        if (el.__wxBound) return; el.__wxBound = true;
        el.addEventListener('mouseenter', function () { magnetEl = el; });
        el.addEventListener('mouseleave', function () { magnetEl = null; magX = 0; magY = 0; el.style.transform = 'translate(0,0)'; });
      });
      document.querySelectorAll('a, button, [data-cursor]').forEach(function (el) {
        if (el.__wxHover) return; el.__wxHover = true;
        var view = el.getAttribute('data-cursor') === 'view';
        el.addEventListener('mouseenter', function () {
          if (view) { label.style.transform = 'translate(-50%,-50%) scale(1)'; ring.style.opacity = '0'; dot.style.width = '0px'; dot.style.height = '0px'; xmark.style.opacity = '0'; }
          else { ring.style.width = '64px'; ring.style.height = '64px'; ring.style.background = 'rgba(255,255,255,.08)'; xmark.style.transform = 'translate(-50%,-50%) scale(1.25)'; }
        });
        el.addEventListener('mouseleave', function () {
          if (view) { label.style.transform = 'translate(-50%,-50%) scale(0)'; ring.style.opacity = '1'; dot.style.width = '8px'; dot.style.height = '8px'; xmark.style.opacity = '1'; }
          else { ring.style.width = '40px'; ring.style.height = '40px'; ring.style.background = 'transparent'; xmark.style.transform = 'translate(-50%,-50%) scale(1)'; }
        });
      });
    }
    bind();
    window.WebX._bindCursor = bind;
  }

  /* ---------- Scroll reveals ---------- */
  function initReveals() {
    var els = document.querySelectorAll('[data-reveal]');
    if (reduce) { els.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target, delay = parseFloat(el.getAttribute('data-reveal-delay') || '0');
          el.style.transitionDelay = delay + 'ms';
          requestAnimationFrame(function () { el.style.opacity = '1'; el.style.transform = 'none'; });
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Split-text stagger (node-aware: preserves coloured sub-spans) ---------- */
  function initSplit() {
    if (reduce) return;
    document.querySelectorAll('[data-split]').forEach(function (el) {
      if (el.__split) return; el.__split = true;
      var lines = el.querySelectorAll('[data-split-line]');
      var targets = lines.length ? lines : [el];
      el.__inners = [];
      targets.forEach(function (line) {
        var units = [];
        Array.prototype.forEach.call(line.childNodes, function (node) {
          if (node.nodeType === 3) {
            node.textContent.split(/\s+/).forEach(function (w) { if (w.length) units.push(document.createTextNode(w)); });
          } else if (node.nodeType === 1) {
            units.push(node.cloneNode(true));
          }
        });
        line.textContent = '';
        line.style.overflow = 'hidden';
        line.style.display = 'block';
        units.forEach(function (u, i) {
          var wrap = document.createElement('span');
          wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top';
          var inner = document.createElement('span');
          inner.style.cssText = 'display:inline-block;transform:translateY(110%);transition:transform .9s cubic-bezier(.16,1,.3,1)';
          inner.appendChild(u);
          wrap.appendChild(inner);
          line.appendChild(wrap);
          if (i < units.length - 1) line.appendChild(document.createTextNode(' '));
          el.__inners.push(inner);
        });
      });
    });
  }
  function playSplit(el, baseDelay) {
    if (!el || !el.__inners) return;
    el.__inners.forEach(function (inner, i) {
      inner.style.transitionDelay = (baseDelay + i * 55) + 'ms';
      inner.style.transform = 'translateY(0)';
    });
  }

  /* ---------- Count-up on scroll ---------- */
  function initCountUp() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        var to = parseFloat(el.getAttribute('data-count'));
        var dec = parseInt(el.getAttribute('data-count-dec') || '0', 10);
        var suffix = el.getAttribute('data-count-suffix') || '';
        var dur = 1600, start = performance.now();
        function step(now) {
          var p = clamp((now - start) / dur, 0, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (to * eased).toFixed(dec) + suffix;
          if (p < 1) requestAnimationFrame(step); else el.textContent = to.toFixed(dec) + suffix;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(function (el) { io.observe(el); });
  }

  /* ---------- Horizontal pinned scroll ---------- */
  function initHorizontal() {
    document.querySelectorAll('[data-horizontal]').forEach(function (section) {
      var track = section.querySelector('[data-horizontal-track]');
      if (!track) return;
      function onScroll() {
        var rect = section.getBoundingClientRect();
        var total = section.offsetHeight - window.innerHeight;
        var progress = clamp(-rect.top / total, 0, 1);
        var dist = track.scrollWidth - window.innerWidth;
        track.style.transform = 'translateX(' + (-progress * dist) + 'px)';
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();
    });
  }

  /* ---------- Parallax ---------- */
  function initParallax() {
    if (reduce) return;
    var items = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (!items.length) return;
    function onScroll() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0, ' + (-center * speed).toFixed(1) + 'px, 0) scale(1.18)';
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------- Sticky header: hide on scroll down, show on up ---------- */
  function initHeader() {
    var header = document.querySelector('[data-header]');
    if (!header) return;
    var last = window.scrollY;
    window.addEventListener('scroll', function () {
      if (window.WebX._menuOpen) { header.style.transform = 'translateY(0)'; return; }
      var y = window.scrollY;
      if (y > 80 && y > last) header.style.transform = 'translateY(-130%)'; else header.style.transform = 'translateY(0)';
      header.style.background = y > 40 ? 'rgba(10,10,10,.72)' : 'transparent';
      header.style.backdropFilter = y > 40 ? 'blur(14px)' : 'none';
      header.style.webkitBackdropFilter = y > 40 ? 'blur(14px)' : 'none';
      header.style.borderColor = y > 40 ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,0)';
      last = y;
    }, { passive: true });
  }

  /* ---------- Mobile nav: hamburger + fullscreen overlay ---------- */
  function initMobileNav() {
    var header = document.querySelector('[data-header]');
    if (!header || header.__mnav) return;
    var nav = header.querySelector('nav');
    if (!nav) return;
    header.__mnav = true;
    var mq = window.matchMedia('(max-width: 820px)');
    var btn = document.createElement('button');
    btn.setAttribute('aria-label', 'Toggle menu');
    btn.setAttribute('aria-expanded', 'false');
    Object.assign(btn.style, { display: 'none', width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.04)', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px', padding: '0 13px', flex: '0 0 auto', cursor: 'pointer' });
    var l1 = document.createElement('span'), l2 = document.createElement('span');
    [l1, l2].forEach(function (l) { Object.assign(l.style, { display: 'block', width: '100%', height: '1.6px', background: '#EDEDED', borderRadius: '2px', transition: 'transform .35s cubic-bezier(.16,1,.3,1), opacity .25s ease' }); });
    btn.appendChild(l1); btn.appendChild(l2); header.appendChild(btn); // sits in the header bar, aligned with the logo

    var overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    Object.assign(overlay.style, { position: 'fixed', inset: '0', zIndex: '9100', background: 'rgba(9,9,11,.97)', backdropFilter: 'blur(22px)', webkitBackdropFilter: 'blur(22px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px', padding: '0 clamp(24px,8vw,48px)', transform: 'translateY(-100%)', transition: 'transform .6s cubic-bezier(.76,0,.24,1)', pointerEvents: 'none' });
    var eyebrow = document.createElement('div');
    eyebrow.textContent = 'Menu';
    Object.assign(eyebrow.style, { fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#9D5CFF', marginBottom: '24px', opacity: '0', transform: 'translateY(20px)', transition: 'opacity .5s ease, transform .5s ease' });
    overlay.appendChild(eyebrow);

    var items = [];
    [].slice.call(nav.querySelectorAll('a')).forEach(function (a) {
      var item = document.createElement('a');
      item.href = a.getAttribute('href');
      if (a.hasAttribute('data-transition')) item.setAttribute('data-transition', '');
      item.textContent = (a.textContent || '').replace('← ', '').trim();
      Object.assign(item.style, { fontFamily: "'Space Grotesk', sans-serif", fontWeight: '600', letterSpacing: '-.03em', fontSize: 'clamp(38px,11vw,72px)', lineHeight: '1.18', color: '#EDEDED', textDecoration: 'none', opacity: '0', transform: 'translateY(24px)', transition: 'opacity .5s ease, transform .6s cubic-bezier(.16,1,.3,1), color .3s ease' });
      item.addEventListener('click', function () { setOpen(false); });
      overlay.appendChild(item); items.push(item);
    });
    var foot = document.createElement('a');
    foot.href = 'mailto:hello@thewebx.in';
    foot.textContent = 'hello@thewebx.in';
    Object.assign(foot.style, { marginTop: '40px', fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', color: '#9A9AA2', textDecoration: 'none', opacity: '0', transform: 'translateY(20px)', transition: 'opacity .5s ease, transform .5s ease' });
    overlay.appendChild(foot); document.body.appendChild(overlay);

    var open = false, animated = [eyebrow].concat(items, [foot]);
    function setOpen(v) {
      open = v; window.WebX._menuOpen = v;
      overlay.style.transform = v ? 'translateY(0)' : 'translateY(-100%)';
      overlay.style.pointerEvents = v ? 'auto' : 'none';
      overlay.setAttribute('aria-hidden', v ? 'false' : 'true');
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
      l1.style.transform = v ? 'translateY(3.8px) rotate(45deg)' : 'none';
      l2.style.transform = v ? 'translateY(-3.8px) rotate(-45deg)' : 'none';
      document.body.style.overflow = v ? 'hidden' : '';
      if (lenis) { if (v) lenis.stop(); else lenis.start(); }
      header.style.zIndex = v ? '9300' : '9000';   // lift header (logo + close button) above the overlay
      animated.forEach(function (el, i) {
        el.style.transitionDelay = (v ? 130 + i * 55 : 0) + 'ms';
        el.style.opacity = v ? '1' : '0';
        el.style.transform = v ? 'translateY(0)' : 'translateY(22px)';
      });
    }
    btn.addEventListener('click', function () { setOpen(!open); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) setOpen(false); });
    function apply() {
      if (mq.matches) { nav.style.display = 'none'; btn.style.display = 'flex'; }
      else { nav.style.display = 'flex'; btn.style.display = 'none'; setOpen(false); }
    }
    if (mq.addEventListener) mq.addEventListener('change', apply); else mq.addListener(apply);
    apply();
  }

  /* ---------- Page-wipe transitions ---------- */
  function initPageTransition() {
    var overlay = document.createElement('div');
    Object.assign(overlay.style, { position: 'fixed', inset: '0', zIndex: '100000', background: '#0A0A0A', transform: 'translateY(100%)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', willChange: 'transform' });
    var mark = document.createElement('div');
    mark.innerHTML = 'Web<span style="color:#9D5CFF">{X}</span>';
    Object.assign(mark.style, { fontFamily: "'Space Grotesk', sans-serif", fontWeight: '700', fontSize: 'clamp(40px,7vw,96px)', color: '#fff', opacity: '0', transition: 'opacity .35s ease', letterSpacing: '-.03em' });
    overlay.appendChild(mark); document.body.appendChild(overlay);

    if (!document.getElementById('wx-intro-kf')) {
      var st = document.createElement('style'); st.id = 'wx-intro-kf';
      st.textContent = '@keyframes wx-intro{0%{transform:translateY(0)}28%{transform:translateY(0)}100%{transform:translateY(-100%)}}';
      document.head.appendChild(st);
    }
    function parkOverlay() { overlay.style.animation = 'none'; overlay.style.transition = 'none'; overlay.style.transform = 'translateY(100%)'; mark.style.opacity = '0'; }
    if (!reduce) {
      overlay.style.transform = 'translateY(0)'; mark.style.opacity = '1';
      overlay.style.animation = 'wx-intro 1.15s cubic-bezier(.76,0,.24,1) forwards';
      setTimeout(function () { mark.style.opacity = '0'; }, 520);
      setTimeout(parkOverlay, 1250);
    } else { parkOverlay(); }

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-transition]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || a.target === '_blank' || /^(mailto:|tel:)/.test(href)) return;
      e.preventDefault();
      if (reduce) { window.location.href = href; return; }
      overlay.style.transition = 'transform .7s cubic-bezier(.76,0,.24,1)';
      overlay.style.transform = 'translateY(0)'; mark.style.opacity = '1';
      setTimeout(function () { window.location.href = href; }, 720);
    });
  }

  /* ---------- Grain overlay ---------- */
  function initGrain() {
    if (document.querySelector('[data-grain]')) return;
    var g = document.createElement('div'); g.setAttribute('data-grain', ''); g.setAttribute('aria-hidden', 'true');
    Object.assign(g.style, { position: 'fixed', inset: '0', zIndex: '90000', pointerEvents: 'none', opacity: '.045', mixBlendMode: 'overlay', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", animation: 'wx-grain .5s steps(2) infinite' });
    document.body.appendChild(g);
  }

  /* ============================================================
     Page modules — each is a no-op unless its markup is present
     ============================================================ */

  /* Home: flowing violet hero canvas */
  /* Home hero: Antigravity-style particle field + rotating dash-burst.
     Dark theme — drawn additively ('lighter') so dots/lines/burst glow on
     near-black. Gradient runs blue -> brand violet -> pink. Particles bend
     toward the cursor (eased gravity) and drift with depth-based parallax. */
  function initHeroCanvas() {
    var canvas = document.querySelector('[data-hero-canvas]');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    // blue -> violet (#9D5CFF brand) -> pink
    var STOPS = [[79, 139, 255], [157, 92, 255], [255, 111, 216]];
    function grad(t) {
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      var s = t * 2, i = s | 0, f = s - i, a = STOPS[i], b = STOPS[i + 1] || STOPS[i];
      return ((a[0] + (b[0] - a[0]) * f) | 0) + ',' + ((a[1] + (b[1] - a[1]) * f) | 0) + ',' + ((a[2] + (b[2] - a[2]) * f) | 0);
    }

    var NB = [[0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]; // forward-only grid neighbours
    var parts = [], grid = [], used = [], cols = 0, rows = 0, cell = 0, linkDist = 120;
    var pullR = 200, pull = 0.9, parallax = 26;

    function build() {
      var count = Math.round((w * h) / 2800);      // optimise by area
      count = Math.max(50, Math.min(560, count));  // clamp (subtle behind text)
      linkDist = w < 640 ? 92 : 120;
      parts = new Array(count);
      for (var i = 0; i < count; i++) {
        var x = Math.random() * w, y = Math.random() * h;
        var t = x / w + (Math.random() - 0.5) * 0.18;   // colour follows x
        parts[i] = {
          i: i, hx: x, hy: y, x: x, y: y, vx: 0, vy: 0,
          ax: (Math.random() - 0.5) * 0.05, ay: (Math.random() - 0.5) * 0.05,
          size: 0.6 + Math.random() * 1.7, depth: 0.35 + Math.random() * 0.65,
          col: grad(t), ph: Math.random() * 6.283
        };
      }
      cell = linkDist; cols = Math.ceil(w / cell) + 1; rows = Math.ceil(h / cell) + 1;
      grid = new Array(cols * rows); used = [];
    }

    // burst state (positioned upper-right, away from the headline)
    var bAngle = 0, bcx = 0, bcy = 0, bInner = 0, bOuter = 0, bRays = 130;

    function resize() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      var sm = Math.min(w, h);
      bcx = w * 0.82; bcy = h * 0.40;
      bInner = sm * 0.10; bOuter = sm * 0.30;
      bRays = w < 760 ? 72 : 104;
    }

    var heroSection = canvas.closest('section');
    var headline = heroSection ? heroSection.querySelector('h1') : null;
    var fine = matchMedia('(pointer: fine)').matches;
    var tmx = 0, tmy = 0, cmx = 0, cmy = 0;                 // normalised parallax (-1..1)
    var tpx = 0, tpy = 0, cpx = 0, cpy = 0, active = false; // pixel cursor for gravity
    if (fine && !reduce && heroSection) {
      heroSection.addEventListener('mousemove', function (e) {
        var r = canvas.getBoundingClientRect();
        tpx = e.clientX - r.left; tpy = e.clientY - r.top;
        tmx = (tpx / r.width - 0.5) * 2; tmy = (tpy / r.height - 0.5) * 2;
        active = true;
      });
      heroSection.addEventListener('mouseleave', function () { tmx = 0; tmy = 0; active = false; });
    }

    resize(); window.addEventListener('resize', resize);
    cpx = tpx = w / 2; cpy = tpy = h / 2;

    function updateField() {
      var pr2 = pullR * pullR;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.hx += p.ax; p.hy += p.ay;                         // ambient drift, wrapped
        if (p.hx < 0) p.hx += w; else if (p.hx > w) p.hx -= w;
        if (p.hy < 0) p.hy += h; else if (p.hy > h) p.hy -= h;
        var tx = p.hx + cmx * parallax * p.depth, ty = p.hy + cmy * parallax * p.depth;
        if (active) {                                        // eased gravity pull
          var dx = cpx - p.x, dy = cpy - p.y, d2 = dx * dx + dy * dy;
          if (d2 < pr2) { var d = Math.sqrt(d2) || 1, e = (1 - d / pullR); e *= e; tx += dx * e * pull; ty += dy * e * pull; }
        }
        p.vx += (tx - p.x) * 0.08; p.vy += (ty - p.y) * 0.08;
        p.vx *= 0.82; p.vy *= 0.82; p.x += p.vx; p.y += p.vy;
      }
    }

    function drawField(intro) {
      var k;
      for (k = 0; k < used.length; k++) grid[used[k]].length = 0; // reuse buckets
      used.length = 0;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var gx = (p.x / cell) | 0, gy = (p.y / cell) | 0;
        if (gx < 0) gx = 0; else if (gx >= cols) gx = cols - 1;
        if (gy < 0) gy = 0; else if (gy >= rows) gy = rows - 1;
        var idx = gy * cols + gx, b = grid[idx];
        if (!b) b = grid[idx] = [];
        if (b.length === 0) used.push(idx);
        b.push(p);
      }
      var link2 = linkDist * linkDist;
      ctx.lineWidth = 1;
      for (var cy = 0; cy < rows; cy++) {
        for (var cx = 0; cx < cols; cx++) {
          var bucket = grid[cy * cols + cx];
          if (!bucket) continue;
          for (var n = 0; n < NB.length; n++) {
            var ncx = cx + NB[n][0], ncy = cy + NB[n][1];
            if (ncx < 0 || ncy < 0 || ncx >= cols || ncy >= rows) continue;
            var other = grid[ncy * cols + ncx];
            if (!other) continue;
            var same = n === 0;
            for (var ai = 0; ai < bucket.length; ai++) {
              var a = bucket[ai];
              for (var bi = 0; bi < other.length; bi++) {
                var bb = other[bi];
                if (same && bb.i <= a.i) continue;
                var dx = a.x - bb.x, dy = a.y - bb.y, dd = dx * dx + dy * dy;
                if (dd > link2) continue;
                var al = (1 - Math.sqrt(dd) / linkDist) * 0.12 * intro;
                if (al < 0.003) continue;
                ctx.strokeStyle = 'rgba(' + a.col + ',' + al + ')';
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(bb.x, bb.y); ctx.stroke();
              }
            }
          }
        }
      }
      var tw0 = performance.now() * 0.0015;
      for (var j = 0; j < parts.length; j++) {
        var q = parts[j], tw = 0.7 + Math.sin(tw0 + q.ph) * 0.3;
        ctx.fillStyle = 'rgba(' + q.col + ',' + (0.6 * tw * intro) + ')';
        ctx.beginPath(); ctx.arc(q.x, q.y, q.size, 0, 6.2832); ctx.fill();
      }
    }

    function drawBurst(dt, intro) {
      bAngle += 0.06 * dt;
      var cx = bcx + cmx * 40, cy = bcy + cmy * 40, t = performance.now() * 0.001;
      ctx.save(); ctx.translate(cx, cy);
      var halo = ctx.createRadialGradient(0, 0, bInner * 0.2, 0, 0, bOuter * 1.18);
      halo.addColorStop(0, 'rgba(157,92,255,' + (0.16 * intro) + ')');
      halo.addColorStop(0.55, 'rgba(79,139,255,' + (0.06 * intro) + ')');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, bOuter * 1.18, 0, 6.2832); ctx.fill();
      ctx.rotate(bAngle); ctx.lineCap = 'round';
      var span = bOuter - bInner;
      for (var i = 0; i < bRays; i++) {
        var a = (i / bRays) * 6.283, ca = Math.cos(a), sa = Math.sin(a);
        var rgb = grad((i / bRays + t * 0.02) % 1);
        var tw = 0.5 + Math.sin(t * 2 + i * 0.6) * 0.5, len = 24 * (0.6 + ((i * 7) % 5) / 5 * 0.9);
        for (var s = 0; s < 2; s++) {
          var r0 = bInner + span * (s / 2) + 6 + ((i * 13) % 7), r1 = Math.min(bOuter, r0 + len);
          var alpha = (1 - r0 / bOuter) * 0.85 * tw * intro;
          if (alpha < 0.01) continue;
          // additive glow: a wide faint pass + a bright thin core (cheaper than shadowBlur)
          ctx.beginPath(); ctx.moveTo(ca * r0, sa * r0); ctx.lineTo(ca * r1, sa * r1);
          ctx.strokeStyle = 'rgba(' + rgb + ',' + (alpha * 0.35) + ')'; ctx.lineWidth = 5.5; ctx.stroke();
          ctx.strokeStyle = 'rgba(' + rgb + ',' + alpha + ')'; ctx.lineWidth = 1.8; ctx.stroke();
        }
      }
      ctx.restore();
    }

    var intro = reduce ? 1 : 0;
    function draw(dt) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#08070d'; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';            // additive glow on dark
      updateField();
      drawField(intro);
      drawBurst(dt, intro);
      ctx.globalCompositeOperation = 'source-over';
    }

    draw(0);
    if (reduce) return;
    var last = performance.now(), raf;
    var loop = function (t) {
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (intro < 1) intro = Math.min(1, intro + dt * 0.8);
      cmx += (tmx - cmx) * 0.06; cmy += (tmy - cmy) * 0.06;
      cpx += (tpx - cpx) * 0.12; cpy += (tpy - cpy) * 0.12;
      if (headline) headline.style.transform = 'translate3d(' + (cmx * 18).toFixed(2) + 'px,' + (cmy * 13).toFixed(2) + 'px,0)';
      draw(dt); raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    if (heroSection && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
          else { if (raf) { cancelAnimationFrame(raf); raf = null; } }
        });
      }, { threshold: 0 });
      io.observe(heroSection);
    }
  }

  /* Home: rotating hero word */
  function initHeroRotator() {
    var el = document.querySelector('[data-rotate]');
    if (!el) return;
    var words = ['experiences', 'websites', 'landing pages', 'brands', 'results'];
    var i = 0; el.textContent = words[0];
    if (reduce) return;
    setInterval(function () {
      el.style.transition = 'transform .45s cubic-bezier(.7,0,.2,1), opacity .45s ease';
      el.style.transform = 'translateY(-110%)'; el.style.opacity = '0';
      setTimeout(function () {
        i = (i + 1) % words.length; el.textContent = words[i];
        el.style.transition = 'none'; el.style.transform = 'translateY(110%)';
        void el.offsetWidth;
        el.style.transition = 'transform .55s cubic-bezier(.16,1,.3,1), opacity .5s ease';
        el.style.transform = 'translateY(0)'; el.style.opacity = '1';
      }, 450);
    }, 2400);
  }

  /* Home/contact: local clock (India Standard Time) */
  function initClock() {
    var el = document.querySelector('[data-clock]');
    if (!el) return;
    function tick() {
      try {
        var t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
        el.textContent = t + ' IST · Open';
      } catch (e) { el.textContent = 'Open for work'; }
    }
    tick(); setInterval(tick, 1000 * 20);
  }

  /* Home: process progress bar synced to horizontal scroll */
  function initProcessBar() {
    var section = document.querySelector('[data-horizontal]');
    var bar = document.querySelector('[data-progress]');
    if (!section || !bar) return;
    var nums = [].slice.call(document.querySelectorAll('[data-process-num]'));
    function onScroll() {
      var rect = section.getBoundingClientRect();
      var total = section.offsetHeight - window.innerHeight;
      var p = Math.max(0, Math.min(-rect.top / total, 1));
      bar.style.width = (25 + p * 75) + '%';
      var active = Math.min(nums.length - 1, Math.floor(p * nums.length + 0.001));
      nums.forEach(function (n, i) {
        if (i === active) { n.style.color = '#9D5CFF'; n.style.opacity = '.9'; }
        else { n.style.color = '#EDEDED'; n.style.opacity = '.12'; }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* Work: floating preview that follows the cursor on row hover */
  function initWorkPreview() {
    var preview = document.querySelector('[data-preview]');
    var pimg = document.querySelector('[data-preview-img]');
    var rows = document.querySelectorAll('.wx-row');
    if (!preview || !rows.length) return;
    var mx = 0, my = 0, px = 0, py = 0, active = false;
    window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
    (function loop() {
      px += (mx - px) * 0.14; py += (my - py) * 0.14;
      preview.style.transform = 'translate(' + (px - 170) + 'px, ' + (py - 120) + 'px) scale(' + (active ? 1 : 0.85) + ')';
      requestAnimationFrame(loop);
    })();
    rows.forEach(function (row) {
      var img = row.getAttribute('data-img');
      var grad = row.getAttribute('data-grad');
      row.addEventListener('mouseenter', function () {
        active = true;
        if (pimg) {
          if (img) { pimg.style.backgroundImage = 'url("' + img + '")'; pimg.style.backgroundSize = 'cover'; pimg.style.backgroundPosition = 'center'; pimg.style.background = pimg.style.background; }
          else if (grad) { pimg.style.background = grad; }
        }
        preview.style.opacity = '1';
      });
      row.addEventListener('mouseleave', function () { active = false; preview.style.opacity = '0'; });
    });
  }

  /* Contact: validation + submit (works with a form endpoint or in demo mode) */
  function initContactForm() {
    var form = document.getElementById('wx-contact-form');
    if (!form) return;
    var success = document.getElementById('wx-contact-success');
    var f = { name: form.querySelector('[name="name"]'), email: form.querySelector('[name="email"]'), message: form.querySelector('[name="message"]') };
    var errs = { name: form.querySelector('[data-err="name"]'), email: form.querySelector('[data-err="email"]'), message: form.querySelector('[data-err="message"]') };
    function setErr(k, on) { if (errs[k]) errs[k].hidden = !on; if (f[k]) f[k].setAttribute('aria-invalid', on ? 'true' : 'false'); }
    Object.keys(f).forEach(function (k) { if (f[k]) f[k].addEventListener('input', function () { setErr(k, false); }); });
    var endpoint = form.getAttribute('data-endpoint') || '';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (f.name && f.name.value || '').trim();
      var email = (f.email && f.email.value || '').trim();
      var message = (f.message && f.message.value || '').trim();
      var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      var eName = name.length < 1, eEmail = !validEmail, eMsg = message.length < 10;
      setErr('name', eName); setErr('email', eEmail); setErr('message', eMsg);
      if (eName || eEmail || eMsg) { var first = form.querySelector('[aria-invalid="true"]'); if (first) first.focus(); return; }
      function done() {
        if (success) {
          form.hidden = true; success.hidden = false;
          [].slice.call(success.querySelectorAll('[data-name-slot]')).forEach(function (s) { s.textContent = name ? (', ' + name.split(' ')[0]) : ''; });
        }
        WebX.scrollTo(0);
      }
      var btn = form.querySelector('button[type="submit"]');
      if (endpoint) {
        if (btn) { btn.disabled = true; btn.dataset.label = btn.innerHTML; btn.textContent = 'Sending…'; }
        fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
          .then(function (res) { if (res.ok) { done(); } else { throw new Error('bad'); } })
          .catch(function () { if (btn) { btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; } window.alert('Sorry — something went wrong. Please email hello@thewebx.in'); });
      } else { done(); }
    });
  }

  /* Footer: back-to-top */
  function wireBackTop() {
    document.querySelectorAll('[data-back-top]').forEach(function (bt) {
      bt.addEventListener('click', function () { WebX.scrollTo(0); });
    });
  }

  /* Home FAQ: smooth height animation for native <details> (progressive enhancement) */
  function initFaq() {
    var items = document.querySelectorAll('details.wx-faq');
    if (!items.length) return;
    items.forEach(function (el) {
      var summary = el.querySelector('summary');
      var body = el.querySelector('.wx-faq-body');
      if (!summary || !body || typeof el.animate !== 'function') return; // no WAAPI -> native toggle
      var anim = null, closing = false, expanding = false;
      var EASE = 'cubic-bezier(.16,1,.3,1)', DUR = reduce ? 0 : 440;
      function finish(open) { el.open = open; anim = null; closing = expanding = false; el.style.height = ''; el.style.overflow = ''; }
      function run(start, end, open) {
        el.style.overflow = 'hidden';
        if (anim) anim.cancel();
        anim = el.animate({ height: [start + 'px', end + 'px'] }, { duration: DUR, easing: EASE });
        anim.onfinish = function () { finish(open); };
        anim.oncancel = function () { closing = expanding = false; };
      }
      function shrink() { closing = true; run(el.offsetHeight, summary.offsetHeight, false); }
      function expand() { expanding = true; run(el.offsetHeight, summary.offsetHeight + body.offsetHeight, true); }
      function openIt() { el.style.overflow = 'hidden'; el.style.height = el.offsetHeight + 'px'; el.open = true; requestAnimationFrame(expand); }
      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (closing || !el.open) openIt();
        else if (expanding || el.open) shrink();
      });
    });
  }

  /* Capability cards: cursor-tracking violet spotlight */
  function initCardSpotlight() {
    if (!matchMedia('(pointer: fine)').matches || reduce) return;
    document.querySelectorAll('[data-cap-card]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* Selected-work cards: 3D tilt that tracks the cursor */
  function initCardTilt() {
    if (!matchMedia('(pointer: fine)').matches || reduce) return;
    document.querySelectorAll('.wx-work').forEach(function (card) {
      var raf = null;
      card.addEventListener('mouseenter', function () { card.style.transition = 'transform .12s ease-out'; });
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.transform = 'perspective(900px) rotateY(' + (px * 7).toFixed(2) + 'deg) rotateX(' + (-py * 7).toFixed(2) + 'deg) scale(1.015)';
        });
      });
      card.addEventListener('mouseleave', function () {
        if (raf) cancelAnimationFrame(raf);
        card.style.transition = 'transform .55s cubic-bezier(.16,1,.3,1)';
        card.style.transform = 'none';
      });
    });
  }

  /* ---------- Public API ---------- */
  window.WebX = {
    initAll: function () {
      initGrain(); initSmoothScroll(); initCursor(); initSplit(); initReveals();
      initCountUp(); initHorizontal(); initParallax(); initHeader(); initMobileNav(); initPageTransition();
      var self = this;
      document.querySelectorAll('[data-split][data-split-auto]').forEach(function (el, i) {
        setTimeout(function () { playSplit(el, 0); }, reduce ? 0 : 1100 + i * 120);
      });
    },
    playSplit: playSplit,
    rebind: function () { if (window.WebX._bindCursor) window.WebX._bindCursor(); },
    scrollTo: function (y) { if (window.WebX._scrollTo) window.WebX._scrollTo(y); else window.scrollTo(0, y); }
  };

  /* ---------- Boot ---------- */
  function boot() {
    window.WebX.initAll();
    initHeroCanvas(); initHeroRotator(); initClock(); initProcessBar();
    initWorkPreview(); initContactForm(); wireBackTop(); initFaq();
    initCardSpotlight(); initCardTilt();
  }
  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
