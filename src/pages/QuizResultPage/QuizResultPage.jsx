import { useApiResource } from "../../hooks/useApiResource";
import { learningApi } from "../../services/api";
import VideoPlayerFrame from "../../components/VideoPlayerFrame/VideoPlayerFrame";
import Modal from "../../components/ui/Modal";
import { useState, useCallback } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  CircleCheckBig,
  CircleX,
  RotateCcw,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { useProgress } from "../../hooks/useProgress";
import EmptyState from "../../components/ui/EmptyState";
import ApiState from "../../components/ApiState";
import "./QuizResultPage.css";

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "right", label: "Đúng" },
  { key: "wrong", label: "Sai" },
];

function QuizResult({ result, questions = [], elapsedSeconds }) {
  const [videoQuestion, setVideoQuestion] = useState(null);
  const [filter, setFilter] = useState("all");
  const wrong = result.totalQuestions - result.correctCount;
  const rows = result.review.filter(
    (row) => filter === "all" || (filter === "right" ? row.correct : !row.correct),
  );
  const stats = [
    {
      key: "accuracy",
      icon: <Target size={20} />,
      value: `${result.score}%`,
      label: "Độ chính xác",
      tone: "green",
    },
    {
      key: "correct",
      icon: <CircleCheckBig size={20} />,
      value: result.correctCount,
      label: "Câu đúng",
      tone: "teal",
    },
    {
      key: "wrong",
      icon: <CircleX size={20} />,
      value: wrong,
      label: "Câu cần ôn lại",
      tone: "coral",
    },
    {
      key: "xp",
      icon: <Star size={20} />,
      value: `+${result.xp} XP`,
      label: "Điểm được ghi nhận",
      tone: "gold",
    },
  ];

  return (
    <div className="qr">
      <nav className="qr-crumbs" aria-label="Breadcrumb">
        <Link to="/learning-path" className="qr-crumbs__link touch-target">
          Bài kiểm tra
        </Link>
        <ChevronRight size={15} />
        <span className="qr-crumbs__current">Kết quả</span>
      </nav>
      <section className="qr-hero">
        <div className="qr-hero__main">
          <span className="qr-hero__badge">
            <Trophy size={16} /> HOÀN THÀNH · CHƯƠNG {result.chapterId}
          </span>
          <h1 className="qr-hero__title text-h1">
            {result.score >= 80
              ? "Bạn làm rất tốt!"
              : result.score >= 50
                ? "Bạn đang tiến bộ, tiếp tục luyện tập nhé!"
                : "Hãy ôn tập và thử lại nhé!"}
          </h1>
          <p className="qr-hero__subtitle">
            Bạn trả lời đúng {result.correctCount} / {result.totalQuestions} câu hỏi.
          </p>
          <div className="qr-hero__reward">
            <span className="qr-hero__reward-icon">
              <Star size={20} fill="currentColor" />
            </span>
            <div className="qr-hero__reward-body">
              <strong className="qr-hero__reward-value">+{result.xp} XP</strong>
              <span className="qr-hero__reward-label">
                XP thưởng cho lần đầu vượt qua bài kiểm tra
              </span>
            </div>
          </div>
        </div>
        <div className="qr-hero__side">
          <div className="qr-hero__donut">
            <svg viewBox="0 0 100 100" className="qr-hero__donut-svg">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,.22)"
                strokeWidth="9"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f7c873"
                strokeWidth="9"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - result.score / 100)}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="qr-hero__donut-label">
              <span className="qr-hero__donut-value">{result.score}%</span>
              <span className="qr-hero__donut-caption">Độ chính xác</span>
            </div>
          </div>
        </div>
      </section>
      {elapsedSeconds != null && (
        <p className="text-number-sm">
          Thời gian làm bài: {Math.floor(elapsedSeconds / 60)} phút {elapsedSeconds % 60} giây
        </p>
      )}
      <div className="qr-stats">
        {stats.map((stat) => (
          <div className={`qr-stat qr-stat--${stat.tone}`} key={stat.key}>
            <span className="qr-stat__icon">{stat.icon}</span>
            <span className="qr-stat__value">{stat.value}</span>
            <span className="qr-stat__label">{stat.label}</span>
          </div>
        ))}
      </div>
      <section className="qr-review">
        <header className="qr-review__head">
          <div className="qr-review__titles">
            <h2 className="qr-review__title text-h2">Xem lại câu trả lời</h2>
            <span className="qr-review__summary">
              {result.totalQuestions} câu · {result.correctCount} đúng · {wrong} sai
            </span>
          </div>
          <div className="qr-review__tabs" role="tablist" aria-label="Lọc kết quả">
            {FILTERS.map((item) => (
              <button
                type="button"
                key={item.key}
                role="tab"
                id={`review-tab-${item.key}`}
                aria-controls="review-panel"
                aria-selected={filter === item.key}
                tabIndex={filter === item.key ? 0 : -1}
                onKeyDown={(event) => {
                  const index = FILTERS.findIndex((f) => f.key === filter);
                  const next =
                    event.key === "ArrowRight"
                      ? (index + 1) % FILTERS.length
                      : event.key === "ArrowLeft"
                        ? (index + FILTERS.length - 1) % FILTERS.length
                        : event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? FILTERS.length - 1
                            : null;

                  if (next !== null) {
                    event.preventDefault();
                    setFilter(FILTERS[next].key);
                    document.getElementById(`review-tab-${FILTERS[next].key}`)?.focus();
                  }
                }}
                className={`qr-review__tab ${filter === item.key ? "qr-review__tab--active" : ""}`}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>
        <div
          className="qr-review__list"
          role="tabpanel"
          id="review-panel"
          aria-labelledby={`review-tab-${filter}`}
          tabIndex={0}
        >
          {rows.map((row) => (
            <div className="qr-review__row" key={row.id}>
              <span className="qr-review__num">{row.id}</span>
              <div className="qr-review__question">
                <p>{row.title}</p>
                <p>
                  Đáp án của bạn:{" "}
                  {questions
                    .find((q) => String(q.id) === String(row.id))
                    ?.options.find((o) => (o.key || o.id) === row.selectedOptionId)?.title ||
                    row.selectedOptionId ||
                    "Chưa trả lời"}
                </p>
                <p>
                  Đáp án đúng:{" "}
                  {questions
                    .find((q) => String(q.id) === String(row.id))
                    ?.options.find((o) => (o.key || o.id) === row.correctOptionId)?.title ||
                    row.correctOptionId}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setVideoQuestion(questions.find((q) => String(q.id) === String(row.id)) || row)
                  }
                >
                  Xem lại video
                </button>
              </div>
              <span
                className={`qr-review__status qr-review__status--${row.correct ? "right" : "wrong"}`}
              >
                {row.correct ? <CircleCheckBig size={14} /> : <CircleX size={14} />}
                {row.correct ? "Đúng" : row.selectedOptionId ? "Sai" : "Chưa trả lời"}
              </span>
            </div>
          ))}
        </div>
      </section>
      {videoQuestion && (
        <Modal labelledBy="review-video-title" onClose={() => setVideoQuestion(null)}>
          <h2 id="review-video-title" className="text-h2">
            Xem lại ký hiệu
          </h2>
          <VideoPlayerFrame videoUrl={videoQuestion.videoUrl} />
          <button type="button" onClick={() => setVideoQuestion(null)}>
            Đóng
          </button>
        </Modal>
      )}
      <div className="qr-actions">
        <Link to={`/learning-path/quiz/${result.chapterId}`} className="qr-actions__secondary">
          <RotateCcw size={16} />
          Luyện tập lại
        </Link>
        <Link to="/learning-path" className="qr-actions__primary">
          Tiếp tục học
          <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}

export default function QuizResultPage() {
  const { quizId } = useParams(),
    { state } = useLocation(),
    progress = useProgress();
  const routed = String(state?.result?.chapterId) === quizId ? state : null;
  const mock = progress.source === "mock" ? progress.quizResults[quizId] : null;
  const load = useCallback(async () => {
    if (routed || mock) {
      return routed || mock;
    }

    const result = await learningApi.quizResult(quizId);

    return { result, questions: result.questions || [], elapsedSeconds: result.elapsedSeconds };
  }, [quizId, routed, mock]);
  const { data, error } = useApiResource(load);

  if (error?.status === 404) {
    return (
      <EmptyState
        title="Chưa có kết quả kiểm tra"
        description="Hoàn thành bài kiểm tra để xem kết quả và câu trả lời."
      />
    );
  }

  if (!data || error) {
    return <ApiState error={error} />;
  }

  return (
    <QuizResult
      result={data.result}
      questions={data.questions}
      elapsedSeconds={data.elapsedSeconds}
    />
  );
}
