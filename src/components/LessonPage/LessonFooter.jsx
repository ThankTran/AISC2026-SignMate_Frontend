import { ArrowRight, Check, X } from "lucide-react";

import "./LessonFooter.css";

const LessonFooter = ({
  lessonTitle,
  selected,
  result,
  checking,
  onCheck,
  onAdvance,
  questionIndex,
  totalQuestions,
  remainingQuestions,
  isLast,
  correctAnswerName,
}) => {
  const hasSelection = Boolean(selected);

  if (result) {
    const correct = result.correct;
    const advanceLabel = isLast ? "Hoàn thành" : "Câu tiếp theo";

    return (
      <div
        className={`lesson-footer ${
          correct ? "lesson-footer--success" : "lesson-footer--error"
        }`}
      >
        <div className="lesson-footer__status">
          <span
            className={`lesson-footer__status-icon ${
              correct
                ? "lesson-footer__status-icon--ok"
                : "lesson-footer__status-icon--no"
            }`}
          >
            {correct ? (
              <Check size={22} strokeWidth={3} />
            ) : (
              <X size={22} strokeWidth={3} />
            )}
          </span>
          <div className="lesson-footer__status-text">
            <p className="lesson-footer__status-title">
              {correct ? "Chính xác! Bạn làm tốt lắm." : "Chưa chính xác!"}
            </p>
            <span className="lesson-footer__status-sub">
              {correct
                ? "XP được tổng kết khi hoàn thành bài học."
                : `Đáp án đúng là: ${correctAnswerName}`}
            </span>
          </div>
        </div>

        <div className="lesson-footer__right">
          <span className="lesson-footer__note">
            {isLast
              ? "Còn bước cuối cùng để xem kết quả"
              : "Nhấn để chuyển sang câu hỏi tiếp theo"}
          </span>
          <button
            type="button"
            className={`lesson-footer__btn ${
              correct
                ? "lesson-footer__btn--advance"
                : "lesson-footer__btn--ack"
            }`}
            onClick={onAdvance}
          >
            {advanceLabel}
            {isLast ? (
              <Check size={16} strokeWidth={3} />
            ) : (
              <ArrowRight size={16} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-footer">
      {/* ---- Left: context ---- */}
      <div className="lesson-footer__left">
        <span className="lesson-footer__dot" />
        <p className="lesson-footer__text">
          <strong>{lessonTitle}</strong> — Câu {questionIndex} trong {totalQuestions}
          <span className="lesson-footer__sep">·</span>
          Còn {Math.max(0, remainingQuestions)} câu nữa
        </p>
      </div>

      {/* ---- Right: hint + action ---- */}
      <div className="lesson-footer__right">
        <span className="lesson-footer__hint">
          Chọn một đáp án để tiếp tục
        </span>

        <button
          type="button"
          disabled={!hasSelection || checking}
          onClick={onCheck}
          className={`lesson-footer__btn ${
            hasSelection && !checking ? "lesson-footer__btn--enabled" : ""
          }`}
        >
          {checking ? (
            <>
              <span className="lesson-footer__spinner" aria-hidden="true" />
              Đang kiểm tra...
            </>
          ) : (
            <>
              Kiểm tra đáp án
              {hasSelection && <ArrowRight size={16} strokeWidth={2.5} />}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LessonFooter;
