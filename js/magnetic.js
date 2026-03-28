/* magnetic.js — GSAP-powered magnetic hover + click feedback */
(function () {
  if (typeof gsap === 'undefined') return;

  const SEL = '.btn-primary,.btn-secondary,.comp-card,.pipe-stage,.s-dot,[data-magnetic]';

  document.querySelectorAll(SEL).forEach(el => {
    const maxShift = parseFloat(el.dataset.magneticStrength) || 14;

    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      gsap.to(el, { x: dx * maxShift, y: dy * maxShift, duration: .25, ease: 'power2.out', overwrite: 'auto' });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)', overwrite: 'auto' });
    });

    el.addEventListener('mousedown', () => {
      gsap.to(el, { scale: .93, duration: .1, overwrite: 'auto' });
    });

    el.addEventListener('mouseup', () => {
      gsap.to(el, { scale: 1, duration: .4, ease: 'back.out(2)', overwrite: 'auto' });
    });
  });
})();
