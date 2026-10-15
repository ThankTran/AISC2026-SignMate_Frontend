import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Volume2,
  VolumeX,
} from "lucide-react";
import "./SignSequencePlayer.css";

const SPEEDS = [0.5, 0.75, 1.0, 1.25];

export default function SignSequencePlayer({
  playlist = [], // Array of { id, text, label, filename, video_url }
  className = "",
  onSequenceComplete,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [clipError, setClipError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const activeVideoRef = useRef(null);
  const preloadVideoRef = useRef(null);

  const activeItem = playlist[currentIndex] || null;
  const nextItem = playlist[currentIndex + 1] || null;
  const totalClips = playlist.length;

  // Reset state during render when playlist or currentIndex changes
  const [prevPlaylist, setPrevPlaylist] = useState(playlist);
  if (playlist !== prevPlaylist) {
    setPrevPlaylist(playlist);
    setCurrentIndex(0);
    setIsPlaying(false);
    setIsCompleted(false);
    setClipError(null);
  }

  const [prevIndex, setPrevIndex] = useState(currentIndex);
  if (currentIndex !== prevIndex) {
    setPrevIndex(currentIndex);
    setClipError(null);
  }

  const playbackVersionRef = useRef(0);

  // Handle active item playback
  useEffect(() => {
    if (!activeItem || !activeVideoRef.current) return;
    activeVideoRef.current.playbackRate = speed;

    const version = ++playbackVersionRef.current;
    if (isPlaying) {
      activeVideoRef.current.play().catch((err) => {
        if (version !== playbackVersionRef.current || err.name === "AbortError") return;
        console.error("Playback error:", err);
        setIsPlaying(false);
        setClipError({
          index: currentIndex,
          label: activeItem.label || activeItem.text,
          message: "Không thể phát video clip này.",
        });
      });
    } else {
      activeVideoRef.current.pause();
    }
    return () => {
      playbackVersionRef.current += 1;
    };
  }, [currentIndex, activeItem, isPlaying, speed]);

  const handleTogglePlay = () => {
    if (isCompleted) {
      // Replay from beginning
      setCurrentIndex(0);
      setIsCompleted(false);
      setIsPlaying(true);
      return;
    }

    if (clipError) {
      setClipError(null);
    }

    if (isPlaying) {
      if (activeVideoRef.current) activeVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsCompleted(false);
    setClipError(null);
    setIsPlaying(true);
    if (activeVideoRef.current) {
      activeVideoRef.current.currentTime = 0;
      activeVideoRef.current.play().catch(() => {});
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsCompleted(false);
      setClipError(null);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalClips - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsCompleted(false);
      setClipError(null);
    } else {
      // Reached the end
      setIsPlaying(false);
      setIsCompleted(true);
      onSequenceComplete?.();
    }
  };

  const handleSelectClip = (index) => {
    if (index >= 0 && index < totalClips) {
      setCurrentIndex(index);
      setIsCompleted(false);
      setClipError(null);
      setIsPlaying(true);
    }
  };

  const handleClipEnded = () => {
    // Media ended event advances to next clip
    if (currentIndex < totalClips - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
      setIsCompleted(true);
      onSequenceComplete?.();
    }
  };

  const handleClipError = () => {
    setIsLoading(false);
    setIsPlaying(false);
    setClipError({
      index: currentIndex,
      label: activeItem ? activeItem.label || activeItem.text : "Ký hiệu",
      message: "Lỗi tải video ký hiệu từ máy chủ.",
    });
  };

  const handleRetryClip = () => {
    setClipError(null);
    setIsLoading(true);
    if (activeVideoRef.current) {
      activeVideoRef.current.load();
      activeVideoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleSkipClip = () => {
    handleNext();
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    if (activeVideoRef.current) {
      activeVideoRef.current.playbackRate = newSpeed;
    }
  };

  const toggleMute = () => {
    if (!activeVideoRef.current) return;
    activeVideoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!playlist.length) {
    return (
      <div className={`sign-seq-player sign-seq-player--empty ${className}`} role="status">
        <p>Chưa có chuỗi ký hiệu để phát.</p>
      </div>
    );
  }

  return (
    <div
      className={`sign-seq-player ${className}`}
      role="region"
      aria-label="Trình phát chuỗi ký hiệu VSL theo câu"
    >
      {/* Viewport */}
      <div className="sign-seq-player__viewport">
        {activeItem && (
          <video
            ref={activeVideoRef}
            key={`${currentIndex}:${activeItem.video_url}`}
            src={activeItem.video_url}
            className="sign-seq-player__video"
            playsInline
            muted={isMuted}
            preload="auto"
            onLoadStart={() => setIsLoading(true)}
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = speed;
              setIsLoading(false);
            }}
            onWaiting={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onEnded={handleClipEnded}
            onError={handleClipError}
            onClick={handleTogglePlay}
          />
        )}

        {/* Hidden preload element for next clip to reduce gap */}
        {nextItem && (
          <video
            ref={preloadVideoRef}
            src={nextItem.video_url}
            preload="auto"
            muted
            className="sign-seq-player__preload"
            aria-hidden="true"
          />
        )}

        {/* Overlay states */}
        {isLoading && !clipError && !isCompleted && (
          <div className="sign-seq-player__overlay" role="status">
            <Loader2 className="sign-seq-player__spinner animate-spin" size={36} />
            <span>Đang chuyển ký hiệu tiếp theo...</span>
          </div>
        )}

        {clipError && (
          <div className="sign-seq-player__overlay sign-seq-player__overlay--error" role="alert">
            <AlertCircle size={32} className="sign-seq-player__error-icon" />
            <p className="sign-seq-player__error-title">
              Không thể tải ký hiệu: &ldquo;{clipError.label}&rdquo;
            </p>
            <p className="sign-seq-player__error-desc">{clipError.message}</p>
            <div className="sign-seq-player__error-actions">
              <button
                type="button"
                className="sign-seq-player__action-btn sign-seq-player__action-btn--primary"
                onClick={handleRetryClip}
              >
                Thử lại clip này
              </button>
              {currentIndex < totalClips - 1 && (
                <button
                  type="button"
                  className="sign-seq-player__action-btn sign-seq-player__action-btn--secondary"
                  onClick={handleSkipClip}
                >
                  Bỏ qua sang từ kế tiếp
                </button>
              )}
            </div>
          </div>
        )}

        {isCompleted && (
          <div
            className="sign-seq-player__overlay sign-seq-player__overlay--complete"
            role="status"
          >
            <CheckCircle2 size={44} className="sign-seq-player__complete-icon" />
            <p className="sign-seq-player__complete-title">Hoàn thành chuỗi ký hiệu</p>
            <p className="sign-seq-player__complete-desc">
              Đã hiển thị toàn bộ {totalClips} ký hiệu theo đúng thứ tự câu.
            </p>
            <button
              type="button"
              className="sign-seq-player__action-btn sign-seq-player__action-btn--primary"
              onClick={handleRestart}
            >
              <RotateCcw size={16} />
              Phát lại từ đầu
            </button>
          </div>
        )}

        {/* Top badges */}
        <div className="sign-seq-player__header-badge">
          <span className="sign-seq-player__position-chip">
            Ký hiệu {currentIndex + 1} / {totalClips}
          </span>
          {activeItem && (
            <span className="sign-seq-player__current-word">
              {activeItem.label || activeItem.text}
            </span>
          )}
        </div>
      </div>

      {/* Control bar */}
      <div className="sign-seq-player__controls" role="toolbar" aria-label="Điều khiển chuỗi video">
        {/* Progress bar across clips */}
        <div
          className="sign-seq-player__sequence-bar"
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalClips}
        >
          {playlist.map((item, idx) => (
            <button
              key={`${item.label || item.text}-${idx}`}
              type="button"
              className={`sign-seq-player__bar-segment ${
                idx === currentIndex
                  ? "sign-seq-player__bar-segment--active"
                  : idx < currentIndex
                    ? "sign-seq-player__bar-segment--played"
                    : ""
              }`}
              onClick={() => handleSelectClip(idx)}
              title={`${idx + 1}. ${item.label || item.text}`}
              aria-label={`Chuyển đến ký hiệu ${idx + 1}: ${item.label || item.text}`}
            />
          ))}
        </div>

        <div className="sign-seq-player__buttons">
          <div className="sign-seq-player__group-left">
            <button
              type="button"
              className="sign-seq-player__btn sign-seq-player__btn--primary"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? "Tạm dừng" : "Phát"}
              title={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            </button>

            <button
              type="button"
              className="sign-seq-player__btn"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Ký hiệu trước"
              title="Ký hiệu trước"
            >
              <SkipBack size={17} />
            </button>

            <button
              type="button"
              className="sign-seq-player__btn"
              onClick={handleNext}
              disabled={currentIndex === totalClips - 1}
              aria-label="Ký hiệu kế tiếp"
              title="Ký hiệu kế tiếp"
            >
              <SkipForward size={17} />
            </button>

            <button
              type="button"
              className="sign-seq-player__btn"
              onClick={handleRestart}
              aria-label="Phát lại toàn bộ chuỗi"
              title="Phát lại từ đầu"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              className="sign-seq-player__btn"
              onClick={toggleMute}
              aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>

          <div className="sign-seq-player__group-right">
            <span className="sign-seq-player__speed-label">Tốc độ:</span>
            <div className="sign-seq-player__speeds">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`sign-seq-player__speed-btn ${
                    speed === s ? "sign-seq-player__speed-btn--active" : ""
                  }`}
                  onClick={() => handleSpeedChange(s)}
                  aria-pressed={speed === s}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Playlist interactive chips strip */}
        <div className="sign-seq-player__playlist-strip" aria-label="Danh sách ký hiệu trong câu">
          <span className="sign-seq-player__strip-label">Thứ tự ký hiệu:</span>
          <div className="sign-seq-player__chips-scroll">
            {playlist.map((item, idx) => (
              <button
                key={`${item.label || item.text}-${idx}`}
                type="button"
                className={`sign-seq-player__chip ${
                  idx === currentIndex ? "sign-seq-player__chip--active" : ""
                } ${idx < currentIndex ? "sign-seq-player__chip--past" : ""}`}
                onClick={() => handleSelectClip(idx)}
                aria-current={idx === currentIndex ? "step" : undefined}
              >
                <span className="sign-seq-player__chip-idx">{idx + 1}</span>
                <span className="sign-seq-player__chip-text">{item.label || item.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
