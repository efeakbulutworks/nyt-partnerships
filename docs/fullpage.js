/**
 * Hard fullpage scroll controller — desktop only (>= 720px).
 * One wheel gesture or keypress = one full section advance, with a
 * 700ms transition lock so rapid inputs can't skip pages.
 * Touch swipe is also hijacked on tablet widths (>= 720px).
 * Below 720px the controller disables itself and native scrolling takes over.
 */
(function () {
  'use strict';

  const SECTION_IDS = [
    'what-i-heard',
    'portfolio-management-map',
    'map-visualized',
    'partnership-types',
    'modular-architecture',
    'why-this-excites-me',
    'about',
  ];

  const LOCK_MS        = 700;  // transition lock duration
  const SWIPE_THRESH   = 50;   // px of vertical touch movement to count as swipe
  const WHEEL_MIN_DELTA = 5;   // ignore micro wheel nudges below this absolute deltaY

  let sections = [];
  let dots     = [];
  let current  = 0;
  let locked   = false;
  let enabled  = false;

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    sections = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean);
    dots     = Array.from(document.querySelectorAll('.scroll-dot'));

    // Immediately mark Page 1 as visible (no scroll needed to reveal it)
    activate(0, false);

    checkEnable();
    window.addEventListener('resize', debounce(checkEnable, 120));
  }

  // ── Enable / disable based on viewport width ───────────────────────────────

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
    activate(current, true);

    sections[current].scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => { locked = false; }, LOCK_MS);
  }

  /** Mark section as visible (fade-in) and update dots. */
  function activate(index, animateDot) {
    if (sections[index]) {
      sections[index].classList.add('visible');
    }
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  // ── Wheel handler ──────────────────────────────────────────────────────────

  function onWheel(e) {
    e.preventDefault();
    if (locked) return;
    if (Math.abs(e.deltaY) < WHEEL_MIN_DELTA) return;
    goTo(current + (e.deltaY > 0 ? 1 : -1));
  }

  // ── Keyboard handler ───────────────────────────────────────────────────────

  function onKey(e) {
    // Don't intercept when focus is inside an input/textarea
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault();
        goTo(current + 1);
        break;
      case ' ':
        e.preventDefault();
        goTo(current + (e.shiftKey ? -1 : 1));
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        goTo(current - 1);
        break;
      case 'Home':
        e.preventDefault();
        goTo(0);
        break;
      case 'End':
        e.preventDefault();
        goTo(sections.length - 1);
        break;
    }
  }

  // ── Touch / swipe handler ──────────────────────────────────────────────────

  let touchStartY = 0;

  function onTouchStart(e) {
    touchStartY = e.touches[0].clientY;
  }

  function onTouchEnd(e) {
    if (locked) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) < SWIPE_THRESH) return;
    goTo(current + (dy > 0 ? 1 : -1));
  }

  // ── Utility ────────────────────────────────────────────────────────────────

  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  // ── Boot ───────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
