import { useConfirm } from "../../hooks/useConfirm";
import { Heart, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import "./LessonTopNav.css";

const MAX_HEARTS = 5;

const formatPct = (current, total) => {
  const value = (current / total) * 100;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

const LessonTopNav = ({
  title,
  completed = 0,
  hearts = MAX_HEARTS,
  currentQuestion = 1,
  totalQuestions = 8,
  onSegmentClick,
}) => {
  const pct = formatPct(completed, totalQuestions);

  const confirm = useConfirm();
  const navigate = useNavigate();
  const confirmExit = async (event) => { event.preventDefault(); if (await confirm({ title: "Thoát bài học?", message: "Tiến độ chưa hoàn tất trong phiên này có thể không được lưu.", confirmLabel: "Thoát" })) navigate('/learning-path'); };
  return (
    <div className="lesson-topnav">
      {/* ---- Left: lesson title ---- */}
      <h1 className="lesson-topnav__title text-h1">
        {title}
      </h1>

      {/* ---- Center: progress ---- */}
      <div className="lesson-topnav__center">
        <span className="lesson-topnav__index">
          {currentQuestion}/{totalQuestions}
        </span>

        <progress className="lesson-topnav__mobile-progress" max={totalQuestions} value={completed} aria-label="Tiến độ bài học" />
        <div className="lesson-topnav__segments">
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const n = i + 1;
            const done = n <= completed;
            const cls = `lesson-topnav__segment ${
              done
                ? "lesson-topnav__segment--done"
                : "lesson-topnav__segment--todo"
            }`;
            return onSegmentClick ? (
              <button
                key={n}
                type="button"
                className={cls}
                onClick={() => onSegmentClick(i)}
                aria-label={`Chuyển đến câu hỏi ${n}`}
              />
            ) : (
              <span key={n} className={cls} />
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

        <Link onClick={confirmExit} to="/learning-path" className="lesson-topnav__exit">
          <X size={14} strokeWidth={2.5} />
          Thoát bài học
        </Link>
      </div>
    </div>
  );
};

export default LessonTopNav;
