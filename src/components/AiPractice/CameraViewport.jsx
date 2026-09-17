import { useEffect, useRef } from "react";
import {
  Camera,
  CameraOff,
  CircleDot,
  Info,
  Signal,
  Sparkles,
} from "lucide-react";

import "./CameraViewport.css";

/* ===== Skeleton hand landmark paths (simulated SVG overlay) ===== */
const HAND_PATHS = [
  "M120,280 Q140,220 160,180 Q170,160 165,140",
  "M165,140 Q160,120 155,105",
  "M140,270 Q155,210 170,170 Q180,145 178,125",
  "M178,125 Q175,108 172,95",
  "M158,268 Q170,205 182,165 Q190,140 190,120",
  "M190,120 Q190,105 188,90",
  "M175,265 Q185,200 195,160 Q202,138 205,118",
  "M205,118 Q207,103 206,88",
  "M190,268 Q200,225 215,200 Q225,185 230,175",
  "M230,175 Q235,165 232,158",
  "M115,285 Q100,260 90,240 Q85,230 88,222",
];

const CameraViewport = ({
  phase,
  countdown,
  currentSign,
  signLabel,
  confidence,
  stream,
  cameraError,
  cameraOn,
  onOpenGuide,
}) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  /* Gắn luồng webcam vào <video> (dọn sạch srcObject khi tắt) */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null;
    }
  }, [stream]);

  /* Animate neon skeleton lines on canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    let raf;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (phase !== "recording" && phase !== "countdown") {
        raf = requestAnimationFrame(draw);
        return;
      }

      const t = frame * 0.02;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";

      HAND_PATHS.forEach((d, i) => {
        const alpha = 0.35 + 0.25 * Math.sin(t + i * 0.7);
        const hue = 260 + 40 * Math.sin(t * 0.5 + i);
        ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
        ctx.shadowColor = `hsla(${hue}, 90%, 60%, 0.6)`;
        ctx.shadowBlur = 8 + 4 * Math.sin(t + i);

        const offsetX = 2 * Math.sin(t * 0.8 + i * 0.5);
        const offsetY = 2 * Math.cos(t * 0.6 + i * 0.4);

        ctx.save();
        ctx.translate(offsetX, offsetY);
        const p = new Path2D(d);
        ctx.stroke(p);
        ctx.restore();
      });

      ctx.shadowBlur = 0;
      frame++;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const isActive = phase === "recording";
  const isCountdown = phase === "countdown";
  const isIdle = phase === "idle";
  const isPaused = phase === "paused";

  const confidenceLabel =
    confidence >= 85 ? "HIGH" : confidence >= 60 ? "MEDIUM" : "LOW";

  return (
    <div className="cam-viewport">
      {/* ---- Top-left status pills ---- */}
      <div className="cam-viewport__badges-top">
        {cameraOn ? (
          <span
            className={`cam-viewport__badge cam-viewport__badge--camera ${
              isIdle ? "cam-viewport__badge--waiting" : "cam-viewport__badge--active"
            }`}
          >
            <Camera size={13} strokeWidth={2.2} />
            {isIdle ? "Camera Waiting" : "Camera Active"}
          </span>
        ) : (
          <span className="cam-viewport__badge cam-viewport__badge--camera cam-viewport__badge--off">
            <CameraOff size={13} strokeWidth={2.2} />
            Camera Off
          </span>
        )}

        {isActive && (
          <span className="cam-viewport__badge cam-viewport__badge--recording">
            <span className="cam-viewport__rec-dot" />
            Recording
          </span>
        )}

        {(isActive || isCountdown) && (
          <span className="cam-viewport__badge cam-viewport__badge--processing">
            <Sparkles size={13} strokeWidth={2} />
            AI Processing...
          </span>
        )}

        {isPaused && (
          <span className="cam-viewport__badge cam-viewport__badge--paused">
            <CircleDot size={13} strokeWidth={2.2} />
            Paused
          </span>
        )}
      </div>

      {/* ---- Video / Camera area ---- */}
      <div className="cam-viewport__video">
        {/* Luồng webcam thực */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="cam-viewport__video-element"
        />

        {/* Dark overlay with gradient */}
        <div className="cam-viewport__video-bg" />

        {/* Skeleton landmark canvas */}
        <canvas
          ref={canvasRef}
          width={480}
          height={360}
          className="cam-viewport__skeleton"
        />

        {/* Camera bị từ chối / lỗi */}
        {cameraError && (
          <div className="cam-viewport__error">
            <CameraOff size={28} strokeWidth={1.8} />
            <p>{cameraError}</p>
          </div>
        )}

        {/* Camera tắt / chờ kích hoạt */}
        {!cameraOn && !cameraError && (
          <div className="cam-viewport__camera-off">
            <Camera size={30} strokeWidth={1.5} />
            <p>Nhấn Bắt đầu luyện tập để mở Camera</p>
          </div>
        )}

        {/* Centre countdown overlay */}
        {isCountdown && countdown > 0 && (
          <div className="cam-viewport__countdown" key={countdown}>
            <span className="cam-viewport__countdown-num">{countdown}</span>
          </div>
        )}

        {/* Centre "Start" prompt when idle (chỉ khi camera đã bật) */}
        {isIdle && cameraOn && !cameraError && (
          <div className="cam-viewport__idle-prompt">
            <p>Nhấn &quot;Bắt đầu&quot; để bắt đầu luyện tập</p>
          </div>
        )}

        {/* Paused overlay */}
        {isPaused && (
          <div className="cam-viewport__paused-overlay">
            <CircleDot size={42} strokeWidth={1.6} />
            <p>Tạm dừng</p>
          </div>
        )}
      </div>

      {/* ---- Bottom-left sign info (clickable -> mở đề bài) ---- */}
      <button
        type="button"
        className="cam-viewport__sign-info"
        onClick={onOpenGuide}
        aria-label="Xem hướng dẫn ký hiệu"
      >
        <span className="cam-viewport__sign-quote">&quot;{currentSign}&quot;</span>
        <span className="cam-viewport__sign-label">{signLabel}</span>
        <span className="cam-viewport__sign-icon">
          <Info size={13} strokeWidth={2.4} />
        </span>
      </button>

      {/* ---- Bottom-right confidence ---- */}
      {(isActive || isPaused) && (
        <div className="cam-viewport__confidence">
          <span className="cam-viewport__conf-label">CONF</span>
          <Signal
            size={15}
            strokeWidth={2.2}
            className={`cam-viewport__conf-icon cam-viewport__conf-icon--${confidenceLabel.toLowerCase()}`}
          />
          <span
            className={`cam-viewport__conf-value cam-viewport__conf-value--${confidenceLabel.toLowerCase()}`}
          >
            {confidenceLabel}
          </span>
        </div>
      )}
    </div>
  );
};

export default CameraViewport;