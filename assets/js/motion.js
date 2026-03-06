(function () {
  // Inject ambient background (permanent "life")
  function ensureAmbient() {
    if (document.querySelector('.site-ambient')) return;
    var el = document.createElement('div');
    el.className = 'site-ambient';
    el.innerHTML = '<div class="dots"></div><div class="blob1"></div><div class="blob2"></div>';
    document.body.appendChild(el);
  }

  // Register reveal animations without requiring markup changes
  function markRevealTargets() {
    // Targets: common cards/blocks across pages
    var selectors = [
      'main section h2',
      'main section h3',
      'main section p',
      'main section ul',
      'main .rounded-2xl',
      'main .rounded-xl',
      'main .leader-card',
      'main .cap-card',
      'main .approach-card',
      'main .partner-panel'
    ];
    var els = [];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (node) {
        // Avoid revealing very small elements like icons
        if (node.closest('nav') || node.closest('footer')) return;
        if (node.classList.contains('reveal-ready') || node.classList.contains('reveal-in')) return;
        // Only reveal block-ish elements to avoid too much motion
        if (node.tagName === 'P' || node.tagName === 'H2' || node.tagName === 'H3' || node.tagName === 'UL' || node.classList.contains('rounded-2xl') || node.classList.contains('rounded-xl') || node.classList.contains('leader-card') || node.classList.contains('cap-card') || node.classList.contains('approach-card') || node.classList.contains('partner-panel')) {
          node.classList.add('reveal-ready');
          els.push(node);
        }
      });
    });
    return els;
  }

  function revealOnScroll(els) {
    if (!els || !els.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    els.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i, 10) * 70) + 'ms';
      obs.observe(el);
    });
  }

  // Add hover polish automatically to common cards
  function addHoverPolish() {
    var cardSelectors = [
      'main a.rounded-2xl',
      'main div.rounded-2xl',
      'main div.rounded-xl',
      'main .leader-card',
      'main .cap-card',
      'main .approach-card'
    ];
    cardSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (el.classList.contains('hover-lift')) return;
        // Skip containers that shouldn't move (e.g., large sections)
        if (el.tagName === 'SECTION') return;
        el.classList.add('hover-lift');
      });
    });

    // Buttons: shimmer
    document.querySelectorAll('a.bg-primary, button.bg-primary').forEach(function (btn) {
      btn.classList.add('btn-shimmer');
    });

    // Nav underline
    document.querySelectorAll('header a[href]').forEach(function (a) {
      // avoid logo
      if (a.querySelector('img')) return;
      a.classList.add('nav-underline');
    });
  }

  function init() {
    ensureAmbient();
    addHoverPolish();
    var targets = markRevealTargets();
    revealOnScroll(targets);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


// Header polish on scroll (executive, subtle)
function enableHeaderScrollState() {
  var header = document.querySelector('.site-header');
  if (!header) return;
  function onScroll() {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Re-run header state once partials are injected
try {
  document.addEventListener('hublat:includes-ready', function(){ enableHeaderScrollState(); });
  setTimeout(function(){ enableHeaderScrollState(); }, 150);
} catch(e) {}

/* ═══════════════════════════════════════════════════════════════════
   V3 ENHANCEMENTS: cursor, scroll-progress, btn arrows
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  /* ── Custom cursor ── */
  function initCursor() {
    if (window.matchMedia('(hover: none)').matches) return;

    // Two separate elements — dot is instant, ring has a small lag
    var dot  = document.createElement('div'); dot.id  = 'cur-dot';
    var ring = document.createElement('div'); ring.id = 'cur-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = -100, my = -100; // start off-screen
    var rx = -100, ry = -100;
    var LERP = 0.38; // ring lag — higher = faster follow (0.38 feels snappy but distinct)

    // Dot: set transform instantly on every mousemove (no lag, no jank)
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + (mx - 3.5) + 'px,' + (my - 3.5) + 'px,0)';
    }, { passive: true });

    // Ring: animates to dot position with lerp — runs in rAF loop
    (function loop() {
      rx += (mx - rx) * LERP;
      ry += (my - ry) * LERP;
      ring.style.transform = 'translate3d(' + (rx - 17) + 'px,' + (ry - 17) + 'px,0)';
      requestAnimationFrame(loop);
    })();

    // Hover / click state on body (avoids costly per-element listeners)
    document.addEventListener('mouseover', function (e) {
      if (e.target && (e.target.closest('a') || e.target.closest('button') || e.target.closest('[role="button"]'))) {
        document.body.classList.add('cur-hover');
      }
    }, { passive: true });
    document.addEventListener('mouseout', function (e) {
      if (e.target && (e.target.closest('a') || e.target.closest('button') || e.target.closest('[role="button"]'))) {
        document.body.classList.remove('cur-hover');
      }
    }, { passive: true });
    document.addEventListener('mousedown', function () { document.body.classList.add('cur-click'); });
    document.addEventListener('mouseup',   function () { document.body.classList.remove('cur-click'); });
  }

  /* ── Scroll progress bar ── */
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);
    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (docH > 0 ? (scrollTop / docH) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── Button arrow microinteraction: upgrade existing CTAs ── */
  function upgradeCTAs() {
    document.querySelectorAll('a.bg-primary, a[class*="bg-primary"]').forEach(function (btn) {
      if (btn.classList.contains('btn-arrow')) return;
      btn.classList.add('btn-fill');
      // If ends with →, wrap it
      var html = btn.innerHTML;
      if (html.includes('→')) {
        btn.classList.add('btn-arrow');
        btn.innerHTML = html.replace('→', '<span class="arrow-icon" aria-hidden="true">→</span>');
      }
    });
  }

  /* ── Stat item border-color on scroll ── */
  function initStatBorders() {
    var items = document.querySelectorAll('.stat-item');
    if (!items.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    items.forEach(function (el) { obs.observe(el); });
  }

  function initV3() {
    initCursor();
    initScrollProgress();
    upgradeCTAs();
    initStatBorders();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initV3);
  } else {
    initV3();
  }

  // Re-run after partials load
  document.addEventListener('hublat:includes-ready', function () {
    upgradeCTAs();
    initStatBorders();
  });
})();
