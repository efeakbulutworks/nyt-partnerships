/**
 * Minimal navigation helper — no scroll locking.
 * Exposes fullpageGoToId for the eval submit button to smooth-scroll to the map.
 */
(function () {
  'use strict';

  function goToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  window.fullpageGoTo   = function () {};
  window.fullpageGoToId = goToId;
})();
