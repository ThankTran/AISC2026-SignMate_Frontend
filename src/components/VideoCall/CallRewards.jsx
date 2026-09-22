import { ArrowRight, Check, Users, Trophy, Home, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import CallButton from "./CallButton";
import { demoRewards as rewards } from "../../mockdata/videoCall/review";

export default function CallRewards({ onContinue }) {
  const progress = Math.round((rewards.currentXp / rewards.nextLevelXp) * 100);
  return (
    <section className="vc-centered vc-thanks vc-enter">
      <div className="vc-celebration">
        <span className="vc-celebration-check">
          <Check size={37} />
        </span>
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{ "--i": i }} />
        ))}
      </div>
      <h1>Cảm ơn bạn đã đánh giá!</h1>
      <p>
        Mỗi kết nối đều có ý nghĩa.
        <br />
        Cảm ơn bạn đã cùng xây dựng cộng đồng SignConnect.
      </p>
      <div className="vc-panel vc-rewards">
        <div className="vc-section-title">
          <span className="vc-icon-tile">
            <Trophy size={22} />
          </span>
          <div>
            <h2>Một buổi học, nhiều niềm vui</h2>
            <p>Thành tích của bạn trong phiên demo</p>
          </div>
        </div>
        <div className="vc-reward-grid">
          <div>
            <Trophy size={19} />
            <small>XP cá nhân</small>
            <strong>
              +{rewards.personalXp} <span>XP</span>
            </strong>
          </div>
          <div>
            <Users size={19} />
            <small>XP đồng đội</small>
            <strong>
              +{rewards.teamXp} <span>XP</span>
            </strong>
          </div>
        </div>
        <div className="vc-level">
          <strong>Cấp độ {rewards.level}</strong>
          <small>
            {rewards.currentXp.toLocaleString("vi-VN")} /{" "}
            {rewards.nextLevelXp.toLocaleString("vi-VN")} XP ({progress}%)
          </small>
        </div>
        <div
          className="vc-progress"
          role="progressbar"
          aria-label={`Tiến độ cấp độ ${rewards.level + 1}`}
          aria-valuenow={rewards.currentXp}
          aria-valuemin={0}
          aria-valuemax={rewards.nextLevelXp}
        >
          <span style={{ "--xp-progress": `${progress}%` }} />
        </div>
        <p>
          Bạn chỉ còn{" "}
          <strong>{rewards.nextLevelXp - rewards.currentXp} XP</strong> nữa để
          đạt Cấp độ {rewards.level + 1}!
        </p>
      </div>
      <div className="vc-actions">
        <Link className="vc-button vc-secondary" to="/">
          <Home size={16} /> Về trang chủ
        </Link>
        <CallButton onClick={onContinue}>
          Tiếp tục luyện tập <ArrowRight size={18} />
        </CallButton>
      </div>
      <span className="vc-thanks-note">
        <Heart size={14} /> Một chút luyện tập mỗi ngày, một bước gần nhau hơn.
      </span>
    </section>
  );
}
