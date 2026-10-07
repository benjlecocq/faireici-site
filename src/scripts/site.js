/* fair[e]ici - shared site behaviour: nav, mobile menu, scroll reveals */
(function () {
  'use strict';

  /* ---- header scrolled state ---- */
  var head = document.querySelector('.site-head');
  function onScroll() {
    if (!head) return;
    head.setAttribute('data-scrolled', window.scrollY > 20 ? 'true' : 'false');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- expertises dropdown: hover-open (desktop) + click (touch) ---- */
  var hasMenu = document.querySelector('.has-menu');
  if (hasMenu) {
    var menuLink = hasMenu.querySelector('a');
    menuLink.setAttribute('aria-haspopup', 'true');
    menuLink.setAttribute('aria-expanded', 'false');
    // Only intercept the click on touch/coarse-pointer devices, where hover
    // isn't available. On desktop the link stays a normal link and the
    // submenu opens on hover (CSS), so no click is needed to reach it.
    var coarse = window.matchMedia && window.matchMedia('(hover: none)').matches;
    menuLink.addEventListener('click', function (e) {
      if (!coarse) return;
      e.preventDefault();
      var open = hasMenu.classList.toggle('open');
      menuLink.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    /* Desktop hover intent: keep the submenu open while the pointer travels
       toward it, and close it only after a short delay once the pointer has
       really left both the trigger and the panel. */
    if (!coarse) {
      var closeTimer = null;
      var openMenu = function () {
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
        hasMenu.classList.add('open');
        menuLink.setAttribute('aria-expanded', 'true');
      };
      var scheduleClose = function () {
        if (closeTimer) clearTimeout(closeTimer);
        closeTimer = setTimeout(function () {
          hasMenu.classList.remove('open');
          menuLink.setAttribute('aria-expanded', 'false');
        }, 260);
      };
      hasMenu.addEventListener('mouseenter', openMenu);
      hasMenu.addEventListener('mouseleave', scheduleClose);
      var panel = hasMenu.querySelector('.submenu');
      if (panel) {
        panel.addEventListener('mouseenter', openMenu);
        panel.addEventListener('mouseleave', scheduleClose);
      }
    }
    document.addEventListener('click', function (e) {
      if (!hasMenu.contains(e.target)) {
        hasMenu.classList.remove('open');
        menuLink.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hasMenu.classList.remove('open');
        menuLink.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- mobile drawer ---- */
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.getAttribute('data-menu') === 'open';
      document.body.setAttribute('data-menu', open ? 'closed' : 'open');
    });
    document.querySelectorAll('.drawer a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.setAttribute('data-menu', 'closed'); });
    });
  }

  /* ---- scroll reveals (freeze-safe) ----
     Some embedded/preview contexts and print/PDF never advance CSS
     transitions, which would otherwise leave opacity:0 content invisible.
     We feature-detect whether transitions actually run; if not, we snap every
     reveal to its visible end-state inline (no animation) so content is never
     hidden. In real browsers, transitions run and we animate on scroll. */
  var reveals = [].slice.call(document.querySelectorAll('[data-reveal]'));

  function snapVisible(el) {
    el.style.transition = 'none';
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.classList.add('in');
  }
  function animateIn(el) { el.classList.add('in'); }

  function startReveals(transitionsRun) {
    if (!transitionsRun) { reveals.forEach(snapVisible); return; }

    function inView(el) {
      var h = window.innerHeight || document.documentElement.clientHeight;
      var r = el.getBoundingClientRect();
      return r.top < h * 0.9 && r.bottom > 0;
    }
    reveals.forEach(function (el) { if (inView(el)) animateIn(el); });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { animateIn(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
      reveals.forEach(function (el) { if (!el.classList.contains('in')) io.observe(el); });
    }
    window.addEventListener('scroll', function () {
      reveals.forEach(function (el) { if (!el.classList.contains('in') && inView(el)) animateIn(el); });
    }, { passive: true });
    // ultimate safety
    setTimeout(function () { reveals.forEach(animateIn); }, 4000);
  }

  // detector: a tiny transition; if it advances, transitions run here
  if (!reveals.length) { /* nothing */ }
  else if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(snapVisible);
  } else {
    var probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;left:-9999px;top:0;width:4px;height:4px;opacity:0.001;transition:opacity .05s linear;pointer-events:none';
    document.body.appendChild(probe);
    void probe.offsetWidth;            // force reflow so the transition has a start value
    probe.style.opacity = '1';
    setTimeout(function () {
      var v = parseFloat(getComputedStyle(probe).opacity) || 0;
      probe.remove();
      startReveals(v > 0.5);
    }, 150);
  }

  /* ---- apply persisted tweaks (hero variant / accent / motion) ---- */
  // These keys are written by the Tweaks panel on the home page and persist
  // across the site via localStorage.
  try {
    var raw = localStorage.getItem('faireici.tweaks');
    if (raw) {
      var t = JSON.parse(raw);
      var root = document.documentElement;
      if (t.accent) root.style.setProperty('--accent', t.accent);
      if (t.accentHi) root.style.setProperty('--accent-hi', t.accentHi);
      if (t.motion === 'off') document.body.setAttribute('data-motion', 'off');
      if (t.hero) root.setAttribute('data-hero', t.hero);
    }
  } catch (e) { /* no-op */ }
})();
