# ⚡ The Electric Pulse — Sci-Fi HUD Computer Tour

**The Electric Pulse** is a high-impact, cinematic web narrative that takes users on an immersive journey through the microscopic layers of computer hardware. Designed with a premium "Sci-Fi Cyber-Circuitry" aesthetic, this project combines cutting-edge web design, advanced interactions, and rich storytelling into a competition-ready digital experience.

---

## 🚀 Key Features

*   **Cinematic Hardware Tour:** A 6-chapter narrative exploring the Motherboard, CPU, RAM, GPU, and Storage, complete with storytelling lore cards.
*   **Sci-Fi HUD Aesthetic:** Custom UI featuring Deep Charcoal, Electric Cyan, and Acid Green palettes, glassmorphism, and custom SVG component symbols.
*   **Advanced Interactivity:**
    *   **Live System Monitor:** A floating widget simulating realtime CPU/GPU/RAM/TEMP monitoring.
    *   **CPU Inspector:** Clickable CPU cores that open a modal revealing live, oscillating GHz frequencies.
    *   **Interactive Hardware:** RAM stick "burst and refill" animations and dynamic GPU benchmark comparison bars on scroll.
    *   **Overclock Mode:** A high-intensity UI toggle that shifts the entire color palette to thermal-critical oranges, triggers warning banners, and spikes the live monitor readings.
*   **Immersive VFX & 3D:**
    *   **Boot Sequence:** A custom `Three.js` 3D scene featuring nested rotating wireframe icosahedrons and a particle neural-network.
    *   **Canvas Animations:** Smooth, requestAnimationFrame-driven GPU shaders (plasma waves) and particle systems.
*   **Easter Eggs & Audio:**
    *   Keyboard Shortcuts HUD (press `?`).
    *   Hidden web-audio drone synths (Ambient Mode).
    *   A hidden **Matrix Rain** Easter Egg unlocked via the Konami Code (`↑↑↓↓←→←→BA`).

## 🛠️ Technology Stack

*   **Core:** HTML5, CSS3 (CSS Variables, Flexbox/Grid, Glassmorphism, CSS Animations)
*   **Logic:** Vanilla JavaScript (ES6+)
*   **Animation Engine:** [GSAP](https://gsap.com/) & ScrollTrigger for high-performance scroll storytelling.
*   **3D Rendering:** [Three.js](https://threejs.org/) for the boot sequence geometry.
*   **Audio:** Native Web Audio API for synthesized ambient drones and component blips.

## 🏁 Running Locally

To run the project locally, you simply need a local web server to prevent canvas CORS issues.

1. Clone the repository.
2. Navigate to the project directory in your terminal.
3. Start a local server (e.g., using `npx http-server`):
   ```bash
   npx http-server . -p 8080 -c-1
   ```
4. Open `http://localhost:8080/index.html` in your web browser.

---

*Designed and engineered for a premium web narrative experience.*
