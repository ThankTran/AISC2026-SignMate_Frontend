import { useState } from "react";

import "./LessonPage.css";

import LessonTopNav from "../../components/LessonPage/LessonTopNav";
import MediaView from "../../components/LessonPage/MediaView";
import QuizSection from "../../components/LessonPage/QuizSection";
import LessonFooter from "../../components/LessonPage/LessonFooter";
import OutOfHeartsModal from "../../components/LessonPage/OutOfHeartsModal";

const CORRECT_ANSWER = "A";
const TOTAL_QUESTIONS = 8;

const LessonPage = () => {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null); // "correct" | "wrong" | null
  const [attempts, setAttempts] = useState(1);
  const [hearts, setHearts] = useState(5);
  const [questionIndex, setQuestionIndex] = useState(4);
  const [clickedCorrect, setClickedCorrect] = useState(false);

  const handleCheck = () => {
    if (!selected || result) return;

    if (selected === CORRECT_ANSWER) {
      setResult("correct");
      setClickedCorrect(true);
    } else {
      setResult("wrong");
      setHearts((h) => h - 1);
      if (attempts < 3) setAttempts((a) => a + 1);
    }
  };

  const handleAdvance = () => {
    setSelected(null);
    setResult(null);
    setAttempts(1);
    setQuestionIndex((i) => Math.min(i + 1, TOTAL_QUESTIONS));
  };

  const remainingQuestions = TOTAL_QUESTIONS - questionIndex;

  return (
    <div className="lesson">
      {/* ===== TOP NAV ===== */}
      <LessonTopNav hearts={hearts} />

      {/* ===== BODY ===== */}
      <div className="lesson__body">
        <MediaView />
        <QuizSection
          selected={selected}
          result={result}
          onSelect={(id) => {
            if (!result) setSelected(id);
          }}
          attempts={attempts}
        />
      </div>

      {/* ===== FOOTER ===== */}
      <LessonFooter
        selected={selected}
        result={result}
        onCheck={handleCheck}
        onAdvance={handleAdvance}
        questionIndex={questionIndex}
        remainingQuestions={remainingQuestions}
        correctAnswer={CORRECT_ANSWER}
        firstTimeCorrect={clickedCorrect}
      />

      {/* ===== OUT OF HEARTS MODAL ===== */}
      {hearts <= 0 && <OutOfHeartsModal />}
    </div>
  );
};

export default LessonPage;