import { useConfirm } from "../../hooks/useConfirm";
import Modal from "../ui/Modal";
import { HeartCrack, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import "./OutOfHeartsModal.css";

const OutOfHeartsModal = () => {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const confirmExit = async (event) => { event.preventDefault(); if (await confirm({ title: "Thoát bài học?", message: "Tiến độ chưa hoàn tất trong phiên này có thể không được lưu.", confirmLabel: "Thoát" })) navigate('/learning-path'); };
  return (
    <Modal className="ooh-modal__card" labelledBy="ooh-title" closeOnOutside={false} closeOnEscape={false}>
        <div className="ooh-modal__card__icon">
          <HeartCrack size={52} strokeWidth={1.6} />
        </div>

        <h2 id="ooh-title" className="ooh-modal__card__title text-h2">
          Bạn đã hết tim mất rồi!
        </h2>

        <p className="ooh-modal__card__text">
          Hãy nghỉ ngơi để hồi phục tim hoặc xem lại các bài học cũ
          để luyện tập thêm nhé.
        </p>

        <Link to="/practice-ai" className="ooh-modal__card__primary">
          <Heart size={16} fill="currentColor" />
          Luyện tập với AI
        </Link>

        <Link onClick={confirmExit} to="/learning-path" className="ooh-modal__card__secondary">
          Thoát bài học
        </Link>
    </Modal>
  );
};

export default OutOfHeartsModal;
