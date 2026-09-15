import { useEffect, useRef, useState } from "react";

import {
  Clock,
  Hand,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

import "./MediaView.css";

const DURATION = 28;
const INITIAL_TIME = 7;

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const SPEEDS = [0.5, 1, 1.5];

const MediaView = () => {
  const [speed, setSpeed] = useState(1);
  const [slowmo, setSlowmo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(INITIAL_TIME);
  const [replaySpin, setReplaySpin] = useState(0);
  const [showReplayToast, setShowReplayToast] = useState(false);
  const [seekTooltip, setSeekTooltip] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  const seekBarRef = useRef(null);
  const toastTimer = useRef(null);
  const hoverIgnoreUntil = useRef(0);

  const progressPct = (currentTime / DURATION) * 100;
  const ended = currentTime >= DURATION;

  /* ---- Auto-hide cleanup ---- */
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  /* ---- Simulated playback timer ---- */
  useEffect(() => {
    if (!isPlaying) return undefined;
    const t = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.25;
        return next >= DURATION ? DURATION : next;
      });
    }, 250);
    return () => clearInterval(t);
  }, [isPlaying]);

  /* ---- Centre overlay helpers ----
     Nút giữa hiển thị khi: tạm dừng / lần đầu tải (luôn) HOẶC
     đang phát mà có chuột di qua video. Sau khi bấm phát, có
     một khoảng "mặc định ẩn" ngắn để nút lập tức biến mất. */
  const centerVisible = !isPlaying || hovering;

  const handlePlayerMouseMove = () => {
    if (!isPlaying) return;
    if (Date.now() < hoverIgnoreUntil.current) return;
    setHovering(true);
  };

  const handlePlayerMouseLeave = () => {
    setHovering(false);
  };

  /* ---- Play / Pause ---- */
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

  /* ---- Replay from start ---- */
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

  /* ---- Seekbar ---- */
  const seekFromClientX = (clientX) => {
    const rect = seekBarRef.current.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (clientX - rect.left) / rect.width)
    );
    return { x: ratio * 100, time: ratio * DURATION };
  };

  /* Hover / move (tracks mouse even when not dragging) */
  const handleSeekMouseMove = (e) => {
    const { x, time } = seekFromClientX(e.clientX);
    setSeekTooltip({ x, time });
    if (dragging) setCurrentTime(time);
  };

  /* Enter: initialise tooltip to current playhead */
  const handleSeekMouseEnter = (e) => {
    const { x, time } = seekFromClientX(e.clientX);
    setSeekTooltip({ x, time });
  };

  const handleSeekMouseLeave = () => {
    if (!dragging) setSeekTooltip(null);
  };

  /* Drag seek */
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
    <section className="lesson-media">
      {/* ---- Sub header ---- */}
      <div className="lesson-media__header">
        <span className="lesson-media__tag">KÝ HIỆU ĐANG HỌC</span>
        <h2 className="lesson-media__title">
          Quan sát ký hiệu cẩn thận
        </h2>
      </div>

      {/* ---- Video player ---- */}
      <div
        className="lesson-media__player"
        onMouseMove={handlePlayerMouseMove}
        onMouseLeave={handlePlayerMouseLeave}
      >
        {/* Click-to-play on video area */}
        <div
          className="lesson-media__thumb"
          onClick={handlePlayPause}
        >
          <div className="lesson-media__thumb-icon">
            <Hand size={44} strokeWidth={1.6} />
          </div>
          <span className="lesson-media__thumb-label">
            Ký hiệu: Lời chào
          </span>

          {/* Centre Play / Pause overlay — visible when paused or on hover while playing */}
          <button
            type="button"
            className={`lesson-media__center-btn ${
              centerVisible ? "" : "lesson-media__center-btn--hidden"
            } ${isPlaying && !ended ? "lesson-media__center-btn--pause" : ""}`}
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

          {/* Replay toast */}
          {showReplayToast && (
            <div className="lesson-media__toast" role="status">
              <RotateCcw
                size={14}
                strokeWidth={2.5}
                className="lesson-media__toast-icon"
              />
              Đang phát lại từ đầu...
            </div>
          )}
        </div>

        {/* Seekbar */}
        <div className="lesson-media__seek">
          <div
            ref={seekBarRef}
            className="lesson-media__seek-bar"
            onMouseMove={handleSeekMouseMove}
            onMouseEnter={handleSeekMouseEnter}
            onMouseLeave={handleSeekMouseLeave}
            onPointerDown={handleSeekPointerDown}
            onPointerUp={handleSeekPointerUp}
            onPointerMove={handleSeekPointerMove}
            role="slider"
            aria-label="Thanh tiến trình video"
            aria-valuemin={0}
            aria-valuemax={DURATION}
            aria-valuenow={Math.round(currentTime)}
          >
            <div
              className="lesson-media__seek-fill"
              style={{ width: `${progressPct}%` }}
            />
            <span
              className="lesson-media__seek-knob"
              style={{ left: `${progressPct}%` }}
            />

            {/* Dynamic hover / drag tooltip */}
            {seekTooltip && (
              <span
                className="lesson-media__seek-tooltip"
                style={{ left: `${seekTooltip.x}%` }}
              >
                {formatTime(seekTooltip.time)}
              </span>
            )}
          </div>

          <span className="lesson-media__seek-time">
            {formatTime(currentTime)} / {formatTime(DURATION)}
          </span>
        </div>
      </div>

      {/* ---- Control bar ---- */}
      <div className="lesson-media__controls">
        <div className="lesson-media__speeds">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              className={`lesson-media__speed ${
                speed === s && !slowmo
                  ? "lesson-media__speed--active"
                  : ""
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

        <button
          type="button"
          className={`lesson-media__btn ${
            slowmo ? "lesson-media__btn--active" : ""
          }`}
          onClick={() => setSlowmo((v) => !v)}
        >
          <Clock size={15} strokeWidth={2} />
          Slow-mo
        </button>

        <button
          type="button"
          className={`lesson-media__btn ${
            showReplayToast ? "lesson-media__btn--flash" : ""
          }`}
          onClick={handleReplay}
        >
          <RotateCcw
            key={replaySpin}
            size={15}
            strokeWidth={2}
            className="lesson-media__btn-spin"
          />
          Xem lại
        </button>
      </div>

      {/* ---- Tip box ---- */}
      <div className="lesson-media__tip">
        <div className="lesson-media__tip-icon">
          <Lightbulb size={18} strokeWidth={2} />
        </div>
        <p className="lesson-media__tip-text">
          <strong>Mẹo:</strong> Chú ý đến hướng chuyển động của bàn
          tay và biểu cảm khuôn mặt — cả hai đều là phần quan trọng
          của ký hiệu.
        </p>
      </div>
    </section>
  );
};

export default MediaView;