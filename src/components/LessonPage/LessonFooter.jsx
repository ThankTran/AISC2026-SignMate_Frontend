import { ArrowRight, Check, X } from "lucide-react";

import "./LessonFooter.css";

const ANSWER_NAMES = {
  A: "Xin chào",
  B: "Cảm ơn",
  C: "Tạm biệt",
  D: "Xin lỗi",
};

const LessonFooter = ({
  selected,
  result,
  onCheck,
  onAdvance,
  questionIndex,
  remainingQuestions,
  correctAnswer,
  firstTimeCorrect,
}) => {
  const hasSelection = Boolean(selected);

  if (result === "correct") {
    return (
      <div className="lesson-footer lesson-footer--success">
        <div className="lesson-footer__status">
          <span className="lesson-footer__status-icon lesson-footer__status-icon--ok">
            <Check size={22} strokeWidth={3} />
          </span>
          <div className="lesson-footer__status-text">
            <p className="lesson-footer__status-title">
              Chính xác! Bạn làm tốt lắm.
            </p>
            <span className="lesson-footer__status-sub">
              {firstTimeCorrect ? "+10 XP" : "Câu hỏi đã được ghi nhận"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="lesson-footer__btn lesson-footer__btn--advance"
          onClick={onAdvance}
        >
          Tiếp tục
          <Check size={16} strokeWidth={3} />
        </button>
      </div>
    );
  }

  if (result === "wrong") {
    return (
      <div className="lesson-footer lesson-footer--error">
        <div className="lesson-footer__status">
          <span className="lesson-footer__status-icon lesson-footer__status-icon--no">
            <X size={22} strokeWidth={3} />
          </span>
          <div className="lesson-footer__status-text">
            <p className="lesson-footer__status-title">
              Chưa chính xác!
            </p>
            <span className="lesson-footer__status-sub">
              Đáp án đúng là:{" "}
              <strong>{ANSWER_NAMES[correctAnswer]}</strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          className="lesson-footer__btn lesson-footer__btn--ack"
          onClick={onAdvance}
        >
          Đã hiểu
          <Check size={16} strokeWidth={3} />
        </button>
      </div>
    );
  }

  return (
    <div className="lesson-footer">
      {/* ---- Left: context ---- */}
      <div className="lesson-footer__left">
        <span className="lesson-footer__dot" />
        <p className="lesson-footer__text">
          <strong>Bài 4</strong> — Câu {questionIndex} trong 8
          <span className="lesson-footer__sep">·</span>
          Còn {remainingQuestions} câu nữa
        </p>
      </div>

      {/* ---- Right: hint + action ---- */}
      <div className="lesson-footer__right">
        <span className="lesson-footer__hint">
          Chọn một đáp án để tiếp tục
        </span>

        <button
          type="button"
          disabled={!hasSelection}
          onClick={onCheck}
          className={`lesson-footer__btn ${
            hasSelection ? "lesson-footer__btn--enabled" : ""
          }`}
        >
          Kiểm tra đáp án
          {hasSelection && <ArrowRight size={16} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
};

export default LessonFooter;