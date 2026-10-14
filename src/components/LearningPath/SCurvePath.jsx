import { useState, useEffect, useRef, useCallback } from "react";
import { useChapters } from "../../hooks/useProgress";
import { useTheoryPreview } from "../../hooks/useTheoryPreview";
import { lessonSteps, connectorTone } from "../../utils/lessonSteps.js";
import LessonNode3D from "./LessonNode3D";
import MilestoneNode3D from "./MilestoneNode3D";
import ChapterHeader3D from "./ChapterHeader3D";
import { ArrowDown, Sparkles } from "lucide-react";
import "./SCurvePath.css";

/* =========================================================
   SINGLE CHAPTER PATH SECTION
   ========================================================= */
const ChapterSection = ({
  chapter,
  isDone,
  containerWidth,
  isMobile,
  activeLessonId,
  activeRef,
}) => {
  const steps = lessonSteps(chapter, isDone);
  const stepGap = isMobile ? 160 : 175;
  const startY = 80;

  // Calculate coordinates in percentage (for responsive positioning)
  // and real pixels (for SVG bezier accuracy)
  const leftXPercent = isMobile ? 38 : 34;
  const rightXPercent = isMobile ? 62 : 66;

  const positionedLessons = steps.map((lesson, index) => {
    const isLeft = index % 2 === 0;
    const xPercent = isLeft ? leftXPercent : rightXPercent;
    const yPx = startY + index * stepGap;
    return {
      ...lesson,
      xPercent,
      yPx,
      xPx: containerWidth * (xPercent / 100),
    };
  });

  const hasLessons = positionedLessons.length > 0;
  const lastStep = positionedLessons.at(-1);

  // Position Milestone Quiz platform at center after last lesson
  const milestoneY = hasLessons
    ? startY + positionedLessons.length * stepGap + (isMobile ? 35 : 45)
    : 100;
  const milestoneXPercent = 50;
  const milestoneXPx = containerWidth * 0.5;

  const canvasHeight = milestoneY + (isMobile ? 100 : 115);

  const entryTone =
    positionedLessons[0]?.status === "completed"
      ? "done"
      : positionedLessons[0]?.status === "active" ||
          positionedLessons[0]?.status === "unlocked"
        ? "active"
        : "pending";

  const quizTone = hasLessons
    ? connectorTone(lastStep, chapter.quiz)
    : "pending";

  return (
    <section
      className={`lp-chapter-section lp-chapter-section--${chapter.status}`}
      key={chapter.id}
      aria-label={chapter.title}
    >
      {/* 3D Chapter Banner */}
      <ChapterHeader3D chapter={chapter} />

      {/* 3D Path Canvas */}
      <div
        className="lp-path-canvas"
        style={{ height: `${canvasHeight}px` }}
        role="region"
        aria-label={`Lộ trình học ${chapter.title}`}
      >
        {/* Responsive Accurate SVG Path */}
        <svg
          className="lp-path-svg"
          viewBox={`0 0 ${containerWidth} ${canvasHeight}`}
          fill="none"
          aria-hidden="true"
        >
          <defs>
            {/* Soft shadow filter for active track glow */}
            <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {hasLessons && (
            <>
              {/* --- 1. Entry Path from Chapter Banner to First Lesson --- */}
              {/* Ground trench shadow */}
              <path
                d={`M ${containerWidth * 0.5},0 C ${containerWidth * 0.5},45 ${positionedLessons[0].xPx},45 ${positionedLessons[0].xPx},${positionedLessons[0].yPx}`}
                className="lp-path-trench"
                strokeWidth="8"
              />
              {/* Dashed journey path */}
              <path
                d={`M ${containerWidth * 0.5},0 C ${containerWidth * 0.5},45 ${positionedLessons[0].xPx},45 ${positionedLessons[0].xPx},${positionedLessons[0].yPx}`}
                className={`lp-path-segment lp-path-segment--${entryTone}`}
                strokeWidth="4.5"
                strokeDasharray="10 10"
                strokeLinecap="round"
                filter={entryTone === "active" ? "url(#glow-teal)" : undefined}
              />

              {/* --- 2. Curved Segments between consecutive Lessons --- */}
              {positionedLessons.slice(1).map((lesson, idx) => {
                const prev = positionedLessons[idx];
                const middleY = (prev.yPx + lesson.yPx) / 2;
                const tone = connectorTone(prev, lesson);

                const d = `M ${prev.xPx},${prev.yPx} C ${prev.xPx},${middleY} ${lesson.xPx},${middleY} ${lesson.xPx},${lesson.yPx}`;

                return (
                  <g key={`seg-${lesson.id}`}>
                    {/* Underlying trench track */}
                    <path
                      d={d}
                      className="lp-path-trench"
                      strokeWidth="8"
                    />
                    {/* Dotted journey line */}
                    <path
                      d={d}
                      className={`lp-path-segment lp-path-segment--${tone}`}
                      strokeWidth="4.5"
                      strokeDasharray="10 10"
                      strokeLinecap="round"
                      filter={tone === "active" ? "url(#glow-teal)" : undefined}
                    />
                  </g>
                );
              })}

              {/* --- 3. Path from Last Lesson to Milestone Quiz Podium --- */}
              {lastStep && (
                <g>
                  {/* Underlying trench track */}
                  <path
                    d={`M ${lastStep.xPx},${lastStep.yPx} C ${lastStep.xPx},${milestoneY - 55} ${milestoneXPx},${milestoneY - 55} ${milestoneXPx},${milestoneY}`}
                    className="lp-path-trench"
                    strokeWidth="8"
                  />
                  {/* Dashed journey line */}
                  <path
                    d={`M ${lastStep.xPx},${lastStep.yPx} C ${lastStep.xPx},${milestoneY - 55} ${milestoneXPx},${milestoneY - 55} ${milestoneXPx},${milestoneY}`}
                    className={`lp-path-segment lp-path-segment--${quizTone}`}
                    strokeWidth="4.5"
                    strokeDasharray="10 10"
                    strokeLinecap="round"
                    filter={quizTone === "active" ? "url(#glow-teal)" : undefined}
                  />
                </g>
              )}
            </>
          )}
        </svg>

        {/* 3D Lesson Nodes */}
        {positionedLessons.map((lesson) => {
          const isActiveLesson = String(lesson.id) === String(activeLessonId);
          return (
            <div
              key={lesson.id}
              ref={isActiveLesson ? activeRef : undefined}
              className="lp-node-mount"
            >
              <LessonNode3D
                lesson={lesson}
                chapter={chapter}
                xPercent={lesson.xPercent}
                yPx={lesson.yPx}
              />
            </div>
          );
        })}

        {/* 3D Milestone Quiz Podium */}
        <MilestoneNode3D
          chapter={chapter}
          xPercent={milestoneXPercent}
          yPx={milestoneY}
        />
      </div>
    </section>
  );
};

