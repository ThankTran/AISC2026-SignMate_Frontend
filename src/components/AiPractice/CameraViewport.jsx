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
  onRetry,
  mock=false,
}) => {
  const videoRef = useRef(null);

  /* Gắn luồng webcam vào <video> (dọn sạch srcObject khi tắt) */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null;
    }
  }, [stream]);

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
            {mock?'Phiên demo':'Đang ghi hình'}
          </span>
        )}

        {mock && (isActive || isCountdown) && (
          <span className="cam-viewport__badge cam-viewport__badge--processing">
            <Sparkles size={13} strokeWidth={2} />
            Chế độ demo
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


        {/* Camera bị từ chối / lỗi */}
        {cameraError && (
          <div className="cam-viewport__error">
            <CameraOff size={28} strokeWidth={1.8} />
            <p>{cameraError}</p><p>Chrome/Edge: mở biểu tượng cài đặt cạnh địa chỉ → Quyền trang web → Camera → Cho phép. Firefox/Safari: mở cài đặt trang web và cho phép Camera.</p><button type="button" onClick={onRetry}>Thử lại</button>
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
      {confidence!=null && (isActive || isPaused) && (
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
