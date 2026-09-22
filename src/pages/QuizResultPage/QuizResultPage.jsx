import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  CircleCheckBig,
  CircleX,
  Flame,
  RotateCcw,
  Star,
  Target,
  Timer,
  Trophy,
} from "lucide-react";

import "./QuizResultPage.css";

const TOTAL_QUESTIONS = 10;
const CORRECT_COUNT = 8;
const WRONG_COUNT = 2;
const ACCURACY = Math.round((CORRECT_COUNT / TOTAL_QUESTIONS) * 100);
const XP_REWARD = 150;
const ELAPSED_SECONDS = 4 * 60 + 12;
const AVG_SECONDS = Math.round(ELAPSED_SECONDS / TOTAL_QUESTIONS);
const WRONG_IDS = [3, 7];

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const QUESTIONS = [
  "Xin chào",
  "Cảm ơn",
  "Tạm biệt",
  "Đồng ý",
  "Xin lỗi",
  "Bạn bè",
  "Gia đình",
  "Học tập",
  "Sức khỏe",
  "Vui vẻ",
];

const REVIEW_ROWS = QUESTIONS.map((title, index) => {
  const id = index + 1;
  return {
    id,
    label: String(id).padStart(2, "0"),
    question: `Xem video minh họa và chọn ký hiệu đúng cho từ “${title}”.`,
    correct: !WRONG_IDS.includes(id),
  };
});

const STATS = [
  {
    key: "accuracy",
    icon: <Target size={20} strokeWidth={2.2} />,
    value: `${ACCURACY}%`,
    label: "Độ chính xác",
    note: `${CORRECT_COUNT} trên ${TOTAL_QUESTIONS} câu đúng`,
    tone: "green",
  },
  {
    key: "score",
    icon: <CircleCheckBig size={20} strokeWidth={2.2} />,
    value: `${CORRECT_COUNT} / ${TOTAL_QUESTIONS}`,
    label: "Số câu đúng",
    note: `${WRONG_COUNT} câu cần ôn tập lại`,
    tone: "coral",
  },
  {
    key: "time",
    icon: <Timer size={20} strokeWidth={2.2} />,
    value: `${String(Math.floor(ELAPSED_SECONDS / 60)).padStart(2, "0")}:${String(
      ELAPSED_SECONDS % 60
    ).padStart(2, "0")}`,
    label: "Thời gian hoàn thành",
    note: `Trung bình ${AVG_SECONDS}s / câu`,
    tone: "teal",
  },
  {
    key: "streak",
    icon: <Flame size={20} strokeWidth={2.2} />,
    value: "+1 Ngày",
    label: "Chuỗi ngày học",
    note: "Duy trì thêm 1 ngày học",
    tone: "gold",
  },
];

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "right", label: "Đúng" },
  { key: "wrong", label: "Sai" },
];

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [filter, setFilter] = useState("all");

  const rows = REVIEW_ROWS.filter(
    (row) =>
      filter === "all" ||
      (filter === "right" && row.correct) ||
      (filter === "wrong" && !row.correct)
  );

  const arcOffset = CIRCUMFERENCE - (ACCURACY / 100) * CIRCUMFERENCE;

  return (
    <div className="qr">
      {/* ===== BREADCRUMB ===== */}
      <nav className="qr-crumbs" aria-label="Breadcrumb">
        <Link to="/learning-path" className="qr-crumbs__link">
          Bài kiểm tra
        </Link>
        <ChevronRight size={15} className="qr-crumbs__chevron" />
        <span className="qr-crumbs__current">Kết quả</span>
      </nav>

      {/* ===== HERO COMPLETION BANNER ===== */}
      <section className="qr-hero">
        <div className="qr-hero__main">
          <span className="qr-hero__badge">
            <Trophy size={16} strokeWidth={2.2} />
            HOÀN THÀNH - Bài kiểm tra tổng hợp — Chương {quizId}
          </span>

          <h1 className="qr-hero__title">Xuất sắc! Bạn làm rất tốt 🎉</h1>

          <p className="qr-hero__subtitle">
            Bạn đã trả lời đúng {CORRECT_COUNT} / {TOTAL_QUESTIONS} câu hỏi chỉ
            trong{" "}
            {`${String(Math.floor(ELAPSED_SECONDS / 60)).padStart(2, "0")}:${String(
              ELAPSED_SECONDS % 60
            ).padStart(2, "0")}`}
            . Hãy tiếp tục duy trì chuỗi ngày học của mình nhé!
          </p>

          <div className="qr-hero__reward">
            <span className="qr-hero__reward-icon">
              <Star size={20} strokeWidth={2.2} fill="currentColor" />
            </span>
            <div className="qr-hero__reward-body">
              <strong className="qr-hero__reward-value">+{XP_REWARD} XP</strong>
              <span className="qr-hero__reward-label">
                Phần thưởng hoàn thành bài kiểm tra
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
                r={RADIUS}
                fill="none"
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="9"
              />
              <circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke="#f7c873"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={arcOffset}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="qr-hero__donut-label">
              <span className="qr-hero__donut-value">{ACCURACY}%</span>
              <span className="qr-hero__donut-caption">Độ chính xác</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SUMMARY GRID ===== */}
      <div className="qr-stats">
        {STATS.map((stat) => (
          <div className={`qr-stat qr-stat--${stat.tone}`} key={stat.key}>
            <span className="qr-stat__icon">{stat.icon}</span>
            <span className="qr-stat__value">{stat.value}</span>
            <span className="qr-stat__label">{stat.label}</span>
            <span className="qr-stat__note">{stat.note}</span>
          </div>
        ))}
      </div>

      {/* ===== DETAILED ANSWER REVIEW TABLE ===== */}
      <section className="qr-review">
        <header className="qr-review__head">
          <div className="qr-review__titles">
            <h2 className="qr-review__title">Xem lại câu trả lời</h2>
            <span className="qr-review__summary">
              {TOTAL_QUESTIONS} câu hỏi · {CORRECT_COUNT} đúng · {WRONG_COUNT}{" "}
              sai
            </span>
          </div>

          <div className="qr-review__tabs" role="tablist" aria-label="Lọc kết quả">
            {FILTERS.map((f) => (
              <button
                type="button"
                key={f.key}
                role="tab"
                aria-selected={filter === f.key}
                className={`qr-review__tab ${
                  filter === f.key ? "qr-review__tab--active" : ""
                }`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>

        <div className="qr-review__list">
          {rows.map((row) => (
            <div className="qr-review__row" key={row.id}>
              <span className="qr-review__num">{row.label}</span>
              <p className="qr-review__question">{row.question}</p>
              <span
                className={`qr-review__status qr-review__status--${
                  row.correct ? "right" : "wrong"
                }`}
              >
                {row.correct ? (
                  <CircleCheckBig size={14} strokeWidth={2.4} />
                ) : (
                  <CircleX size={14} strokeWidth={2.4} />
                )}
                {row.correct ? "Đúng" : "Sai"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ACTION BAR ===== */}
      <div className="qr-actions">
        <Link
          to={`/learning-path/quiz/${quizId}`}
          className="qr-actions__secondary"
        >
          <RotateCcw size={16} strokeWidth={2.4} />
          Luyện tập lại
        </Link>
        <Link to="/learning-path" className="qr-actions__primary">
          Tiếp tục học
          <ArrowRight size={17} strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
};

export default QuizResultPage;