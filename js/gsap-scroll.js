/* gsap-scroll.js — GSAP ScrollTrigger cinematic scroll animations */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* ── Utility ── */
  function st(trigger, extra) {
    return { scrollTrigger: { trigger, start: 'top 85%', ...extra } };
  }

  /* ── 1. Section eyebrows flicker in ── */
  document.querySelectorAll('.section-eyebrow').forEach(el => {
    gsap.from(el, { ...st(el), y: 12, opacity: 0, duration: .5, ease: 'power2.out' });
  });

  /* ── 2. Chapter progress bar fill ── */
  document.querySelectorAll('.chapter-progress').forEach(el => {
    const fill = el.querySelector('.chapter-bar-fill');
    if (!fill) return;
    fill.style.width = '0%';
    gsap.to(fill, { ...st(el, { start: 'top 90%' }), width: '100%', duration: 1.5, ease: 'power3.out', delay: .2 });
  });

  /* ── 3. Section headings slide from left ── */
  document.querySelectorAll('.section-heading').forEach(el => {
    gsap.from(el, { ...st(el), x: -60, opacity: 0, duration: .9, ease: 'power3.out' });
  });

  /* ── 4. Section body text fade up ── */
  document.querySelectorAll('.section-sub').forEach(el => {
    gsap.from(el, { ...st(el, { start: 'top 88%' }), y: 22, opacity: 0, duration: .7, ease: 'power2.out', delay: .12 });
  });

  /* ── 5. Lore cards slide from left ── */
  document.querySelectorAll('.lore-card').forEach(el => {
    gsap.from(el, { ...st(el, { start: 'top 92%' }), x: -45, opacity: 0, duration: .8, ease: 'power2.out' });
  });

  /* ── 6. Comp-cards stagger (3D back bounce) ── */
  document.querySelectorAll('.component-grid').forEach(grid => {
    gsap.from(grid.querySelectorAll('.comp-card'), {
      ...st(grid, { start: 'top 82%' }),
      y: 45, opacity: 0, scale: .9, duration: .55, stagger: .08, ease: 'back.out(1.4)'
    });
  });

  /* ── 7. CPU die scale + rotation entrance ── */
  const cpuDie = document.querySelector('.cpu-die');
  if (cpuDie) {
    gsap.from(cpuDie, { ...st(cpuDie, { start: 'top 82%' }), scale: .7, opacity: 0, rotation: -8, duration: 1.1, ease: 'back.out(1.4)' });
  }

  /* ── 8. CPU stat pills stagger ── */
  gsap.from('.cpu-stats .stat-pill', {
    ...st('.cpu-stats', { start: 'top 88%' }), y: 18, opacity: 0, duration: .4, stagger: .07, ease: 'power2.out'
  });

  /* ── 9. RAM sticks scale from bottom ── */
  gsap.from('.ram-stick', {
    ...st('.ram-sticks', { start: 'top 82%' }),
    scaleY: 0, opacity: 0, duration: .65, stagger: .1, ease: 'power3.out', transformOrigin: 'bottom center'
  });

  /* ── 10. GPU pipeline stages slide in ── */
  gsap.from('.pipe-stage', {
    ...st('.shader-pipeline', { start: 'top 82%' }), x: -30, opacity: 0, duration: .45, stagger: .1, ease: 'power2.out'
  });

  /* ── 11. Disk platter spin-in ── */
  const platter = document.querySelector('.disk-platter');
  if (platter) {
    gsap.from(platter, { ...st(platter, { start: 'top 82%' }), scale: 0, rotation: 120, opacity: 0, duration: 1.2, ease: 'back.out(1.2)' });
  }

  /* ── 12. Summary cards stagger ── */
  gsap.from('.summary-card', {
    ...st('.summary-grid', { start: 'top 82%' }), y: 35, opacity: 0, scale: .93, duration: .55, stagger: .08, ease: 'back.out(1.3)'
  });

  /* ── 13. Final CTA buttons pop in ── */
  gsap.from('.final-cta .btn-primary, .final-cta .btn-secondary', {
    ...st('.final-cta', { start: 'top 90%' }), y: 20, opacity: 0, scale: .9, duration: .5, stagger: .1, ease: 'back.out(1.5)'
  });

  /* ── 14. Boot screen timeline (on load, not scroll) ── */
  const bootTl = gsap.timeline({ delay: .2 });
  bootTl
    .from('#boot-logo',   { y: -40, opacity: 0, duration: 1.0, ease: 'power3.out' })
    .from('#boot-tagline',{ y: 20,  opacity: 0, duration: .6,  ease: 'power2.out' }, '-=.5')
    .from('.lore-card',   { x: -40, opacity: 0, duration: .7,  ease: 'power2.out' }, '-=.3')
    .from('#terminal',    { y: 30,  opacity: 0, duration: .8,  ease: 'power2.out' }, '-=.4')
    .from('#scroll-hint', { opacity: 0,          duration: .6 }, '-=.2');

})();
