import { useRef, useState } from 'react';
import { Hand, Pause, Play, RotateCcw, LoaderCircle } from 'lucide-react';
import './VideoPlayerFrame.css';
const formatTime = (value) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
function VideoSource({ videoUrl, poster, loop = false, muted = true, slowMo = false, onPlayStateChange }) {
  const video = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(Boolean(videoUrl));
  const [error, setError] = useState(false);
  const [ended, setEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  function updatePlaying(value) { setPlaying(value); onPlayStateChange?.(value); }
  async function play() {
    if (!video.current) return;
    try { if (ended) { video.current.currentTime = 0; setEnded(false); } await video.current.play(); }
    catch { setError(true); setLoading(false); }
  }
  function seek(next) { if (!video.current || !duration) return; video.current.currentTime = Math.max(0, Math.min(duration, next)); setTime(video.current.currentTime); setEnded(false); }
  function changeSpeed(value) { setSpeed(value); if (video.current) video.current.playbackRate = value; }
  return <div className="vp-frame">
    <div className="vp-frame__player">
      {!videoUrl ? <div className="vp-frame__thumb" role="status"><Hand size={44} /><p>Video đang được cập nhật</p></div> : <>
        <div className="vp-frame__screen">
          <video ref={video} className="vp-frame__video" src={videoUrl} poster={poster} playsInline muted={muted} loop={loop} preload="metadata"
            onLoadedMetadata={(event) => { setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0); event.currentTarget.playbackRate = speed; setLoading(false); }}
            onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)} onWaiting={() => setLoading(true)} onCanPlay={() => setLoading(false)}
            onPlay={() => { updatePlaying(true); setEnded(false); }} onPause={() => updatePlaying(false)} onEnded={() => { setEnded(true); updatePlaying(false); }}
            onError={() => { setError(true); setLoading(false); updatePlaying(false); }} aria-label="Video minh họa ký hiệu" />
          {loading && !error && <span className="vp-frame__loading" role="status"><LoaderCircle className="vp-frame__spinner" /> Đang tải video…</span>}
        </div>
        {error ? <div role="alert">Không thể tải video. <button type="button" onClick={() => { setError(false); setLoading(true); video.current?.load(); }}>Thử lại</button></div> : <>
          <button type="button" className="vp-frame__btn" onClick={() => playing ? video.current.pause() : play()} aria-label={ended ? 'Xem lại' : playing ? 'Tạm dừng' : 'Phát video'}>{playing ? <Pause size={18} /> : ended ? <RotateCcw size={18} /> : <Play size={18} />}{ended ? 'Xem lại' : playing ? 'Tạm dừng' : 'Phát video'}</button>
          <input className="vp-frame__range" type="range" tabIndex={0} min={0} max={duration || 0} step="0.1" value={time} disabled={!duration} aria-label="Tiến trình video" aria-valuetext={`${formatTime(time)} trên ${formatTime(duration)}`}
            onChange={(event) => seek(Number(event.target.value))} onKeyDown={(event) => { const next = { ArrowLeft: time - 2, ArrowRight: time + 2, Home: 0, End: duration }[event.key]; if (next !== undefined) { event.preventDefault(); seek(next); } }} />
          <span className="vp-frame__seek-time">{formatTime(time)} / {formatTime(duration)}</span>
        </>}
      </>}
    </div>
    {videoUrl && <div className="vp-frame__controls">{[0.5, 1, 1.5].map((value) => <button type="button" key={value} className={`vp-frame__speed ${speed === value ? 'vp-frame__speed--active' : ''}`} aria-pressed={speed === value} onClick={() => changeSpeed(value)}>{value}x</button>)}{slowMo && <button type="button" className="vp-frame__btn" aria-pressed={speed === 0.5} onClick={() => changeSpeed(0.5)}>Slow-mo</button>}</div>}
  </div>;
}

export default function VideoPlayerFrame(props) { return <VideoSource key={props.videoUrl || "placeholder"} {...props} />; }
