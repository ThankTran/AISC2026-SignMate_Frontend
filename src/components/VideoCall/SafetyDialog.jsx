import { VIDEO_DEMO } from "../../services/videoCall/config";
import { useState } from "react";
import Modal from "../ui/Modal";
import CallButton from "./CallButton";
import { errorMessage } from "../../services/errorMessages";

export default function SafetyDialog({ action, partner, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const isBlock = action === "block";

  return (
    <Modal
      className="vc-panel vc-modal"
      onClose={busy ? undefined : onClose}
      closeOnOutside={!busy}
      closeOnEscape={!busy}
      labelledBy="vc-safety-title"
      describedBy="vc-safety-description"
    >
      <h2 id="vc-safety-title" className="text-h2">
        {isBlock ? `Chặn ${partner.name}?` : "Báo cáo buổi trò chuyện"}
      </h2>
      <p id="vc-safety-description">
        {isBlock
          ? import.meta.env.VITE_USE_MOCK === "true"
            ? "Hồ sơ này sẽ không xuất hiện khi ghép cặp trong phiên demo hiện tại."
            : "Người dùng này sẽ bị loại khỏi tìm kiếm, ghép cặp và không thể gửi lời mời cho bạn."
          : VIDEO_DEMO
            ? "Báo cáo demo được lưu trên trình duyệt, chưa gửi đến đội ngũ hỗ trợ."
            : "Báo cáo được lưu trên trình duyệt, chưa gửi đến đội ngũ hỗ trợ."}
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
        <CallButton secondary disabled={busy} onClick={onClose}>
          Hủy
        </CallButton>
        <CallButton
          disabled={busy || (!isBlock && !reason.trim())}
          onClick={async () => {
            setBusy(true);
            setError(null);

            try {
              await onConfirm(reason);
            } catch (err) {
              setError(err);
            } finally {
              setBusy(false);
            }
          }}
        >
          Xác nhận
        </CallButton>
      </div>
      {error && <p role="alert">{errorMessage(error)}</p>}
    </Modal>
  );
}
