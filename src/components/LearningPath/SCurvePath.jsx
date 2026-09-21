import {
  BookOpen,
  Check,
  Clock,
  Hand,
  Home,
  Lock,
  MessageCircle,
  Palette,
  Play,
  Smile,
  Star,
  Sun,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  CHAPTERS,
  getLastLessonStatus,
  SON_CHUONG_LABEL,
} from "../../mockdata";

import "./SCurvePath.css";

/* Icons theo key trong dữ liệu (để dữ liệu thuần, tách khỏi component) */
const CHAPTER_ICONS = {
  bookOpen: <BookOpen size={22} strokeWidth={2.2} />,
  messageCircle: <MessageCircle size={22} strokeWidth={2.2} />,
  users: <Users size={22} strokeWidth={2.2} />,
  palette: <Palette size={22} strokeWidth={2.2} />,
  sun: <Sun size={24} strokeWidth={2} />,
  smile: <Smile size={22} strokeWidth={2.2} />,
  home: <Home size={22} strokeWidth={2.2} />,
  hand: <Hand size={22} strokeWidth={2.2} />,
};

/* =========================================================
   ĐƯỜNG NỐI SVG (khớp viewBox 700x1650, tọa độ theo px)
   tone: done | active | pending
   ========================================================= */

const SEGMENTS = [
  // ---- Chương 1 (hoàn thành - xanh lá) ----
  { d: "M 350,100 C 350,145 140,145 140,190", tone: "done" },
  { d: "M 140,190 C 390,190 310,320 560,320", tone: "done" },
  { d: "M 560,320 C 310,320 390,450 140,450", tone: "done" },
  { d: "M 140,450 C 350,450 400,580 560,580", tone: "done" },
  // Nối Quiz Ch1 -> Header Ch2 (uốn lượn sang chương tiếp theo)
  {
    d: "M 560,580 C 730,610 730,760 560,760 C 440,760 300,770 155,770",
    tone: "done",
    transition: true,
  },
  // ---- Chương 2 (đang học) ----
  { d: "M 350,800 C 350,850 140,850 140,900", tone: "done" },
  { d: "M 140,900 C 390,900 310,1060 560,1060", tone: "active" },
  { d: "M 560,1060 C 310,1060 390,1220 140,1220", tone: "pending" },
  // Đoạn vào bài kiểm tra cuối chương (chưa mở khóa - xám)
  { d: "M 140,1220 C 350,1220 400,1400 560,1400", tone: "pending" },
];

/* =========================================================
   HEADER CHƯƠNG
   ========================================================= */

