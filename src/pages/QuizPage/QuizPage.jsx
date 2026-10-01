import QuizRouteGuard from "./QuizRouteGuard";
import {useProgress} from "../../hooks/useProgress";
import { useConfirm } from "../../hooks/useConfirm";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
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
import { learningApi } from "../../services/api";
import { useApiResource } from "../../hooks/useApiResource";
import ApiState from "../../components/ApiState";

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

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const QuizSession = ({ quiz }) => {
 const {recordQuiz}=useProgress();
  const confirm = useConfirm();
  const confirmExit = async (event) => { event.preventDefault(); if (await confirm({ title: "Thoát bài kiểm tra?", message: "Tiến độ chưa hoàn tất trong phiên này có thể không được lưu.", confirmLabel: "Thoát" })) navigate('/learning-path'); };
  const QUESTIONS = quiz.questions.map((q) => ({ ...q, category: "Ngôn ngữ ký hiệu",
    prompt: "Xem video minh họa và chọn ký hiệu đúng." }));
  const TOTAL_QUESTIONS = QUESTIONS.length;
  const [sessionId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingOption, setPendingOption] = useState(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  const [feedback, setFeedback] = useState({});
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const totalSeconds = quiz.durationSeconds || quiz.timeLimitSeconds || 20 * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [expired, setExpired] = useState(false);
  const finished = useRef(false);
  const [deadline] = useState(() => Date.now() + totalSeconds * 1000);
  const autoAttempted = useRef(false);
  const autoSubmit = useRef(null);

  const question = QUESTIONS[current];
  const isAnswered = (q) => answers[q.id] != null;
  const allAnswered = QUESTIONS.every(isAnswered);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (!remaining && !finished.current) { setExpired(true); autoSubmit.current?.(); }
    }, 250);
    return () => clearInterval(timer);
  }, [deadline]);

  const submitAnswers = async (nextAnswers, automatic = false) => {
    if (busy.current || finished.current) return;
    if (!automatic && !await confirm({ title: "Nộp bài kiểm tra?", message: allAnswered ? "Bạn đã trả lời tất cả câu hỏi. Nộp bài để xem kết quả?" : `Còn ${TOTAL_QUESTIONS - Object.keys(nextAnswers).length} câu chưa trả lời. Các câu này được tính là chưa đúng.`, confirmLabel: "Nộp bài" })) return;
    if (busy.current || finished.current) return;
    busy.current = true;
    const elapsedSeconds = Math.min(totalSeconds, Math.max(0, Math.round((new Date().getTime() - (deadline - totalSeconds * 1000)) / 1000)));
    setSubmitting(true);
    setError(null);
    try {
      const result = await learningApi.submitQuiz(quizId, { userSessionId: sessionId, answers: nextAnswers });
      if (!mounted.current) return;
      finished.current = true;
      recordQuiz(quizId,{result,answers:nextAnswers,questions:QUESTIONS,elapsedSeconds});
      navigate(`/learning-path/quiz/${quizId}/result`, { state: { result, answers: nextAnswers, questions: QUESTIONS, elapsedSeconds } });
    } catch (err) { if (mounted.current) setError(err); }
    finally { busy.current = false; if (mounted.current) setSubmitting(false); }
  };

  useEffect(() => { autoSubmit.current = () => { if (!busy.current && !autoAttempted.current) { autoAttempted.current = true; void submitAnswers(answers, true); } }; });

  const handleSelect = async (key) => {
    if (expired || busy.current || answers[question.id] != null) return;
    busy.current = true;
    setSubmitting(true);
    setPendingOption(key);
    setError(null);
    try {
      const result = await learningApi.checkQuiz(quizId, { questionId: question.id, selectedOptionId: key });
      if (!mounted.current) return;
      const nextAnswers = { ...answers, [question.id]: key };
      setAnswers(nextAnswers);
      setFeedback((prev) => ({ ...prev, [question.id]: result }));
    } catch (err) {
      if (mounted.current) setError(err.status === 404 || err.status === 405
        ? new Error("Máy chủ chưa có API chấm câu mới. Hãy khởi động lại backend rồi chọn đáp án lại.")
        : err);
    }
    finally {
      busy.current = false;
      if (mounted.current) { setSubmitting(false); setPendingOption(null); }
    }
  };

  const goToQuestion = (index) => {
    if (busy.current || finished.current) return;
    setCurrent(index);
    setError(null);
  };

  const handleNext = () => {
    if (busy.current || finished.current || !isAnswered(question)) return;
    if (allAnswered) {
      void submitAnswers(answers);
      return;
    }
    // At the end, return to any question skipped using the numbered navigation.
    goToQuestion(current < TOTAL_QUESTIONS - 1
      ? current + 1 : QUESTIONS.findIndex((item) => !isAnswered(item)));
  };

  if(error?.status===403)return <QuizRouteGuard error={error}/>;
  return (
    <div className="quiz">
      {/* ===== HEADER ===== */}
      <header className="quiz__header">
        <div className="quiz__header-left">
          <h1 className="quiz__header-title text-h1">
            Bài kiểm tra tổng hợp — Chương {quizId}
          </h1>
          <span className="quiz__difficulty">Độ khó: Nâng cao</span>
        </div>

        <div className="quiz__header-right">
          <div className={`quiz__timer ${timeLeft <= 10 ? "quiz__timer--urgent" : timeLeft <= 60 ? "quiz__timer--warning" : ""}`}>
            <Clock size={16} strokeWidth={2.2} />
            <span className="quiz__timer-value">
              {timeLeft === 0 ? "00:00" : formatTime(timeLeft)}
            </span>
          </div>

          <span className="sr-only" role="status" aria-live="polite">{timeLeft <= 0 ? "Hết giờ, đang nộp bài." : timeLeft <= 10 ? "Còn 10 giây hoặc ít hơn." : timeLeft <= 60 ? "Còn một phút hoặc ít hơn." : ""}</span>
          <Link onClick={confirmExit} to="/learning-path" className="quiz__exit">
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
          <button type="button" className="quiz__prompt-icon" aria-label="Hướng dẫn" aria-describedby="quiz-help">
            <MessageCircleQuestion size={19} strokeWidth={2} />
          </button>
          <p id="quiz-help" role="tooltip" className="quiz__prompt-text">{question.prompt}</p>
        </div>
      </div>

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
                    feedback[question.id] ? selected
                      ? feedback[question.id].correct ? "quiz-answer--correct" : "quiz-answer--incorrect"
                      : option.key === feedback[question.id].correctOptionId ? "quiz-answer--correct" : ""
                      : pendingOption === option.key ? "quiz-answer--pending" : ""
                  }`}
                  disabled={submitting || isAnswered(question)}
                  aria-pressed={selected || pendingOption === option.key}
                  aria-busy={pendingOption === option.key}
                  onClick={() => handleSelect(option.key)}
                >
                  <span className="quiz-answer__badge">{option.key}</span>

                  <div className="quiz-answer__thumb">
                    {Icon && <Icon size={42} strokeWidth={1.6} />}
                  </div>

                  <div className="quiz-answer__body">
                    <span className="quiz-answer__title">{option.title}</span>
                    <span className="quiz-answer__desc">{option.desc}</span>
                    {pendingOption === option.key && <span className="quiz-answer__verdict">Đang chấm…</span>}
                    {selected && feedback[question.id] && (
                      <span className="quiz-answer__verdict">
                        {feedback[question.id].correct ? "✓ Chính xác" : "✕ Chưa đúng"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="quiz-answers__actions">
            <p id="quiz-next-hint" className="quiz-answers__feedback" role="status">
              {submitting ? pendingOption ? "Đang chấm đáp án…" : "Đang lưu kết quả…"
                : !isAnswered(question) ? "Chọn một đáp án để tiếp tục." : ""}
            </p>
            <div className="quiz-answers__buttons">
            <button type="button" className="quiz__finish-early" disabled={submitting || current === 0} onClick={() => goToQuestion(current - 1)}>← Câu trước</button>
            {!allAnswered && <button type="button" className="quiz__finish-early"
              disabled={submitting} onClick={() => submitAnswers(answers, expired)}>
              Nộp bài
            </button>}
            <button type="button" className="quiz__next"
              aria-describedby={!isAnswered(question) ? "quiz-next-hint" : undefined}
              disabled={submitting || !isAnswered(question)}
              onClick={handleNext}>
              {allAnswered ? "Xem kết quả" : current === TOTAL_QUESTIONS - 1
                ? "Đến câu chưa trả lời" : "Câu tiếp theo →"}
            </button>
            </div>
          </div>
          {!allAnswered && <p className="quiz-answers__submit-note">Có thể nộp ngay. Câu chưa trả lời được tính là chưa đúng.</p>}
          {error && <div className="quiz-answers__error" role="alert">
            <p>{error.message}</p>
            {expired || Object.keys(answers).length === TOTAL_QUESTIONS
              ? <button type="button" disabled={submitting} onClick={() => submitAnswers(answers, expired)}>Thử lưu lại kết quả</button>
              : <p>Vui lòng thử lại thao tác vừa thực hiện.</p>}
          </div>}
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
                disabled={submitting}
                aria-current={i === current ? "step" : undefined}
                onClick={() => goToQuestion(i)}
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
      </div>
    </div>
  );
};

export default function QuizPage() {
  const { quizId } = useParams();
  const load = useCallback(() => learningApi.quiz(quizId), [quizId]);
  const { data, error } = useApiResource(load);
  if (!data || String(data.chapterId) !== quizId) return <QuizRouteGuard error={error}><ApiState error={error} /></QuizRouteGuard>;
  if (!data.questions?.length) return <p role="status">Bài kiểm tra đang được cập nhật.</p>;
  return <QuizSession key={quizId} quiz={data} />;
}
