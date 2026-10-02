import {useChapters} from "../../hooks/useProgress";
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
   HEADER CHƯƠNG
   tone: done | active | pending
   ========================================================= */

const ChapterHeader = ({ chapter }) => {
  const { status } = chapter;
  const pct = chapter.total ? Math.round((chapter.done / chapter.total) * 100) : 0;

  return (
    <div
      className={`lp-chapter lp-chapter--${status}`}

    >
      <div className="lp-chapter__head">
        <span className="lp-chapter__tag">{chapter.tag}</span>
        <span className="lp-chapter__status">
          {SON_CHUONG_LABEL[status]}
        </span>
      </div>

      <h2 className="lp-chapter__title text-h2">{chapter.title}</h2>
      <p className="lp-chapter__desc">{chapter.desc}</p>

      <div className="lp-chapter__foot">
        <div className="lp-chapter__bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <span className="lp-chapter__count">
          {chapter.total ? `${chapter.done}/${chapter.total} Bài học` : "Nội dung đang cập nhật"}
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
      CHAPTER_ICONS[lesson.icon] ?? CHAPTER_ICONS.bookOpen
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
    lesson.status === "completed" || lesson.status === "unlocked" || lesson.status === "active";

  return (
    <div
      className="lp-node"
      title={lesson.unavailableReason || undefined}
      style={{ top: lesson.layoutY, left: `${lesson.layoutX}%` }}
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
            {lesson.published===false&&<span className="text-caption"> · Đang cập nhật</span>}
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
          <Link className="lp-tooltip__btn" to={`/learning-path/lesson/${lesson.id}`}>
              <Play size={16} fill="currentColor" />
              Bắt đầu học
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
  const quizUnlocked = ["unlocked", "completed"].includes(quiz.status);
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
        : "Đạt từ 70% để mở chương tiếp theo";
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
            ? `Bài kiểm tra Chương ${chapter.id}`
            : `Bài kiểm tra Chương ${chapter.id}`}
        </span>
        <span className="lp-quiz__meta">{meta}</span>
      </div>
    </div>
  );

  return (
    <div
      className="lp-quiz-row"
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
 const chapters=useChapters();return (
  <div className="lp-curve">
    {chapters.map((chapter, chapterIndex) => {
      // Each chapter owns its layout; persisted coordinates may overlap or
      // describe an older curriculum with fewer chapters.
      let height = 110;
      const lessons = chapter.lessons.map((lesson, index) => {
        const positioned = { ...lesson, layoutX: lesson.status === "active" ? 50 : index % 2 ? 70 : 30, layoutY: height };
        height += lesson.status === "active" && lesson.tooltip ? 340 : 190;
        return positioned;
      });
      const first = lessons[0];
      const last = lessons.at(-1);
      const canvasHeight = lessons.length ? height - 40 : 110;
      const entryTone = first?.status === "completed" ? "done"
        : first?.status === "active" || first?.status === "unlocked" ? "active" : "pending";
      const quizTone = chapter.quiz.status === "completed" ? "done"
        : chapter.quiz.status === "unlocked" ? "active" : "pending";
      return (
        <section className="lp-curve__chapter" key={chapter.id} aria-label={chapter.title}>
          <ChapterHeader chapter={chapter} />
          <div className="lp-curve__lessons" style={{ height: canvasHeight }}>
            <svg className="lp-curve__svg" viewBox={`0 0 100 ${canvasHeight}`}
              fill="none" preserveAspectRatio="none" aria-hidden="true">
              <path
                d={first
                  ? `M 50,0 C 50,55 ${first.layoutX},55 ${first.layoutX},${first.layoutY}`
                  : `M 50,0 L 50,${canvasHeight}`}
                className={`lp-curve__segment lp-curve__segment--${entryTone}`}
                strokeWidth="4" vectorEffect="non-scaling-stroke" />
              {lessons.slice(1).map((lesson, index) => {
                const previous = lessons[index];
                const middle = (previous.layoutY + lesson.layoutY) / 2;
                const tone = previous.status === "completed"
                  ? lesson.status === "completed" ? "done" : "active"
                  : "pending";
                return <path key={lesson.id}
                  d={`M ${previous.layoutX},${previous.layoutY} C ${previous.layoutX},${middle} ${lesson.layoutX},${middle} ${lesson.layoutX},${lesson.layoutY}`}
                  className={`lp-curve__segment lp-curve__segment--${tone}`}
                  strokeWidth="4" vectorEffect="non-scaling-stroke" />;
              })}
              {last && <path
                d={`M ${last.layoutX},${last.layoutY} C ${last.layoutX},${canvasHeight - 65} 50,${canvasHeight - 65} 50,${canvasHeight}`}
                className={`lp-curve__segment lp-curve__segment--${quizTone}`}
                strokeWidth="4" vectorEffect="non-scaling-stroke" />}
            </svg>
            {lessons.map((lesson) => <LessonNode key={lesson.id} lesson={lesson} />)}
          </div>
          <QuizNode chapter={chapter} />
          {chapterIndex < chapters.length - 1 && (
            <div className="lp-curve__bridge" aria-hidden="true">
              <svg className="lp-curve__svg" viewBox="0 0 100 150"
                fill="none" preserveAspectRatio="none">
                <path d="M 50,0 C 50,35 78,35 78,75 C 78,115 50,115 50,150"
                  className={`lp-curve__segment lp-curve__segment--transition lp-curve__segment--${chapter.quiz.status === "completed" ? "done" : "pending"}`}
                  strokeWidth="4" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          )}
        </section>
      );
    })}
  </div>
);};

export default SCurvePath;
