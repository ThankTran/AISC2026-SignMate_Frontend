import { Camera, CameraOff, Square } from "lucide-react";

import "./SessionControls.css";

const SessionControls = ({
  phase,
  onToggleCamera,
  onStart,
  onStop,
  cameraOn,
  disabled = false,
}) => {
  const isRunning = phase === "recording" || phase === "countdown";

  return (
    <div className="session-ctrl">
      <span className="session-ctrl__label">SESSION CONTROLS</span>

      {/* ---- Toggle buttons ---- */}
      <div className="session-ctrl__toggles">
        <button
          type="button"
          className={`session-ctrl__toggle ${
            cameraOn ? "session-ctrl__toggle--active" : "session-ctrl__toggle--off"
          }`}
          onClick={onToggleCamera}
          disabled={disabled}
          aria-label={cameraOn ? "Tắt camera" : "Bật camera"}
        >
          {cameraOn ? (
            <Camera size={16} strokeWidth={2} />
          ) : (
            <CameraOff size={16} strokeWidth={2} className="session-ctrl__toggle-off-ic" />
          )}
          {cameraOn ? "On" : "Off"}
        </button>
      </div>

      {/* ---- Primary action ---- */}
      {!isRunning ? (
        <button
          type="button"
          className="session-ctrl__primary session-ctrl__primary--start"
          onClick={onStart}
          disabled={disabled}
        >
          Bắt đầu luyện tập
        </button>
      ) : (
        <button
          type="button"
          className="session-ctrl__primary session-ctrl__primary--stop"
          onClick={onStop}
          disabled={disabled}
        >
          <Square size={16} strokeWidth={2.5} fill="currentColor" />
          Dừng luyện tập
        </button>
      )}
    </div>
  );
};

export default SessionControls;