const ChapterHeader = ({ chapter }) => {
  const { status } = chapter;
  const pct = Math.round((chapter.done / chapter.total) * 100);

  return (
    <div
      className={`lp-chapter lp-chapter--${status}`}
      style={{ top: `${chapter.header.y}%`, left: `${chapter.header.x}%` }}
    >
      <div className="lp-chapter__head">
        <span className="lp-chapter__tag">{chapter.tag}</span>
        <span className="lp-chapter__status">
          {SON_CHUONG_LABEL[status]}
        </span>
      </div>

      <h3 className="lp-chapter__title">{chapter.title}</h3>
      <p className="lp-chapter__desc">{chapter.desc}</p>

      <div className="lp-chapter__foot">
        <div className="lp-chapter__bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <span className="lp-chapter__count">
          {chapter.done}/{chapter.total} Bài học
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   NODE BÀI HỌC
   ========================================================= */

const LessonIcon = ({ lesson }) => {
  const glyph =
    lesson.status === "completed" ? (
      <Check size={24} strokeWidth={2.8} />
    ) : (
      CHAPTER_ICONS[lesson.icon]
    );

  return (
    <div className={`lp-node__icon lp-node__icon--${lesson.status}`}>
      <div className={`lp-node__ring lp-node__ring--${lesson.status}`} />
      <span className="lp-node__glyph">{glyph}</span>
    </div>
  );
};

const LessonNode = ({ lesson }) => {
  const interactive =
    lesson.status === "completed" || lesson.status === "unlocked";

  return (
    <div
      className="lp-node"
      style={{ top: `${lesson.y}%`, left: `${lesson.x}%` }}
    >
      {interactive ? (
        <Link
          className="lp-node__link"
          to={`/learning-path/lesson/${lesson.id}`}
        >
          <LessonIcon lesson={lesson} />
          <span className="lp-node__label">{lesson.title}</span>
        </Link>
      ) : (
        <>
          <LessonIcon lesson={lesson} />
          <span
            className={`lp-node__label ${
              lesson.status === "locked" ? "lp-node__label--locked" : ""
            }`}
          >
            {lesson.title}
          </span>
        </>
      )}

      {/* Tooltip cho node đang học */}
      {lesson.status === "active" && lesson.tooltip && (
        <div className="lp-tooltip">
          <p className="lp-tooltip__title">{lesson.title}</p>
          <p className="lp-tooltip__desc">{lesson.tooltip.desc}</p>
          <div className="lp-tooltip__meta">
            <span className="lp-tooltip__time">
              <Clock size={13} /> {lesson.tooltip.duration}
            </span>
            <span className="lp-tooltip__xp">
              <Star size={13} /> {lesson.tooltip.xp}
            </span>
          </div>
          <Link to={`/learning-path/lesson/${lesson.id}`}>
            <button className="lp-tooltip__btn" type="button">
              <Play size={16} fill="currentColor" />
              Bắt đầu học
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   NODE QUIZ CUỐI CHƯƠNG
   (Chỉ mở khi hoàn thành bài học cuối cùng của chương)
   ========================================================= */

const QuizNode = ({ chapter }) => {
  const { quiz } = chapter;
  const quizUnlocked = getLastLessonStatus(chapter) === "completed";
  const status = quizUnlocked
    ? quiz.status === "completed"
      ? "completed"
      : "active"
    : "locked";

  let meta = "Hoàn thành bài cuối của chương";
  if (quizUnlocked) {
    meta =
      quiz.status === "completed"
        ? `Điểm ${quiz.score}/100 · Xem lại`
        : "Mở khóa chương tiếp theo";
  }

  const core = (
    <div className={`lp-quiz lp-quiz--${status}`}>
      <div className="lp-quiz__icon">
        {quizUnlocked ? (
          <Trophy size={22} strokeWidth={2.2} />
        ) : (
          <Lock size={20} strokeWidth={2.4} />
        )}
      </div>
      <div className="lp-quiz__body">
        <span className="lp-quiz__title">
          {quizUnlocked
            ? `Bài kiểm tra Chương ${chapter.id} · Ôn tập`
            : `Bài kiểm tra Chương ${chapter.id}`}
        </span>
        <span className="lp-quiz__meta">{meta}</span>
      </div>
    </div>
  );

  return (
    <div
      className="lp-node"
      style={{
        top: `${quiz.y}%`,
        left: `${quiz.x}%`,
        ...(quizUnlocked ? {} : { pointerEvents: "none" }),
      }}
    >
      {quizUnlocked ? (
        <Link
          className="lp-node__link"
          to={`/learning-path/quiz/${chapter.id}`}
          aria-label={`Bài kiểm tra ôn tập Chương ${chapter.id}`}
        >
          {core}
        </Link>
      ) : (
        core
      )}
    </div>
  );
};

/* =========================================================
   THÀNH PHẦN CHÍNH
   ========================================================= */

const SCurvePath = () => {
  const segClass = (seg) =>
    `lp-curve__segment lp-curve__segment--${seg.tone}${
      seg.transition ? " lp-curve__segment--transition" : ""
    }`;

  return (
    <div className="lp-curve">
      {/* ===== SVG BACKBONE ===== */}
      <svg
        className="lp-curve__svg"
        viewBox="0 0 700 1650"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {SEGMENTS.map((seg, i) => (
          <path
            key={i}
            d={seg.d}
            strokeWidth="5"
            strokeLinecap="round"
            className={segClass(seg)}
          />
        ))}
      </svg>

      {/* ===== CHAPTER HEADERS ===== */}
      {CHAPTERS.map((ch) => (
        <ChapterHeader key={`ch-header-${ch.id}`} chapter={ch} />
      ))}

      {/* ===== LESSON NODES ===== */}
      {CHAPTERS.map((ch) =>
        ch.lessons.map((lesson) => (
          <LessonNode
            key={`${ch.id}-lesson-${lesson.id}`}
            lesson={lesson}
          />
        ))
      )}

      {/* ===== QUIZ NODES (cuối mỗi chương) ===== */}
      {CHAPTERS.map((ch) => (
        <QuizNode key={`ch-quiz-${ch.id}`} chapter={ch} />
      ))}
    </div>
  );
};

export default SCurvePath;