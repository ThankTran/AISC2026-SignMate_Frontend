import { HeartCrack, Heart } from "lucide-react";
import { Link } from "react-router-dom";

import "./OutOfHeartsModal.css";

const OutOfHeartsModal = () => {
  return (
    <div className="ooh-modal">
      <div className="ooh-modal__backdrop" />

      <div className="ooh-modal__card" role="dialog" aria-modal="true">
        <div className="ooh-modal__card__icon">
          <HeartCrack size={52} strokeWidth={1.6} />
        </div>

        <h2 className="ooh-modal__card__title">
          Bạn đã hết tim mất rồi!
        </h2>

        <p className="ooh-modal__card__text">
          Hãy nghỉ ngơi để hồi phục tim hoặc xem lại các bài học cũ
          để luyện tập thêm nhé.
        </p>

        <button type="button" className="ooh-modal__card__primary">
          <Heart size={16} fill="currentColor" />
          Nạp thêm tim / Luyện tập
        </button>

        <Link to="/learning-path" className="ooh-modal__card__secondary">
          Thoát bài học
        </Link>
      </div>
    </div>
  );
};

export default OutOfHeartsModal;