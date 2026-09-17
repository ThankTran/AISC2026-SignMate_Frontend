import { Check, X } from "lucide-react";

import "./SignGuideModal.css";

/* Hình minh họa ký hiệu mẫu theo từng số ASL (emoji) */
const SIGN_MEDIA = {
  "1": "☝️",
  "2": "✌️",
  "3": "🤟",
  "4": "✋",
  "5": "🖐",
  "6": "🤙",
  "7": "🤞",
  "8": "🤏",
  "9": "🤏",
  "10": "👍",
};

const SignGuideModal = ({ sign, label, steps, onClose, onStart }) => {
  const media = SIGN_MEDIA[sign] ?? "✋";

  return (
    <div className="sign-modal" role="dialog" aria-modal="true" aria-labelledby="sign-modal-title">
      <div className="sign-modal__backdrop" onClick={onClose} />

      <div className="sign-modal__card">
        <button
          type="button"
          className="sign-modal__close"
          onClick={onClose}
          aria-label="Đóng hướng dẫn"
        >
          <X size={18} strokeWidth={2.2} />
        </button>

        <h3 className="sign-modal__title" id="sign-modal-title">
          Hướng dẫn thực hiện: Số {sign} ({label})
        </h3>

        {/* ---- Minh họa ký hiệu mẫu ---- */}
        <div className="sign-modal__media">
          <span className="sign-modal__hand" aria-hidden="true">
            {media}
          </span>
          <span className="sign-modal__media-caption">
            Hình minh họa ký hiệu mẫu
          </span>
        </div>

        {/* ---- Các bước chi tiết ---- */}
        <ol className="sign-modal__steps">
          {steps.map((step, i) => (
            <li key={i} className="sign-modal__step">
              <span className="sign-modal__step-num">{i + 1}</span>
              <span className="sign-modal__step-text">{step}</span>
            </li>
          ))}
        </ol>

        <button type="button" className="sign-modal__cta" onClick={onStart}>
          <Check size={17} strokeWidth={2.5} />
          Đã hiểu, Bắt đầu làm
        </button>
      </div>
    </div>
  );
};

export default SignGuideModal;