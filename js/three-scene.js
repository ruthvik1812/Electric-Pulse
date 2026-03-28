/* three-scene.js — Three.js Boot 3D Visualization */
(function () {
  if (typeof THREE === 'undefined') return;

  const bootSection = document.getElementById('boot');
  if (!bootSection) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'three-boot-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  bootSection.appendChild(canvas);

  // Replace CSS arc-reactor with Three.js scene
  const arcEl = bootSection.querySelector('.arc-reactor');
  if (arcEl) arcEl.style.display = 'none';

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(2.5, 0, 8);

  function makeIco(r, d, hex, op) {
    const m = new THREE.Mesh(
      new THREE.IcosahedronGeometry(r, d),
      new THREE.MeshBasicMaterial({ color: hex, wireframe: true, transparent: true, opacity: op })
    );
    m.position.set(2.5, 0, 0);
    scene.add(m);
    return m;
  }

  const ico1 = makeIco(2.4, 2, 0x00F2FF, 0.28);
  const ico2 = makeIco(1.6, 1, 0xA855F7, 0.36);
  const ico3 = makeIco(0.9, 0, 0xEC4899, 0.44);

  // Particle field
  const N = 200, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random()-.5)*13;
    pos[i*3+1] = (Math.random()-.5)*8;
    pos[i*3+2] = (Math.random()-.5)*5-1;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size:.045, color:0x00F2FF, transparent:true, opacity:.5 })));

  // Connecting lines
  const lPts = [];
  for (let i=0;i<N;i++) for (let j=i+1;j<N;j++) {
    const dx=pos[i*3]-pos[j*3], dy=pos[i*3+1]-pos[j*3+1], dz=pos[i*3+2]-pos[j*3+2];
    if (dx*dx+dy*dy+dz*dz < 4.8) lPts.push(pos[i*3],pos[i*3+1],pos[i*3+2],pos[j*3],pos[j*3+1],pos[j*3+2]);
  }
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.Float32BufferAttribute(lPts, 3));
  scene.add(new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ color:0x00F2FF, transparent:true, opacity:.07 })));

  let mx=0, my=0, t=0;
  document.addEventListener('mousemove', e => { mx=(e.clientX/innerWidth-.5); my=(e.clientY/innerHeight-.5); }, {passive:true});

  function animate() {
    requestAnimationFrame(animate);
    t += .006;
    ico1.rotation.set(t*.18+my*.12, t*.32+mx*.12, 0);
    ico2.rotation.set(-t*.28-my*.09, t*.22+mx*.10, 0);
    ico3.rotation.set(t*.44, -t*.38+mx*.07, 0);
    renderer.render(scene, camera);
  }
  animate();

  function resize() {
    const w=bootSection.offsetWidth||innerWidth, h=bootSection.offsetHeight||innerHeight;
    camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
  }
  resize();
  window.addEventListener('resize', resize, {passive:true});
})();
