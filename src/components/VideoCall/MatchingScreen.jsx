import { VIDEO_DEMO } from "../../services/videoCall/config";
import { ArrowLeft, Check, Hand, X, Sparkles, Clock } from "lucide-react";
import { formatTime } from "../../utils/videoCall/formatTime";
import { matchingSteps } from "../../mockdata/videoCall/topics";

export default function MatchingScreen({ elapsed, onCancel }) {
  return (
    <section className="vc-search vc-enter" aria-label="Đang tìm bạn học">
      <div className="vc-search-topbar">
        <button
          type="button"
          className="vc-back"
          onClick={onCancel}
          aria-label="Hủy tìm kiếm và quay lại chọn chủ đề"
        >
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </button>
      </div>

      <div className="vc-search-card">
        <div className="vc-search-orb" aria-hidden="true">
          <span className="vc-ripple-ring r1" />
          <span className="vc-ripple-ring r2" />
          <span className="vc-ripple-ring r3" />
          <div className="vc-orb-core">
            <Hand size={38} />
          </div>
        </div>

        <span className="vc-search-badge">
          <Sparkles size={13} /> ĐANG TÌM KIẾM BẠN HỌC
        </span>

        <h1 className="text-h1 vc-search-title">
          Đang kết nối với bạn học<span className="vc-dots">...</span>
        </h1>

        <p className="vc-search-desc">
          SignMate đang tìm kiếm người học có chung chủ đề yêu thích
          <br />
          để bắt đầu một buổi luyện tập bổ ích và tự nhiên.
        </p>

        {VIDEO_DEMO && (
          <div className="vc-search-checks" aria-live="polite">
            {matchingSteps.map((t, i) => {
              const isDone = elapsed >= i + 1;
              return (
                <div key={t} className={`vc-check-row ${isDone ? "complete" : ""}`}>
                  <span className="vc-check-icon">
                    {isDone ? <Check size={14} /> : <span className="vc-loader" />}
                  </span>
                  <span className="vc-check-label">{t}</span>
                </div>
              );
            })}
          </div>
        )}

        {!VIDEO_DEMO && (
          <div className="vc-search-status-banner" role="status">
            <span className="vc-loader" />
            <p>
              {elapsed < 15
                ? "Ưu tiên người có nhiều chủ đề chung."
                : elapsed < 30
                  ? "Đang mở rộng tìm kiếm trong những người có chủ đề chung."
                  : "Chưa có người phù hợp. Bạn có thể tiếp tục chờ hoặc hủy tìm kiếm."}
            </p>
          </div>
        )}

        <div className="vc-wait-badge">
          <Clock size={14} />
          <span>Thời gian tìm kiếm:</span>
          <strong>{formatTime(elapsed)}</strong>
        </div>

        <button
          type="button"
          className="vc-cancel-btn"
          onClick={onCancel}
          aria-label="Hủy tìm kiếm"
        >
          <X size={16} />
          <span>Hủy tìm kiếm</span>
        </button>
      </div>
    </section>
  );
}
