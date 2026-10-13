import { ArrowRight, Hand, Sparkles, MessageCircle, ShieldCheck, Heart, Users } from "lucide-react";
import ParticipantAvatar from "./ParticipantAvatar";
import CallButton from "./CallButton";
import { demoPartners as partners } from "../../mockdata/videoCall/partners";

export default function SmartMatchCard({ canSearch, onSearch }) {
  return (
    <aside className="vc-match-aside" aria-label="Bảng điều khiển ghép cặp thông minh">
      <div className="vc-ai-card">
        <div className="vc-ai-topbar">
          <span className="vc-ai-label">
            <Sparkles size={14} className="vc-sparkle-spin" /> SmartMatch AI
          </span>
          <span className="vc-ai-mode-badge">
            <Users size={13} /> 1-on-1 Realtime
          </span>
        </div>

        {/* Radar Sonar & Orbit Stage */}
        <div className="vc-orbit vc-radar-stage" aria-hidden="true">
          {/* Radar background grid & crosshairs */}
          <div className="vc-radar-crosshair h" />
          <div className="vc-radar-crosshair v" />
          <div className="vc-radar-grid outer" />
          <div className="vc-radar-grid middle" />
          <div className="vc-radar-grid inner" />

          {/* Radar rotating sweep beam */}
          <div className="vc-radar-scanner" />

          {/* 3 Sonar radiating waves (continuous pulses) */}
          <div className="vc-sonar-wave wave-1" />
          <div className="vc-sonar-wave wave-2" />
          <div className="vc-sonar-wave wave-3" />

          {/* 3D Floating Hand in the center */}
          <div className="vc-radar-core-3d">
            <div className="vc-orbit-core">
              <Hand size={32} className="vc-hand-icon" />
              <span className="vc-core-glow" />
            </div>
          </div>

          {/* Orbiting Satellites (Heart, Message, Avatar/Partner, Sparkles) */}
          <div className="vc-orbit-track track-heart">
            <span className="vc-orbit-node node-heart" title="Đồng cảm & sẻ chia">
              <Heart size={15} />
            </span>
          </div>

          <div className="vc-orbit-track track-message">
            <span className="vc-orbit-node node-message" title="Hội thoại thực tế">
              <MessageCircle size={15} />
            </span>
          </div>

          <div className="vc-orbit-track track-avatar">
            <span className="vc-orbit-node node-avatar" title="Bạn học đồng hành">
              <Users size={14} />
            </span>
          </div>

          <div className="vc-orbit-track track-sparkle">
            <span className="vc-orbit-node node-sparkle" title="Ghép cặp thông minh">
              <Sparkles size={13} />
            </span>
          </div>
        </div>

        <h2 className="text-h2">
          Kết nối bạn học
          <br />
          Cùng chung sở thích
        </h2>

        <div className="vc-steps-mini">
          <div className="vc-step-mini-item">
            <span className="vc-step-num">1</span>
            <span>Khớp chủ đề quan tâm</span>
          </div>
          <div className="vc-step-mini-item">
            <span className="vc-step-num">2</span>
            <span>Xác nhận thông tin đối tác</span>
          </div>
          <div className="vc-step-mini-item">
            <span className="vc-step-num">3</span>
            <span>Kiểm tra thiết bị & vào phòng</span>
          </div>
        </div>

        <div className="vc-online">
          <span className="vc-avatar-stack">
            {partners.map((p) => (
              <ParticipantAvatar key={p.name} person={p} />
            ))}
          </span>
          <div>
            <strong>
              <i /> Cộng đồng sẵn sàng kết nối
            </strong>
            <small>Cùng luyện tập ngôn ngữ ký hiệu mỗi ngày</small>
          </div>
        </div>
      </div>

      <CallButton
        disabled={!canSearch}
        onClick={onSearch}
        className={`vc-match-cta-btn ${canSearch ? "is-ready" : ""}`}
        aria-label="Bắt đầu tìm kiếm bạn học"
      >
        {canSearch && <span className="vc-cta-shimmer" aria-hidden="true" />}
        <span className="vc-cta-text">Tìm bạn luyện tập</span>
        <ArrowRight size={18} className="vc-cta-arrow" />
      </CallButton>

      <p className="vc-under-button">
        {canSearch ? (
          <>
            <ShieldCheck size={14} className="vc-shield-icon" /> Môi trường an toàn & tôn trọng ·
            Bạn có thể rời phòng bất cứ lúc nào
          </>
        ) : (
          "Vui lòng chọn ít nhất 1 chủ đề ở bên trái để tiếp tục"
        )}
      </p>
    </aside>
  );
}
