/* sidebar.js — Scroll-driven voltage gauge + section dots */
(function() {
  const fill    = document.getElementById('voltage-fill');
  const pct     = document.getElementById('voltage-percent');
  const dots    = document.querySelectorAll('.s-dot');
  const sections = document.querySelectorAll('.section');

  function update() {
    const scrollTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(100, Math.round((scrollTop / docH) * 100));

    fill.style.height = progress + '%';
    pct.textContent   = progress + '%';

    // Active dot
    let current = 0;
    sections.forEach((s, i) => {
      const rect = s.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5) current = i;
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  window.addEventListener('scroll', update, { passive: true });
  update();

  // Click dots to navigate
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      sections[i] && sections[i].scrollIntoView({ behavior: 'smooth' });
    });
  });
})();
