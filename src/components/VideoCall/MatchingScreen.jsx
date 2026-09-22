import { ArrowLeft, Check, Hand } from "lucide-react";
import { formatTime } from "../../utils/videoCall/formatTime";
import { matchingSteps } from "../../mockdata/videoCall/topics";

export default function MatchingScreen({ elapsed, onCancel }) {
  return (
    <section className="vc-search vc-enter">
      <button className="vc-back" onClick={onCancel}>
        <ArrowLeft size={18} /> Quay lại
      </button>
      <div className="vc-search-orb" aria-hidden="true">
        <span />
        <span />
        <span />
        <Hand size={48} />
      </div>
      <span className="vc-eyebrow">ĐANG KẾT NỐI NHỮNG ĐÔI TAY</span>
      <h1>
        Một kết nối mới đang đến<span className="vc-dots">...</span>
      </h1>
      <p>
        Đang tìm người bạn cùng chung sở thích
        <br />
        để bắt đầu một cuộc trò chuyện thật vui.
      </p>
      <div className="vc-search-checks" aria-live="polite">
        {matchingSteps.map((t, i) => (
          <div key={t} className={elapsed >= i + 1 ? "complete" : ""}>
            <span>
              {elapsed >= i + 1 ? (
                <Check size={17} />
              ) : (
                <span className="vc-loader" />
              )}
            </span>
            {t}
          </div>
        ))}
      </div>
      <div className="vc-wait">
        <small>THỜI GIAN CHỜ</small>
        <strong>{formatTime(elapsed)}</strong>
      </div>
      <span className="vc-search-demo">
        Đang mô phỏng ghép cặp · Hồ sơ demo
      </span>
      <button className="vc-text-button" onClick={onCancel}>
        Hủy tìm kiếm
      </button>
    </section>
  );
}
