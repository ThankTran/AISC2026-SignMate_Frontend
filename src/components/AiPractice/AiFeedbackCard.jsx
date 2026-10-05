import { Star } from "lucide-react";

import "./AiFeedbackCard.css";

const regionNames = {
  left_hand: "Tay trái",
  right_hand: "Tay phải",
  face: "Khuôn mặt",
  recognition: "Nhận diện động tác",
};

const AiFeedbackCard = ({ feedback }) => {
  const items = Array.isArray(feedback)
    ? feedback.filter((item) => item?.message)
    : feedback
      ? [{ message: feedback }]
      : [];

  return (
    <div className="ai-feedback">
      <div className="ai-feedback__header">
        <span className="ai-feedback__icon">
          <Star size={16} strokeWidth={2} />
        </span>
        <h2 className="ai-feedback__title text-h2">Nhận xét của AI</h2>
      </div>
      {items.length ? (
        <div className="ai-feedback__items">
          {items.map((item, index) => (
            <div className="ai-feedback__item" key={`${item.region || "general"}-${index}`}>
              <div className="ai-feedback__item-heading">
                <h3>{regionNames[item.region] || "Nhận xét chung"}</h3>
                {typeof item.score === "number" && Number.isFinite(item.score) && (
                  <span>{item.score.toFixed(2)} / 100</span>
                )}
              </div>
              <p className="ai-feedback__text">{item.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="ai-feedback__text">
          Nhận xét sẽ xuất hiện sau khi AI chấm lượt thực hiện của bạn.
        </p>
      )}
    </div>
  );
};

export default AiFeedbackCard;
