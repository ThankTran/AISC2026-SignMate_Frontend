import { Check, Circle } from "lucide-react";

import "./DailyQuests.css";

const QUESTS = [
  {
    id: 1,
    label: "Hoàn thành 1 bài học hôm nay",
    xp: "+10 XP",
    done: true,
  },
  {
    id: 2,
    label: "Luyện 5 ký hiệu liên tiếp",
    xp: "+15 XP",
    done: true,
  },
  {
    id: 3,
    label: "Đạt 80%+ trong bài kiểm tra",
    xp: "+20 XP",
    done: false,
  },
  {
    id: 4,
    label: "Thử chế độ Luyện tập AI",
    xp: "+25 XP",
    done: false,
  },
];

const DailyQuests = () => {
  const earned = QUESTS.filter((q) => q.done).reduce((sum, q) => {
    return sum + parseInt(q.xp.replace(/\D/g, ""), 10);
  }, 0);
  const total = QUESTS.reduce((sum, q) => {
    return sum + parseInt(q.xp.replace(/\D/g, ""), 10);
  }, 0);
  const pct = Math.round((earned / total) * 100);

  return (
    <div className="lp-quests">
      {/* Header + progress */}
      <div className="lp-quests__header">
        <div className="lp-quests__title-row">
          <h3 className="lp-quests__title">NHIỆM VỤ HÔM NAY</h3>
          <span className="lp-quests__xp">
            {earned} / {total} XP
          </span>
        </div>
        <div className="lp-quests__bar-track">
          <div
            className="lp-quests__bar-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* List */}
      <ul className="lp-quests__list">
        {QUESTS.map((q) => (
          <li
            key={q.id}
            className={`lp-quest ${q.done ? "lp-quest--done" : ""}`}
          >
            <span className="lp-quest__check">
              {q.done ? <Check size={15} strokeWidth={3} /> : <Circle size={15} />}
            </span>
            <span className="lp-quest__label">{q.label}</span>
            <span className="lp-quest__xp">{q.xp}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DailyQuests;