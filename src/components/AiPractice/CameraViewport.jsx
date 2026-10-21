import { useEffect, useRef } from "react";
import { Camera, CameraOff, CircleDot, Info, Signal, Sparkles } from "lucide-react";
import { handSign } from "../../services/handSign";

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
  framing,
  onFraming,
  mock = false,
}) => {
  const videoRef = useRef(null);

  /* Gắn luồng webcam vào <video> (dọn sạch srcObject khi tắt) */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null;
    }
  }, [stream]);

  useEffect(() => {
    if (!stream || !onFraming) return;
    let stopped = false,
      timer,
      controller;
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    const sample = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth) {
        timer = setTimeout(sample, 300);
        return;
      }
      canvas.height = Math.round((480 * video.videoHeight) / video.videoWidth);
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.7));
      if (stopped) return;
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        if (!blob) throw new Error("Chưa đọc được camera.");
        const status = await handSign.framing(blob, controller.signal);
        if (!stopped) onFraming(status);
      } catch {
        if (!stopped)
          onFraming({
            ready: false,
            message: "Chưa kiểm tra được vị trí · Đang thử kết nối lại AI…",
          });
      } finally {
        clearTimeout(timeout);
        if (!stopped) timer = setTimeout(sample, 650);
      }
    };
    void sample();
    return () => {
      stopped = true;
      clearTimeout(timer);
      controller?.abort();
    };
  }, [stream, onFraming]);

  const isActive = phase === "recording";
  const isCountdown = phase === "countdown";
  const isIdle = phase === "idle";
  const isPaused = phase === "paused";

  const confidenceLabel = confidence >= 85 ? "HIGH" : confidence >= 60 ? "MEDIUM" : "LOW";

  return (
    <div
      className={`cam-viewport ${cameraOn ? `cam-viewport--${framing?.ready ? "ready" : "adjust"}` : ""}`}
    >
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
            {mock ? "Phiên demo" : "Đang ghi hình"}
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
        <video ref={videoRef} autoPlay playsInline muted className="cam-viewport__video-element" />

        {/* Dark overlay with gradient */}
        <div className="cam-viewport__video-bg" />

        {/* Skeleton landmark canvas */}

        {/* Camera bị từ chối / lỗi */}
        {cameraError && (
          <div className="cam-viewport__error">
            <CameraOff size={28} strokeWidth={1.8} />
            <p>{cameraError}</p>
            <p>
              Chrome/Edge: mở biểu tượng cài đặt cạnh địa chỉ → Quyền trang web → Camera → Cho phép.
              Firefox/Safari: mở cài đặt trang web và cho phép Camera.
            </p>
            <button type="button" onClick={onRetry}>
              Thử lại
            </button>
          </div>
        )}

        {/* Camera tắt / chờ kích hoạt */}
        {!cameraOn && !cameraError && (
          <div className="cam-viewport__camera-off">
            <Camera size={30} strokeWidth={1.5} />
            <p>
              {phase === "processing"
                ? "Video đã gửi · AI đang chấm điểm"
                : "Nhấn Mở camera để căn chỉnh vị trí"}
            </p>
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
      {cameraOn && (
        <div className="cam-viewport__framing" role="status">
          <strong>{framing?.ready ? "Vị trí phù hợp" : "Cần căn chỉnh"}</strong>
          <span>{framing?.message || "Đang kiểm tra mặt và hai vai…"}</span>
        </div>
      )}

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
      {confidence != null && (isActive || isPaused) && (
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
