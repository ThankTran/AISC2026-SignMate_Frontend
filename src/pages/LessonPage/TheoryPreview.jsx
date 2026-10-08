import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Lock,
  Video,
  PencilLine,
  RotateCcw,
  Play,
  Pause,
  Lightbulb,
} from "lucide-react";
import { useTheoryItems, useTheoryPreview } from "../../hooks/useTheoryPreview";
import { useTheoryVideo } from "../../hooks/useTheoryVideo";
import { groupsFor } from "../../utils/theoryVocabulary.js";
import "./TheoryPreview.css";

function SegmentPlayer({ segment, loading, loadError, retry, speed, onComplete }) {
  const player = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [mediaAttempt, setMediaAttempt] = useState(0);
  const completed = useRef(false);
  useEffect(() => {
    if (player.current) player.current.playbackRate = speed;
  }, [speed]);
  async function play(restart = false) {
    const video = player.current;
    if (!video) return;
    if (restart || video.ended || (segment.end != null && video.currentTime >= segment.end)) {
      video.currentTime = segment.start || 0;
    }
    try {
      await video.play();
      setError("");
    } catch {
      setError("Nhấn Phát để bắt đầu video.");
    }
  }
  function finish() {
    if (!completed.current && !error) {
      completed.current = true;
      onComplete();
    }
  }
  return (
    <>
      <div className="theory__media">
        {segment?.videoUrl ? (
          <video
            key={mediaAttempt}
            ref={player}
            src={segment.videoUrl}
            playsInline
            muted
            preload="metadata"
            onLoadedMetadata={() => {
              player.current.currentTime = segment.start || 0;
              player.current.playbackRate = speed;
              setReady(true);
              play();
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={() => {
              if (segment.end != null && player.current.currentTime >= segment.end) {
                player.current.pause();
                finish();
              }
            }}
            onEnded={finish}
            onError={() => {
              setError("Không tải được video. Vui lòng thử lại sau.");
              setReady(false);
            }}
          />
        ) : (
          <div className="theory__placeholder" role="status" aria-busy={loading}>
            <Video size={40} strokeWidth={1.5} />
            <strong>
              {loading
                ? "Đang tải video ký hiệu…"
                : loadError
                  ? "Video chưa khả dụng"
                  : "Chọn ký hiệu để bắt đầu"}
            </strong>
            {loadError && <p>{loadError.message}</p>}
            {loadError && loadError.status !== 404 && (
              <button type="button" className="theory__retry" onClick={retry}>
                Thử lại
              </button>
            )}
          </div>
        )}
      </div>
      {error && (
        <p role="status" className="theory__media-error">
          {error}
          {!ready && (
            <button
              type="button"
              className="theory__retry"
              onClick={() => {
                setError("");
                setMediaAttempt((value) => value + 1);
              }}
            >
              Tải lại video
            </button>
          )}
        </p>
      )}
      <div className="theory__playback">
        <button
          type="button"
          disabled={!ready}
          onClick={() => (playing ? player.current.pause() : play())}
          aria-label={playing ? "Tạm dừng" : "Phát video"}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button type="button" disabled={!ready} onClick={() => play(true)}>
          <RotateCcw size={17} /> Phát lại đoạn này
        </button>
      </div>
    </>
  );
}

export default function TheoryPreview({ lesson }) {
  const { isDone, complete } = useTheoryPreview();
  const navigate = useNavigate();
  const groups = groupsFor(lesson);
  const all = groups.flatMap((group) => group.terms);
  const [groupIndex, setGroupIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(all[0]?.id);
  const [speed, setSpeed] = useState(1);
  const done = isDone(lesson.id);
  const group = groups[groupIndex];
  const selected = all.find((item) => item.id === selectedId);
  const progress = useTheoryItems(lesson.id, all, done);
  const viewed = progress.ids;
  const count = group?.terms.filter((item) => viewed.includes(item.id)).length || 0;
  const canContinue = done || (all.length > 0 && viewed.length >= all.length);
  const mark = () => {
    if (selected) progress.mark(selected.id);
  };
  const toggleLearned = () => {
    if (!selected) return;
    progress.toggle(selected.id);
  };
  const video = useTheoryVideo(selected?.videoLabel);
  function switchGroup(index) {
    setGroupIndex(index);
    setSelectedId(groups[index].terms[0]?.id);
  }
  function tabKey(event, index) {
    const target =
      event.key === "ArrowRight"
        ? (index + 1) % groups.length
        : event.key === "ArrowLeft"
          ? (index - 1 + groups.length) % groups.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? groups.length - 1
              : null;
    if (target !== null) {
      event.preventDefault();
      switchGroup(target);
      document.getElementById(`theory-tab-${target}`)?.focus();
    }
  }
  return (
    <section className="theory">
      <Link className="theory__back" to="/learning-path">
        <ArrowLeft size={18} /> Về lộ trình
      </Link>
      <nav className="theory__steps" aria-label="Các bước của trạm">
        <span aria-current="step">
          <BookOpen size={17} /> 01 · Học lý thuyết
        </span>
        <ArrowRight size={15} />
        <span>{canContinue ? <PencilLine size={17} /> : <Lock size={15} />} 02 · Kiểm tra</span>
      </nav>
      <header className="theory__heading">
        <h1>Lý thuyết {lesson.title}</h1>
        <p>Chọn một ký hiệu, quan sát và thực hành theo nhịp của bạn.</p>
      </header>
      <div className="theory__viewer-heading">
        <h2 aria-live="polite">
          Đang xem:{" "}
          {selected
            ? `Ký hiệu ${selected.topic === "Bảng chữ cái" ? "chữ " : selected.topic === "Số" && /^\d+$/.test(selected.term) ? "số " : ""}${selected.term}`
            : "Chưa có nội dung"}
        </h2>
        <span>
          {selected ? all.findIndex((item) => item.id === selected.id) + 1 : 0}/{all.length}
        </span>
      </div>
      <div className="theory__grid">
        <div className="theory__viewer">
          <SegmentPlayer
            key={`${selectedId}:${video.segment?.videoUrl || "loading"}`}
            segment={video.segment}
            loading={video.loading}
            loadError={video.error}
            retry={video.retry}
            speed={speed}
            onComplete={mark}
          />
          <div className="theory__timeline" aria-label="Các phân đoạn ký hiệu">
            {group?.terms.map((item) => (
              <button
                type="button"
                key={item.id}
                title={item.term}
                aria-label={`Xem ký hiệu ${item.term}`}
                aria-pressed={selectedId === item.id}
                className={`${viewed.includes(item.id) ? "is-completed" : ""} ${selectedId === item.id ? "is-active" : ""}`}
                onClick={() => setSelectedId(item.id)}
              >
                <span />
              </button>
            ))}
          </div>
          <div className="theory__speed">
            <span>Tốc độ phát</span>
            <div role="group" aria-label="Tốc độ phát">
              {[0.5, 0.75, 1].map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={speed === value}
                  onClick={() => setSpeed(value)}
                >
                  {value === 1 ? "1.0" : value}x
                </button>
              ))}
            </div>
          </div>
          <div className="theory__tip">
            <Lightbulb size={19} />
            <p>
              <strong>Quan sát</strong> hình tay · <strong>Thực hành chậm</strong> từng động tác ·{" "}
              <strong>Tự ghi nhớ</strong> rồi lặp lại.
            </p>
          </div>
        </div>
        <aside className="theory__playlist" aria-label="Danh sách ký hiệu">
          <div className="theory__playlist-heading">
            <h2>Chọn ký hiệu</h2>
            <span>{group?.terms.length || 0} mục</span>
          </div>
          <div className="theory__tabs" role="tablist" aria-label="Nhóm từ vựng">
            {groups.map((item, index) => (
              <button
                type="button"
                role="tab"
                id={`theory-tab-${index}`}
                aria-controls="theory-keypad"
                aria-selected={index === groupIndex}
                tabIndex={index === groupIndex ? 0 : -1}
                key={item.id}
                onKeyDown={(event) => tabKey(event, index)}
                onClick={() => switchGroup(index)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div
            id="theory-keypad"
            role="tabpanel"
            aria-labelledby={group ? `theory-tab-${groupIndex}` : undefined}
            className={`theory__keypad ${!["Bảng chữ cái", "Số"].includes(group?.topic) ? "theory__keypad--words" : ""}`}
          >
            {group?.terms.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={selectedId === item.id}
                aria-label={`${item.term}${viewed.includes(item.id) ? ", đã học" : ""}`}
                style={
                  item.term.length > 3 && group?.topic === "Số" ? { fontSize: "0.8rem" } : undefined
                }
                className={`${viewed.includes(item.id) ? "is-completed" : ""} ${selectedId === item.id ? "is-active" : ""}`}
                onClick={() => setSelectedId(item.id)}
              >
                {item.term}
                {viewed.includes(item.id) && <span className="theory__dot" />}
              </button>
            ))}
            {!group && <p>Từ vựng của bài học đang được cập nhật.</p>}
          </div>
          <div className="theory__legend">
            <span>
              <i /> Chưa học
            </span>
            <span>
              <i className="is-completed" /> Đã học
            </span>
            <span>
              <i className="is-active" /> Đang chọn
            </span>
          </div>
          <p className="theory__group-progress" aria-live="polite">
            Đã học:{" "}
            <strong>
              {count}/{group?.terms.length || 0}
            </strong>{" "}
            {selected?.topic === "Bảng chữ cái"
              ? "chữ cái"
              : selected?.topic === "Số"
                ? "số"
                : "mục"}
          </p>
          <div className="theory__mark-row">
            <button
              type="button"
              className="theory__mark"
              disabled={!selected}
              aria-pressed={viewed.includes(selectedId)}
              aria-label="Đánh dấu đã thuộc"
              onClick={toggleLearned}
            >
              <Check size={16} />
              Đánh dấu đã thuộc
            </button>
          </div>
        </aside>
      </div>
      <footer className="theory__footer">
        <div className="theory__progress">
          <div>
            <strong>Tiến độ bài học</strong>
            <span aria-live="polite">
              {viewed.length}/{all.length} mục đã học
            </span>
          </div>
          <progress value={viewed.length} max={all.length || 1} />
          <p className="theory__progress-hint" role="status">
            {canContinue
              ? "Bạn đã sẵn sàng làm bài kiểm tra."
              : "Xem hết các ký hiệu hoặc đánh dấu đã thuộc để mở bài kiểm tra."}
          </p>
        </div>
        <button
          type="button"
          className="theory__cta"
          disabled={!canContinue}
          onClick={() => {
            complete(lesson.id);
            navigate("?step=practice");
          }}
        >
          Tôi đã hiểu, sang làm bài kiểm tra <ArrowRight size={18} />
        </button>
      </footer>
    </section>
  );
}
