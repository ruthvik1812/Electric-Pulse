/* particles.js — Floating multi-color particles across the whole page */
(function() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#00F2FF','#A855F7','#EC4899','#F97316','#FCD34D','#BCFF00','#22D3EE'];
  const COUNT  = 90;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: COUNT }, () => makeParticle());

  function makeParticle() {
    return {
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 2 + 0.4,
      vx:    (Math.random() - 0.5) * 0.4,
      vy:    (Math.random() - 0.5) * 0.4 - 0.1,
      alpha: Math.random() * 0.6 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    };
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scrollFraction = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

    particles.forEach(p => {
      p.pulse += p.pulseSpeed;
      const a = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse));

      // Draw glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.globalAlpha = a * 0.3;
      ctx.fill();

      // Draw core dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a;
      ctx.fill();

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < -10)  p.x = canvas.width + 10;
      if (p.x > canvas.width + 10)  p.x = -10;
      if (p.y < -10)  p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;
    });

    ctx.globalAlpha = 1;

    // Draw connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = a.color;
          ctx.globalAlpha = (1 - dist / 100) * 0.12;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  tick();
})();
