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

  /* ---------- Lenis-style smooth scroll (keeps native scrollTop -> sticky works) ---------- */
  function initSmoothScroll() {
    if (reduce || matchMedia('(pointer: coarse)').matches) return;
    var target = window.scrollY, current = window.scrollY, raf = null;
    var maxScroll = function () { return document.documentElement.scrollHeight - window.innerHeight; };
    function loop() {
      current = lerp(current, target, 0.11);
      if (Math.abs(target - current) < 0.4) { current = target; window.scrollTo(0, current); raf = null; return; }
      window.scrollTo(0, current);
      raf = requestAnimationFrame(loop);
    }
    function onWheel(e) {
      if (e.ctrlKey) return;
      e.preventDefault();
      target = clamp(target + e.deltaY, 0, maxScroll());
      if (raf === null) raf = requestAnimationFrame(loop);
    }
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', function () { target = clamp(target, 0, maxScroll()); });
    window.addEventListener('scroll', function () { if (raf === null) { current = window.scrollY; target = window.scrollY; } });
    window.WebX._scrollTo = function (y) { target = clamp(y, 0, maxScroll()); if (raf === null) raf = requestAnimationFrame(loop); };
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
    Object.assign(btn.style, { display: 'none', position: 'fixed', top: '14px', right: 'clamp(16px,5vw,72px)', width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(255,255,255,.18)', background: 'rgba(20,20,24,.7)', backdropFilter: 'blur(10px)', webkitBackdropFilter: 'blur(10px)', zIndex: '9200', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px', padding: '0 14px' });
    var l1 = document.createElement('span'), l2 = document.createElement('span');
    [l1, l2].forEach(function (l) { Object.assign(l.style, { display: 'block', width: '100%', height: '1.6px', background: '#EDEDED', borderRadius: '2px', transition: 'transform .35s cubic-bezier(.16,1,.3,1), opacity .25s ease' }); });
    btn.appendChild(l1); btn.appendChild(l2); document.body.appendChild(btn);

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
  function initHeroCanvas() {
    var canvas = document.querySelector('[data-hero-canvas]');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener('resize', resize);
    var blobs = [
      { hue: 266, sat: 92, lig: 62, r: 0.62, ax: 0.20, ay: 0.16, sx: 0.11, sy: 0.07, px: 0.30, py: 0.32 },
      { hue: 258, sat: 80, lig: 50, r: 0.55, ax: 0.18, ay: 0.20, sx: 0.08, sy: 0.13, px: 0.72, py: 0.60 },
      { hue: 280, sat: 70, lig: 66, r: 0.42, ax: 0.22, ay: 0.14, sx: 0.15, sy: 0.10, px: 0.55, py: 0.82 },
      { hue: 248, sat: 85, lig: 55, r: 0.48, ax: 0.16, ay: 0.18, sx: 0.09, sy: 0.16, px: 0.18, py: 0.70 }
    ];
    function draw(t) {
      var time = t * 0.0001;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#08070d'; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      var minDim = Math.min(w, h);
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        var cx = (b.px + Math.sin(time * b.sx * 6.283 + b.hue) * b.ax) * w;
        var cy = (b.py + Math.cos(time * b.sy * 6.283 + b.hue) * b.ay) * h;
        var rad = b.r * minDim * (1 + 0.08 * Math.sin(time * 4 + b.hue));
        var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        grd.addColorStop(0, 'hsla(' + b.hue + ',' + b.sat + '%,' + b.lig + '%,0.55)');
        grd.addColorStop(0.5, 'hsla(' + b.hue + ',' + b.sat + '%,' + (b.lig - 10) + '%,0.18)');
        grd.addColorStop(1, 'hsla(' + b.hue + ',' + b.sat + '%,' + b.lig + '%,0)');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    draw(performance.now());
    window.addEventListener('resize', function () { draw(performance.now()); });
    if (reduce) return;
    var raf, loop = function (t) { draw(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    var heroSection = canvas.closest('section');
    if (heroSection && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(loop); }
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
      var grad = row.getAttribute('data-grad');
      row.addEventListener('mouseenter', function () { active = true; if (pimg) pimg.style.background = grad; preview.style.opacity = '1'; });
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
  }
  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
