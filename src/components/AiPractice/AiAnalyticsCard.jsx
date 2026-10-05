import { formRating } from "../../services/handSign";
import "./AiAnalyticsCard.css";
export default function AiAnalyticsCard({ result, phase }) {
  const score = result?.form?.score;
  const regions = result?.form?.region_scores;
  const circumference = 2 * Math.PI * 54;

  return (
    <section className="ai-analytics" aria-label="Điểm động tác">
      <div className="ai-analytics__header">
        <h2 className="ai-analytics__title text-h2">AI Analytics · Phản hồi động tác</h2>
      </div>
      {(phase === "processing" || phase === "recording") && (
        <p className="ai-analytics__status" role="status">
          {phase === "processing"
            ? "AI đang chấm động tác…"
            : "Đang ghi hình · Chấm điểm khi kết thúc"}
        </p>
      )}
      <div className="ai-analytics__gauge">
        <div className="ai-analytics__gauge-ring">
          <svg viewBox="0 0 120 120" className="ai-analytics__gauge-svg" aria-hidden="true">
            <circle className="ai-analytics__gauge-bg" cx="60" cy="60" r="54" />
            <circle
              className="ai-analytics__gauge-fill"
              cx="60"
              cy="60"
              r="54"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - (score ?? 0) / 100)}
            />
          </svg>
          <div className="ai-analytics__gauge-value">
            <span className="ai-analytics__gauge-num">
              {score == null ? "—" : Math.round(score)}
            </span>
            <span className="ai-analytics__gauge-label">Điểm động tác</span>
          </div>
        </div>
      </div>
      <p className="ai-analytics__rating">{formRating(result?.form?.status)}</p>
      <h3 className="ai-analytics__match-title">Khớp tốt với động tác mẫu</h3>
      <div className="ai-analytics__metrics">
        {[
          ["right_hand", "Tay phải"],
          ["face", "Khuôn mặt"],
        ].map(([key, label]) => (
          <div className="ai-analytics__metric" key={key}>
            <span className="ai-analytics__metric-label">{label}</span>
            <span className="ai-analytics__metric-val">
              {regions?.[key] == null ? "—" : Math.round(regions[key])}
              <small> /100</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
