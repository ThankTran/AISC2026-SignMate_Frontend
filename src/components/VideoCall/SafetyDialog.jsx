import { useState } from "react";
import { useDialogFocus } from "../../hooks/videoCall/useDialogFocus";
import CallButton from "./CallButton";

export default function SafetyDialog({ action, partner, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const dialogRef = useDialogFocus(onClose);
  const isBlock = action === "block";

  return (
    <div className="vc-modal-backdrop" onClick={onClose}>
      <section
        ref={dialogRef}
        className="vc-panel vc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vc-safety-title"
        aria-describedby="vc-safety-description"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="vc-safety-title">
          {isBlock ? `Chặn ${partner.name}?` : "Báo cáo buổi trò chuyện"}
        </h2>
        <p id="vc-safety-description">
          {isBlock
            ? "Hồ sơ này sẽ không xuất hiện khi ghép cặp trong phiên demo hiện tại."
            : "Báo cáo demo được lưu trên trình duyệt, chưa gửi đến đội ngũ hỗ trợ."}
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
      </section>
    </div>
  );
}
