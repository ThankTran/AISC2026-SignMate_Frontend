import { useEffect, useRef, useState } from "react";
import { Check, Sparkles, Users, Languages, Plus } from "lucide-react";
import handImage from "../../assets/hand_v2.png";
import "./HandScene.css";

function useHandPointer(ref) {
  useEffect(() => {
    const host = ref.current;
    if (!host) return;

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
        x: pointer.x * pointer.activity * 10,
        y: pointer.y * pointer.activity * 7,
        rx: -pointer.y * pointer.activity * 3.5 - pointer.vy * 1.8,
        ry: pointer.x * pointer.activity * 6 + pointer.vx * 2.5,
        rz: Math.max(-40, Math.min(40, pointer.vx * 18)),
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

function useAnimatedScore(target = 98, duration = 1400) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setScore(Math.round(ease * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    const frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return score;
}

// Hệ thống hạt bụi sáng lấp lánh (Particle Glow) phân bổ quanh dải quỹ đạo & 4 thẻ
const STARDUST_PARTICLES = [
  // Nhóm quanh Thẻ 1 (Độ chính xác - Trên trái)
  { top: "12%", left: "24%", size: 6, color: "emerald", delay: "0s", duration: "4.8s", anim: "twinkle-drift-1" },
  { top: "8%", left: "14%", size: 4, color: "mint", delay: "1.2s", duration: "5.5s", anim: "twinkle-drift-2" },
  { top: "24%", left: "18%", size: 5, color: "cyan", delay: "2.1s", duration: "6.2s", anim: "twinkle-drift-3" },

  // Nhóm quanh Thẻ 2 (AI Phân tích - Dưới trái)
  { top: "68%", left: "16%", size: 5, color: "mint", delay: "0.5s", duration: "5.2s", anim: "twinkle-drift-1" },
  { top: "86%", left: "12%", size: 6, color: "emerald", delay: "1.8s", duration: "5.8s", anim: "twinkle-drift-3" },
  { top: "78%", left: "26%", size: 4, color: "cyan", delay: "2.9s", duration: "4.9s", anim: "twinkle-drift-2" },

  // Nhóm quanh Thẻ 3 (Người học tích cực - Trên phải)
  { top: "10%", left: "74%", size: 5, color: "cyan", delay: "0.8s", duration: "5.6s", anim: "twinkle-drift-2" },
  { top: "22%", left: "80%", size: 6, color: "emerald", delay: "2.4s", duration: "6.0s", anim: "twinkle-drift-1" },
  { top: "16%", left: "62%", size: 4, color: "gold", delay: "1.5s", duration: "5.1s", anim: "twinkle-drift-3" },

  // Nhóm quanh Thẻ 4 (Luyện tập 1-on-1 - Dưới phải)
  { top: "70%", left: "76%", size: 5, color: "emerald", delay: "0.3s", duration: "5.4s", anim: "twinkle-drift-3" },
  { top: "84%", left: "82%", size: 6, color: "mint", delay: "2.2s", duration: "5.9s", anim: "twinkle-drift-1" },
  { top: "76%", left: "65%", size: 4, color: "cyan", delay: "1.1s", duration: "6.3s", anim: "twinkle-drift-2" },

  // Nhóm dọc theo dải quỹ đạo & quanh bàn tay trung tâm
  { top: "34%", left: "32%", size: 5, color: "mint", delay: "0.7s", duration: "5.0s", anim: "twinkle-drift-2" },
  { top: "32%", left: "62%", size: 6, color: "gold", delay: "1.9s", duration: "5.7s", anim: "twinkle-drift-1" },
  { top: "44%", left: "24%", size: 5, color: "cyan", delay: "2.8s", duration: "6.1s", anim: "twinkle-drift-3" },
  { top: "46%", left: "72%", size: 5, color: "emerald", delay: "1.4s", duration: "5.3s", anim: "twinkle-drift-1" },
  { top: "58%", left: "30%", size: 4, color: "gold", delay: "0.9s", duration: "4.7s", anim: "twinkle-drift-2" },
  { top: "60%", left: "68%", size: 6, color: "mint", delay: "2.6s", duration: "6.4s", anim: "twinkle-drift-3" },
  { top: "26%", left: "48%", size: 5, color: "cyan", delay: "3.2s", duration: "5.6s", anim: "twinkle-drift-1" },
  { top: "68%", left: "48%", size: 5, color: "emerald", delay: "1.7s", duration: "5.2s", anim: "twinkle-drift-2" },
];

export default function HandScene() {
  const sceneRef = useRef(null);
  const score = useAnimatedScore(98, 1400);

  useHandPointer(sceneRef);

  return (
    <div className="hand-scene" ref={sceneRef}>
      {/* 5. Ambient Blur Orbs (Chuyển động cực kỳ chậm ở phía xa) */}
      <div className="hand-ambient-glows" aria-hidden="true">
        <div className="hand-orb orb-emerald" />
        <div className="hand-orb orb-cyan" />
        <div className="hand-orb orb-teal" />
      </div>

      {/* 2. Dải quỹ đạo phát sáng 3D chuyển động xoay quanh bàn tay (Parallax & Gentle Motion) */}
      <div className="hand-orbits-container" aria-hidden="true">
        <div className="hand-orbit-ring orbit-ring-1">
          <div className="hand-orbit-ellipse ellipse-1" />
          <div className="orbit-spark spark-1" />
        </div>
        <div className="hand-orbit-ring orbit-ring-2">
          <div className="hand-orbit-ellipse ellipse-2" />
          <div className="orbit-spark spark-2" />
        </div>
        <div className="hand-orbit-ring orbit-ring-3">
          <div className="hand-orbit-ellipse ellipse-3" />
          <div className="orbit-spark spark-3" />
        </div>
      </div>

      {/* 4. Đốm chấm sáng li ti mờ ảo (Particle Glow & Stardust Twinkle) */}
      <div className="hand-particles-layer" aria-hidden="true">
        {STARDUST_PARTICLES.map((p, idx) => (
          <span
            key={idx}
            className={`hand-stardust-dot dot-${p.color} dot-anim-${p.anim}`}
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* 1. Bàn tay 3D trung tâm (Không còn các chữ cái hay emoji bừa bộn) */}
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

      {/* 3. Phân bổ đều 4 thẻ thông tin xung quanh bàn tay */}

      {/* Thẻ 1: Phía trên bên trái - Độ chính xác 98% */}
      <div className="hand-card-slot hand-card-accuracy">
        <div className="hand-card">
          <div className="hand-card-sparks" aria-hidden="true">
            <span className="card-spark sp-1" />
            <span className="card-spark sp-2" />
          </div>
          <span className="hand-card-label">Độ chính xác</span>
          <div className="hand-card-score">
            <span className="hand-card-check">
              <Check size={14} />
            </span>
            <strong>{score}%</strong>
          </div>
          <div className="hand-card-progress" aria-hidden="true">
            <i style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>

      {/* Thẻ 2: Phía dưới bên trái - AI Phân tích */}
      <div className="hand-card-slot hand-card-analysis">
        <div className="hand-card">
          <div className="hand-card-sparks" aria-hidden="true">
            <span className="card-spark sp-1" />
            <span className="card-spark sp-2" />
          </div>
          <span className="hand-card-check check-emerald">
            <Sparkles size={14} />
          </span>
          <div className="hand-card-text-block">
            <strong>AI Phân tích</strong>
            <small>Nhận diện cử chỉ tức thì</small>
          </div>
        </div>
      </div>

      {/* Thẻ 3: Phía trên bên phải - Người học tích cực */}
      <div className="hand-card-slot hand-card-community">
        <div className="hand-card">
          <div className="hand-card-sparks" aria-hidden="true">
            <span className="card-spark sp-1" />
            <span className="card-spark sp-2" />
          </div>
          <span className="hand-card-check check-teal">
            <Users size={14} />
          </span>
          <div className="hand-card-text-block">
            <strong>Người học tích cực</strong>
            <small>Cộng đồng học mỗi ngày</small>
          </div>
          <Plus size={14} className="hand-card-plus" aria-hidden="true" />
        </div>
      </div>

      {/* Thẻ 4: Phía dưới bên phải - Dịch thuật VSL */}
      <div className="hand-card-slot hand-card-practice">
        <div className="hand-card">
          <div className="hand-card-sparks" aria-hidden="true">
            <span className="card-spark sp-1" />
            <span className="card-spark sp-2" />
          </div>
          <span className="hand-card-check check-translate">
            <Languages size={14} />
          </span>
          <div className="hand-card-text-block">
            <strong>Dịch thuật VSL</strong>
            <small>Chuyển ngữ ký hiệu tức thì</small>
          </div>
        </div>
      </div>
    </div>
  );
}
