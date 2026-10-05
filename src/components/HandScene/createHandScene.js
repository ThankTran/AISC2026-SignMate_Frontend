import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";

// A smooth solid model inspired by the supplied mint hand reference.
// The implicit surface joins the palm and five fingers without visible seams.
function createHand(material) {
  const resolution = 72;
  const extent = 2.5;
  const hand = new MarchingCubes(resolution, material, false, false, 60000);

  hand.isolation = 0;
  hand.scale.setScalar(extent);

  const fingers = [
    [-0.57, 0.05, -0.66, 1.52, 0.185],
    [-0.15, 0.16, -0.15, 1.83, 0.19],
    [0.28, 0.13, 0.34, 1.61, 0.18],
    [0.65, -0.05, 0.83, 1.16, 0.155],
    [-0.52, -0.6, -1.3, 0.16, 0.22],
  ];

  function smoothUnion(a, b, k) {
    const h = Math.max(k - Math.abs(a - b), 0) / k;

    return Math.min(a, b) - h * h * k * 0.25;
  }

  for (let z = 0; z < resolution; z++) {
    const pz = ((z / resolution) * 2 - 1) * extent;

    for (let y = 0; y < resolution; y++) {
      const py = ((y / resolution) * 2 - 1) * extent;

      for (let x = 0; x < resolution; x++) {
        const px = ((x / resolution) * 2 - 1) * extent;
        // Rounded palm with a gently tapered base; the front has real volume.
        let d =
          (Math.sqrt((px / 0.79) ** 2 + ((py + 0.51) / 0.99) ** 2 + (pz / 0.34) ** 2) - 1) * 0.34;

        for (const [ax, ay, bx, by, radius] of fingers) {
          const dx = bx - ax;
          const dy = by - ay;
          const t = THREE.MathUtils.clamp(
            ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy),
            0,
            1,
          );
          const finger =
            Math.sqrt((px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2 + (pz * 1.13) ** 2) -
            radius;

          d = smoothUnion(d, finger, 0.14);
        }

        hand.field[x + y * resolution + z * resolution * resolution] = -d;
      }
    }
  }

  hand.update();

  return hand;
}

export function createHandScene(host, onContextLost) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 30);

  camera.position.set(0, 0.15, 10);
  camera.lookAt(0, 0.15, 0);
  scene.add(new THREE.HemisphereLight(0xf2fff9, 0x52765e, 2.6));

  const key = new THREE.DirectionalLight(0xfff5e6, 3.5);

  key.position.set(-3, 5, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xc5e6ff, 2.4);

  rim.position.set(3, 2, -2);
  scene.add(rim);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0x73cba4,
    roughness: 0.48,
    metalness: 0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.65,
  });
  const hand = createHand(material);
  const wrist = new THREE.Group();

  hand.position.y = 1.25;
  wrist.position.y = -1.25;
  wrist.add(hand);
  scene.add(wrist);
  host.appendChild(renderer.domElement);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let paused = false;
  let visible = true;
  let lost = false;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  const pointer = { x: 0, y: 0, vx: 0, vy: 0, activity: 0, time: null };

  function resetPointer() {
    pointer.x = 0;
    pointer.y = 0;
    pointer.vx = 0;
    pointer.vy = 0;
    pointer.activity = 0;
    pointer.time = null;
  }

  function render() {
    renderer.render(scene, camera);
  }

  function tick(time) {
    frame = 0;

    if (paused || reducedMotion.matches || !visible || document.hidden || lost) {
      return;
    }

    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;

    lastTime = time;
    elapsed += delta;

    // Velocity is measured in viewport widths/heights per second, independent
    // of mouse event frequency. Fast gestures respond more promptly.
    const speed = Math.min(Math.hypot(pointer.vx, pointer.vy), 3);
    const blend = 1 - Math.exp(-delta * (5 + speed * 4));
    const followX = pointer.x * pointer.activity;
    const followY = pointer.y * pointer.activity;
    const yaw = THREE.MathUtils.clamp(followX * 0.2 + pointer.vx * 0.1, -0.45, 0.45);
    const pitch = THREE.MathUtils.clamp(followY * 0.12 + pointer.vy * 0.06, -0.22, 0.22);
    const roll = THREE.MathUtils.clamp(-pointer.vx * 0.055, -0.14, 0.14);

    wrist.rotation.y += (yaw + Math.sin(elapsed * 0.65) * 0.06 - wrist.rotation.y) * blend;
    wrist.rotation.x += (pitch - 0.06 - wrist.rotation.x) * blend;
    wrist.rotation.z += (roll + Math.sin(elapsed * 1.5) * 0.04 - wrist.rotation.z) * blend;
    wrist.position.x += (followX * 0.16 - wrist.position.x) * blend;
    wrist.position.y +=
      (-1.25 - followY * 0.12 + Math.sin(elapsed * 1.05) * 0.055 - wrist.position.y) * blend;

    const decay = Math.exp(-delta * 5);

    pointer.vx *= decay;
    pointer.vy *= decay;
    pointer.activity *= Math.exp(-delta * 1.5);
    render();
    frame = requestAnimationFrame(tick);
  }

  function syncMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    resetPointer();

    if (reducedMotion.matches) {
      wrist.rotation.set(0, 0, 0);
      wrist.position.set(0, -1.25, 0);

      if (!lost) {
        render();
      }
    }

    if (!paused && !reducedMotion.matches && visible && !document.hidden && !lost) {
      frame = requestAnimationFrame(tick);
    }
  }

  function resize() {
    resetPointer();

    const { width, height } = host.getBoundingClientRect();

    if (!width || !height || lost) {
      return;
    }

    const aspect = width / height;
    const halfHeight = Math.max(2.6, 2.1 / aspect);

    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
  }

  function move(event) {
    if (
      event.pointerType === "touch" ||
      paused ||
      reducedMotion.matches ||
      !visible ||
      document.hidden ||
      lost
    ) {
      return;
    }

    const x = THREE.MathUtils.clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1);
    const y = THREE.MathUtils.clamp((event.clientY / window.innerHeight) * 2 - 1, -1, 1);
    const dt = pointer.time === null ? 0 : (event.timeStamp - pointer.time) / 1000;

    if (dt > 0 && dt < 0.15) {
      const sampleBlend = 1 - Math.exp(-dt * 30);
      const vx = THREE.MathUtils.clamp((x - pointer.x) / dt, -3, 3);
      const vy = THREE.MathUtils.clamp((y - pointer.y) / dt, -3, 3);

      pointer.vx += (vx - pointer.vx) * sampleBlend;
      pointer.vy += (vy - pointer.vy) * sampleBlend;
    } else {
      pointer.vx = 0;
      pointer.vy = 0;
    }

    pointer.x = x;
    pointer.y = y;
    pointer.time = event.timeStamp;
    pointer.activity = 1;
  }

  function contextLost(event) {
    event.preventDefault();
    lost = true;
    syncMotion();
    renderer.domElement.style.visibility = "hidden";
    onContextLost();
  }

  const observer = new ResizeObserver(resize);

  observer.observe(host);

  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncMotion();
  });

  intersection.observe(host);
  window.addEventListener("pointermove", move, { passive: true });
  document.documentElement.addEventListener("pointerleave", resetPointer);
  window.addEventListener("blur", resetPointer);
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  reducedMotion.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", syncMotion);
  resize();
  syncMotion();

  return {
    setPaused(value) {
      paused = value;
      syncMotion();
    },
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("blur", resetPointer);
      reducedMotion.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncMotion);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      hand.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
