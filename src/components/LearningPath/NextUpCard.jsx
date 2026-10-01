import {useProgress} from "../../hooks/useProgress";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./NextUpCard.css";

const NextUpCard = () => {
  const {nextLesson:lesson}=useProgress();
  const navigate = useNavigate();
  if(!lesson)return null;
  return (
    <div className="lp-next">
      <div className="lp-next__content">
        <span className="lp-next__eyebrow">TIẾP THEO</span>
        <h2 className="lp-next__title text-h2">{lesson.title}</h2>
        <p className="lp-next__meta">
          Chương {lesson.chapterId}
        </p>
      </div>

      <button
        type="button"
        className="lp-next__play"
        aria-label="Bắt đầu bài tiếp theo"
        onClick={() => navigate(`/learning-path/lesson/${lesson.id}`)}
      >
        <Play size={22} fill="currentColor" />
      </button>
    </div>
  );
};

export default NextUpCard;
