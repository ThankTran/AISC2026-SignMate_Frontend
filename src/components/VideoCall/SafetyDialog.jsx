import { VIDEO_DEMO } from "../../services/videoCall/config";
import { useState } from "react";
import Modal from "../ui/Modal";
import CallButton from "./CallButton";

export default function SafetyDialog({ action, partner, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const isBlock = action === "block";

  return (
    <Modal className="vc-panel vc-modal" onClose={onClose} labelledBy="vc-safety-title" describedBy="vc-safety-description">
        <h2 id="vc-safety-title" className="text-h2">
          {isBlock ? `Chặn ${partner.name}?` : "Báo cáo buổi trò chuyện"}
        </h2>
        <p id="vc-safety-description">
          {isBlock
            ? (VIDEO_DEMO ? "Hồ sơ này sẽ không xuất hiện khi ghép cặp trong phiên demo hiện tại." : "Hồ sơ này sẽ không xuất hiện khi ghép cặp trong phiên hiện tại.")
            : (VIDEO_DEMO ? "Báo cáo demo được lưu trên trình duyệt, chưa gửi đến đội ngũ hỗ trợ." : "Báo cáo được lưu trên trình duyệt, chưa gửi đến đội ngũ hỗ trợ.")}
        </p>
        {!isBlock && (
          <textarea
            aria-label="Lý do báo cáo"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Mô tả vấn đề bạn gặp phải…"
          />
        )}
        <div className="vc-actions">
          <CallButton secondary onClick={onClose}>
            Hủy
          </CallButton>
          <CallButton
            disabled={!isBlock && !reason.trim()}
            onClick={() => onConfirm(reason)}
          >
            Xác nhận
          </CallButton>
        </div>
    </Modal>
  );
}
