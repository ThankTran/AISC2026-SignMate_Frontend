import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Hand,
  HandHeart,
  Handshake,
  HeartHandshake,
  HeartPulse,
  Home,
  Users,
} from "lucide-react";

import "./LessonPage.css";

import LessonTopNav from "../../components/LessonPage/LessonTopNav";
import MediaView from "../../components/LessonPage/MediaView";
import QuizSection from "../../components/LessonPage/QuizSection";
import LessonFooter from "../../components/LessonPage/LessonFooter";
import LessonResultModal from "../../components/LessonPage/LessonResultModal";
import OutOfHeartsModal from "../../components/LessonPage/OutOfHeartsModal";

import { checkLessonAnswer, finishLesson } from "../../services/lessonApi";

const LESSON_ID = 1;
const MAX_ATTEMPTS = 3;
const MAX_HEARTS = 5;

const SIGN_POOL = [
  { title: "Xin chào", desc: "Lời chào hỏi", icon: Hand },
  { title: "Cảm ơn", desc: "Bày tỏ lòng biết ơn", icon: HandHeart },
  { title: "Tạm biệt", desc: "Lời chào khi chia tay", icon: Handshake },
  { title: "Xin lỗi", desc: "Bày tỏ sự xin lỗi", icon: HeartHandshake },
  { title: "Bạn bè", desc: "Tình bạn thân thiết", icon: Users },
  { title: "Gia đình", desc: "Người thân yêu thương", icon: Home },
  { title: "Học tập", desc: "Hoạt động học hành", icon: BookOpen },
  { title: "Sức khỏe", desc: "Cơ thể khỏe mạnh", icon: HeartPulse },
];

const LETTERS = ["A", "B", "C", "D"];

const LESSON_QUESTIONS = SIGN_POOL.map((sign, i) => {
  const options = LETTERS.map((letter, j) => {
    const item = SIGN_POOL[(i + j) % SIGN_POOL.length];
    return {
      id: letter,
      icon: item.icon,
      title: item.title,
      caption: item.desc,
    };
  });
  return {
    id: i + 1,
    title: sign.title,
    videoUrl: `/videos/ky-hieu-${i + 1}.mp4`,
    thumbLabel: `Ký hiệu: ${sign.title}`,
    icon: sign.icon,
    correctAnswer: "A",
    options,
  };
});

const EXPLANATIONS = {
  "Xin chào": "Bàn tay mở xoay nhẹ về phía trước thể hiện lời chào hỏi.",
  "Cảm ơn": "Đầu ngón tay chạm cằm rồi đưa ra ngoài, biểu lộ lòng biết ơn.",
  "Tạm biệt": "Các ngón tay khép rồi xòe ra như vẫy tay chia tay.",
  "Xin lỗi": "Nắm bàn tay xoay tròn trước ngực thể hiện sự hối lỗi.",
  "Bạn bè": "Hai ngón trỏ song song bên cạnh nhau thể hiện tình bạn.",
  "Gia đình": "Các ngón tay chụm lại rồi xòe ra quanh mặt, ý chỉ người thân.",
  "Học tập": "Bàn tay mở úp xuống, cử động như mở trang sách.",
  "Sức khỏe": "Bàn tay úp lên ngực, chuyển động nhẹ theo nhịp tim.",
};

const getSessionId = () => {
  const KEY = "signmate.sessionId";
  if (typeof window === "undefined") return "session-dev";
  let stored = window.localStorage.getItem(KEY);
  if (stored) return stored;
  stored = window.crypto?.randomUUID?.() ?? `session-${Date.now()}`;
  window.localStorage.setItem(KEY, stored);
  return stored;
};

const USER_SESSION_ID = getSessionId();

const simulateCheck = (question, selected) => ({
  correct: selected === question.correctAnswer,
  explanation:
    EXPLANATIONS[question.title] ??
    "Ký hiệu đã được nhận diện và đánh giá chính xác.",
  aiAccuracy: selected === question.correctAnswer ? 96 : 74,
  xpEarned: selected === question.correctAnswer ? 10 : 0,
});

const buildSummary = () => ({
  label: "BÀI HỌC 12 · CHƯƠNG 3",
  title: "Ngôn ngữ ký hiệu - Ký hiệu cơ bản",
  score: 94,
  passed: true,
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
});

const IS_DEV = import.meta.env?.DEV === true;
const INITIAL_QUESTION_INDEX = 3;

