/**
 * Evaluation flow — Pages 2, 3, 4.
 * Manages window.partnershipDraft, star ratings, brand cards,
 * numeric inputs, live margin display, button gating, and submit.
 */
(function () {
  'use strict';

  // ── Global draft ────────────────────────────────────────────────────────────

  window.partnershipDraft = {
    name: '', brands: [],
    growth: 0, audience: 0, alignment: 0, innovation: 0,
    revenue: 0, cost: 0, scalability: 0, longevity: 0,
    complexity: 0, coordination: 0, timeline: 0, staffing: 0, customization: 0,
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
        updateButtons();
      });
    });
    renderStars(stars, 0);
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
        } else {
          window.partnershipDraft.brands.push(brand);
          card.classList.add('selected');
        }
        updateEcosystemDisplay();
        updateButtons();
      });
    });
  }

  // ── Numeric inputs ──────────────────────────────────────────────────────────

  function setupNumericInput(inputEl, field) {
    inputEl.addEventListener('input', () => {
      const raw = inputEl.value.replace(/[^0-9]/g, '');
      window.partnershipDraft[field] = raw ? parseInt(raw, 10) : 0;
      // Reformat with commas
      if (raw) {
        const pos = inputEl.selectionStart;
        const prevLen = inputEl.value.length;
        inputEl.value = parseInt(raw, 10).toLocaleString('en-US');
        // Restore cursor roughly
        const delta = inputEl.value.length - prevLen;
        inputEl.setSelectionRange(pos + delta, pos + delta);
      } else {
        inputEl.value = '';
      }
      updateMarginDisplay();
      updateButtons();
    });
  }

  function updateMarginDisplay() {
    const margin = window.partnershipDraft.revenue - window.partnershipDraft.cost;
    const el = document.getElementById('margin-display');
    if (!el) return;
    const fmt = Math.abs(margin).toLocaleString('en-US');
    const sign = margin < 0 ? '−$' : '$';
    el.textContent = `Estimated margin: ${sign}${fmt}`;
    el.className = 'live-margin-display ' + (margin >= 0 ? 'positive' : 'negative');
  }

  // ── Button validation ───────────────────────────────────────────────────────

  function updateButtons() {
    const d = window.partnershipDraft;

    const btn1 = document.getElementById('continue-step-1');
    if (btn1) {
      const ok = d.name.trim().length > 0
        && d.brands.length > 0
        && d.growth > 0 && d.audience > 0 && d.alignment > 0 && d.innovation > 0;
      btn1.disabled = !ok;
    }

    const btn2 = document.getElementById('continue-step-2');
    if (btn2) {
      const ok = d.revenue > 0 && d.scalability > 0 && d.longevity > 0;
      btn2.disabled = !ok;
    }

    const btn3 = document.getElementById('submit-step-3');
    if (btn3) {
      const ok = d.complexity > 0 && d.coordination > 0
        && d.timeline > 0 && d.staffing > 0 && d.customization > 0;
      btn3.disabled = !ok;
    }
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

  const BRAND_COLORS = {
    times:      '#d62828',
    athletic:   '#1e5089',
    cooking:    '#4f7b2d',
    wirecutter: '#c8a028',
    games:      '#6e3fa3',
    audio:      '#1c8a8a',
  };

  function computeScores() {
    const d = window.partnershipDraft;
    const eco = ecosystemScore(d.brands);

    const strategicX = (d.growth + d.audience + d.alignment + eco + d.innovation) / 5;
    const commercialY = (marginScore(d.revenue, d.cost) * 0.50)
                      + (d.scalability * 0.25)
                      + (d.longevity * 0.25);
    const resourceIntensity = (d.complexity + d.coordination + d.timeline + d.staffing + d.customization) / 5;

    const color = d.brands.length === 1
      ? (BRAND_COLORS[d.brands[0]] || '#121212')
      : '#121212';

    return {
      sv: Math.round(strategicX * 10) / 10,
      cv: Math.round(commercialY * 10) / 10,
      ri: Math.round(resourceIntensity * 10) / 10,
      color,
    };
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  function handleSubmit() {
    const d = window.partnershipDraft;
    const scores = computeScores();

    if (typeof window.chartAddUserBubble === 'function') {
      window.chartAddUserBubble({
        name:   d.name,
        brands: [...d.brands],
        sv:     scores.sv,
        cv:     scores.cv,
        ri:     scores.ri,
        color:  scores.color,
        isUserSubmitted: true,
      });
    }

    if (typeof window.fullpageGoToId === 'function') {
      window.fullpageGoToId('map-visualized');
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  function init() {
    // Partnership name input
    const nameInput = document.getElementById('partnership-name');
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        window.partnershipDraft.name = nameInput.value;
        updateButtons();
      });
    }

    // Brand cards
    setupBrandCards();

    // Star rating widgets
    document.querySelectorAll('.stars-rating').forEach(setupStars);

    // Numeric inputs
    const revInput  = document.getElementById('revenue-input');
    const costInput = document.getElementById('cost-input');
    if (revInput)  setupNumericInput(revInput,  'revenue');
    if (costInput) setupNumericInput(costInput, 'cost');

    // Continue / submit buttons
    document.getElementById('continue-step-1')?.addEventListener('click', () => {
      window.fullpageGoToId?.('step-commercial');
    });
    document.getElementById('continue-step-2')?.addEventListener('click', () => {
      window.fullpageGoToId?.('step-resource');
    });
    document.getElementById('submit-step-3')?.addEventListener('click', handleSubmit);

    // Clear submission link on map page
    document.getElementById('clear-submission')?.addEventListener('click', e => {
      e.preventDefault();
      window.chartClearUserBubble?.();
    });

    // Initial render
    updateEcosystemDisplay();
    updateMarginDisplay();
    updateButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
