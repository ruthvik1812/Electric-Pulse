/**
 * SILICON: A HUMAN STORY — journey.js
 * Competition submission — clean, modular, well-commented
 */
'use strict';

/* ══════════════════════════════════════
   1. DOM CACHE
══════════════════════════════════════ */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ══════════════════════════════════════
   2. LOADER — circuit draw + progress bar
══════════════════════════════════════ */
(function initLoader() {
  const loader    = $('loader');
  const fillEl    = $('loader-fill');
  let   progress  = 0;
  const tick = setInterval(() => {
    progress = Math.min(progress + Math.random() * 18, 100);
    fillEl.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add('done'); 
        setTimeout(triggerChapterReveals, 200);
      }, 400);
    }
  }, 120);
})();

/* ══════════════════════════════════════
   3. SCROLL PROGRESS BAR
══════════════════════════════════════ */
const scrollBar = $('scroll-bar');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollBar.style.width = (window.scrollY / max * 100) + '%';
}, { passive: true });

/* ══════════════════════════════════════
   4. NAV — opaque + active dot + badge
══════════════════════════════════════ */
const nav     = $('chapter-nav');
const dots    = $$('.nav-dot');
const badge   = $('chapter-badge');
const chapters = ['genesis','spark','exp','connected','ai','quantum'];

window.addEventListener('scroll', () => {
  nav.classList.toggle('opaque', window.scrollY > 60);
  const mid = window.scrollY + window.innerHeight * 0.4;
  chapters.forEach((id, i) => {
    const el = $(id); if (!el) return;
    const abs = el.getBoundingClientRect().top + window.scrollY;
    if (mid >= abs && mid <= abs + el.offsetHeight) {
      dots.forEach(d => d.classList.remove('active'));
      dots[i]?.classList.add('active');
      if (badge) badge.textContent = String(i+1).padStart(2,'0') + ' / 06';
    }
  });
}, { passive: true });

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const target = $(dot.dataset.target);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});


/* ══════════════════════════════════════
   5. SCROLL REVEAL (Intersection Observer)
══════════════════════════════════════ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

function triggerChapterReveals() {
  $$('[data-reveal]').forEach(el => revealObs.observe(el));
  // Also immediately reveal anything already in view
  $$('[data-reveal]').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.95) el.classList.add('visible');
  });
}


/* ══════════════════════════════════════
   6. STAR-FIELD CANVAS (chapter 1 bg)
   — Parallax scroll effect
══════════════════════════════════════ */
(function initStarfield() {
  const canvas = $('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Three layers at different speeds = parallax
  const LAYERS = [
    { count: 80,  size: 0.8, speed: 0.6, color: 'rgba(255,255,255,0.6)' },
    { count: 50,  size: 1.4, speed: 0.3, color: 'rgba(0,242,255,0.4)'   },
    { count: 25,  size: 2.0, speed: 0.15,color: 'rgba(167,139,250,0.3)' },
  ];

  let W, H, stars = [];

  function buildStars() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    stars = [];
    LAYERS.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        stars.push({
          x:     Math.random() * W,
          y:     Math.random() * H,
          r:     layer.size + Math.random() * layer.size,
          alpha: 0.3 + Math.random() * 0.7,
          color: layer.color,
          speed: layer.speed,
          twinkle: Math.random() * Math.PI * 2,
        });
      }
    });
  }

  buildStars();
  window.addEventListener('resize', buildStars);

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() * 0.001;

    stars.forEach(s => {
      // Parallax: Y offset based on scroll and layer speed
      const oy = (scrollY * s.speed) % H;
      const py = (s.y - oy + H) % H;
      const tw = Math.sin(s.twinkle + t) * 0.3;
      ctx.beginPath();
      ctx.arc(s.x, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0.1, s.alpha + tw);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    requestAnimationFrame(draw);
  })();
})();

/* ══════════════════════════════════════
   7. PARALLAX ATOM LAYERS (chapter 1)
   Scroll effect #2
══════════════════════════════════════ */
(function initParallax() {
  const layers = $$('.plx-layer');
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.speed) || 0.2;
      layer.style.transform = `translateY(${sy * speed}px)`;
    });
  }, { passive: true });
})();

