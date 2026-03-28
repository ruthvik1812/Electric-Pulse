/* glitch.js — Section transition glitch effects */
(function() {
  const overlay  = document.getElementById('glitch-overlay');
  const sections = document.querySelectorAll('.section');

  let lastSection = -1;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = Array.from(sections).indexOf(entry.target);
      if (idx !== lastSection && lastSection !== -1) {
        triggerGlitch();
      }
      lastSection = idx;
    });
  }, { threshold: 0.5 });

  sections.forEach(s => io.observe(s));

  function triggerGlitch() {
    overlay.classList.remove('active');
    void overlay.offsetWidth; // reflow
    overlay.classList.add('active');
    setTimeout(() => overlay.classList.remove('active'), 250);
  }

  // Also expose for manual triggering
  window.triggerGlitch = triggerGlitch;
})();
