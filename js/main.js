/* main.js — Boot terminal sequence, RAM fill, core activation, canvas shader */
(function() {

  /* ── Boot terminal animation ── */
  const termBody  = document.getElementById('terminal-body');
  const termLines = [
    { t: '$ initializing ELECTRIC PULSE v2.4.1 ...', cls: '' },
    { t: '$ loading hardware abstraction layer[HAL]', cls: '' },
    { t: '✓ BIOS POST check          [OK]', cls: 'ok' },
    { t: '✓ Detecting CPU: Intel i9-14900K 24C/32T', cls: 'ok' },
    { t: '✓ Memory test: 4×16 GB DDR5-6400', cls: 'ok' },
    { t: '✓ GPU enumeration: RTX 4090 24GB Ada', cls: 'ok' },
    { t: '! Overclocking profile: EXTREME applied', cls: 'err' },
    { t: '✓ Quantum bus latency: 1.2ns', cls: 'ok' },
    { t: '$ mounting /dev/pulse ...', cls: 'info' },
    { t: '✓ System ready — voltage nominal at 1.245V', cls: 'ok' },
  ];

  let lineIdx = 0;
  function typeLine() {
    if (lineIdx >= termLines.length) return;
    const { t, cls } = termLines[lineIdx];
    const span = document.createElement('div');
    span.className = cls;
    termBody.appendChild(span);

    let charIdx = 0;
    const interval = setInterval(() => {
      span.textContent = t.slice(0, ++charIdx);
      if (charIdx >= t.length) {
        clearInterval(interval);
        lineIdx++;
        setTimeout(typeLine, 160);
      }
    }, 18);
  }
  setTimeout(typeLine, 600);

  /* ── RAM sticks fill on scroll into view ── */
  const ramFills = document.querySelectorAll('.ram-fill');
  const ramPcts  = [72, 88, 45, 91];

  const ramObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        ramFills.forEach((f, i) => {
          setTimeout(() => {
            f.style.height = ramPcts[i] + '%';
          }, i * 200);
        });
        ramObs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  const ramSection = document.getElementById('ram');
  if (ramSection) ramObs.observe(ramSection);

  /* ── CPU core random activation ── */
  const cores = document.querySelectorAll('.core:not(.cache-l3)');
  function randomActivate() {
    cores.forEach(c => c.classList.remove('active'));
    const n = Math.floor(Math.random() * 3) + 2;
    const indices = [];
    while (indices.length < n) {
      const r = Math.floor(Math.random() * cores.length);
      if (!indices.includes(r)) { indices.push(r); cores[r].classList.add('active'); }
    }
  }
  setInterval(randomActivate, 1800);

  /* ── Summary bar fills on scroll into view ── */
  const sumBars = document.querySelectorAll('.summary-bar-fill');
  const sumPcts  = ['78%','94%','61%','88%','55%','100%'];
  const sumObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sumBars.forEach((b, i) => {
          setTimeout(() => b.style.width = sumPcts[i] || '80%', i * 150);
        });
        sumObs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  const sumSection = document.getElementById('summary');
  if (sumSection) sumObs.observe(sumSection);

  /* ── GPU shader canvas — plasma wave animation ── */
  const canvas = document.getElementById('shader-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let t = 0;
    function drawShader() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width, H = canvas.height;
      if (W === 0 || H === 0) { requestAnimationFrame(drawShader); return; }
      const imageData = ctx.createImageData(W, H);
      const data = imageData.data;
      for (let y = 0; y < H; y += 2) {
        for (let x = 0; x < W; x += 2) {
          const v = Math.sin(x * 0.015 + t)
                  + Math.sin(y * 0.012 - t * 0.7)
                  + Math.sin((x + y) * 0.009 + t * 0.5)
                  + Math.sin(Math.sqrt(x * x + y * y) * 0.008 - t);
          const norm = (v + 4) / 8;
          // GPU color palette: magenta/pink/purple
          const r = Math.round(180 + norm * 75);
          const g = Math.round(20  + norm * 52);
          const b = Math.round(153 + norm * 102);
          const a = Math.round(norm * 180);
          const base = (y * W + x) * 4;
          data[base]     = r; data[base+1] = g; data[base+2] = b; data[base+3] = a;
          // 2x2 pixel block for performance
          if (x+1 < W) { const b2=(y*W+(x+1))*4; data[b2]=r;data[b2+1]=g;data[b2+2]=b;data[b2+3]=a; }
          if (y+1 < H) { const b3=((y+1)*W+x)*4; data[b3]=r;data[b3+1]=g;data[b3+2]=b;data[b3+3]=a; }
          if (x+1<W&&y+1<H){const b4=((y+1)*W+(x+1))*4;data[b4]=r;data[b4+1]=g;data[b4+2]=b;data[b4+3]=a;}
        }
      }
      ctx.putImageData(imageData, 0, 0);
      t += 0.025;
      requestAnimationFrame(drawShader);
    }
    drawShader();
  }

  /* ── PCB trace animation now handled by interactions.js (IntersectionObserver) ── */


  /* ── Scroll-reveal now handled by GSAP ScrollTrigger (gsap-scroll.js) ── */

})();
