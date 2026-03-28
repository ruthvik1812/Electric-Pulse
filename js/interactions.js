/* ═══════════════════════════════════════════════════════════
   interactions.js — Rich interactivity layer
   Sections: RAM click | CPU modal | Web Audio | Cursor color |
             Keyboard HUD | Summary counter | Plasma shader upgrade
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. WEB AUDIO API — Subtle sci-fi synth blips
     Only activates after first user gesture
  ───────────────────────────────────────── */
  let audioCtx = null;
  let audioEnabled = false;

  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioEnabled = true;
  }

  function playBlip(freq = 440, type = 'sine', gain = 0.06, dur = 0.12) {
    if (!audioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const g   = audioCtx.createGain();
      osc.connect(g);
      g.connect(audioCtx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + dur);
      g.gain.setValueAtTime(gain, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  function playClick() { playBlip(880, 'square', 0.05, 0.08); }
  function playOpen()  { playBlip(660, 'sine',   0.06, 0.18); }
  function playClose() { playBlip(330, 'sine',   0.05, 0.14); }

  // Init audio on first interaction
  document.addEventListener('click', () => { initAudio(); }, { once: true });
  document.addEventListener('keydown', () => { initAudio(); }, { once: true });


  /* ─────────────────────────────────────────
     2. RAM STICK CLICK INTERACTIVITY
     Click → burst animation → refill to new value
  ───────────────────────────────────────── */
  const ramSticks  = document.querySelectorAll('.ram-stick');
  const ramPcts    = [72, 88, 45, 91];
  const ramFills   = document.querySelectorAll('.ram-fill');
  const ramLabels  = document.querySelectorAll('.ram-label');

  ramSticks.forEach((stick, i) => {
    stick.addEventListener('click', () => {
      playClick();
      const fill = ramFills[i];
      if (!fill) return;

      // Burst drain
      fill.style.transition = 'height 0.2s ease';
      fill.style.height = '0%';

      // Create burst particle
      const burst = document.createElement('div');
      burst.style.cssText = `
        position:absolute; bottom:50%; left:50%;
        width:40px; height:40px;
        margin-left:-20px; margin-bottom:-20px;
        border-radius:50%;
        background: radial-gradient(circle, rgba(34,211,238,0.8), transparent 70%);
        pointer-events:none;
        animation: burstOut 0.4s ease-out forwards;
        z-index:10;
      `;
      stick.appendChild(burst);
      setTimeout(() => burst.remove(), 500);

      // Refill with new random-ish value
      setTimeout(() => {
        const newPct = ramPcts[i] + (Math.random() * 10 - 5) | 0;
        fill.style.transition = 'height 0.9s cubic-bezier(0.23,1,0.32,1)';
        fill.style.height = Math.max(20, Math.min(99, newPct)) + '%';

        // Update label below stick
        const pctBadge = stick.parentElement.querySelector('span.mono');
        if (pctBadge) {
          pctBadge.textContent = Math.max(20, Math.min(99, newPct)) + '%';
        }
      }, 300);
    });
  });

  // Add burst keyframe
  const burstStyle = document.createElement('style');
  burstStyle.textContent = `
    @keyframes burstOut {
      from { transform: scale(0); opacity: 0.9; }
      to   { transform: scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(burstStyle);


  /* ─────────────────────────────────────────
     3. CPU CORE CLICK MODAL
     Click any core → show live freq readout + details
  ───────────────────────────────────────── */
  const modal       = document.getElementById('core-modal');
  const modalFreq   = document.getElementById('modal-freq-val');
  const modalCoreName = document.getElementById('modal-core-name');
  const modalCoreType = document.getElementById('modal-core-type');
  const modalCoreL2  = document.getElementById('modal-core-l2');
  const modalCorePwr = document.getElementById('modal-core-pwr');
  const modalLoadFill = document.getElementById('modal-load-fill');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  let freqInterval = null;

  const coreData = {
    P: { type: 'Raptor Cove (P-Core)', l2: '2 MB', baseFreq: 3200, boostFreq: 5800, wattRange: [12, 28] },
    E: { type: 'Gracemont (E-Core)',   l2: '4 MB (shared)', baseFreq: 2200, boostFreq: 4300, wattRange: [4, 10]  },
  };

  function openCoreModal(core) {
    if (!modal) return;
    playOpen();

    const id       = core.id || 'core-0';
    const isECore  = id.includes('e');
    const num      = id.replace('core-e', '').replace('core-', '');
    const data     = isECore ? coreData.E : coreData.P;
    const coreLabel = isECore ? `E-Core ${num}` : `P-Core ${num}`;

    if (modalCoreName)    modalCoreName.textContent  = coreLabel;
    if (modalCoreType)    modalCoreType.textContent  = data.type;
    if (modalCoreL2)      modalCoreL2.textContent    = data.l2;

    const load = 30 + Math.random() * 65;
    const watt = (data.wattRange[0] + (load / 100) * (data.wattRange[1] - data.wattRange[0])).toFixed(1);
    if (modalCorePwr)     modalCorePwr.textContent   = watt + ' W';
    if (modalLoadFill)    modalLoadFill.style.width  = load.toFixed(0) + '%';

    // Animated frequency counter
    clearInterval(freqInterval);
    let currentFreq = data.baseFreq;
    const targetFreq = data.baseFreq + (load / 100) * (data.boostFreq - data.baseFreq);
    freqInterval = setInterval(() => {
      currentFreq += (targetFreq - currentFreq) * 0.08;
      currentFreq += (Math.random() - 0.5) * 40;
      if (modalFreq) modalFreq.textContent = (currentFreq / 1000).toFixed(2);
    }, 80);

    modal.classList.add('visible');
  }

  function closeModal() {
    if (!modal) return;
    playClose();
    modal.classList.remove('visible');
    clearInterval(freqInterval);
  }

  // Attach to all cores
  document.querySelectorAll('.core, .cache-l3').forEach(core => {
    core.addEventListener('click', e => {
      e.stopPropagation();
      if (core.classList.contains('cache-l3')) return; // L3 has tooltip already
      openCoreModal(core);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modal)         modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });


  /* ─────────────────────────────────────────
     4. SECTION-SPECIFIC CURSOR COLOR MORPHING
  ───────────────────────────────────────── */
  const SECTION_COLORS = {
    boot:        '#00F2FF',
    motherboard: '#A855F7',
    cpu:         '#F97316',
    ram:         '#22D3EE',
    gpu:         '#EC4899',
    storage:     '#BCFF00',
    summary:     '#FCD34D',
  };

  const cursorOuter = document.getElementById('cursor-outer');
  const cursorInner = document.getElementById('cursor-inner');

  const sections = document.querySelectorAll('.section');
  const cursorObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const color = SECTION_COLORS[entry.target.id] || '#00F2FF';
        if (cursorOuter) {
          cursorOuter.style.borderColor = color;
          cursorOuter.style.boxShadow   = `0 0 12px ${color}44, 0 0 24px ${color}22`;
        }
        if (cursorInner) {
          cursorInner.style.background  = color;
          cursorInner.style.boxShadow   = `0 0 8px ${color}`;
        }
        // Also update active drawer link
        document.querySelectorAll('.drawer-section-link').forEach(l => {
          l.classList.toggle('active', l.dataset.section === entry.target.id);
        });
        // Update mobile nav label
        const mobileLabel = document.getElementById('nav-active-section');
        if (mobileLabel) mobileLabel.textContent = entry.target.id.toUpperCase();
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => cursorObs.observe(s));


  /* ─────────────────────────────────────────
     5. KEYBOARD SHORTCUTS HUD — Press ?
  ───────────────────────────────────────── */
  const hud = document.getElementById('shortcuts-hud');
  const hudCloseBtn = document.getElementById('hud-close-btn');

  function openHud()  { if (hud) { hud.classList.add('visible'); playOpen(); } }
  function closeHud() { if (hud) { hud.classList.remove('visible'); playClose(); } }

  document.addEventListener('keydown', e => {
    if (e.key === '?' || e.key === '/') { e.preventDefault(); openHud(); }
    if (e.key === 'Escape') {
      closeHud();
      closeModal();
      closeMobileDrawer();
    }
  });
  if (hudCloseBtn) hudCloseBtn.addEventListener('click', closeHud);
  if (hud)         hud.addEventListener('click', e => { if (e.target === hud) closeHud(); });


  /* ─────────────────────────────────────────
     6. SUMMARY CARD HOVER — Animated counter
  ───────────────────────────────────────── */
  document.querySelectorAll('.summary-card').forEach(card => {
    const numEl = card.querySelector('.summary-number');
    if (!numEl) return;
    const orig = numEl.textContent.trim();

    card.addEventListener('mouseenter', () => {
      playBlip(1100, 'sine', 0.03, 0.1);
      // Extract numeric part and unit
      const match = orig.match(/^([\d.]+)(.*)$/);
      if (!match) return;
      const base = parseFloat(match[1]);
      const unit = match[2];
      const target = base + (Math.random() * 6 - 3);
      let frame = 0;
      const frames = 12;
      const iv = setInterval(() => {
        const lerped = base + (target - base) * (frame / frames);
        numEl.textContent = (Number.isInteger(base) ? Math.round(lerped) : lerped.toFixed(1)) + unit;
        frame++;
        if (frame > frames) clearInterval(iv);
      }, 40);
    });

    card.addEventListener('mouseleave', () => {
      numEl.textContent = orig;
    });
  });


  /* ─────────────────────────────────────────
     7. MOBILE NAV — Hamburger + Drawer logic
  ───────────────────────────────────────── */
  const hamburger   = document.getElementById('hamburger');
  const drawer      = document.getElementById('mobile-drawer');
  const backdrop    = document.getElementById('mobile-backdrop');
  const progressFill = document.getElementById('mobile-progress-fill');

  function openMobileDrawer() {
    drawer?.classList.add('open');
    backdrop?.classList.add('open');
    hamburger?.classList.add('open');
    playOpen();
  }
  function closeMobileDrawer() {
    drawer?.classList.remove('open');
    backdrop?.classList.remove('open');
    hamburger?.classList.remove('open');
    playClose();
  }

  hamburger?.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMobileDrawer() : openMobileDrawer();
  });
  backdrop?.addEventListener('click', closeMobileDrawer);

  // Drawer links
  document.querySelectorAll('.drawer-section-link').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.getElementById(link.dataset.section);
      target?.scrollIntoView({ behavior: 'smooth' });
      closeMobileDrawer();
    });
  });

  // Mobile progress bar sync
  window.addEventListener('scroll', () => {
    if (!progressFill) return;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct  = Math.min(100, (window.scrollY / docH) * 100);
    progressFill.style.width = pct + '%';
  }, { passive: true });


  /* ─────────────────────────────────────────
     8. COMP-CARD + CHAPTER REVEALS
        Now handled by GSAP ScrollTrigger in gsap-scroll.js
  ───────────────────────────────────────── */






  /* ─────────────────────────────────────────
    10. PCB TRACE ANIMATION — IntersectionObserver trigger
        (fixed from immediate fire in main.js)
  ───────────────────────────────────────── */
  const mbSection = document.getElementById('motherboard');
  if (mbSection) {
    let tracesAnimated = false;
    const mbObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !tracesAnimated) {
        tracesAnimated = true;
        const paths = document.querySelectorAll('#mb-svg path');
        paths.forEach((p, i) => {
          const len = p.getTotalLength ? p.getTotalLength() : 200;
          p.style.strokeDasharray  = len;
          p.style.strokeDashoffset = len;
          p.style.transition = `stroke-dashoffset 1.8s ${i * 0.2}s cubic-bezier(0.23,1,0.32,1)`;
          requestAnimationFrame(() => {
            p.style.strokeDashoffset = '0';
          });
        });
        mbObs.disconnect();
      }
    }, { threshold: 0.2 });
    mbObs.observe(mbSection);
  }

})();
