import { Heart, X } from "lucide-react";
import { Link } from "react-router-dom";

import "./LessonTopNav.css";

const TOTAL_LESSONS = 8;
const CURRENT_LESSON = 4;
const COMPLETED_LESSONS = [1, 2, 3];
const MAX_HEARTS = 5;

const LessonTopNav = ({ hearts = MAX_HEARTS }) => {
  const pct = Math.round((CURRENT_LESSON / TOTAL_LESSONS) * 100);

  return (
    <div className="lesson-topnav">
      {/* ---- Left: lesson title ---- */}
      <h1 className="lesson-topnav__title">
        Bài 4: Chào hỏi cơ bản
      </h1>

      {/* ---- Center: progress ---- */}
      <div className="lesson-topnav__center">
        <span className="lesson-topnav__index">
          {CURRENT_LESSON}/{TOTAL_LESSONS}
        </span>

        <div className="lesson-topnav__segments" aria-hidden="true">
          {Array.from({ length: TOTAL_LESSONS }).map((_, i) => {
            const n = i + 1;
            const done =
              COMPLETED_LESSONS.includes(n) || n <= CURRENT_LESSON;
            return (
              <span
                key={n}
                className={`lesson-topnav__segment ${
                  done
                    ? "lesson-topnav__segment--done"
                    : "lesson-topnav__segment--todo"
                }`}
              />
            );
          })}
        </div>

        <span className="lesson-topnav__pct">{pct}%</span>
      </div>

      {/* ---- Right: hearts + exit ---- */}
      <div className="lesson-topnav__right">
        <div className="lesson-topnav__hearts">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <Heart
              key={i}
              size={18}
              className={
                i < hearts
                  ? "lesson-topnav__heart--alive"
                  : "lesson-topnav__heart--lost"
              }
              fill={i < hearts ? "#ef4444" : "none"}
              strokeWidth={2}
            />
          ))}
        </div>

        <Link to="/learning-path" className="lesson-topnav__exit">
          <X size={14} strokeWidth={2.5} />
          Thoát bài học
        </Link>
      </div>
    </div>
  );
};

export default LessonTopNav;