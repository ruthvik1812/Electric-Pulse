/* ═══════════════════════════════════════════════════════════════
   features.js — Extra features layer:
   1. Live System Monitor  2. Overclock Mode
   3. Konami Code → Matrix Rain  4. GPU Benchmark Bars
   5. Journey Completion Confetti  6. Ambient Sound Toggle
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════
     1. LIVE SYSTEM MONITOR WIDGET
        Simulated values update with smooth noise
  ════════════════════════════════════════════════════════ */
  const MON = {
    cpu:  { el: document.getElementById('mon-fill-cpu'),  val: document.getElementById('mon-val-cpu'),  base: 62, noise: 18, unit: '%' },
    gpu:  { el: document.getElementById('mon-fill-gpu'),  val: document.getElementById('mon-val-gpu'),  base: 74, noise: 20, unit: '%' },
    ram:  { el: document.getElementById('mon-fill-ram'),  val: document.getElementById('mon-val-ram'),  base: 68, noise:  8, unit: '%' },
    temp: { el: document.getElementById('mon-fill-temp'), val: document.getElementById('mon-val-temp'), base: 71, noise: 12, unit: '°C' },
  };

  // State for smooth random walk
  const state = { cpu: 62, gpu: 74, ram: 68, temp: 71 };

  function updateMonitor() {
    const isOC = document.body.classList.contains('overclock');
    const ocBoost = isOC ? 20 : 0;

    Object.keys(MON).forEach(key => {
      const m = MON[key];
      if (!m.el || !m.val) return;
      const target = m.base + (Math.random() - 0.5) * m.noise + ocBoost;
      state[key] += (Math.min(99, Math.max(1, target)) - state[key]) * 0.25;
      const v = Math.round(state[key]);
      m.el.style.width = v + '%';
      m.val.textContent = v + m.unit;

      // Color the temp bar based on heat
      if (key === 'temp') {
        if (v > 85) m.el.style.background = 'linear-gradient(90deg,#F97316,#EF4444)';
        else if (v > 70) m.el.style.background = 'linear-gradient(90deg,#BCFF00,#F97316)';
        else m.el.style.background = 'linear-gradient(90deg,#22D3EE,#BCFF00)';
      }
    });
  }

  setInterval(updateMonitor, 900);
  updateMonitor();

  // Minimize toggle
  const monToggle = document.getElementById('mon-toggle');
  const monBody   = document.getElementById('mon-body');
  let monMin = false;
  monToggle?.addEventListener('click', () => {
    monMin = !monMin;
    monBody.style.display = monMin ? 'none' : '';
    monToggle.textContent = monMin ? '▲ SHOW' : '▼ MIN';
  });


  /* ════════════════════════════════════════════════════════
     2. OVERCLOCK MODE
  ════════════════════════════════════════════════════════ */
  const ocBtn      = document.getElementById('overclock-btn');
  const thermalBar = document.getElementById('thermal-warning');
  let ocActive = false;

  ocBtn?.addEventListener('click', () => {
    ocActive = !ocActive;
    document.body.classList.toggle('overclock', ocActive);
    ocBtn.classList.toggle('active', ocActive);
    ocBtn.textContent = ocActive ? '🔥 THROTTLE' : '⚡ OVERCLOCK';
    thermalBar?.classList.toggle('visible', ocActive);

    // Play audio cue
    playFeatureBlip(ocActive ? 1200 : 400, ocActive ? 0.08 : 0.05);

    // Shake screen briefly on activation
    if (ocActive && typeof gsap !== 'undefined') {
      gsap.to('body', { x: 3, duration: 0.05, yoyo: true, repeat: 6, ease: 'power1.inOut', clearProps: 'x' });
    }
  });


  /* ════════════════════════════════════════════════════════
     3. KONAMI CODE EASTER EGG → Matrix Rain
     Sequence: ↑↑↓↓←→←→BA
  ════════════════════════════════════════════════════════ */
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIdx = 0;

  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        triggerMatrixRain();
      }
    } else {
      konamiIdx = 0;
    }
  });

  const matCanvas  = document.getElementById('matrix-canvas');
  const matMessage = document.getElementById('matrix-message');

  function triggerMatrixRain() {
    if (!matCanvas) return;
    playFeatureBlip(800, 0.08);

    matCanvas.width  = window.innerWidth;
    matCanvas.height = window.innerHeight;
    const ctx = matCanvas.getContext('2d');

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
    const cols  = Math.floor(matCanvas.width / 16);
    const drops = Array(cols).fill(1);

    matCanvas.classList.add('visible');
    if (matMessage) matMessage.classList.add('visible');

    let frame = 0;
    function drawMatrix() {
      if (frame > 240) { // ~4 seconds at 60fps
        matCanvas.classList.remove('visible');
        if (matMessage) matMessage.classList.remove('visible');
        return;
      }
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, matCanvas.width, matCanvas.height);
      ctx.fillStyle = '#00FF41';
      ctx.font = '14px monospace';
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * 16, y * 16);
        if (y * 16 > matCanvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      frame++;
      requestAnimationFrame(drawMatrix);
    }
    drawMatrix();

    matCanvas.onclick = () => {
      matCanvas.classList.remove('visible');
      if (matMessage) matMessage.classList.remove('visible');
    };
  }


  /* ════════════════════════════════════════════════════════
     4. GPU BENCHMARK BARS — Animate on scroll
  ════════════════════════════════════════════════════════ */
  const benchBars  = document.querySelectorAll('.bench-bar[data-score]');
  const MAX_SCORE  = 191; // RTX 4090 reference

  const benchObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      benchBars.forEach((bar, i) => {
        const score = parseFloat(bar.dataset.score);
        setTimeout(() => {
          bar.style.width = ((score / MAX_SCORE) * 100).toFixed(1) + '%';
        }, i * 150);
      });
      benchObs.disconnect();
    }
  }, { threshold: 0.3 });

  const benchSection = document.querySelector('.benchmark-chart');
  if (benchSection) benchObs.observe(benchSection);


  /* ════════════════════════════════════════════════════════
     5. JOURNEY COMPLETION CONFETTI + TOAST
        Fires once when #summary enters view
  ════════════════════════════════════════════════════════ */
  const confettiCanvas = document.getElementById('confetti-canvas');
  const toast          = document.getElementById('journey-complete-toast');
  let celebrationFired = false;

  const summaryObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !celebrationFired) {
      celebrationFired = true;
      fireCelebration();
      summaryObs.disconnect();
    }
  }, { threshold: 0.3 });

  const summarySection = document.getElementById('summary');
  if (summarySection) summaryObs.observe(summarySection);

  function fireCelebration() {
    if (!confettiCanvas) return;
    playFeatureBlip(880, 0.06);

    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    confettiCanvas.classList.add('visible');

    const ctx = confettiCanvas.getContext('2d');
    const COLORS = ['#00F2FF','#BCFF00','#EC4899','#FCD34D','#A855F7','#F97316'];
    const particles = Array.from({length: 120}, () => ({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height * 0.5,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * -8 - 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 6 + 3,
      spin: Math.random() * 0.4 - 0.2,
      angle: Math.random() * Math.PI * 2,
      life: 1,
      decay: 0.012 + Math.random() * 0.008,
    }));

    let frame = 0;
    function drawConfetti() {
      if (frame > 180) {
        confettiCanvas.classList.remove('visible');
        return;
      }
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      particles.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.18; // gravity
        p.vx *= 0.99;
        p.angle += p.spin;
        p.life  -= p.decay;
        if (p.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.5);
        ctx.restore();
      });
      frame++;
      requestAnimationFrame(drawConfetti);
    }
    drawConfetti();

    // Toast message
    if (toast) {
      setTimeout(() => {
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 4000);
      }, 400);
    }
  }


  /* ════════════════════════════════════════════════════════
     6. AMBIENT SOUND TOGGLE (Web Audio droning synth)
  ════════════════════════════════════════════════════════ */
  const soundBtn = document.getElementById('sound-btn');
  let ambientCtx = null, ambientNodes = [], ambientOn = false;

  function startAmbient() {
    if (!ambientCtx) ambientCtx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = [55, 110, 220, 440];
    freqs.forEach((f, i) => {
      const osc  = ambientCtx.createOscillator();
      const gain = ambientCtx.createGain();
      const lfo  = ambientCtx.createOscillator();
      const lfoG = ambientCtx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, ambientCtx.currentTime);
      lfo.frequency.setValueAtTime(0.3 + i * 0.1, ambientCtx.currentTime);
      lfoG.gain.setValueAtTime(f * 0.005, ambientCtx.currentTime);
      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);
      gain.gain.setValueAtTime(0, ambientCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.025 / (i + 1), ambientCtx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ambientCtx.destination);
      osc.start();
      lfo.start();
      ambientNodes.push({ osc, gain, lfo });
    });
  }

  function stopAmbient() {
    ambientNodes.forEach(n => {
      n.gain.gain.linearRampToValueAtTime(0, ambientCtx.currentTime + 0.8);
      setTimeout(() => { try { n.osc.stop(); n.lfo.stop(); } catch(e) {} }, 900);
    });
    ambientNodes = [];
  }

  soundBtn?.addEventListener('click', () => {
    ambientOn = !ambientOn;
    soundBtn.classList.toggle('active', ambientOn);
    soundBtn.textContent = ambientOn ? '🔈 MUTE' : '🔇 AMBIENT';
    ambientOn ? startAmbient() : stopAmbient();
  });


  /* ════════════════════════════════════════════════════════
     UTILITY: Feature blip (works independently of interactions.js audio)
  ════════════════════════════════════════════════════════ */
  let _fCtx = null;
  function playFeatureBlip(freq, gain = 0.06) {
    try {
      if (!_fCtx) _fCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = _fCtx.createOscillator();
      const g   = _fCtx.createGain();
      osc.connect(g); g.connect(_fCtx.destination);
      osc.frequency.setValueAtTime(freq, _fCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, _fCtx.currentTime + 0.2);
      g.gain.setValueAtTime(gain, _fCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, _fCtx.currentTime + 0.2);
      osc.start(); osc.stop(_fCtx.currentTime + 0.2);
    } catch(e) {}
  }

})();
