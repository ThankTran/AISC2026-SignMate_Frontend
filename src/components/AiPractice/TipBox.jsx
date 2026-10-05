import { Info } from "lucide-react";

import "./TipBox.css";

const TipBox = ({ tip }) => {
  return (
    <div className="tip-box">
      <div className="tip-box__content">
        <span className="tip-box__icon">
          <Info size={16} strokeWidth={2.2} />
        </span>
        <p className="tip-box__text">
          <strong>Mẹo:</strong> {tip}
        </p>
      </div>
    </div>
  );
};

export default TipBox;
