/* site.js — Electric Pulse V2 — Full Attractions */
(function () {
  'use strict';

  /* ══════════════════════════════════
     0. SCROLL PROGRESS BAR
  ══════════════════════════════════ */
  const progress = document.createElement('div');
  progress.id = 'scroll-progress';
  document.body.prepend(progress);

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (window.scrollY / max * 100) + '%';
  }, { passive: true });

  /* ══════════════════════════════════
     1. ANNOUNCEMENT BAR
  ══════════════════════════════════ */
  const bar     = document.getElementById('announce-bar');
  const closeBtn= document.getElementById('announceClose');
  if (bar) {
    document.body.classList.add('has-announce');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        bar.classList.add('hidden');
        document.body.classList.remove('has-announce');
      });
    }
  }

  /* ══════════════════════════════════
     2. ANIMATED ORB BACKGROUND
  ══════════════════════════════════ */
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx    = bgCanvas.getContext('2d');
  let W, H;

  function resize() {
    W = bgCanvas.width  = window.innerWidth;
    H = bgCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const ORBS = [
    { x:0.15, y:0.25, r:0.45, color:[0,188,212],    speed:0.0003,  phase:0    },
    { x:0.80, y:0.15, r:0.40, color:[124,58,237],   speed:0.0002,  phase:1.2  },
    { x:0.65, y:0.75, r:0.50, color:[244,114,182],  speed:0.00025, phase:2.4  },
    { x:0.25, y:0.80, r:0.35, color:[52,211,153],   speed:0.00035, phase:3.6  },
    { x:0.90, y:0.55, r:0.30, color:[251,191,36],   speed:0.0004,  phase:0.8  },
  ];

  let tick = 0;
  function drawBg() {
    tick++;
    bgCtx.clearRect(0, 0, W, H);
    bgCtx.fillStyle = '#080B14';
    bgCtx.fillRect(0, 0, W, H);

    ORBS.forEach(orb => {
      const w1 = Math.sin(tick * orb.speed * 1000 + orb.phase);
      const w2 = Math.cos(tick * orb.speed *  800 + orb.phase);
      const cx = (orb.x + w1 * 0.08) * W;
      const cy = (orb.y + w2 * 0.06) * H;
      const rad = orb.r * Math.min(W, H) * 0.7;
      const g   = bgCtx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      const [r, gv, b] = orb.color;
      g.addColorStop(0,   `rgba(${r},${gv},${b},0.22)`);
      g.addColorStop(0.5, `rgba(${r},${gv},${b},0.07)`);
      g.addColorStop(1,   `rgba(${r},${gv},${b},0)`);
      bgCtx.beginPath();
      bgCtx.arc(cx, cy, rad, 0, Math.PI * 2);
      bgCtx.fillStyle = g;
      bgCtx.fill();
    });

    // Grid
    bgCtx.strokeStyle = 'rgba(255,255,255,0.025)';
    bgCtx.lineWidth   = 1;
    const gs = 80;
    for (let x = 0; x < W; x += gs) { bgCtx.beginPath(); bgCtx.moveTo(x,0); bgCtx.lineTo(x,H); bgCtx.stroke(); }
    for (let y = 0; y < H; y += gs) { bgCtx.beginPath(); bgCtx.moveTo(0,y); bgCtx.lineTo(W,y); bgCtx.stroke(); }

    requestAnimationFrame(drawBg);
  }
  drawBg();

  /* ══════════════════════════════════
     3. FLOATING PARTICLE NETWORK
  ══════════════════════════════════ */
  const pCanvas = document.getElementById('particle-canvas');
  const pCtx    = pCanvas.getContext('2d');

  function resizeP() {
    pCanvas.width  = window.innerWidth;
    pCanvas.height = window.innerHeight;
  }
  resizeP();
  window.addEventListener('resize', resizeP);

  const COLORS = ['#00F2FF','#A78BFA','#F472B6','#34D399','#FBBF24'];
  const PARTICLES = Array.from({ length: 70 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r:  Math.random() * 1.8 + 0.6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: Math.random() * 0.5 + 0.2,
  }));

  function drawParticles() {
    const pw = pCanvas.width, ph = pCanvas.height;
    pCtx.clearRect(0, 0, pw, ph);

    // Update
    PARTICLES.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = pw; if (p.x > pw) p.x = 0;
      if (p.y < 0) p.y = ph; if (p.y > ph) p.y = 0;
    });

    // Draw connections
    for (let i = 0; i < PARTICLES.length; i++) {
      for (let j = i + 1; j < PARTICLES.length; j++) {
        const dx = PARTICLES[i].x - PARTICLES[j].x;
        const dy = PARTICLES[i].y - PARTICLES[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          pCtx.beginPath();
          pCtx.moveTo(PARTICLES[i].x, PARTICLES[i].y);
          pCtx.lineTo(PARTICLES[j].x, PARTICLES[j].y);
          pCtx.strokeStyle = `rgba(0,242,255,${0.07 * (1 - dist/120)})`;
          pCtx.lineWidth   = 0.8;
          pCtx.stroke();
        }
      }
    }

    // Draw dots
    PARTICLES.forEach(p => {
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pCtx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2,'0');
      pCtx.fill();
    });

    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ══════════════════════════════════
     4. TYPEWRITER HERO
  ══════════════════════════════════ */
  const typeEl  = document.getElementById('typewriter');
  const phrases = ['Speed of Light', 'Next Generation', 'Future of Tech', 'Speed of Light'];
  let  pIdx = 0, cIdx = 0, deleting = false;

  function typeStep() {
    const phrase = phrases[pIdx];
    if (!deleting) {
      cIdx++;
      typeEl.textContent = phrase.slice(0, cIdx);
      if (cIdx === phrase.length) { deleting = true; setTimeout(typeStep, 2200); return; }
      setTimeout(typeStep, 65);
    } else {
      cIdx--;
      typeEl.textContent = phrase.slice(0, cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
        setTimeout(typeStep, 400);
        return;
      }
      setTimeout(typeStep, 35);
    }
  }
  if (typeEl) setTimeout(typeStep, 800);

  /* ══════════════════════════════════
     5. NAVBAR SCROLL
  ══════════════════════════════════ */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ══════════════════════════════════
     6. SCROLL REVEAL
  ══════════════════════════════════ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

  /* ══════════════════════════════════
     7. COUNTER ANIMATION
  ══════════════════════════════════ */
  function animateCount(el, target, dur = 1800) {
    let start = null;
    const isFloat = target % 1 !== 0;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val  = target * ease;
      el.textContent = isFloat ? val.toFixed(2) : Math.floor(val).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target, parseFloat(e.target.dataset.count));
        countObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

  /* ══════════════════════════════════
     8. SPEC BAR FILL
  ══════════════════════════════════ */
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fill = e.target.querySelector('.spec-bar-fill');
        if (fill) fill.style.width = getComputedStyle(fill).getPropertyValue('--w').trim();
        barObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.spec-card').forEach(el => barObs.observe(el));

  /* ══════════════════════════════════
     9. SHOWCASE TABS
  ══════════════════════════════════ */
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel-content').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(`tab-${tab.dataset.tab}`);
      if (target) { target.classList.add('active'); }
    });
  });

  /* ══════════════════════════════════
    10. 3D CARD TILT
  ══════════════════════════════════ */
  document.querySelectorAll('.feature-card, .testi-card, .plan-card, .spec-card, .bento-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      card.style.transform = `perspective(800px) rotateX(${-dy*6}deg) rotateY(${dx*6}deg) scale(1.02)`;

      // Move card light
      const light = card.querySelector('.card-light');
      if (light) {
        light.style.left = (e.clientX - rect.left) + 'px';
        light.style.top  = (e.clientY - rect.top)  + 'px';
      }
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ══════════════════════════════════
    11. INJECT CARD LIGHT into every card
  ══════════════════════════════════ */
  document.querySelectorAll('.feature-card, .testi-card, .bento-card').forEach(card => {
    const light = document.createElement('div');
    light.className = 'card-light';
    card.prepend(light);
  });

  /* ══════════════════════════════════
    12. SPARKLE ON PRIMARY BUTTON CLICK
  ══════════════════════════════════ */
  const SPARKLE_COLORS = ['#00F2FF','#A78BFA','#F472B6','#34D399','#FBBF24','#F97316'];
  document.querySelectorAll('.btn-sparkle').forEach(btn => {
    btn.addEventListener('click', e => {
      const r = btn.getBoundingClientRect();
      const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
      for (let i = 0; i < 16; i++) {
        const p = document.createElement('div');
        p.className = 'sparkle-particle';
        const angle = (Math.random() * 360) * Math.PI / 180;
        const dist  = 60 + Math.random() * 80;
        p.style.cssText = `
          left:${ox}px; top:${oy}px;
          background:${SPARKLE_COLORS[i % SPARKLE_COLORS.length]};
          --tx:${Math.cos(angle)*dist}px;
          --ty:${Math.sin(angle)*dist - 30}px;
          box-shadow: 0 0 6px ${SPARKLE_COLORS[i % SPARKLE_COLORS.length]};
          animation-delay: ${Math.random() * 0.15}s;
          animation-duration: ${0.5 + Math.random() * 0.3}s;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 900);
      }
    });
  });

  /* ══════════════════════════════════
    13. MAGNETIC BUTTONS
  ══════════════════════════════════ */
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width  / 2;
      const my = e.clientY - r.top  - r.height / 2;
      el.style.transform = `translate(${mx * 0.2}px, ${my * 0.2}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(() => el.style.transition = '', 500);
    });
  });

  /* ══════════════════════════════════
    14. SMOOTH CURSOR WITH TRAIL
  ══════════════════════════════════ */
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position:fixed; width:20px; height:20px; border-radius:50%;
    background:rgba(0,242,255,0.2); border:1.5px solid rgba(0,242,255,0.6);
    pointer-events:none; z-index:9900; transform:translate(-50%,-50%);
    mix-blend-mode:screen; transition: width 0.25s, height 0.25s, background 0.25s;
  `;
  document.body.appendChild(cursor);

  // Trail dots
  const TRAIL_COUNT = 8;
  const trail = Array.from({ length: TRAIL_COUNT }, (_, i) => {
    const d = document.createElement('div');
    d.style.cssText = `
      position:fixed; border-radius:50%; pointer-events:none; z-index:9899;
      transform:translate(-50%,-50%); mix-blend-mode:screen;
      width:${6 - i*0.5}px; height:${6 - i*0.5}px;
      background: ${['#00F2FF','#A78BFA','#F472B6','#34D399','#FBBF24','#00F2FF','#A78BFA','#34D399'][i]};
      opacity:${0.5 - i*0.05};
    `;
    document.body.appendChild(d);
    return { el: d, x: 0, y: 0 };
  });

  let mx = 0, my = 0;
  const trailPos = Array(TRAIL_COUNT).fill({ x: 0, y: 0 }).map(() => ({ x:0, y:0 }));
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  let cx2 = 0, cy2 = 0;
  function cursorTick() {
    cx2 += (mx - cx2) * 0.14;
    cy2 += (my - cy2) * 0.14;
    cursor.style.left = cx2 + 'px';
    cursor.style.top  = cy2 + 'px';

    trailPos[0].x += (cx2 - trailPos[0].x) * 0.4;
    trailPos[0].y += (cy2 - trailPos[0].y) * 0.4;
    for (let i = 1; i < TRAIL_COUNT; i++) {
      trailPos[i].x += (trailPos[i-1].x - trailPos[i].x) * 0.4;
      trailPos[i].y += (trailPos[i-1].y - trailPos[i].y) * 0.4;
      trail[i].el.style.left = trailPos[i].x + 'px';
      trail[i].el.style.top  = trailPos[i].y + 'px';
    }
    requestAnimationFrame(cursorTick);
  }
  cursorTick();

  document.querySelectorAll('a, button, .tab, .plan-card, .feature-card, .bento-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '40px';
      cursor.style.height = '40px';
      cursor.style.background = 'rgba(0,242,255,0.08)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '20px';
      cursor.style.height = '20px';
      cursor.style.background = 'rgba(0,242,255,0.2)';
    });
  });

  /* ══════════════════════════════════
    15. SMOOTH ANCHOR SCROLL
  ══════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ══════════════════════════════════
    16. ADD HERO GLOWS
  ══════════════════════════════════ */
  const hero = document.getElementById('hero');
  if (hero) {
    ['hero-glow-1','hero-glow-2'].forEach(cls => {
      const el = document.createElement('div');
      el.className = 'hero-glow ' + cls;
      hero.appendChild(el);
    });
  }

  /* ══════════════════════════════════
    17. TESTIMONIAL AUTO-ROTATION RING
  ══════════════════════════════════ */
  const testiCards = document.querySelectorAll('.testi-card');
  let testiIdx = 0;
  if (testiCards.length) {
    setInterval(() => {
      testiCards.forEach(c => c.classList.remove('active-ring'));
      testiIdx = (testiIdx + 1) % testiCards.length;
      testiCards[testiIdx].classList.add('active-ring');
    }, 3500);
  }

  /* ══════════════════════════════════
    18. BENTO CARD "01/02/03" animation
  ══════════════════════════════════ */
  const bentoObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const num = e.target.querySelector('.bento-num');
        if (num) {
          num.style.animation = 'none';
          num.style.color     = 'var(--cyan)';
          num.style.textShadow = '0 0 12px var(--cyan)';
        }
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.bento-card').forEach(c => bentoObs.observe(c));

  /* ══════════════════════════════════
    19. PAGE-LOAD ENTRANCE ANIMATION
  ══════════════════════════════════ */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes panelIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
    body { animation: pageIn 0.6s ease-out both; }
    @keyframes pageIn { from{opacity:0} to{opacity:1} }
  `;
  document.head.appendChild(style);

})();
