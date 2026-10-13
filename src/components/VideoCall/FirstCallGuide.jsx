import { useState } from "react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Video, SunMedium, MessageSquareHeart, X, Sparkles } from "lucide-react";

export default function FirstCallGuide() {
  const user = useCurrentUser();
  const key = `signmate-camera-guide:${user?.uid || "guest"}`;
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(key) === "seen";
    } catch {
      return false;
    }
  });

  if (dismissed) {
    return null;
  }

  function handleDismiss() {
    try {
      localStorage.setItem(key, "seen");
    } catch {
      /* The hint can appear again if storage is unavailable. */
    }
    setDismissed(true);
  }

  return (
    <aside className="vc-first-guide" aria-label="Mẹo chuẩn bị cho cuộc gọi video">
      <div className="vc-first-guide-header">
        <div className="vc-first-guide-title">
          <span className="vc-guide-chip">
            <Sparkles size={14} /> Mẹo luyện tập
          </span>
          <h2 className="text-h2">Chuẩn bị trước khi vào phòng gọi</h2>
        </div>
        <button
          type="button"
          className="vc-guide-close-btn"
          onClick={handleDismiss}
          aria-label="Đóng hướng dẫn"
          title="Đóng hướng dẫn"
        >
          <X size={16} />
        </button>
      </div>

      <div className="vc-first-guide-grid">
        <div className="vc-guide-card">
          <span className="vc-guide-icon-pill">
            <Video size={17} />
          </span>
          <div>
            <strong>Khung hình chuẩn</strong>
            <p>Đặt camera ngang tầm mắt, thấy rõ nét mặt, vai và không gian ký hiệu của 2 tay.</p>
          </div>
        </div>

        <div className="vc-guide-card">
          <span className="vc-guide-icon-pill">
            <SunMedium size={17} />
          </span>
          <div>
            <strong>Ánh sáng rõ ràng</strong>
            <p>Nguồn sáng hướng vào mặt, tránh ngồi ngược sáng từ cửa sổ hoặc bóng tối phía sau.</p>
          </div>
        </div>

        <div className="vc-guide-card">
          <span className="vc-guide-icon-pill">
            <MessageSquareHeart size={17} />
          </span>
          <div>
            <strong>Tự tin chia sẻ</strong>
            <p>Không cần hoàn hảo ngay từ đầu. Khung chat văn bản luôn sẵn sàng hỗ trợ bạn.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