/* ══════════════════════════════════════
   8. CHAPTER 2 — STICKY SCROLL STEPS
   Drives narrative text + SVG animation
══════════════════════════════════════ */
(function initSticky() {
  const sparkSection = $('spark');
  if (!sparkSection) return;
  const steps    = $$('.n-step');
  const current  = document.querySelector('.t-current');
  const sizeBars = $('size-bars');
  let   lastStep = -1;

  function getStep() {
    const rect   = sparkSection.getBoundingClientRect();
    const h      = sparkSection.offsetHeight;
    const prog   = Math.max(0, Math.min(1, (-rect.top) / (h - window.innerHeight)));
    // 3 steps evenly split
    return Math.min(2, Math.floor(prog * 3));
  }

  function applyStep(step) {
    if (step === lastStep) return;
    lastStep = step;

    steps.forEach(s => s.classList.toggle('active', +s.dataset.step === step));

    // Step 1 → show current flow
    if (current) current.classList.toggle('on', step >= 1);

    // Step 2 → show size bars
    if (sizeBars) sizeBars.classList.toggle('show', step >= 2);

    // Animate electrons on step 1+
    animateElectrons(step >= 1);
  }

  window.addEventListener('scroll', () => applyStep(getStep()), { passive: true });
})();

/* Electron animation along transistor path */
let electronActive = false;
function animateElectrons(on) {
  if (on === electronActive) return;
  electronActive = on;
  const electrons = [{ id: 'e1', frac: 0 }, { id: 'e2', frac: 0.33 }, { id: 'e3', frac: 0.66 }];
  if (!on) {
    electrons.forEach(e => { const el = $(e.id); if (el) el.style.opacity = 0; });
    return;
  }
  const svg   = $('transistor-svg');
  const path  = $('current-flow');
  if (!svg || !path) return;

  const total = path.getTotalLength();

  function tick() {
    if (!electronActive) return;
    electrons.forEach(e => {
      e.frac = (e.frac + 0.003) % 1;
      const pt = path.getPointAtLength(e.frac * total);
      const el = $(e.id);
      if (el) {
        el.setAttribute('cx', pt.x);
        el.setAttribute('cy', pt.y);
        el.style.opacity = 1;
      }
    });
    requestAnimationFrame(tick);
  }
  tick();
}

/* ══════════════════════════════════════
   9. CHAPTER 3 — TIMELINE ANIMATE RAIL
══════════════════════════════════════ */
(function initTimeline() {
  const rail = document.querySelector('.tl-rail');
  if (!rail) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { rail.classList.add('animated'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.3 });
  obs.observe(rail);
})();