/* =========================================================
   MAIN SCURVEPATH COMPONENT
   ========================================================= */
const SCurvePath = () => {
  const chapters = useChapters();
  const { isDone } = useTheoryPreview();
  const containerRef = useRef(null);
  const activeRef = useRef(null);

  const [containerWidth, setContainerWidth] = useState(640);
  const [isMobile, setIsMobile] = useState(false);
  const [showJumpButton, setShowJumpButton] = useState(false);

  // Measure actual container width via ResizeObserver
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth || 640;
      setContainerWidth(width);
      setIsMobile(width <= 640);
    }
  }, []);

  useEffect(() => {
    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateDimensions]);

  // Find currently active lesson ID
  const allSteps = chapters.flatMap((chapter) => lessonSteps(chapter, isDone));
  const activeLesson = allSteps.find(
    (step) => step.status === "active" || step.status === "unlocked",
  );
  const activeLessonId = activeLesson?.id;

  // Track if active lesson is scrolled out of viewport for Jump button
  useEffect(() => {
    if (!activeRef.current) {
      setShowJumpButton(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowJumpButton(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(activeRef.current);
    return () => observer.disconnect();
  }, [activeLessonId]);

  const scrollToActive = () => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="lp-journey-container" ref={containerRef}>
      {chapters.map((chapter, chapterIndex) => (
        <div key={chapter.id} className="lp-chapter-wrapper">
          <ChapterSection
            chapter={chapter}
            isDone={isDone}
            containerWidth={containerWidth}
            isMobile={isMobile}
            activeLessonId={activeLessonId}
            activeRef={activeRef}
          />

          {/* Chapter-to-chapter transition bridge */}
          {chapterIndex < chapters.length - 1 && (
            <div className="lp-chapter-bridge" aria-hidden="true">
              <svg
                className="lp-path-svg"
                viewBox={`0 0 ${containerWidth} 110`}
                fill="none"
              >
                {/* Bridge trench */}
                <path
                  d={`M ${containerWidth * 0.5},0 C ${containerWidth * 0.5},40 ${containerWidth * 0.5},70 ${containerWidth * 0.5},110`}
                  className="lp-path-trench"
                  strokeWidth="8"
                />
                {/* Dashed Bridge Journey line */}
                <path
                  d={`M ${containerWidth * 0.5},0 C ${containerWidth * 0.5},40 ${containerWidth * 0.5},70 ${containerWidth * 0.5},110`}
                  className={`lp-path-segment lp-path-segment--${chapter.quiz.status === "completed" ? "done" : "pending"}`}
                  strokeWidth="5"
                  strokeDasharray="10 12"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
      ))}

      {/* Floating Shortcut: Return / Jump to current active lesson */}
      {showJumpButton && (
        <button
          type="button"
          className="lp-jump-to-current"
          onClick={scrollToActive}
          aria-label="Cuộn màn hình tới bài học đang học"
        >
          <Sparkles size={16} className="lp-jump-sparkle" />
          <span>Đến bài đang học</span>
          <ArrowDown size={14} className="lp-jump-arrow" />
        </button>
      )}
    </div>
  );
};

export default SCurvePath;
