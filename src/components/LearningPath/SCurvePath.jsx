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

import "./SCurvePath.css";

/* =========================================================
   DỮ LIỆU LỘ TRÌNH THEO CHƯƠNG
   (Tọa độ theo đơn vị % của container, khớp viewBox 700x1650)
   ========================================================= */

const CHAPTERS = [
  {
    id: 1,
    tag: "Chương 1",
    title: "Ký hiệu cơ bản",
    desc: "Làm quen với bảng chữ cái, cách chào hỏi và giới thiệu bản thân.",
    status: "completed",
    done: 3,
    total: 3,
    header: { x: 50, y: 3.3 },
    lessons: [
      {
        id: 1,
        title: "Bảng chữ & Số",
        status: "completed",
        icon: <BookOpen size={22} strokeWidth={2.2} />,
        x: 20,
        y: 10.6,
      },
      {
        id: 2,
        title: "Chào hỏi cơ bản",
        status: "completed",
        icon: <MessageCircle size={22} strokeWidth={2.2} />,
        x: 80,
        y: 17.3,
      },
      {
        id: 3,
        title: "Thành viên gia đình",
        status: "completed",
        icon: <Users size={22} strokeWidth={2.2} />,
        x: 20,
        y: 23.9,
      },
    ],
    quiz: { x: 80, y: 30.9, status: "completed", score: 90 },
  },
  {
    id: 2,
    tag: "Chương 2",
    title: "Giao tiếp hằng ngày",
    desc: "Màu sắc, hình dạng và các hoạt động quen thuộc trong cuộc sống.",
    status: "active",
    done: 1,
    total: 3,
    header: { x: 50, y: 37.3 },
    lessons: [
      {
        id: 4,
        title: "Màu sắc & Hình dạng",
        status: "completed",
        icon: <Palette size={22} strokeWidth={2.2} />,
        x: 20,
        y: 44.5,
      },
      {
        id: 5,
        title: "Hoạt động hằng ngày",
        status: "active",
        icon: <Sun size={24} strokeWidth={2} />,
        x: 80,
        y: 51.2,
        tooltip: {
          desc: "Ăn, ngủ, đi làm, học tập mỗi ngày",
          duration: "12 phút",
          xp: "+30 XP",
        },
      },
      {
        id: 6,
        title: "Biểu cảm cảm xúc",
        status: "unlocked",
        icon: <Smile size={22} strokeWidth={2.2} />,
        x: 20,
        y: 57.9,
      },
    ],
    quiz: { x: 80, y: 64.8, status: "locked" },
  },
  {
    id: 3,
    tag: "Chương 3",
    title: "Gia đình & Bạn bè",
    desc: "Các mối quan hệ thân thiết trong ngôn ngữ ký hiệu.",
    status: "locked",
    done: 0,
    total: 3,
    header: { x: 50, y: 72.1 },
    lessons: [
      {
        id: 7,
        title: "Ông bà & Cha mẹ",
        status: "locked",
        icon: <Home size={22} strokeWidth={2.2} />,
        x: 20,
        y: 79.4,
      },
      {
        id: 8,
        title: "Anh chị em",
        status: "locked",
        icon: <Hand size={22} strokeWidth={2.2} />,
        x: 80,
        y: 86.1,
      },
    ],
    quiz: { x: 20, y: 93.6, status: "locked" },
  },
];

/* =========================================================
   ĐƯỜNG NỐI SVG
   tone: done | active | pending
   ========================================================= */

const SEGMENTS = [
  // Chương 1 (hoàn thành - xanh lá)
  { d: "M 350,100 C 350,140 140,140 140,175", tone: "done" },
  { d: "M 140,175 C 390,175 310,285 560,285", tone: "done" },
  { d: "M 560,285 C 310,285 390,395 140,395", tone: "done" },
  { d: "M 140,395 C 350,395 400,510 560,510", tone: "done" },
  // Nối Quiz Ch1 -> Header Ch2 (uốn lượn, đi qua chương đã mở)
  {
    d: "M 560,510 C 730,540 730,660 560,660 C 440,660 300,625 155,588",
    tone: "done",
    transition: true,
  },
  // Chương 2 (đang học)
  { d: "M 350,660 C 350,700 140,700 140,735", tone: "done" },
  { d: "M 140,735 C 390,735 310,845 560,845", tone: "active" },
  { d: "M 560,845 C 310,845 390,955 140,955", tone: "pending" },
  { d: "M 140,955 C 350,955 400,1070 560,1070", tone: "pending" },
  // Nối Quiz Ch2 -> Header Ch3 (chương khóa - xám mờ)
  {
    d: "M 560,1070 C 730,1100 730,1210 560,1210 C 440,1210 300,1205 155,1165",
    tone: "pending",
    transition: true,
  },
  // Chương 3 (bị khóa - xám)
  { d: "M 350,1235 C 350,1275 140,1275 140,1310", tone: "pending" },
  { d: "M 140,1310 C 390,1310 310,1420 560,1420", tone: "pending" },
  { d: "M 560,1420 C 310,1420 390,1545 140,1545", tone: "pending" },
];

const CHAPTER_STATUS_LABEL = {
  completed: "Hoàn thành",
  active: "Đang học",
  locked: "Bị khóa",
};

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
          {CHAPTER_STATUS_LABEL[status]}
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
      lesson.icon
    );

  return (
    <div
      className={`lp-node__icon lp-node__icon--${lesson.status}`}
    >
      <div className={`lp-node__ring lp-node__ring--${lesson.status}`} />
      <span className="lp-node__glyph">{glyph}</span>
    </div>
  );
};

const LessonNode = ({ lesson }) => {
  const interactive = lesson.status === "completed" || lesson.status === "unlocked";

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

      {/* Tooltip / Popover cho node đang học */}
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
   ========================================================= */

const QUIZ_META = {
  completed: (q) => `Điểm ${q.score}/100`,
  active: () => "Mở khóa chương tiếp theo",
  locked: () => "Đang khóa",
};

const QuizNode = ({ quiz, chapterId }) => {
  const clickable = quiz.status !== "locked";
  const core = (
    <div className={`lp-quiz lp-quiz--${quiz.status}`}>
      <div className="lp-quiz__icon">
        {quiz.status === "locked" ? (
          <Lock size={20} strokeWidth={2.4} />
        ) : (
          <Trophy size={22} strokeWidth={2.2} />
        )}
      </div>
      <div className="lp-quiz__body">
        <span className="lp-quiz__title">Bài kiểm tra Chương {chapterId}</span>
        <span className="lp-quiz__meta">{QUIZ_META[quiz.status](quiz)}</span>
      </div>
    </div>
  );

  return (
    <div
      className="lp-node"
      style={{ top: `${quiz.y}%`, left: `${quiz.x}%` }}
    >
      {clickable ? (
        <Link className="lp-node__link" to={`/learning-path/lesson/${chapterId}-quiz`}>
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
          <LessonNode key={`${ch.id}-lesson-${lesson.id}`} lesson={lesson} />
        ))
      )}

      {/* ===== QUIZ NODES ===== */}
      {CHAPTERS.map((ch) => (
        <QuizNode key={`ch-quiz-${ch.id}`} quiz={ch.quiz} chapterId={ch.id} />
      ))}
    </div>
  );
};

export default SCurvePath;