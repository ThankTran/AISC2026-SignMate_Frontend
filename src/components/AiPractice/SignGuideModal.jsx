import Modal from "../ui/Modal";
import { Check, X } from "lucide-react";

import "./SignGuideModal.css";

const SignGuideModal = ({ sign, label, steps, onClose, onStart }) => {

  return (
    <Modal className="sign-modal__card" labelledBy="sign-modal-title" onClose={onClose}>
        <button
          type="button"
          className="sign-modal__close"
          onClick={onClose}
          aria-label="Đóng hướng dẫn"
        >
          <X size={18} strokeWidth={2.2} />
        </button>

        <h3 className="sign-modal__title text-h3" id="sign-modal-title">
          Hướng dẫn thực hiện: Số {sign} ({label})
        </h3>

        {/* ---- Minh họa ký hiệu mẫu ---- */}
        <div className="sign-modal__media">
          <p>Video ký hiệu VSL đang được cập nhật</p>
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
    </Modal>
  );
};

export default SignGuideModal;
