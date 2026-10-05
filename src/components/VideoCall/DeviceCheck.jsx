import { useEffect, useRef, useState } from "react";
import CallButton from "./CallButton";
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
        "Không thể mở camera. Mở quyền trang web cạnh thanh địa chỉ, chọn Camera → Cho phép, rồi thử lại.",
      );
    }
  }

  return (
    <section className="vc-panel vc-device-check">
      <h1 className="text-h1">Kiểm tra thiết bị</h1>
      <video
        ref={video}
        muted
        autoPlay
        playsInline
        style={{
          width: "100%",
          maxHeight: 320,
          transform: "scaleX(-1)",
          background: "var(--color-neutral-100)",
          borderRadius: 12,
        }}
      />
      <p>
        Đặt camera ngang tầm mắt, hướng ánh sáng về phía bạn và giữ cả hai tay trong khung hình.
      </p>
      <label>
        Camera
        <select
          value={device}
          onChange={(event) => {
            setDevice(event.target.value);
            void check(event.target.value);
          }}
        >
          <option value="">Camera mặc định</option>
          {devices.map((item) => (
            <option key={item.deviceId} value={item.deviceId}>
              {item.label || "Camera"}
            </option>
          ))}
        </select>
      </label>
      <label>
        <input type="checkbox" checked={mic} onChange={(event) => setMic(event.target.checked)} />{" "}
        Bật micro khi vào phòng (tùy chọn)
      </label>
      {error && <p role="alert">{error}</p>}
      <div className="vc-actions">
        <button type="button" onClick={onBack}>
          Quay lại
        </button>
        <button type="button" onClick={() => check()}>
          {error ? "Thử lại" : "Bật camera kiểm tra"}
        </button>
        <CallButton disabled={!ready} onClick={() => onReady({ deviceId: device, mic })}>
          Vào phòng
        </CallButton>
      </div>
    </section>
  );
}
