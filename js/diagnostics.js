/* diagnostics.js — D-key System Diagnostics overlay */
(function() {
  const overlay = document.getElementById('diag-overlay');
  const body    = document.body;
  let active    = false;

  // Real-time log lines for easter eggs
  const easterEggs = [
    '// TODO: fix the quantum entanglement bug on line 1337',
    '// WARN: coffee.level critically low — dev mode unstable',
    '// NOTE: this UI runs on pure vibes and caffeine',
    '// HACK: if the matrix glitches, press D again',
    '// SECRET: you found the diagnostics panel! 🎉',
    '// easter_egg.found = true; achievement_unlocked();',
    '// author: a sleepy engineer at 3AM',
    '// kernel panic averted. you\'re welcome.',
  ];

  let logInterval;

  function toggle() {
    active = !active;
    overlay.classList.toggle('active', active);
    body.classList.toggle('scanlines', active);

    if (active) {
      // Animate corner logs typing
      animateLogs();
      logInterval = setInterval(rotateLogs, 3500);
    } else {
      clearInterval(logInterval);
    }
  }

  const tlEl = document.querySelector('.diag-corner-tl');
  const trEl = document.querySelector('.diag-corner-tr');
  const blEl = document.querySelector('.diag-corner-bl');
  const brEl = document.querySelector('.diag-corner-br');

  function animateLogs() {
    const now = new Date();
    tlEl.innerHTML = `
      <b>SYS::DIAGNOSTICS v2.4.1</b><br>
      <span>uptime:</span> <b>${formatUptime()}</b><br>
      <span>heap:</span>   <b>${randMB(512, 1024)} / 2048 MB</b><br>
      <span>temp:</span>   <b>${randInt(55,72)}°C</b><br>
      <span>voltage:</span><b>${(Math.random()*0.2+1.18).toFixed(3)}V</b>
    `;
    trEl.innerHTML = `
      <b>KERNEL LOG</b><br>
      <span>[${timestamp(now)}]</span> <b>IRQ ready</b><br>
      <span>[${timestamp(now)}]</span> <b>PCI enumeration OK</b><br>
      <span>[${timestamp(now)}]</span> <b>DRAM init: 4×16GB</b><br>
      <span>[${timestamp(now)}]</span> <b>ACPI tables loaded</b>
    `;
    blEl.innerHTML = `<b>// HIDDEN SYS LOG</b><br>${easterEggs[Math.floor(Math.random()*easterEggs.length)]}`;
    brEl.innerHTML = `
      <b>NET::PULSE</b><br>
      <span>packets_in:</span>  <b>${randInt(10000,99999)}</b><br>
      <span>packets_out:</span> <b>${randInt(10000,99999)}</b><br>
      <span>latency:</span>     <b>${randInt(1,4)}ms</b>
    `;
  }

  function rotateLogs() { if (active) animateLogs(); }

  function formatUptime() {
    const s = Math.floor(performance.now() / 1000);
    return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m ${s%60}s`;
  }
  function randInt(a, b) { return Math.floor(Math.random()*(b-a)+a); }
  function randMB(a, b)  { return randInt(a, b) + ' MB'; }
  function timestamp(d)  {
    return d.toTimeString().slice(0,8);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'd' || e.key === 'D') toggle();
  });
})();
