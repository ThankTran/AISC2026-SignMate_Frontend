import { Check, Circle, Star, X } from "lucide-react";

import "./QuizSection.css";

const QuizSection = ({ question, selected, result, onSelect }) => {
  const { options, correctAnswer, question: questionText } = question;
  const answered = result !== null;

  return (
    <section className="lesson-quiz">
      {/* ---- Header ---- */}
      <span className="lesson-quiz__tag">
        <Star size={12} fill="currentColor" />
        CÂU HỎI TRẮC NGHIỆM
      </span>

      <h2 className="lesson-quiz__question text-h2">{questionText}</h2>

      <p className="lesson-quiz__desc">
        Xem video bên trái và chọn đáp án phù hợp nhất.
      </p>

      {/* ---- Answer grid ---- */}
      <div className="lesson-quiz__grid" role="radiogroup" aria-label={questionText}>
        {options.map((option, index) => {
          const Icon = option.icon;
          const isSelected = selected === option.id;
          const isCorrect = result !== null && option.id === correctAnswer;
          const isWrong =
            answered &&
            !result.correct &&
            isSelected &&
            option.id !== correctAnswer;
          const showRadioCheck =
            isSelected && (result === null || result.correct);

          return (
            <button
              key={option.id}
              type="button" role="radio" aria-checked={isSelected}
              className={`lesson-quiz__card ${
                isSelected && result === null
                  ? "lesson-quiz__card--selected"
                  : ""
              } ${isCorrect ? "lesson-quiz__card--correct" : ""} ${
                isWrong ? "lesson-quiz__card--wrong" : ""
              }`}
              onClick={() => onSelect(option.id)}
              tabIndex={isSelected || (!selected && index === 0) ? 0 : -1}
              onKeyDown={(event) => { const direction = ['ArrowRight','ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 0; if (direction && !answered) { event.preventDefault(); const next=(index+direction+options.length)%options.length; onSelect(options[next].id); event.currentTarget.parentElement.querySelectorAll('[role="radio"]')[next]?.focus(); } }}
              disabled={answered}
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
              <span className="lesson-quiz__card-badge">{String.fromCharCode(65 + index)}</span>

              {/* Text */}
              <div className="lesson-quiz__card-text">
                <span className="lesson-quiz__card-title">
                  {option.title}
                </span>
                <span className="lesson-quiz__card-caption">
                  {option.caption}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ---- AI result feedback ---- */}
      {answered && (
        <div
          className={`lesson-quiz__ai ${
            result.correct
              ? "lesson-quiz__ai--ok"
              : "lesson-quiz__ai--no"
          }`}
        >
          {result.aiAccuracy != null && (
            <span className="lesson-quiz__ai-accuracy">
              Độ chính xác AI: {result.aiAccuracy}%
            </span>
          )}
          {result.explanation && (
            <p className="lesson-quiz__ai-explain">{result.explanation}</p>
          )}
        </div>
      )}


    </section>
  );
};

export default QuizSection;
