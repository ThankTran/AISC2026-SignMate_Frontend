import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleCheck,
  Clock,
  Hand,
  Handshake,
  Heart,
  HeartPulse,
  Home,
  MessageCircleQuestion,
  Sparkles,
  ThumbsUp,
  Users,
  X,
} from "lucide-react";

import VideoPlayerFrame from "../../components/VideoPlayerFrame/VideoPlayerFrame";

import "./QuizPage.css";

const TOTAL_QUESTIONS = 10;
const INITIAL_INDEX = 3;
const INITIAL_SECONDS = 12 * 60 + 52;

const OPTION_ICONS = {
  hand: Hand,
  thumbsUp: ThumbsUp,
  handshake: Handshake,
  circleCheck: CircleCheck,
  heart: Heart,
  users: Users,
  home: Home,
  bookOpen: BookOpen,
  heartPulse: HeartPulse,
  sparkles: Sparkles,
};

const LETTERS = ["A", "B", "C", "D"];

const SIGN_POOL = [
  {
    title: "Xin chào",
    desc: "Động tác chào hỏi",
    icon: "hand",
  },
  {
    title: "Cảm ơn",
    desc: "Động tác bày tỏ lòng biết ơn",
    icon: "thumbsUp",
  },
  {
    title: "Tạm biệt",
    desc: "Động tác chia tay tạm biệt",
    icon: "handshake",
  },
  {
    title: "Đồng ý",
    desc: "Động tác gật đầu đồng tình",
    icon: "circleCheck",
  },
  {
    title: "Xin lỗi",
    desc: "Động tác xin lỗi chân thành",
    icon: "heart",
  },
  {
    title: "Bạn bè",
    desc: "Động tác thể hiện tình bạn",
    icon: "users",
  },
  {
    title: "Gia đình",
    desc: "Động tác chỉ những người thân",
    icon: "home",
  },
  {
    title: "Học tập",
    desc: "Động tác thể hiện việc học",
    icon: "bookOpen",
  },
  {
    title: "Sức khỏe",
    desc: "Động tác thể hiện sự khỏe mạnh",
    icon: "heartPulse",
  },
  {
    title: "Vui vẻ",
    desc: "Động tác thể hiện niềm vui",
    icon: "sparkles",
  },
];

