import {useProgress} from "../../hooks/useProgress";
import { Flame, Star, Target } from "lucide-react";

import "./ProgressWidget.css";


const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;


const ProgressWidget = () => {
  const {stats,chapters}=useProgress();
  const TOTAL = chapters.reduce((sum, chapter) => sum + chapter.total, 0);
  const DONE = chapters.reduce((sum, chapter) => sum + chapter.done, 0);
  const DONUT_PCT = TOTAL ? Math.round(DONE / TOTAL * 100) : 0;
  const BAR_PCT = DONUT_PCT;
  const OFFSET = CIRCUMFERENCE - (DONUT_PCT / 100) * CIRCUMFERENCE;
  const STATS = [
    { icon: <Flame size={18} />, value: `${stats.streak} ngày`, label: "Chuỗi ngày", color: "var(--color-coral-500)" },
    { icon: <Star size={18} />, value: stats.xp, label: "Tổng XP", color: "var(--color-teal-700)" },
    { icon: <Target size={18} />, value: DONE, label: "Bài hoàn thành", color: "var(--color-teal-700)" },
  ];
  return (
    <div className="lp-progress">
      <h2 className="lp-progress__title text-h2">TIẾN ĐỘ CẤP ĐỘ</h2>
      <span className="lp-progress__level">{stats.level}</span>

      {/* Donut */}
      <div className="lp-progress__donut-wrap">
        <svg viewBox="0 0 100 100" className="lp-progress__donut">
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="9"
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="#0d8a6a"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={OFFSET}
            transform="rotate(-90 50 50)"
            className="lp-progress__donut-arc"
          />
        </svg>
        <div className="lp-progress__donut-label">
          <span className="lp-progress__donut-pct">{DONUT_PCT}%</span>
          <span className="lp-progress__donut-sub">hoàn thành</span>
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="lp-progress__bar-section">
        <div className="lp-progress__bar-header">
          <span>Bài {DONE} / {TOTAL}</span>
          <span>{BAR_PCT}%</span>
        </div>
        <div className="lp-progress__bar-track">
          <div
            className="lp-progress__bar-fill"
            style={{ width: `${BAR_PCT}%` }}
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="lp-progress__stats">
        {STATS.map((s) => (
          <div className="lp-stat" key={s.label}>
            <span className="lp-stat__icon" style={{ color: s.color }}>
              {s.icon}
            </span>
            <span className="lp-stat__value">{s.value}</span>
            <span className="lp-stat__label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressWidget;
