import {
  Check,
  Circle,
  Hand,
  HandHeart,
  Handshake,
  HeartHandshake,
  Star,
  X,
} from "lucide-react";

import "./QuizSection.css";

const CORRECT_ANSWER = "A";

const ANSWERS = [
  {
    id: "A",
    icon: Hand,
    title: "Xin chào",
    caption: "Lời chào hỏi",
  },
  {
    id: "B",
    icon: HandHeart,
    title: "Cảm ơn",
    caption: "Bày tỏ lòng biết ơn",
  },
  {
    id: "C",
    icon: Handshake,
    title: "Tạm biệt",
    caption: "Lời chào khi chia tay",
  },
  {
    id: "D",
    icon: HeartHandshake,
    title: "Xin lỗi",
    caption: "Bày tỏ sự xin lỗi",
  },
];

const QuizSection = ({ selected, result, onSelect, attempts }) => {
  return (
    <section className="lesson-quiz">
      {/* ---- Header ---- */}
      <span className="lesson-quiz__tag">
        <Star size={12} fill="currentColor" />
        CÂU HỎI TRẮC NGHIỆM
      </span>

      <h2 className="lesson-quiz__question">
        Chọn nghĩa đúng của ký hiệu trên
      </h2>

      <p className="lesson-quiz__desc">
        Xem video bên trái và chọn đáp án phù hợp nhất.
      </p>

      {/* ---- Answer grid ---- */}
      <div className="lesson-quiz__grid">
        {ANSWERS.map((a) => {
          const Icon = a.icon;
          const isSelected = selected === a.id;
          const isCorrect =
            result !== null && a.id === CORRECT_ANSWER;
          const isWrong =
            result === "wrong" && isSelected && a.id !== CORRECT_ANSWER;
          const showRadioCheck =
            isSelected && (result === null || result === "correct");

          return (
            <button
              key={a.id}
              type="button"
              className={`lesson-quiz__card ${
                isSelected && result === null
                  ? "lesson-quiz__card--selected"
                  : ""
              } ${isCorrect ? "lesson-quiz__card--correct" : ""} ${
                isWrong ? "lesson-quiz__card--wrong" : ""
              }`}
              onClick={() => onSelect(a.id)}
              disabled={result !== null}
            >
              {/* Radio */}
              <span className="lesson-quiz__radio">
                {showRadioCheck ? (
                  <span className="lesson-quiz__radio-fill">
                    <Check size={11} strokeWidth={3.5} />
                  </span>
                ) : isCorrect ? (
                  <span className="lesson-quiz__radio-fill">
                    <Check size={11} strokeWidth={3.5} />
                  </span>
                ) : isWrong ? (
                  <span className="lesson-quiz__radio-fill lesson-quiz__radio-fill--x">
                    <X size={12} strokeWidth={3.5} />
                  </span>
                ) : (
                  <Circle size={16} strokeWidth={2} />
                )}
              </span>

              {/* Icon */}
              <div className="lesson-quiz__card-icon">
                <Icon size={30} strokeWidth={1.6} />
              </div>

              {/* Letter badge */}
              <span className="lesson-quiz__card-badge">{a.id}</span>

              {/* Text */}
              <div className="lesson-quiz__card-text">
                <span className="lesson-quiz__card-title">
                  {a.title}
                </span>
                <span className="lesson-quiz__card-caption">
                  {a.caption}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ---- Attempts ---- */}
      <div className="lesson-quiz__attempts">
        <span className="lesson-quiz__attempts-arrow">→</span>
        Lần thử {attempts} / 3
      </div>
    </section>
  );
};

export default QuizSection;