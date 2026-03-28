/* aurora.js — Multi-layer animated aurora wave + lightning arcs + shooting stars */
(function () {

  /* ══════════════════════════════════════
     1. AURORA CANVAS — FLOWING WAVES
  ══════════════════════════════════════ */
  const aCanvas = document.getElementById('aurora-canvas');
  if (aCanvas) {
    const ctx = aCanvas.getContext('2d');
    let W, H;
    const resize = () => { W = aCanvas.width = window.innerWidth; H = aCanvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    // Aurora wave bands
    const BANDS = [
      { color: [0, 242, 255],   amp: 0.22, freq: 0.8,  speed: 0.4,  phase: 0,   y: 0.25 },
      { color: [168, 85, 247],  amp: 0.20, freq: 0.6,  speed: 0.3,  phase: 1.5, y: 0.40 },
      { color: [236, 72, 153],  amp: 0.18, freq: 1.0,  speed: 0.5,  phase: 3.0, y: 0.55 },
      { color: [249, 115, 22],  amp: 0.16, freq: 0.7,  speed: 0.2,  phase: 4.5, y: 0.65 },
      { color: [188, 255, 0],   amp: 0.14, freq: 0.9,  speed: 0.6,  phase: 2.0, y: 0.75 },
      { color: [252, 211, 77],  amp: 0.18, freq: 0.5,  speed: 0.35, phase: 0.7, y: 0.35 },
    ];

    let t = 0;
    function drawAurora() {
      ctx.clearRect(0, 0, W, H);
      t += 0.008;

      BANDS.forEach(band => {
        const R = band.color[0], G = band.color[1], B = band.color[2];
        const yBase = H * band.y;
        const ampPx = H * band.amp;

        ctx.beginPath();
        // Top wave edge
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 6) {
          const wave = Math.sin(x * band.freq * 0.005 + t * band.speed + band.phase)
                     + 0.4 * Math.sin(x * band.freq * 0.012 + t * band.speed * 1.3);
          ctx.lineTo(x, yBase + wave * ampPx);
        }
        ctx.lineTo(W, H);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, yBase - ampPx, 0, yBase + ampPx * 2);
        grad.addColorStop(0,   `rgba(${R},${G},${B},0.0)`);
        grad.addColorStop(0.3, `rgba(${R},${G},${B},0.18)`);
        grad.addColorStop(0.6, `rgba(${R},${G},${B},0.28)`);
        grad.addColorStop(1,   `rgba(${R},${G},${B},0.0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      requestAnimationFrame(drawAurora);
    }
    drawAurora();
  }

  /* ══════════════════════════════════════
     2. LIGHTNING ARC CANVAS
  ══════════════════════════════════════ */
  const lCanvas = document.getElementById('arc-canvas');
  if (lCanvas) {
    const lCtx = lCanvas.getContext('2d');
    let lW, lH;
    const lResize = () => { lW = lCanvas.width = window.innerWidth; lH = lCanvas.height = window.innerHeight; };
    lResize();
    window.addEventListener('resize', lResize);

    const ARC_COLORS = ['#00F2FF', '#A855F7', '#EC4899', '#BCFF00'];
    let arcs = [];

    function makeArc() {
      const side = Math.random() > 0.5;
      return {
        x1: side ? 0 : lW,
        y1: Math.random() * lH * 0.8 + lH * 0.1,
        x2: side ? lW * (0.3 + Math.random() * 0.4) : lW * (0.3 + Math.random() * 0.4),
        y2: Math.random() * lH * 0.8 + lH * 0.1,
        color: ARC_COLORS[Math.floor(Math.random() * ARC_COLORS.length)],
        life: 0,
        maxLife: 30 + Math.random() * 40,
        segs: 8 + Math.floor(Math.random() * 6),
        jitter: 12 + Math.random() * 24,
      };
    }

    function drawLightning(ctx, x1, y1, x2, y2, segs, jitter, alpha, color) {
      const pts = [[x1, y1]];
      for (let i = 1; i < segs; i++) {
        const f = i / segs;
        const px = x1 + (x2 - x1) * f + (Math.random() - 0.5) * jitter * 2;
        const py = y1 + (y2 - y1) * f + (Math.random() - 0.5) * jitter * 2;
        pts.push([px, py]);
      }
      pts.push([x2, y2]);

      // Glow pass
      ctx.shadowBlur = 18;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = alpha * 0.5;
      ctx.beginPath();
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.stroke();

      // Core pass
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function tickArcs() {
      lCtx.clearRect(0, 0, lW, lH);

      // Spawn new arcs randomly
      if (arcs.length < 3 && Math.random() < 0.025) {
        arcs.push(makeArc());
      }

      arcs = arcs.filter(arc => {
        arc.life++;
        const progress = arc.life / arc.maxLife;
        const alpha = progress < 0.2 ? progress / 0.2
                    : progress > 0.7 ? (1 - progress) / 0.3
                    : 1;
        drawLightning(lCtx, arc.x1, arc.y1, arc.x2, arc.y2, arc.segs, arc.jitter, alpha * 0.6, arc.color);
        return arc.life < arc.maxLife;
      });

      lCtx.globalAlpha = 1;
      requestAnimationFrame(tickArcs);
    }
    tickArcs();
  }

  /* ══════════════════════════════════════
     3. SHOOTING STARS
  ══════════════════════════════════════ */
  const STAR_COLORS = [
    ['#00F2FF', 'rgba(0,242,255,0)'],
    ['#A855F7', 'rgba(168,85,247,0)'],
    ['#EC4899', 'rgba(236,72,153,0)'],
    ['#FCD34D', 'rgba(252,211,77,0)'],
    ['#BCFF00', 'rgba(188,255,0,0)'],
  ];

  function spawnStar() {
    const el      = document.createElement('div');
    el.className  = 'shooting-star';
    const [c1, c2]= STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    const angle   = 25 + Math.random() * 30;
    const top     = Math.random() * 70 + '%';
    const left    = (Math.random() * 60) + '%';
    const dur     = 1.2 + Math.random() * 1.4;

    el.style.cssText = `
      top:${top}; left:${left};
      background: linear-gradient(90deg, ${c1}, ${c2});
      transform: rotate(${angle}deg);
      animation-duration: ${dur}s;
      box-shadow: 0 0 6px ${c1}, 0 0 12px ${c1};
      width: ${80 + Math.random() * 100}px;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000 + 100);
  }

  setInterval(spawnStar, 900 + Math.random() * 600);

  /* ══════════════════════════════════════
     4. RIPPLE ON CLICK
  ══════════════════════════════════════ */
  const RIPPLE_COLORS = ['rgba(0,242,255,0.5)', 'rgba(168,85,247,0.5)', 'rgba(236,72,153,0.4)', 'rgba(252,211,77,0.4)'];

  document.addEventListener('click', e => {
    const color = RIPPLE_COLORS[Math.floor(Math.random() * RIPPLE_COLORS.length)];
    const size  = 60 + Math.random() * 40;
    const ripple = document.createElement('div');
    ripple.className = 'ripple-ring';
    ripple.style.cssText = `
      width:${size}px; height:${size}px;
      left:${e.clientX - size/2}px; top:${e.clientY - size/2}px;
      background: radial-gradient(circle, ${color} 0%, transparent 70%);
      border: 1px solid ${color};
      position:fixed; z-index:99998; pointer-events:none;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });

  /* ══════════════════════════════════════
     5. 3D CARD TILT on mouse move
  ══════════════════════════════════════ */
  const tiltCards = document.querySelectorAll('.comp-card, .summary-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(600px) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) scale(1.03)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ══════════════════════════════════════
     6. CSS DUST PARTICLES per section
  ══════════════════════════════════════ */
  const DUST_COLORS = ['#00F2FF','#A855F7','#EC4899','#F97316','#FCD34D','#BCFF00','#22D3EE'];
  document.querySelectorAll('.section').forEach(section => {
    for (let i = 0; i < 12; i++) {
      const dust = document.createElement('div');
      dust.className = 'dust';
      const size  = 2 + Math.random() * 4;
      const color = DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)];
      dust.style.cssText = `
        width:${size}px; height:${size}px;
        background:${color};
        left:${5 + Math.random() * 90}%;
        top:${5  + Math.random() * 90}%;
        opacity:${0.2 + Math.random() * 0.5};
        animation-duration:${5 + Math.random() * 8}s;
        animation-delay:${Math.random() * 5}s;
        box-shadow: 0 0 ${size*2}px ${color};
        z-index:0;
      `;
      section.appendChild(dust);
    }
  });

  /* ══════════════════════════════════════
     7. DATA STREAM LINES per section
  ══════════════════════════════════════ */
  const STREAM_DATA = [
    { section: '#motherboard', color: '#A855F7' },
    { section: '#cpu',         color: '#F97316' },
    { section: '#ram',         color: '#22D3EE' },
    { section: '#gpu',         color: '#EC4899' },
    { section: '#storage',     color: '#BCFF00' },
  ];
  STREAM_DATA.forEach(({ section: sel, color }) => {
    const sec = document.querySelector(sel);
    if (!sec) return;
    for (let i = 0; i < 5; i++) {
      const line = document.createElement('div');
      line.className = 'data-stream-line';
      line.style.cssText = `
        top:${10 + Math.random() * 80}%;
        left:0;
        background: linear-gradient(90deg, transparent, ${color}, transparent);
        animation-duration:${3 + Math.random() * 4}s;
        animation-delay:${Math.random() * 4}s;
        width:${100 + Math.random() * 150}px;
        opacity:${0.3 + Math.random() * 0.4};
      `;
      sec.appendChild(line);
    }
  });

  /* ══════════════════════════════════════
     8. MOUSE PARALLAX on orbs
  ══════════════════════════════════════ */
  const orbs = document.querySelectorAll('.orb');
  document.addEventListener('mousemove', e => {
    const mx = (e.clientX / window.innerWidth  - 0.5) * 30;
    const my = (e.clientY / window.innerHeight - 0.5) * 30;
    orbs.forEach((orb, i) => {
      const factor = (i % 3 + 1) * 0.4;
      orb.style.transform = `translate(${mx * factor}px, ${my * factor}px)`;
    });
  });

  /* ══════════════════════════════════════
     9. SHIMMER divs added to cards
  ══════════════════════════════════════ */
  document.querySelectorAll('.comp-card, .summary-card').forEach(card => {
    const shimmer = document.createElement('div');
    shimmer.className = 'shimmer';
    card.appendChild(shimmer);
    card.classList.add('ripple-host');
  });

  /* ══════════════════════════════════════
    10. NEON FLICKER DELAY per eyebrow
  ══════════════════════════════════════ */
  document.querySelectorAll('.section-eyebrow').forEach((el, i) => {
    el.style.setProperty('--flicker-delay', `${i * 1.3}s`);
  });

})();
