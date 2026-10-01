import { Star } from "lucide-react";

import "./AiFeedbackCard.css";

const AiFeedbackCard = ({ feedback }) => {
  return (
    <div className="ai-feedback">
      <div className="ai-feedback__header">
        <span className="ai-feedback__icon">
          <Star size={16} strokeWidth={2} />
        </span>
        <h2 className="ai-feedback__title text-h2">Nhận xét của AI</h2>
      </div>
      <p className="ai-feedback__text">{feedback}</p>
    </div>
  );
};

export default AiFeedbackCard;
