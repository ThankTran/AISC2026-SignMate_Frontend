import { useEffect, useRef } from "react";
import { Check, Plus } from "lucide-react";
import handImage from "../../assets/hand_v2.png";
import "./HandScene.css";

function useHandPointer(ref) {
  useEffect(() => {
    const host = ref.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 901px)");
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, time: null, activity: 0 };
    const current = { x: 0, y: 0, rx: 0, ry: 0, rz: 0 };
    let frame = 0;
    let previous = 0;

    function paint() {
      host.style.setProperty("--hand-x", `${current.x}px`);
      host.style.setProperty("--hand-y", `${current.y}px`);
      host.style.setProperty("--hand-rx", `${current.rx}deg`);
      host.style.setProperty("--hand-ry", `${current.ry}deg`);
      host.style.setProperty("--hand-rz", `${current.rz}deg`);
    }

    function tick(time) {
      const dt = previous ? Math.min((time - previous) / 1000, 0.05) : 0;

      previous = time;

      const blend =
        1 - Math.exp(-dt * (3.5 + Math.min(Math.hypot(pointer.vx, pointer.vy), 3) * 0.5));
      const targets = {
        x: pointer.x * pointer.activity * 12,
        y: pointer.y * pointer.activity * 8,
        rx: -pointer.y * pointer.activity * 4 - pointer.vy * 2,
        ry: pointer.x * pointer.activity * 7 + pointer.vx * 3,
        // Gesture velocity determines the swing, not the cursor's screen side.
        // Positive CSS rotation leans the fingertips right around the wrist.
        rz: Math.max(-45, Math.min(45, pointer.vx * 20)),
      };
      let moving = false;

      for (const key of Object.keys(current)) {
        current[key] += (targets[key] - current[key]) * blend;

        if (Math.abs(current[key]) > 0.01) {
          moving = true;
        }
      }

      pointer.vx *= Math.exp(-dt * 3);
      pointer.vy *= Math.exp(-dt * 3);
      pointer.activity *= Math.exp(-dt * 1.5);
      paint();
      frame = moving || pointer.activity > 0.001 ? requestAnimationFrame(tick) : 0;

      if (!frame) {
        previous = 0;
      }
    }

    function move(event) {
      if (event.pointerType === "touch" || motion.matches || !desktop.matches || document.hidden) {
        return;
      }

      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      const dt = pointer.time === null ? 0 : (event.timeStamp - pointer.time) / 1000;
      const clamp = (value) => Math.max(-3, Math.min(3, value));
      const blend = 1 - Math.exp(-dt * 14);

      if (dt > 0 && dt < 0.15) {
        pointer.vx += (clamp((x - pointer.x) / dt) - pointer.vx) * blend;
        pointer.vy += (clamp((y - pointer.y) / dt) - pointer.vy) * blend;
      } else {
        pointer.vx = 0;
        pointer.vy = 0;
      }

      Object.assign(pointer, { x, y, time: event.timeStamp, activity: 1 });

      if (!frame) {
        frame = requestAnimationFrame(tick);
      }
    }

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      Object.assign(pointer, { x: 0, y: 0, vx: 0, vy: 0, time: null, activity: 0 });
      for (const key of Object.keys(current)) {
        current[key] = 0;
      }

      paint();
    }

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", reset);
    document.documentElement.addEventListener("pointerleave", reset);
    document.addEventListener("visibilitychange", reset);
    motion.addEventListener("change", reset);
    desktop.addEventListener("change", reset);

    return () => {
      reset();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", reset);
      document.documentElement.removeEventListener("pointerleave", reset);
      document.removeEventListener("visibilitychange", reset);
      motion.removeEventListener("change", reset);
      desktop.removeEventListener("change", reset);
    };
  }, [ref]);
}

export default function HandScene() {
  const sceneRef = useRef(null);

  useHandPointer(sceneRef);

  return (
    <div className="hand-scene" ref={sceneRef}>
      <div className="hand-scene-shadow" aria-hidden="true" />
      <div className="hand-scene-hand">
        <div className="hand-scene-hand-float">
          <svg
            viewBox="117 48 259 413"
            role="img"
            aria-label="Bàn tay xanh mint giơ hai ngón"
            className="hand-scene-image"
          >
            <image href={handImage} width="500" height="500" />
          </svg>
        </div>
      </div>
      <div className="hand-card-slot hand-card-accuracy">
        <div className="hand-card">
          <span className="hand-card-label">Độ chính xác</span>
          <div className="hand-card-score">
            <span className="hand-card-check">
              <Check />
            </span>
            <strong>98%</strong>
          </div>
          <div className="hand-card-progress" aria-hidden="true">
            <i />
          </div>
        </div>
      </div>
      <div className="hand-card-slot hand-card-analysis">
        <div className="hand-card">
          <span className="hand-card-check">
            <Check />
          </span>
          <strong>AI Phân tích</strong>
        </div>
      </div>
      <div className="hand-card-slot hand-card-community">
        <div className="hand-card">
          <strong>Người học tích cực</strong>
          <Plus aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