const QUESTIONS = SIGN_POOL.map((sign, i) => ({
  id: i + 1,
  category: "Ngôn ngữ ký hiệu",
  target: sign.title,
  videoUrl: `/videos/sign-${i + 1}.mp4`,
  prompt: `Xem video minh họa và chọn ký hiệu đúng cho từ “${sign.title}”.`,
  options: LETTERS.map((letter, j) => {
    const item = SIGN_POOL[(i + j) % SIGN_POOL.length];
    return {
      key: letter,
      title: item.title,
      desc: item.desc,
      icon: item.icon,
    };
  }),
}));

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const QuizPage = () => {
  const { quizId } = useParams();
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(INITIAL_INDEX);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(INITIAL_SECONDS);
  const [submitted, setSubmitted] = useState(false);

  const question = QUESTIONS[current];
  const TargetIcon = OPTION_ICONS[question.options[0].icon];
  const answeredCount = Object.keys(answers).length;
  const isAnswered = (q) => answers[q.id] != null;
  const isLastQuestion = current >= TOTAL_QUESTIONS - 1;

  useEffect(() => {
    if (timeLeft <= 0) return undefined;
    const timer = setTimeout(() => {
      setTimeLeft((s) => s - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleSelect = (key) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [question.id]: key }));
  };

  const handleNext = () => {
    if (submitted || isLastQuestion) return;
    setCurrent((i) => Math.min(i + 1, TOTAL_QUESTIONS - 1));
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setAnswers({});
    setCurrent(0);
  };

  return (
    <div className="quiz">
      {/* ===== HEADER ===== */}
      <header className="quiz__header">
        <div className="quiz__header-left">
          <h1 className="quiz__header-title">
            Bài kiểm tra tổng hợp — Chương {quizId}
          </h1>
          <span className="quiz__difficulty">Độ khó: Nâng cao</span>
        </div>

        <div className="quiz__header-right">
          <div className="quiz__timer">
            <Clock size={16} strokeWidth={2.2} />
            <span className="quiz__timer-value">
              {timeLeft === 0 ? "00:00" : formatTime(timeLeft)}
            </span>
          </div>

          <Link to="/learning-path" className="quiz__exit">
            <X size={15} strokeWidth={2.5} />
            Thoát
          </Link>
        </div>
      </header>

      {/* ===== QUESTION BANNER ===== */}
      <div className="quiz__banner">
        <div className="quiz__banner-badges">
          <span className="quiz__badge quiz__badge--progress">
            Câu {current + 1} / {TOTAL_QUESTIONS}
          </span>
          <span className="quiz__badge quiz__badge--category">
            {question.category}
          </span>
        </div>

        <div className="quiz__prompt">
          <span className="quiz__prompt-icon">
            <MessageCircleQuestion size={19} strokeWidth={2} />
          </span>
          <p className="quiz__prompt-text">{question.prompt}</p>
        </div>
      </div>

      {/* ===== SUBMITTED RESULT ===== */}
      {submitted && (
        <div className="quiz__result">
          <span className="quiz__result-icon">
            <Check size={20} strokeWidth={3} />
          </span>
          <div className="quiz__result-body">
            <p className="quiz__result-title">Đã nộp bài kiểm tra!</p>
            <p className="quiz__result-sub">
              Bạn đã trả lời {answeredCount} / {TOTAL_QUESTIONS} câu hỏi.
            </p>
          </div>
          <button
            type="button"
            className="quiz__result-reset"
            onClick={handleReset}
          >
            Làm lại
          </button>
        </div>
      )}

      {/* ===== MAIN GRID ===== */}
      <div className="quiz__grid">
        {/* ---- LEFT: VIDEO PLAYER ---- */}
        <section className="quiz-media">
          <div className="quiz-media__header">
            <span className="quiz-media__title">VIDEO MINH HỌA</span>
            <span
              className={`quiz-media__live ${
                videoPlaying ? "quiz-media__live--on" : ""
              }`}
            >
              <span className="quiz-media__live-dot" />
              {videoPlaying ? "Đang phát" : "Đã tạm dừng"}
            </span>
          </div>

          <VideoPlayerFrame
            key={question.id}
            videoUrl={question.videoUrl}
            thumbLabel={`Ký hiệu: ${question.target}`}
            icon={TargetIcon && <TargetIcon size={44} strokeWidth={1.6} />}
            duration={28}
            initialTime={7}
            speeds={[1, 1.25, 1.5, 2]}
            replayLabel="Phát lại"
            onPlayStateChange={setVideoPlaying}
          />
        </section>

        {/* ---- RIGHT: ANSWER GRID ---- */}
        <section className="quiz-answers">
          <span className="quiz-answers__heading">Chọn đáp án đúng</span>

          <div className="quiz-answers__grid">
            {question.options.map((option) => {
              const Icon = OPTION_ICONS[option.icon];
              const selected = answers[question.id] === option.key;

              return (
                <button
                  type="button"
                  key={option.key}
                  className={`quiz-answer ${
                    selected ? "quiz-answer--selected" : ""
                  }`}
                  onClick={() => handleSelect(option.key)}
                >
                  <span className="quiz-answer__badge">{option.key}</span>

                  <div className="quiz-answer__thumb">
                    {Icon && <Icon size={42} strokeWidth={1.6} />}
                  </div>

                  <div className="quiz-answer__body">
                    <span className="quiz-answer__title">{option.title}</span>
                    <span className="quiz-answer__desc">{option.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* ===== FOOTER NAV BAR ===== */}
      <div className="quiz__navbar">
        <div className="quiz__nav-left">
          <div className="quiz__dots">
            {QUESTIONS.map((q, i) => (
              <button
                type="button"
                key={q.id}
                className={`quiz__dot ${
                  i === current
                    ? "quiz__dot--current"
                    : isAnswered(q)
                    ? "quiz__dot--answered"
                    : ""
                }`}
                onClick={() => setCurrent(i)}
                aria-label={`Câu hỏi ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="quiz__legend">
            <span className="quiz__legend-item">
              <span className="quiz__legend-swatch quiz__legend-swatch--answered" />
              Đã trả lời
            </span>
            <span className="quiz__legend-item">
              <span className="quiz__legend-swatch" />
              Chưa trả lời
            </span>
          </div>
        </div>

        <div className="quiz__nav-actions">
          {!submitted && !isLastQuestion && (
            <button
              type="button"
              className="quiz__next"
              onClick={handleNext}
            >
              Câu tiếp theo
              <ArrowRight size={16} strokeWidth={2.4} />
            </button>
          )}

          <button
            type="button"
            className="quiz__submit"
            onClick={handleSubmit}
          >
            Nộp câu trả lời
            <Check size={17} strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;