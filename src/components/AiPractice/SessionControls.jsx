import { Camera, CameraOff, Mic, MicOff, Square } from "lucide-react";

import "./SessionControls.css";

const SessionControls = ({
  phase,
  onToggleCamera,
  onToggleMic,
  onStart,
  onStop,
  cameraOn,
  micOn,
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
          aria-label={cameraOn ? "Tắt camera" : "Bật camera"}
        >
          {cameraOn ? (
            <Camera size={16} strokeWidth={2} />
          ) : (
            <CameraOff
              size={16}
              strokeWidth={2}
              className="session-ctrl__toggle-off-ic"
            />
          )}
          {cameraOn ? "On" : "Off"}
        </button>

        <button
          type="button"
          className={`session-ctrl__toggle ${
            micOn ? "session-ctrl__toggle--active" : "session-ctrl__toggle--off"
          }`}
          onClick={onToggleMic}
          aria-label={micOn ? "Tắt mic" : "Bật mic"}
        >
          {micOn ? (
            <Mic size={16} strokeWidth={2} />
          ) : (
            <MicOff
              size={16}
              strokeWidth={2}
              className="session-ctrl__toggle-off-ic"
            />
          )}
          Mic {micOn ? "On" : "Off"}
        </button>
      </div>

      {/* ---- Primary action ---- */}
      {!isRunning ? (
        <button
          type="button"
          className="session-ctrl__primary session-ctrl__primary--start"
          onClick={onStart}
        >
          Bắt đầu luyện tập
        </button>
      ) : (
        <button
          type="button"
          className="session-ctrl__primary session-ctrl__primary--stop"
          onClick={onStop}
        >
          <Square size={16} strokeWidth={2.5} fill="currentColor" />
          Dừng luyện tập
        </button>
      )}
    </div>
  );
};

export default SessionControls;