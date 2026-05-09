/**
 * Fullpage scroll controller.
 *
 * Two sections: evaluation form (form-page, no hijack) and map.
 * The map section uses hard JS hijack — one wheel/key/swipe = one section.
 * The evaluation section (form-page) scrolls naturally; CSS scroll-snap
 * handles boundary snap. IntersectionObserver keeps state in sync.
 *
 * Desktop only (>= 720px). Below 720px, native scroll everywhere.
 */
(function () {
  'use strict';

  const SECTION_IDS = [
    'evaluation',
    'map-visualized',
  ];

  const LOCK_MS         = 700;
  const SWIPE_THRESH    = 50;
  const WHEEL_MIN_DELTA = 5;

  let sections = [];
  let current  = 0;
  let locked   = false;
  let enabled  = false;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function isFormPage(idx) {
    return sections[idx] && sections[idx].classList.contains('form-page');
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  function init() {
    sections = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean);

    activate(0);
    setupIntersectionObserver();
    checkEnable();
    window.addEventListener('resize', debounce(checkEnable, 120));
  }

  // ── IntersectionObserver — keeps current in sync during native scroll ──────

  function setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            const idx = sections.indexOf(entry.target);
            if (idx >= 0) {
              current = idx;
              sections[idx].classList.add('visible');
            }
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach(s => observer.observe(s));
  }

  // ── Enable / disable event hijack ─────────────────────────────────────────

  function checkEnable() {
    const wide = window.innerWidth >= 720;
    if (wide && !enabled) {
      enabled = true;
      window.addEventListener('wheel',      onWheel,      { passive: false });
      window.addEventListener('keydown',    onKey);
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchend',   onTouchEnd,   { passive: true });
    } else if (!wide && enabled) {
      enabled = false;
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('keydown',    onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend',   onTouchEnd);
    }
  }

  // ── Core navigation ────────────────────────────────────────────────────────

  function goTo(index) {
    const target = Math.max(0, Math.min(sections.length - 1, index));
    if (locked) return;
    locked = true;

    current = target;
    activate(current);
    sections[current].scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => { locked = false; }, LOCK_MS);
  }

  function goToId(id) {
    const idx = sections.findIndex(s => s.id === id);
    if (idx >= 0) goTo(idx);
  }

  function activate(index) {
    if (sections[index]) sections[index].classList.add('visible');
  }

  // ── Wheel ──────────────────────────────────────────────────────────────────

  function onWheel(e) {
    if (isFormPage(current)) return;
    e.preventDefault();
    if (locked) return;
    if (Math.abs(e.deltaY) < WHEEL_MIN_DELTA) return;
    goTo(current + (e.deltaY > 0 ? 1 : -1));
  }

  // ── Keyboard ───────────────────────────────────────────────────────────────

  function onKey(e) {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (isFormPage(current)) return;

    switch (e.key) {
      case 'ArrowDown': case 'PageDown':
        e.preventDefault(); goTo(current + 1); break;
      case ' ':
        e.preventDefault(); goTo(current + (e.shiftKey ? -1 : 1)); break;
      case 'ArrowUp': case 'PageUp':
        e.preventDefault(); goTo(current - 1); break;
      case 'Home':
        e.preventDefault(); goTo(0); break;
      case 'End':
        e.preventDefault(); goTo(sections.length - 1); break;
    }
  }

  // ── Touch ──────────────────────────────────────────────────────────────────

  let touchStartY = 0;

  function onTouchStart(e) { touchStartY = e.touches[0].clientY; }

  function onTouchEnd(e) {
    if (locked) return;
    if (isFormPage(current)) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) < SWIPE_THRESH) return;
    goTo(current + (dy > 0 ? 1 : -1));
  }

  // ── Utility ────────────────────────────────────────────────────────────────

  function debounce(fn, ms) {
    let t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  window.fullpageGoTo   = goTo;
  window.fullpageGoToId = goToId;

  // ── Boot ───────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
