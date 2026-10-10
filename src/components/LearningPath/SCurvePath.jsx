import { lessonSteps, connectorTone } from "../../utils/lessonSteps.js";
import { useChapters } from "../../hooks/useProgress";
import { useTheoryPreview } from "../../hooks/useTheoryPreview";
import { BookOpen, PencilLine, Check, Lock, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { SON_CHUONG_LABEL } from "../../mockdata";
import "./SCurvePath.css";

/* =========================================================
   HEADER CHƯƠNG
   tone: done | active | pending
   ========================================================= */

const ChapterHeader = ({ chapter }) => {
  const { status } = chapter;
  const pct = chapter.total ? Math.round((chapter.done / chapter.total) * 100) : 0;

  return (
    <div className={`lp-chapter lp-chapter--${status}`}>
      <div className="lp-chapter__head">
        <span className="lp-chapter__tag">{chapter.tag}</span>
        <span className="lp-chapter__status">{SON_CHUONG_LABEL[status]}</span>
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

const LessonNode = ({ lesson }) => {
  const locked = lesson.status === "locked";
  const theory = lesson.kind === "theory";
  const Icon = theory ? BookOpen : PencilLine;
  const label = theory ? "Lý thuyết" : "Kiểm tra";
  const content = (
    <>
      <span className={`lp-node__kind ${theory ? "" : "lp-node__kind--practice"}`}>
        {lesson.number} · {theory ? "HỌC" : "KIỂM TRA"}
      </span>
      <div className={`lp-node__icon lp-node__icon--${lesson.status}`}>
        <div className={`lp-node__ring lp-node__ring--${lesson.status}`} />
        <span className="lp-node__glyph">
          <Icon size={25} />
        </span>
        {lesson.status === "completed" && <Check className="lp-node__badge" size={18} />}
        {locked && <Lock className="lp-node__badge" size={16} />}
      </div>
      <span className="lp-node__label">
        {label} {lesson.title}
      </span>
      <span className="lp-node__hint">
        {lesson.status === "completed"
          ? "Đã hoàn thành · Xem lại"
          : locked
            ? theory
              ? "Hoàn thành trạm trước"
              : lesson.published === false
                ? "Bài kiểm tra đang cập nhật"
                : "Hoàn thành lý thuyết để mở"
            : theory
              ? "Khám phá bài học"
              : "Sẵn sàng luyện tập"}
      </span>
    </>
  );
  return (
    <div
      className="lp-node lp-node--step"
      style={{ top: lesson.layoutY, left: `${lesson.layoutX}%` }}
    >
      {locked ? (
        <div className="lp-node__link" aria-disabled="true">
          {content}
        </div>
      ) : (
        <Link
          className="lp-node__link"
          to={`/learning-path/lesson/${lesson.lessonId}${theory ? "" : "?step=practice"}`}
          aria-label={`${label} ${lesson.title}`}
        >
          {content}
        </Link>
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
  const status = quizUnlocked ? (quiz.status === "completed" ? "completed" : "active") : "locked";

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
          {quizUnlocked ? `Bài kiểm tra Chương ${chapter.id}` : `Bài kiểm tra Chương ${chapter.id}`}
        </span>
        <span className="lp-quiz__meta">{meta}</span>
      </div>
    </div>
  );

  return (
    <div className="lp-quiz-row">
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
  const chapters = useChapters();
  const { isDone } = useTheoryPreview();

  return (
    <div className="lp-curve">
      {chapters.map((chapter, chapterIndex) => {
        // Each chapter owns its layout; persisted coordinates may overlap or
        // describe an older curriculum with fewer chapters.
        let height = 80;
        const lessons = lessonSteps(chapter, isDone).map((lesson) => {
          const positioned = {
            ...lesson,
            layoutX: lesson.kind === "theory" ? 32 : 68,
            layoutY: height,
          };
          height += 185;
          return positioned;
        });
        const first = lessons[0];
        const last = lessons.at(-1);
        const canvasHeight = lessons.length ? height - 40 : 110;
        const entryTone =
          first?.status === "completed"
            ? "done"
            : first?.status === "active" || first?.status === "unlocked"
              ? "active"
              : "pending";
        const quizTone = connectorTone(last, chapter.quiz);

        return (
          <section className="lp-curve__chapter" key={chapter.id} aria-label={chapter.title}>
            <ChapterHeader chapter={chapter} />
            <div className="lp-curve__lessons" style={{ height: canvasHeight }}>
              <svg
                className="lp-curve__svg"
                viewBox={`0 0 100 ${canvasHeight}`}
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d={
                    first
                      ? `M 50,0 C 50,55 ${first.layoutX},55 ${first.layoutX},${first.layoutY}`
                      : `M 50,0 L 50,${canvasHeight}`
                  }
                  className={`lp-curve__segment lp-curve__segment--${entryTone}`}
                  strokeWidth="4"
                  vectorEffect="non-scaling-stroke"
                />
                {lessons.slice(1).map((lesson, index) => {
                  const previous = lessons[index];
                  const middle = (previous.layoutY + lesson.layoutY) / 2;
                  const tone = connectorTone(previous, lesson);

                  return (
                    <path
                      key={lesson.id}
                      d={`M ${previous.layoutX},${previous.layoutY} C ${previous.layoutX},${middle} ${lesson.layoutX},${middle} ${lesson.layoutX},${lesson.layoutY}`}
                      className={`lp-curve__segment lp-curve__segment--${tone}`}
                      strokeWidth="4"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
                {last && (
                  <path
                    d={`M ${last.layoutX},${last.layoutY} C ${last.layoutX},${canvasHeight - 65} 50,${canvasHeight - 65} 50,${canvasHeight}`}
                    className={`lp-curve__segment lp-curve__segment--${quizTone}`}
                    strokeWidth="4"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </svg>
              {lessons.map((lesson) => (
                <LessonNode key={lesson.id} lesson={lesson} />
              ))}
            </div>
            <QuizNode chapter={chapter} />
            {chapterIndex < chapters.length - 1 && (
              <div className="lp-curve__bridge" aria-hidden="true">
                <svg
                  className="lp-curve__svg"
                  viewBox="0 0 100 150"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 50,0 C 50,35 78,35 78,75 C 78,115 50,115 50,150"
                    className={`lp-curve__segment lp-curve__segment--transition lp-curve__segment--${chapter.quiz.status === "completed" ? "done" : "pending"}`}
                    strokeWidth="4"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default SCurvePath;
