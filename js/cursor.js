/* cursor.js — Custom reticle cursor with lock-on */
(function() {
  const outer = document.getElementById('cursor-outer');
  const inner = document.getElementById('cursor-inner');

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let ox = mx, oy = my;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    inner.style.left = mx + 'px';
    inner.style.top  = my + 'px';
  });

  // Smooth outer follows inner with lerp
  function animateCursor() {
    ox += (mx - ox) * 0.12;
    oy += (my - oy) * 0.12;
    outer.style.left = ox + 'px';
    outer.style.top  = oy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Lock-on for interactive elements
  const lockTargets = document.querySelectorAll(
    'button, .comp-card, .core, .cache-l3, .pipe-stage, .ram-stick, .s-dot, .summary-card, .btn-primary, .btn-secondary, a, [data-interactive]'
  );
  lockTargets.forEach(el => {
    el.addEventListener('mouseenter', () => { outer.classList.add('locked'); inner.classList.add('locked'); });
    el.addEventListener('mouseleave', () => { outer.classList.remove('locked'); inner.classList.remove('locked'); });
  });

  // Click pulse
  document.addEventListener('mousedown', () => {
    outer.classList.add('click-pulse');
    setTimeout(() => outer.classList.remove('click-pulse'), 300);
  });
})();