const LessonPage = () => {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [attempts, setAttempts] = useState(1);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [questionIndex, setQuestionIndex] = useState(INITIAL_QUESTION_INDEX);
  const [clickedCorrect, setClickedCorrect] = useState(false);
  const [resultModal, setResultModal] = useState(null);

  const advanceLockRef = useRef(false);
  const correctCountRef = useRef(0);

  const question = LESSON_QUESTIONS[questionIndex];
  const isLast = questionIndex >= LESSON_QUESTIONS.length - 1;
  const remainingQuestions = LESSON_QUESTIONS.length - (questionIndex + 1);

  const handleSelect = (id) => {
    if (result || checking) return;
    setSelected(id);
  };

  const applyResult = (response) => {
    const correct = response.correct === true;

    setResult({
      correct,
      explanation: response.explanation ?? "",
      aiAccuracy: response.aiAccuracy ?? null,
      xpEarned: response.xpEarned ?? (correct ? 10 : 0),
    });

    if (correct) {
      setClickedCorrect(true);
      correctCountRef.current += 1;
    } else {
      setHearts((h) => Math.max(0, h - 1));
      setAttempts((a) => Math.min(a + 1, MAX_ATTEMPTS));
    }

    advanceLockRef.current = true;
  };

  const handleCheck = async () => {
    if (!selected || result || checking) return;

    setChecking(true);
    let response;
    try {
      response = await checkLessonAnswer({
        lessonId: LESSON_ID,
        questionId: question.id,
        selectedOptionId: selected,
        userSessionId: USER_SESSION_ID,
      });
    } catch {
      response = simulateCheck(question, selected);
    }
    setChecking(false);

    applyResult(response);
  };

  const completeLesson = async () => {
    const correctCount = correctCountRef.current;

    let summary;
    try {
      summary = await finishLesson({
        lessonId: LESSON_ID,
        userSessionId: USER_SESSION_ID,
        correctCount,
        totalQuestions: LESSON_QUESTIONS.length,
      });
    } catch {
      summary = buildSummary();
    }

    setSelected(null);
    setResult(null);
    setResultModal(summary);
  };

  const jumpToQuestion = (index) => {
    advanceLockRef.current = false;
    setSelected(null);
    setResult(null);
    setAttempts(1);
    setQuestionIndex(Math.max(0, Math.min(index, LESSON_QUESTIONS.length - 1)));
  };

  const handleSegmentClick = (index) => {
    jumpToQuestion(index);
  };

  const handleAdvance = () => {
    if (!advanceLockRef.current) return;
    advanceLockRef.current = false;

    if (isLast) {
      setResult(null);
      completeLesson();
      return;
    }

    setSelected(null);
    setResult(null);
    setAttempts(1);
    setQuestionIndex((i) => i + 1);
  };

  const handleRetake = () => {
    advanceLockRef.current = false;
    setResultModal(null);
    setSelected(null);
    setResult(null);
    setChecking(false);
    setAttempts(1);
    setHearts(MAX_HEARTS);
    setQuestionIndex(INITIAL_QUESTION_INDEX);
    setClickedCorrect(false);
    correctCountRef.current = 0;
  };

  const correctAnswerName = question.options.find(
    (option) => option.id === question.correctAnswer
  )?.title;

  return (
    <div className="lesson">
      {/* ===== TOP NAV ===== */}
      <LessonTopNav
        hearts={hearts}
        currentQuestion={questionIndex + 1}
        totalQuestions={LESSON_QUESTIONS.length}
        onSegmentClick={IS_DEV ? handleSegmentClick : undefined}
      />

      {/* ===== BODY ===== */}
      <div className="lesson__body">
        <MediaView question={question} />
        <QuizSection
          question={question}
          selected={selected}
          result={result}
          onSelect={handleSelect}
          attempts={attempts}
        />
      </div>

      {/* ===== FOOTER ===== */}
      <LessonFooter
        selected={selected}
        result={result}
        checking={checking}
        questionIndex={questionIndex + 1}
        totalQuestions={LESSON_QUESTIONS.length}
        remainingQuestions={remainingQuestions}
        isLast={isLast}
        correctAnswerName={correctAnswerName}
        firstTimeCorrect={clickedCorrect}
        onCheck={handleCheck}
        onAdvance={handleAdvance}
      />

      {/* ===== LESSON RESULT MODAL ===== */}
      {resultModal && (
        <LessonResultModal
          summary={resultModal}
          onClose={handleRetake}
          onRetake={handleRetake}
          onNext={() => navigate("/learning-path")}
        />
      )}

      {/* ===== OUT OF HEARTS MODAL ===== */}
      {hearts <= 0 && !resultModal && <OutOfHeartsModal />}
    </div>
  );
};

export default LessonPage;