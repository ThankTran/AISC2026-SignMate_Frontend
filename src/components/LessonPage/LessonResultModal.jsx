import {useProgress} from "../../hooks/useProgress";
import Modal from "../ui/Modal";
import {
  ArrowRight,
  Check,
  Clock3,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";

import "./LessonResultModal.css";

const XP_SEGMENTS = 10;

const LessonResultModal = ({ lessonId, summary, onClose, onRetake, onNext }) => {
 const progress=useProgress();const lesson=progress.lessons.find(row=>row.id===Number(lessonId));
 const result=summary||progress.lessonResults[lessonId]||{};
 const {score=0,xp=0,time='—',timeUnit='phút',timeNote='',breakdown=[]}=result;
 const passed=result.passed===true;
 const label=lesson?`BÀI HỌC ${lesson.id} · CHƯƠNG ${lesson.chapterId}`:'KẾT QUẢ BÀI HỌC';
 const title=result.title||lesson?.title||'Bài học',level=result.level||progress.stats.xpLevel,nextLesson=result.nextLesson||progress.nextLesson?.title||'Ôn tập lộ trình';
 const xpFilled=Math.floor((progress.stats.xp%1000)/1000*XP_SEGMENTS);

  return (
    <Modal className={`lrm__card ${passed ? "lrm--passed" : "lrm--failed"}`} labelledBy="lrm-title" onClose={onClose}>
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
            {passed ? <Trophy size={42} strokeWidth={1.7} /> : <RotateCcw size={42} strokeWidth={1.7} />}
          </span>

          <span className="lrm__hero-tag">{label}</span>
          <h2 className="lrm__hero-title text-h2" id="lrm-title">
            {passed ? "Hoàn thành bài học!" : "Chưa đạt, hãy thử lại"}
          </h2>
          <p className="lrm__hero-subtitle">{title}</p>
        </header>

        {/* ===== SUMMARY STATS ===== */}
        <div className="lrm__stats">
          <div className="lrm-stat">
            <span className="lrm-stat__pct">{score}%</span>
            <span className="lrm-stat__flag">{passed ? "ĐẠT" : "CHƯA ĐẠT"}</span>
            <span className="lrm-stat__note">
              {passed ? <Check size={14} strokeWidth={2.6} /> : <X size={14} strokeWidth={2.6} />}
              Độ chính xác
            </span>
          </div>

          <div className="lrm-stat lrm-stat--xp">
            <span className="lrm-stat__value">+{xp} XP</span>{xp===0 && result.xpPreviouslyAwarded===true && <span className="lrm-stat__note">Đã nhận XP bài này trước đó</span>}
            <span className="lrm-stat__level">Level {level}</span>
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
            <h3 className="lrm-breakdown__title text-h3">
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
          <button type="button" className={passed ? "lrm__retake" : "lrm__next-btn"} onClick={onRetake}>
            <RotateCcw size={16} strokeWidth={2.4} />
            Luyện tập lại
          </button>

          {passed && <div className="lrm__next">
            <div className="lrm__next-hint">
              <span className="lrm__next-label">Bài tiếp theo</span>
              <strong className="lrm__next-name">{nextLesson}</strong>
            </div>
            <button type="button" className="lrm__next-btn" onClick={onNext}>
              Bài tiếp theo
              <ArrowRight size={17} strokeWidth={2.4} />
            </button>
          </div>}
        </footer>
    </Modal>
  );
};

export default LessonResultModal;
