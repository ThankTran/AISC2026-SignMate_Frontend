import { useEffect, useRef, useState } from "react";

import {
  Clock,
  Hand,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

import "./VideoPlayerFrame.css";

const DEFAULT_DURATION = 28;
const DEFAULT_INITIAL_TIME = 7;
const DEFAULT_SPEEDS = [0.5, 1, 1.5];

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const VideoPlayerFrame = ({
  videoUrl,
  thumbLabel = "Ký hiệu: Lời chào",
  icon = <Hand size={44} strokeWidth={1.6} />,
  duration = DEFAULT_DURATION,
  initialTime = DEFAULT_INITIAL_TIME,
  speeds = DEFAULT_SPEEDS,
  slowMo = false,
  replayLabel = "Xem lại",
  onPlayStateChange,
}) => {
  const [speed, setSpeed] = useState(1);
  const [slowmo, setSlowmo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [replaySpin, setReplaySpin] = useState(0);
  const [showReplayToast, setShowReplayToast] = useState(false);
  const [seekTooltip, setSeekTooltip] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  const seekBarRef = useRef(null);
  const toastTimer = useRef(null);
  const hoverIgnoreUntil = useRef(0);

  const progressPct = (currentTime / duration) * 100;
  const ended = currentTime >= duration;

  useEffect(() => {
    onPlayStateChange?.(isPlaying);
  }, [isPlaying, onPlayStateChange]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  useEffect(() => {
    if (!isPlaying) return undefined;
    const t = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.25;
        return next >= duration ? duration : next;
      });
    }, 250);
    return () => clearInterval(t);
  }, [isPlaying, duration]);

  const centerVisible = !isPlaying || hovering;

  const handlePlayerMouseMove = () => {
    if (!isPlaying) return;
    if (Date.now() < hoverIgnoreUntil.current) return;
    setHovering(true);
  };

  const handlePlayerMouseLeave = () => {
    setHovering(false);
  };

  const handlePlayPause = () => {
    if (ended) {
      setCurrentTime(0);
      setIsPlaying(true);
      setHovering(false);
      hoverIgnoreUntil.current = Date.now() + 700;
      return;
    }
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      setHovering(false);
      hoverIgnoreUntil.current = Date.now() + 700;
    }
  };

  const handleReplay = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    setHovering(false);
    hoverIgnoreUntil.current = Date.now() + 700;
    setReplaySpin((k) => k + 1);

    if (toastTimer.current) clearTimeout(toastTimer.current);
    setShowReplayToast(true);
    toastTimer.current = setTimeout(() => {
      setShowReplayToast(false);
    }, 2200);
  };

  const seekFromClientX = (clientX) => {
    const rect = seekBarRef.current.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (clientX - rect.left) / rect.width)
    );
    return { x: ratio * 100, time: ratio * duration };
  };

  const handleSeekMouseMove = (e) => {
    const { x, time } = seekFromClientX(e.clientX);
    setSeekTooltip({ x, time });
    if (dragging) setCurrentTime(time);
  };

  const handleSeekMouseEnter = (e) => {
    const { x, time } = seekFromClientX(e.clientX);
    setSeekTooltip({ x, time });
  };

  const handleSeekMouseLeave = () => {
    if (!dragging) setSeekTooltip(null);
  };

  const handleSeekPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    const { x, time } = seekFromClientX(e.clientX);
    setSeekTooltip({ x, time });
    setCurrentTime(time);
  };

  const handleSeekPointerUp = () => setDragging(false);

  const handleSeekPointerMove = (e) => {
    const { x, time } = seekFromClientX(e.clientX);
    setSeekTooltip({ x, time });
    if (dragging) setCurrentTime(time);
  };

  return (
    <div className="vp-frame" data-video-src={videoUrl}>
      {videoUrl && (
        <video
          className="vp-frame__video"
          src={videoUrl}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      )}

      <div
        className="vp-frame__player"
        onMouseMove={handlePlayerMouseMove}
        onMouseLeave={handlePlayerMouseLeave}
      >
        <div
          className="vp-frame__thumb"
          onClick={handlePlayPause}
        >
          <div className="vp-frame__thumb-icon">{icon}</div>
          <span className="vp-frame__thumb-label">{thumbLabel}</span>

          <button
            type="button"
            className={`vp-frame__center-btn ${
              centerVisible ? "" : "vp-frame__center-btn--hidden"
            } ${isPlaying && !ended ? "vp-frame__center-btn--pause" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
            aria-label={isPlaying && !ended ? "Tạm dừng" : "Phát video"}
          >
            {isPlaying && !ended ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" />
            )}
          </button>

          {showReplayToast && (
            <div className="vp-frame__toast" role="status">
              <RotateCcw
                size={14}
                strokeWidth={2.5}
                className="vp-frame__toast-icon"
              />
              Đang phát lại từ đầu...
            </div>
          )}
        </div>

        <div className="vp-frame__seek">
          <div
            ref={seekBarRef}
            className="vp-frame__seek-bar"
            onMouseMove={handleSeekMouseMove}
            onMouseEnter={handleSeekMouseEnter}
            onMouseLeave={handleSeekMouseLeave}
            onPointerDown={handleSeekPointerDown}
            onPointerUp={handleSeekPointerUp}
            onPointerMove={handleSeekPointerMove}
            role="slider"
            aria-label="Thanh tiến trình video"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
          >
            <div
              className="vp-frame__seek-fill"
              style={{ width: `${progressPct}%` }}
            />
            <span
              className="vp-frame__seek-knob"
              style={{ left: `${progressPct}%` }}
            />

            {seekTooltip && (
              <span
                className="vp-frame__seek-tooltip"
                style={{ left: `${seekTooltip.x}%` }}
              >
                {formatTime(seekTooltip.time)}
              </span>
            )}
          </div>

          <span className="vp-frame__seek-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="vp-frame__controls">
        <div className="vp-frame__speeds">
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              className={`vp-frame__speed ${
                speed === s && !slowmo ? "vp-frame__speed--active" : ""
              }`}
              onClick={() => {
                setSpeed(s);
                setSlowmo(false);
              }}
            >
              {s}x
            </button>
          ))}
        </div>

        {slowMo && (
          <button
            type="button"
            className={`vp-frame__btn ${
              slowmo ? "vp-frame__btn--active" : ""
            }`}
            onClick={() => setSlowmo((v) => !v)}
          >
            <Clock size={15} strokeWidth={2} />
            Slow-mo
          </button>
        )}

        <button
          type="button"
          className={`vp-frame__btn ${
            showReplayToast ? "vp-frame__btn--flash" : ""
          }`}
          onClick={handleReplay}
        >
          <RotateCcw
            key={replaySpin}
            size={15}
            strokeWidth={2}
            className="vp-frame__btn-spin"
          />
          {replayLabel}
        </button>
      </div>
    </div>
  );
};

export default VideoPlayerFrame;