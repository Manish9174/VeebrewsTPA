/* =====================================================================
   HUCK STYLE SCROLL REVEAL  -  assets/hckx-split-reveal.js
   IntersectionObserver se section viewport me aate hi
   ".hckxsr-is-inview" class add hoti hai.
   "hckxsr-js" class <html> par turant add ho jaati hai taaki CSS
   ko pata chale JS chal raha hai - tabhi hide/reveal animation
   states activate hote hain (warna content hamesha visible rehta
   hai, blank section kabhi nahi dikhega).
   ===================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('hckxsr-js');

  function initSection(section) {
    if (!section || section.dataset.hckxsrObserved === 'true') return;
    section.dataset.hckxsrObserved = 'true';

    var threshold = parseFloat(section.getAttribute('data-hckxsr-threshold'));
    if (isNaN(threshold) || threshold <= 0) threshold = 0.3;

    var replay = section.hasAttribute('data-hckxsr-replay');

    if (!('IntersectionObserver' in window)) {
      section.classList.add('hckxsr-is-inview');
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            section.classList.add('hckxsr-is-inview');
            if (!replay) observer.unobserve(section);
          } else if (replay) {
            section.classList.remove('hckxsr-is-inview');
          }
        });
      },
      { threshold: threshold }
    );

    observer.observe(section);
  }

  function initAll() {
    document.querySelectorAll('[data-hckxsr]').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  /* Theme editor: section reload hone par dobara init */
  document.addEventListener('shopify:section:load', function (e) {
    var section = e.target.querySelector('[data-hckxsr]');
    if (section) {
      section.dataset.hckxsrObserved = 'false';
      initSection(section);
    }
  });
})();