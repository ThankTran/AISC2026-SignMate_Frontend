import { Play } from "lucide-react";

import "./NextUpCard.css";

const NextUpCard = () => {
  return (
    <div className="lp-next">
      <div className="lp-next__content">
        <span className="lp-next__eyebrow">TIẾP THEO</span>
        <h3 className="lp-next__title">Hoạt động hằng ngày</h3>
        <p className="lp-next__meta">
          Chương 2 · 16 phút · +35 XP
        </p>
      </div>

      <button
        type="button"
        className="lp-next__play"
        aria-label="Bắt đầu bài tiếp theo"
      >
        <Play size={22} fill="currentColor" />
      </button>
    </div>
  );
};

export default NextUpCard;