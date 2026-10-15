import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, AlertCircle, Loader2 } from "lucide-react";
import "./SignVideoPlayer.css";

const SPEEDS = [0.5, 0.75, 1.0, 1.25];

export default function SignVideoPlayer({
  videoUrl,
  label = "",
  filename = "",
  autoPlay = false,
  className = "",
  onEnded,
  onError,
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(Boolean(videoUrl));
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [prevVideoUrl, setPrevVideoUrl] = useState(videoUrl);
  if (videoUrl !== prevVideoUrl) {
    setPrevVideoUrl(videoUrl);
    setIsLoading(Boolean(videoUrl));
    setHasError(false);
    setErrorMessage("");
    setCurrentTime(0);
    setIsPlaying(false);
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (autoPlay) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [videoUrl, autoPlay]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed, videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current || hasError) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          setIsPlaying(false);
          setHasError(true);
          setErrorMessage("Không thể phát video.");
          onError?.(err);
        });
    }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setCurrentTime(0);
    videoRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage("");
    setIsLoading(true);
    videoRef.current?.load();
    handleRestart();
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const target = Number(e.target.value);
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const formatSeconds = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!videoUrl) {
    return (
      <div className={`sign-video-player sign-video-player--empty ${className}`} role="status">
        <div className="sign-video-player__placeholder">
          <p className="sign-video-player__placeholder-text">Chưa có video ký hiệu để hiển thị</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`sign-video-player ${className}`}
      role="region"
      aria-label={`Trình phát ký hiệu: ${label || "Video VSL"}`}
    >
      <div className="sign-video-player__viewport">
        <video
          ref={videoRef}
          src={videoUrl}
          className="sign-video-player__video"
          playsInline
          muted={isMuted}
          preload="auto"
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration || 0);
            e.currentTarget.playbackRate = speed;
            setIsLoading(false);
          }}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            onEnded?.();
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
            setErrorMessage("Không thể tải file video từ máy chủ.");
            onError?.(new Error("Video load failed"));
          }}
          onClick={togglePlay}
        />

        {isLoading && (
          <div className="sign-video-player__overlay" role="status">
            <Loader2 className="sign-video-player__spinner animate-spin" size={36} />
            <span className="sign-video-player__loading-text">Đang tải video...</span>
          </div>
        )}

        {hasError && (
          <div
            className="sign-video-player__overlay sign-video-player__overlay--error"
            role="alert"
          >
            <AlertCircle size={32} className="sign-video-player__error-icon" />
            <p className="sign-video-player__error-text">{errorMessage}</p>
            <button type="button" className="sign-video-player__retry-btn" onClick={handleRetry}>
              Thử tải lại
            </button>
          </div>
        )}

        {label && (
          <div className="sign-video-player__badge" aria-label={`Ký hiệu: ${label}`}>
            <span className="sign-video-player__badge-label">{label}</span>
            {filename && <span className="sign-video-player__badge-fn">{filename}</span>}
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="sign-video-player__controls" role="toolbar" aria-label="Điều khiển video">
        <div className="sign-video-player__timeline">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Thời lượng video"
            className="sign-video-player__slider"
          />
          <div className="sign-video-player__timestamps">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>

        <div className="sign-video-player__buttons">
          <div className="sign-video-player__group-left">
            <button
              type="button"
              className="sign-video-player__btn sign-video-player__btn--primary"
              onClick={togglePlay}
              aria-label={isPlaying ? "Tạm dừng" : "Phát"}
              disabled={hasError}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            </button>

            <button
              type="button"
              className="sign-video-player__btn"
              onClick={handleRestart}
              aria-label="Phát lại từ đầu"
              title="Phát lại từ đầu"
              disabled={hasError}
            >
              <RotateCcw size={17} />
            </button>

            <button
              type="button"
              className="sign-video-player__btn"
              onClick={toggleMute}
              aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
          </div>

          <div className="sign-video-player__group-right">
            <span className="sign-video-player__speed-label" id="speed-label">
              Tốc độ:
            </span>
            <div className="sign-video-player__speeds" role="group" aria-labelledby="speed-label">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`sign-video-player__speed-btn ${speed === s ? "sign-video-player__speed-btn--active" : ""}`}
                  onClick={() => handleSpeedChange(s)}
                  aria-pressed={speed === s}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
