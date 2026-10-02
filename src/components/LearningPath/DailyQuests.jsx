import {useProgress} from "../../hooks/useProgress";
import { Link } from "react-router-dom";
import { Check, Circle } from "lucide-react";

import "./DailyQuests.css";

const DailyQuests = () => {
  const {dailyQuests:quests,source}=useProgress();
  const earned = quests.filter((q) => q.done).reduce((sum, q) => {
    return sum + q.xp;
  }, 0);
  const total = quests.reduce((sum, q) => {
    return sum + q.xp;
  }, 0);
  const done=quests.filter(q=>q.done).length;
  const pct = quests.length ? Math.round(done / quests.length * 100) : 0;

  return (
    <div className="lp-quests">
      {/* Header + progress */}
      <div className="lp-quests__header">
        <div className="lp-quests__title-row">
          <h2 className="lp-quests__title text-h2">NHIỆM VỤ HÔM NAY</h2>
          <span className="lp-quests__xp">
            {source==='server'?`${done} / ${quests.length} nhiệm vụ`:`${earned} / ${total} XP`}
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
        {quests.map((q) => (
          <li
            key={q.id}
            className={`lp-quest ${q.done ? "lp-quest--done" : ""}`}
          >
            <span className="lp-quest__check">
              {q.done ? <Check size={15} strokeWidth={3} /> : <Circle size={15} />}
            </span>
            {(q.type === 'practice' || q.type === 'ai') ? <Link className="lp-quest__label touch-target" to="/practice-ai">{q.label}</Link> : <span className="lp-quest__label">{q.label}</span>}
            <span className="lp-quest__xp">{source==='server'?q.done?`Đã nhận ${q.xp} XP`:'Chưa hoàn thành':`+${q.xp} XP`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DailyQuests;