/* ══════════════════════════════════════
   10. COUNTER ANIMATIONS
═══════════════════════════════════════ */
(function initCounters() {
  function compact(n) {
    if (n >= 1e9)  return (n/1e9).toFixed(0)  + 'B';
    if (n >= 1e6)  return (n/1e6).toFixed(0)  + 'M';
    if (n >= 1e3)  return (n/1e3).toFixed(0)  + 'K';
    return n.toString();
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const fmt    = el.dataset.format === 'compact';
    const suffix = el.dataset.suffix || '';
    let   start  = null;
    const dur    = 1800;

    function step(ts) {
      if (!start) start = ts;
      const p    = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val  = target * ease;
      el.textContent = (fmt ? compact(val) : (val % 1 ? val.toFixed(1) : Math.floor(val).toLocaleString())) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  $$('[data-count]').forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════════
   11. GLOBE CANVAS (chapter 4)
   — Animated connection network
══════════════════════════════════════ */
(function initGlobe() {
  const canvas = $('globe-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  const COLORS = ['#00F2FF','#A78BFA','#34D399','#F472B6'];

  // Random "city" nodes on a 2D globe projection
  const NODES = Array.from({ length: 28 }, () => ({
    x: Math.random(),
    y: 0.1 + Math.random() * 0.8,
    r: 2 + Math.random() * 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    pulsePhase: Math.random() * Math.PI * 2,
  }));

  // Random edges
  const EDGES = [];
  for (let i = 0; i < NODES.length; i++) {
    const count = 2 + Math.floor(Math.random() * 3);
    for (let k = 0; k < count; k++) {
      const j = Math.floor(Math.random() * NODES.length);
      if (j !== i) EDGES.push({ a: i, b: j, progress: Math.random(), speed: 0.002 + Math.random() * 0.004 });
    }
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const t0 = Date.now();
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = (Date.now() - t0) * 0.001;

    // Background grid
    ctx.strokeStyle = 'rgba(0,242,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Draw edge connections
    EDGES.forEach(e => {
      e.progress = (e.progress + e.speed) % 1;
      const a = NODES[e.a], b = NODES[e.b];
      const ax = a.x * W, ay = a.y * H;
      const bx = b.x * W, by = b.y * H;

      ctx.beginPath();
      ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
      ctx.strokeStyle = 'rgba(0,242,255,0.06)';
      ctx.lineWidth   = 0.8;
      ctx.stroke();

      // Animated packet
      const px = ax + (bx - ax) * e.progress;
      const py = ay + (by - ay) * e.progress;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = a.color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw nodes
    NODES.forEach(n => {
      const x = n.x * W, y = n.y * H;
      const pulse = Math.sin(t + n.pulsePhase) * 0.3;

      // Outer pulse ring
      ctx.beginPath();
      ctx.arc(x, y, n.r * 2.5 + pulse * 4, 0, Math.PI * 2);
      ctx.fillStyle = n.color.replace(')', ',0.08)').replace('rgb','rgba');
      ctx.fill();

      // Node dot
      ctx.beginPath();
      ctx.arc(x, y, n.r, 0, Math.PI * 2);
      ctx.fillStyle   = n.color;
      ctx.globalAlpha = 0.8 + pulse * 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    requestAnimationFrame(draw);
  })();
})();

/* ══════════════════════════════════════
   12. QUANTUM CANVAS (chapter 5 bg)
   — Floating particle field
══════════════════════════════════════ */
(function initQuantumCanvas() {
  const canvas = $('quantum-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const DOTS = Array.from({ length: 50 }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0003,
    vy: (Math.random() - 0.5) * 0.0003,
    r: 1 + Math.random() * 2,
    color: ['#00F2FF','#A78BFA','#F472B6'][Math.floor(Math.random()*3)],
  }));

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    DOTS.forEach(d => {
      d.x = (d.x + d.vx + 1) % 1;
      d.y = (d.y + d.vy + 1) % 1;
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.globalAlpha = 0.35;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    requestAnimationFrame(draw);
  })();
})();

/* ══════════════════════════════════════
   13. QUBIT INTERACTION
   Interactive element — click to observe
══════════════════════════════════════ */
(function initQubit() {
  const qubit   = $('qubit');
  const label   = $('q-label');
  const hint    = $('qubit-hint');
  const btn     = $('observe-btn');
  if (!qubit) return;

  let observed = false;
  const STATES = ['|0⟩','|1⟩'];

  function observe() {
    if (observed) {
      // Reset to superposition
      observed = false;
      qubit.classList.remove('collapsed');
      if (label) label.textContent = '|ψ⟩';
      if (hint)  hint.textContent  = 'Superposition — click to observe';
      if (btn)   btn.textContent   = 'Observe Qubit';
    } else {
      observed = true;
      const state = STATES[Math.floor(Math.random() * 2)];
      qubit.classList.add('collapsed');
      if (label) label.textContent = state;
      if (hint)  hint.textContent  = `Collapsed to ${state} — wave function collapsed!`;
      if (btn)   btn.textContent   = '↺ Reset superposition';
      // Shake animation
      qubit.style.animation = 'none';
      qubit.getBoundingClientRect();
      qubit.style.animation = 'qubitShake 0.4s ease';
    }
  }

  qubit.addEventListener('click', observe);
  qubit.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') observe(); });
  if (btn) btn.addEventListener('click', observe);

  // Inject shake keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes qubitShake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-6px)}
      40%{transform:translateX(6px)}
      60%{transform:translateX(-4px)}
      80%{transform:translateX(4px)}
    }
  `;
  document.head.appendChild(style);
})();

/* ══════════════════════════════════════
   14. RESTART BUTTON smooth scroll
══════════════════════════════════════ */
const restartBtn = $('restart-btn');
if (restartBtn) {
  restartBtn.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════
   15. CARD 3D TILT (chapters 3–5)
══════════════════════════════════════ */
$$('.stat-block, .qf, .flip-card, .ai-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    card.style.transform = `perspective(600px) rotateX(${-dy*5}deg) rotateY(${dx*5}deg) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ══════════════════════════════════════
   16. THEME TOGGLE (dark ↔ light)
══════════════════════════════════════ */
(function initTheme() {
  const btn = $('theme-toggle');
  if (!btn) return;
  const saved = localStorage.getItem('si-theme');
  if (saved === 'light') document.body.classList.add('light');

  btn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('si-theme', document.body.classList.contains('light') ? 'light' : 'dark');
    // animate icon swap
    btn.style.transform = 'scale(0.8) rotate(20deg)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  });
})();

/* ══════════════════════════════════════
   17. FULLSCREEN TOGGLE
══════════════════════════════════════ */
(function initFullscreen() {
  const btn = $('fullscreen-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });
})();

/* ══════════════════════════════════════
   18. MOBILE NAV OVERLAY
══════════════════════════════════════ */
(function initMobileNav() {
  const toggle  = $('mobile-nav-toggle');
  const overlay = $('mobile-nav-overlay');
  if (!toggle || !overlay) return;

  toggle.addEventListener('click', () => {
    overlay.classList.toggle('open');
    overlay.setAttribute('aria-hidden', overlay.classList.contains('open') ? 'false' : 'true');
  });

  // Close on item click
  $$('.mno-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = $(item.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
    });
  });

  // Close on backdrop click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
    }
  });
})();

/* ══════════════════════════════════════
   19. KEYBOARD NAVIGATION (Arrow keys)
      Up/Down → jump chapters
      Left/Right → jump chapters
══════════════════════════════════════ */
(function initKeyboardNav() {
  const ids = ['genesis','spark','exp','connected','ai','quantum'];
  let current = 0;

  // Track current chapter
  window.addEventListener('scroll', () => {
    const mid = window.scrollY + window.innerHeight * 0.5;
    ids.forEach((id, i) => {
      const el = $(id); if (!el) return;
      const abs = el.getBoundingClientRect().top + window.scrollY;
      if (mid >= abs && mid <= abs + el.offsetHeight) current = i;
    });
  }, { passive: true });

  document.addEventListener('keydown', e => {
    // Ignore when focus is in input/textarea
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = Math.min(current + 1, ids.length - 1);
      $(ids[next])?.scrollIntoView({ behavior: 'smooth' });
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = Math.max(current - 1, 0);
      $(ids[prev])?.scrollIntoView({ behavior: 'smooth' });
    }
  });
})();

/* ══════════════════════════════════════
   20. MOORE'S LAW BAR CHART HOVER
       Interaction: hover to show value
══════════════════════════════════════ */
(function initBarChart() {
  const bars    = $$('.mc-bar');
  const tooltip = $('mc-tooltip');
  if (!bars.length || !tooltip) return;

  // Animate bars in when chart comes into view
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        bars.forEach((b, i) => {
          setTimeout(() => b.classList.add('animated'), i * 120);
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  const chart = document.querySelector('.moores-chart');
  if (chart) obs.observe(chart);

  bars.forEach(bar => {
    function showTip() {
      tooltip.innerHTML = `<strong style="color:var(--cyan)">${bar.dataset.year}</strong><br>${bar.dataset.val} transistors`;
      tooltip.classList.add('show');
    }
    function hideTip() { tooltip.classList.remove('show'); }
    bar.addEventListener('mouseenter', showTip);
    bar.addEventListener('focus',      showTip);
    bar.addEventListener('mouseleave', hideTip);
    bar.addEventListener('blur',       hideTip);
    bar.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showTip(); }
    });
  });
})();

/* ══════════════════════════════════════
   21. AI MODEL SLIDER
       Interaction #4 — drag to explore
══════════════════════════════════════ */
(function initAISlider() {
  const slider = $('ai-slider');
  const fill   = $('ai-fill');
  const cards  = $$('.ai-card');
  if (!slider || !cards.length) return;

  function update(idx) {
    const pct = (idx / (cards.length - 1)) * 100;
    if (fill) fill.style.width = pct + '%';
    cards.forEach((c, i) => c.classList.toggle('active', i === idx));
  }

  update(0); // initial state

  slider.addEventListener('input', () => update(+slider.value));
  // Touch/keyboard friendly
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') update(Math.min(+slider.value + 1, 4));
    if (e.key === 'ArrowLeft')  update(Math.max(+slider.value - 1, 0));
  });
})();

