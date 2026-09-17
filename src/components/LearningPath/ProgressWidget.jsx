import { Flame, Star, Target } from "lucide-react";

import "./ProgressWidget.css";

const TOTAL = 8;
const DONE = 3;
const DONUT_PCT = 60;
const BAR_PCT = 66;

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const OFFSET = CIRCUMFERENCE - (DONUT_PCT / 100) * CIRCUMFERENCE;

const STATS = [
  { icon: <Flame size={18} />, value: "7 ngày", label: "Chuỗi ngày", color: "#ef4444" },
  { icon: <Star size={18} />, value: "2.340", label: "Tổng XP", color: "#f59e0b" },
  { icon: <Target size={18} />, value: "87%", label: "Độ chính xác", color: "#0d8a6a" },
];

const ProgressWidget = () => {
  return (
    <div className="lp-progress">
      <h3 className="lp-progress__title">TIẾN ĐỘ CẤP ĐỘ</h3>
      <span className="lp-progress__level">Cơ bản</span>

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
