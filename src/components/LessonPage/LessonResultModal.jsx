import {
  ArrowRight,
  Check,
  Clock3,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";

import "./LessonResultModal.css";

const DEFAULT_SUMMARY = {
  label: "BÀI HỌC 12 · CHƯƠNG 3",
  title: "Ngôn ngữ ký hiệu - Ký hiệu cơ bản",
  score: 94,
  xp: 50,
  level: 3,
  time: "02:15",
  timeUnit: "phút",
  timeNote: "Nhanh hơn TB 45s",
  nextLesson: "Ký hiệu nâng cao",
  breakdown: [
    { label: "Chào hỏi", pct: 98 },
    { label: "Số đếm", pct: 96 },
    { label: "Màu sắc", pct: 89 },
    { label: "Gia đình", pct: 92 },
    { label: "Động từ", pct: 95 },
  ],
};

const XP_SEGMENTS = 10;

const LessonResultModal = ({ summary = {}, onClose, onRetake, onNext }) => {
  const {
    label = DEFAULT_SUMMARY.label,
    title = DEFAULT_SUMMARY.title,
    score = DEFAULT_SUMMARY.score,
    xp = DEFAULT_SUMMARY.xp,
    level = DEFAULT_SUMMARY.level,
    time = DEFAULT_SUMMARY.time,
    timeUnit = DEFAULT_SUMMARY.timeUnit,
    timeNote = DEFAULT_SUMMARY.timeNote,
    nextLesson = DEFAULT_SUMMARY.nextLesson,
    breakdown = DEFAULT_SUMMARY.breakdown,
  } = summary;

  const xpFilled = Math.round((xp / 100) * XP_SEGMENTS);

  return (
    <div
      className="lrm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lrm-title"
    >
      <div className="lrm__backdrop" onClick={onClose} />

      <div className="lrm__card">
        {/* ===== HERO BANNER ===== */}
        <header className="lrm__hero">
          <button
            type="button"
            className="lrm__close"
            onClick={onClose}
            aria-label="Đóng kết quả bài học"
          >
            <X size={18} strokeWidth={2.4} />
          </button>

          <span className="lrm__hero-icon" aria-hidden="true">
            <Trophy size={42} strokeWidth={1.7} />
          </span>

          <span className="lrm__hero-tag">{label}</span>
          <h2 className="lrm__hero-title" id="lrm-title">
            Hoàn thành bài học!
          </h2>
          <p className="lrm__hero-subtitle">{title}</p>
        </header>

        {/* ===== SUMMARY STATS ===== */}
        <div className="lrm__stats">
          <div className="lrm-stat">
            <span className="lrm-stat__pct">{score}%</span>
            <span className="lrm-stat__flag">ĐẠT</span>
            <span className="lrm-stat__note">
              <Check size={14} strokeWidth={2.6} />
              Độ chính xác AI
            </span>
          </div>

          <div className="lrm-stat lrm-stat--xp">
            <span className="lrm-stat__value">+{xp} XP</span>
            <span className="lrm-stat__level">Lv {level}</span>
            <div className="lrm-xpbar" aria-hidden="true">
              {Array.from({ length: XP_SEGMENTS }).map((_, i) => (
                <span
                  key={i}
                  className={`lrm-xpbar__seg ${
                    i < xpFilled ? "lrm-xpbar__seg--filled" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="lrm-stat">
            <span className="lrm-stat__value lrm-stat__value--time">
              <Clock3 size={20} strokeWidth={2.2} />
              {time}
            </span>
            <span className="lrm-stat__unit">{timeUnit}</span>
            <span className="lrm-stat__note">🕒 {timeNote}</span>
          </div>
        </div>

        {/* ===== ACCURACY BREAKDOWN ===== */}
        <section className="lrm-breakdown">
          <div className="lrm-breakdown__head">
            <h3 className="lrm-breakdown__title">
              Độ chính xác theo phần
            </h3>
            <span className="lrm-breakdown__count">{breakdown.length} phần</span>
          </div>

          <div className="lrm-breakdown__list">
            {breakdown.map((item) => {
              const excellent = item.pct >= 90;
              return (
                <div className="lrm-bar" key={item.label}>
                  <span className="lrm-bar__label">{item.label}</span>
                  <div className="lrm-bar__track">
                    <div
                      className={`lrm-bar__fill ${
                        excellent ? "lrm-bar__fill--green" : "lrm-bar__fill--amber"
                      }`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <span
                    className={`lrm-bar__tag ${
                      excellent ? "lrm-bar__tag--green" : "lrm-bar__tag--amber"
                    }`}
                  >
                    {item.pct}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="lrm-breakdown__legend">
            <span className="lrm-legend">
              <i className="lrm-legend__dot lrm-legend__dot--green" />
              ≥ 90% · Xuất sắc
            </span>
            <span className="lrm-legend">
              <i className="lrm-legend__dot lrm-legend__dot--amber" />
              &lt; 90% · Cần luyện tập
            </span>
          </div>
        </section>

        {/* ===== FOOTER ACTIONS ===== */}
        <footer className="lrm__footer">
          <button type="button" className="lrm__retake" onClick={onRetake}>
            <RotateCcw size={16} strokeWidth={2.4} />
            Luyện tập lại
          </button>

          <div className="lrm__next">
            <div className="lrm__next-hint">
              <span className="lrm__next-label">Bài tiếp theo</span>
              <strong className="lrm__next-name">{nextLesson}</strong>
            </div>
            <button type="button" className="lrm__next-btn" onClick={onNext}>
              Bài tiếp theo
              <ArrowRight size={17} strokeWidth={2.4} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LessonResultModal;