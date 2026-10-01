import "./AiAnalyticsCard.css";

const CIRCUMFERENCE = 2 * Math.PI * 54;
const RADIUS = 54;

const AiAnalyticsCard = ({ accuracy, stability, speed, posture, clarity, isActive }) => {
  const dashOffset = CIRCUMFERENCE - ((accuracy ?? 0) / 100) * CIRCUMFERENCE;

  return (
    <div className="ai-analytics">
      {/* ---- Header ---- */}
      <div className="ai-analytics__header">
        <h2 className="ai-analytics__title text-h2">
          AI Analytics - Phản hồi thời gian thực
        </h2>
        {isActive && (
          <span className="ai-analytics__live">
            <span className="ai-analytics__live-dot" />
            DEMO
          </span>
        )}
      </div>

      {/* ---- Accuracy Gauge ---- */}
      <div className="ai-analytics__gauge">
        <div className="ai-analytics__gauge-ring">
          <svg viewBox="0 0 120 120" className="ai-analytics__gauge-svg">
            <defs>
              <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7f77dd" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <circle
              className="ai-analytics__gauge-bg"
              cx="60"
              cy="60"
              r={RADIUS}
            />
            <circle
              className="ai-analytics__gauge-fill"
              cx="60"
              cy="60"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="ai-analytics__gauge-value">
            <span className="ai-analytics__gauge-num">{accuracy == null ? "--" : `${accuracy}%`}</span>
            <span className="ai-analytics__gauge-label">Độ chính xác</span>
          </div>
        </div>
      </div>

      {/* ---- Metrics Grid ---- */}
      <div className="ai-analytics__metrics">
        <div className="ai-analytics__metric">
          <span className="ai-analytics__metric-val">{stability == null ? "--" : `${stability}%`}</span>
          <span className="ai-analytics__metric-label">Độ ổn định</span>
        </div>
        <div className="ai-analytics__metric">
          <span className="ai-analytics__metric-val">{speed == null ? "--" : `${speed}s`}</span>
          <span className="ai-analytics__metric-label">Tốc độ</span>
        </div>
        <div className="ai-analytics__metric">
          <span className="ai-analytics__metric-val">{posture == null ? "--" : `${posture}%`}</span>
          <span className="ai-analytics__metric-label">Tư thế</span>
        </div>
        <div className="ai-analytics__metric">
          <span className="ai-analytics__metric-val">{clarity == null ? "--" : `${clarity}%`}</span>
          <span className="ai-analytics__metric-label">Độ rõ ràng</span>
        </div>
      </div>
    </div>
  );
};

export default AiAnalyticsCard;
