import { useEffect, useRef, useState } from "react";
import CallButton from "./CallButton";
import { VIDEO_DEMO } from "../../services/videoCall/config";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Mic,
  RefreshCw,
} from "lucide-react";

export default function DeviceCheck({ onReady, onBack }) {
  const video = useRef(null),
    stream = useRef(null),
    generation = useRef(0);
  const [devices, setDevices] = useState([]),
    [device, setDevice] = useState(""),
    [mic, setMic] = useState(false),
    [ready, setReady] = useState(false),
    [error, setError] = useState("");

  useEffect(
    () => () => {
      generation.current++;
      stream.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  async function check(id = device) {
    const request = ++generation.current;

    setReady(false);
    setError("");
    stream.current?.getTracks().forEach((track) => track.stop());

    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: id ? { deviceId: { exact: id } } : true,
        audio: false,
      });

      if (request !== generation.current) {
        media.getTracks().forEach((track) => track.stop());

        return;
      }

      stream.current = media;

      if (video.current) {
        video.current.srcObject = media;
      }

      setDevices(
        (await navigator.mediaDevices.enumerateDevices()).filter(
          (item) => item.kind === "videoinput",
        ),
      );
      setReady(true);
    } catch {
      setError(
        "Không thể mở camera. Vui lòng cấp quyền Camera trong cài đặt trình duyệt rồi bấm 'Thử lại'.",
      );
    }
  }

  return (
    <section className="vc-panel vc-device-check vc-enter">
      <div className="vc-device-header">
        <span className="vc-eyebrow">CHUẨN BỊ TRƯỚC CUỘC GỌI</span>
        <h1 className="text-h1">Kiểm tra camera & vùng ký hiệu</h1>
        <p className="vc-device-subtitle">
          Để cuộc đối thoại diễn ra trọn vẹn, hãy căn chỉnh camera sao cho khuôn mặt và hai bàn tay của bạn luôn nằm trong khung hình.
        </p>
      </div>

      {/* Video Preview Container with Signing Space Guide */}
      <div className="vc-device-stage">
        <video
          ref={video}
          muted
          autoPlay
          playsInline
          className={`vc-device-video ${ready ? "is-ready" : ""}`}
        />

        {/* Visual Framing Guide Overlay for Sign Language */}
        <div className="vc-framing-guide" aria-hidden="true">
          <div className="vc-guide-corner vc-corner-tl" />
          <div className="vc-guide-corner vc-corner-tr" />
          <div className="vc-guide-corner vc-corner-bl" />
          <div className="vc-guide-corner vc-corner-br" />

          {/* Silhouette contour representing head, shoulders and signing space */}
          <div className="vc-guide-silhouette">
            <div className="vc-guide-head" />
            <div className="vc-guide-hands-zone">
              <span>Vùng chuyển động hai tay</span>
            </div>
          </div>

          <div className="vc-guide-pill">
            <Camera size={13} />
            <span>Khung hình chuẩn: Đầu, vai và hai bàn tay</span>
          </div>
        </div>

        {ready && (
          <div className="vc-device-live-badge">
            <CheckCircle2 size={15} />
            <span>Camera đã sẵn sàng</span>
          </div>
        )}

        {!ready && !error && (
          <div className="vc-device-prompt-overlay">
            <div className="vc-prompt-icon">
              <Camera size={32} />
            </div>
            <p>Bấm &ldquo;Bật camera kiểm tra&rdquo; bên dưới để kiểm tra góc quay và ánh sáng</p>
          </div>
        )}
      </div>

      {/* Device controls & options */}
      <div className="vc-device-controls-box">
        <div className="vc-device-field">
          <label htmlFor="camera-select" className="vc-field-label">
            <Camera size={16} /> Chọn thiết bị camera
          </label>
          <div className="vc-select-wrapper">
            <select
              id="camera-select"
              value={device}
              className="vc-select"
              onChange={(event) => {
                setDevice(event.target.value);
                void check(event.target.value);
              }}
            >
              <option value="">Camera mặc định của hệ thống</option>
              {devices.map((item) => (
                <option key={item.deviceId} value={item.deviceId}>
                  {item.label || `Camera ${item.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="vc-checkbox-label">
          <input
            type="checkbox"
            checked={mic}
            className="vc-checkbox"
            onChange={(event) => setMic(event.target.checked)}
          />
          <span className="vc-checkbox-custom" />
          <span className="vc-checkbox-text">
            <Mic size={15} /> Bật micro kèm âm thanh khi vào phòng (tùy chọn)
          </span>
        </label>
      </div>

      {error && (
        <div className="vc-device-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="vc-device-actions">
        <button type="button" className="vc-btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <button type="button" className="vc-btn-action" onClick={() => check()}>
          <RefreshCw size={15} />
          {error ? "Thử lại quyền camera" : ready ? "Kiểm tra lại camera" : "Bật camera kiểm tra"}
        </button>

        <CallButton
          disabled={!ready}
          className="vc-btn-primary"
          onClick={() => onReady({ deviceId: device, mic })}
        >
          Vào phòng luyện tập <ArrowRight size={16} />
        </CallButton>
      </div>

      {VIDEO_DEMO && (
        <div className="vc-demo-bypass-wrapper">
          <button
            type="button"
            className="vc-demo-bypass-btn"
            onClick={() => onReady({ camera: false, mic: false })}
          >
            <Sparkles size={14} /> Vào phòng giả lập không cần camera (Chế độ Demo)
          </button>
        </div>
      )}
    </section>
  );
}
