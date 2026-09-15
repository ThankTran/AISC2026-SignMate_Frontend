import { Check, Clock, Palette, Play, Star } from "lucide-react";
import { Link } from "react-router-dom";

import "./SCurvePath.css";

const LESSONS = [
  {
    id: 1,
    title: "Bảng chữ & Số",
    status: "completed",
    top: "8.5%",
    left: "16.1%",
  },
  {
    id: 2,
    title: "Chào hỏi cơ bản",
    status: "completed",
    top: "26.8%",
    left: "80.6%",
  },
  {
    id: 3,
    title: "Thành viên gia đình",
    status: "completed",
    top: "45.1%",
    left: "16.1%",
  },
  {
    id: 4,
    title: "Màu sắc & Hình dạng",
    status: "active",
    top: "63.4%",
    left: "80.6%",
    tooltip: {
      desc: "Đỏ, xanh, tròn, vuông",
      duration: "11 phút",
      xp: "+25 XP",
    },
  },
  {
    id: 5,
    title: "Hoạt động hằng ngày",
    status: "locked",
    top: "81.7%",
    left: "16.1%",
  },
];

const STATUS_CONFIG = {
  completed: {
    bg: "lp-node--completed",
    icon: <Check size={22} strokeWidth={2.5} />,
    iconColor: "#fff",
    ring: "lp-node__ring--completed",
  },
  active: {
    bg: "lp-node--active",
    icon: <Palette size={22} strokeWidth={2} />,
    iconColor: "#fff",
    ring: "lp-node__ring--active",
  },
  locked: {
    bg: "lp-node--locked",
    icon: <Clock size={20} strokeWidth={2} />,
    iconColor: "#9CA3AF",
    ring: "lp-node__ring--locked",
  },
};

const SCurvePath = () => {
  const cfg = (s) => STATUS_CONFIG[s];

  return (
    <div className="lp-curve">
      {/* ===== SVG BACKBONE ===== */}
      <svg
        className="lp-curve__svg"
        viewBox="0 0 620 820"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Completed segments (dashed green) */}
        <path
          d="M 100,70 C 260,70 360,220 500,220"
          stroke="#0D8A6A"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="14 8"
          className="lp-curve__segment lp-curve__segment--done"
        />
        <path
          d="M 500,220 C 360,220 260,370 100,370"
          stroke="#0D8A6A"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="14 8"
          className="lp-curve__segment lp-curve__segment--done"
        />
        <path
          d="M 100,370 C 260,370 360,520 500,520"
          stroke="#0D8A6A"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="14 8"
          className="lp-curve__segment lp-curve__segment--done"
        />

        {/* Upcoming segments (dashed grey) */}
        <path
          d="M 500,520 C 360,520 260,670 100,670"
          stroke="#D1D5DB"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="14 8"
          className="lp-curve__segment lp-curve__segment--pending"
        />
      </svg>

      {/* ===== LESSON NODES ===== */}
      {LESSONS.map((lesson) => {
        const s = cfg(lesson.status);
        return (
          <div
            key={lesson.id}
            className="lp-node"
            style={{ top: lesson.top, left: lesson.left }}
          >
            {/* Node circle */}
            <div className={`lp-node__icon ${s.bg}`}>
              <div className={`lp-node__ring ${s.ring}`} />
              <span style={{ color: s.iconColor, position: "relative", zIndex: 1 }}>
                {s.icon}
              </span>
            </div>

            {/* Label */}
            <span className="lp-node__label">{lesson.title}</span>

            {/* Active tooltip card */}
            {lesson.status === "active" && lesson.tooltip && (
              <div className="lp-tooltip">
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
      })}
    </div>
  );
};

export default SCurvePath;
