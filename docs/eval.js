/**
 * Evaluation flow — single combined form.
 * Manages window.partnershipDraft, star ratings, brand cards,
 * timeline pill counter, numeric inputs, live margin display, submit.
 */
(function () {
  'use strict';

  // ── Global draft ────────────────────────────────────────────────────────────

  window.partnershipDraft = {
    name: '',
    brands: [],
    // Strategic
    brandAlignment: 0,
    growthAudience: 0,
    innovationScalability: 0,
    // Commercial
    revenue: 0,
    cost: 0,
    repeatability: 0,
    // Resource
    complexityCoordination: 0,
    timelineQuarters: 0,
    staffing: 0,
  };

  // ── Star ratings ────────────────────────────────────────────────────────────

  function renderStars(stars, rating) {
    stars.forEach((s, i) => {
      s.classList.toggle('active', i < rating);
      s.classList.remove('preview');
    });
  }

  function setupStars(container) {
    const field = container.dataset.field;
    if (!field) return;
    const stars = Array.from(container.querySelectorAll('.star'));

    stars.forEach((star, i) => {
      star.addEventListener('mouseenter', () => {
        stars.forEach((s, j) => s.classList.toggle('preview', j <= i));
      });
      star.addEventListener('mouseleave', () => {
        renderStars(stars, window.partnershipDraft[field]);
      });
      star.addEventListener('click', () => {
        window.partnershipDraft[field] = i + 1;
        renderStars(stars, i + 1);
        updateSubmit();
      });
    });
    renderStars(stars, 0);
  }

  // ── Timeline pill counter ────────────────────────────────────────────────────

  function setupTimelinePills() {
    document.querySelectorAll('.timeline-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const val = parseInt(pill.dataset.quarters, 10);
        window.partnershipDraft.timelineQuarters = val;
        document.querySelectorAll('.timeline-pill').forEach(p => {
          p.classList.toggle('selected', parseInt(p.dataset.quarters, 10) === val);
        });
        updateSubmit();
      });
    });
  }

  // ── Brand cards ─────────────────────────────────────────────────────────────

  function ecosystemScore(brands) {
    if (brands.length <= 1) return 1;
    if (brands.length === 2) return 3;
    return 5;
  }

  function updateEcosystemDisplay() {
    const n = window.partnershipDraft.brands.length;
    const s = ecosystemScore(window.partnershipDraft.brands);
    const el = document.getElementById('ecosystem-display');
    if (el) {
      el.textContent = `${n} brand${n !== 1 ? 's' : ''} selected → Cross-Brand Ecosystem score: ${s} / 5`;
    }
  }

  function setupBrandCards() {
    document.querySelectorAll('.brand-card').forEach(card => {
      card.addEventListener('click', () => {
        const brand = card.dataset.brand;
        const idx = window.partnershipDraft.brands.indexOf(brand);
        if (idx >= 0) {
          window.partnershipDraft.brands.splice(idx, 1);
          card.classList.remove('selected');
          card.style.borderColor = '';
        } else {
          window.partnershipDraft.brands.push(brand);
          card.classList.add('selected');
          card.style.borderColor = card.dataset.color || '';
        }
        updateEcosystemDisplay();
        updateSubmit();
      });
    });
  }

  // ── Numeric inputs ──────────────────────────────────────────────────────────

  function setupNumericInput(inputEl, field) {
    inputEl.addEventListener('input', () => {
      const raw = inputEl.value.replace(/[^0-9]/g, '');
      window.partnershipDraft[field] = raw ? parseInt(raw, 10) : 0;
      if (raw) {
        const pos     = inputEl.selectionStart;
        const prevLen = inputEl.value.length;
        inputEl.value = parseInt(raw, 10).toLocaleString('en-US');
        const delta   = inputEl.value.length - prevLen;
        inputEl.setSelectionRange(pos + delta, pos + delta);
      } else {
        inputEl.value = '';
      }
      updateMarginDisplay();
      updateSubmit();
    });
  }

  function updateMarginDisplay() {
    const margin = window.partnershipDraft.revenue - window.partnershipDraft.cost;
    const el = document.getElementById('margin-display');
    if (!el) return;
    const fmt  = Math.abs(margin).toLocaleString('en-US');
    const sign = margin < 0 ? '−$' : '$';
    el.textContent = `Estimated margin: ${sign}${fmt}`;
    el.className   = 'live-margin-display ' + (margin >= 0 ? 'positive' : 'negative');
  }

  // ── Submit button gating ────────────────────────────────────────────────────

  function updateSubmit() {
    const d   = window.partnershipDraft;
    const btn = document.getElementById('submit-eval');
    if (!btn) return;
    const ok = d.name.trim().length > 0
      && d.brands.length > 0
      && d.brandAlignment > 0
      && d.growthAudience > 0
      && d.innovationScalability > 0
      && d.revenue > 0
      && d.repeatability > 0
      && d.complexityCoordination > 0
      && d.timelineQuarters > 0
      && d.staffing > 0;
    btn.disabled = !ok;
  }

  // ── Scoring ─────────────────────────────────────────────────────────────────

  function marginScore(revenue, cost) {
    const m = revenue - cost;
    if (m < 1000000)  return 1;
    if (m < 3000000)  return 2;
    if (m < 7000000)  return 3;
    if (m < 15000000) return 4;
    return 5;
  }

  function timelineScore(quarters) {
    if (quarters <= 1) return 1;
    if (quarters === 2) return 2;
    if (quarters === 3) return 3;
    if (quarters === 4) return 4;
    return 5;
  }

  const BRAND_COLORS = {
    times:      '#d62828',
    athletic:   '#1e5089',
    cooking:    '#4f7b2d',
    wirecutter: '#c8a028',
    games:      '#6e3fa3',
    audio:      '#1c8a8a',
  };

  function computeScores() {
    const d   = window.partnershipDraft;
    const eco = ecosystemScore(d.brands);

    const strategicX = (
      eco + d.brandAlignment + d.growthAudience + d.innovationScalability
    ) / 4;

    const commercialY = (marginScore(d.revenue, d.cost) * 0.50)
                      + (d.repeatability * 0.50);

    const resourceIntensity = (
      d.complexityCoordination + timelineScore(d.timelineQuarters) + d.staffing
    ) / 3;

    const color = d.brands.length === 1
      ? (BRAND_COLORS[d.brands[0]] || '#121212')
      : '#121212';

    return {
      sv:    Math.round(strategicX       * 10) / 10,
      cv:    Math.round(commercialY      * 10) / 10,
      ri:    Math.round(resourceIntensity * 10) / 10,
      color,
    };
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  function handleSubmit() {
    const d      = window.partnershipDraft;
    const scores = computeScores();

    if (typeof window.chartAddUserBubble === 'function') {
      window.chartAddUserBubble({
        name:            d.name,
        brands:          [...d.brands],
        sv:              scores.sv,
        cv:              scores.cv,
        ri:              scores.ri,
        color:           scores.color,
        isUserSubmitted: true,
      });
    }

    if (typeof window.fullpageGoToId === 'function') {
      window.fullpageGoToId('map-visualized');
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  function init() {
    const nameInput = document.getElementById('partnership-name');
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        window.partnershipDraft.name = nameInput.value;
        updateSubmit();
      });
    }

    setupBrandCards();
    document.querySelectorAll('.stars-rating').forEach(setupStars);
    setupTimelinePills();

    const revInput  = document.getElementById('revenue-input');
    const costInput = document.getElementById('cost-input');
    if (revInput)  setupNumericInput(revInput,  'revenue');
    if (costInput) setupNumericInput(costInput, 'cost');

    document.getElementById('submit-eval')?.addEventListener('click', handleSubmit);

    document.getElementById('clear-submission')?.addEventListener('click', e => {
      e.preventDefault();
      window.chartClearUserBubble?.();
    });

    updateEcosystemDisplay();
    updateMarginDisplay();
    updateSubmit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
