import {
  ArrowRight,
  Hand,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Heart,
} from "lucide-react";
import ParticipantAvatar from "./ParticipantAvatar";
import CallButton from "./CallButton";
import { demoPartners as partners } from "../../mockdata/videoCall/partners";

export default function SmartMatchCard({ canSearch, onSearch }) {
  return (
    <aside className="vc-match-aside">
      <div className="vc-ai-card">
        <span className="vc-ai-label">
          <Sparkles size={14} /> SmartMatch AI
        </span>
        <div className="vc-orbit" aria-hidden="true">
          <div className="vc-orbit-ring" />
          <div className="vc-orbit-ring second" />
          <span className="vc-orbit-core">
            <Hand size={39} />
          </span>
          <span className="vc-orbit-node node-one">
            <Heart size={19} />
          </span>
          <span className="vc-orbit-node node-two">
            <MessageCircle size={20} />
          </span>
          <span className="vc-orbit-spark">
            <Sparkles size={22} />
          </span>
        </div>
        <h2>
          Một người bạn.
          <br />
          Nhiều điều để sẻ chia.
        </h2>
        <p>
          Gợi ý bạn học cùng sở thích và trình độ, để mỗi cuộc trò chuyện đều
          thật tự nhiên.
        </p>
        <div className="vc-online">
          <span className="vc-avatar-stack">
            {partners.map((p) => (
              <ParticipantAvatar key={p.name} person={p} />
            ))}
          </span>
          <div>
            <strong>
              <i /> Sẵn sàng kết nối
            </strong>
            <small>Khám phá hồ sơ luyện tập mẫu</small>
          </div>
        </div>
      </div>
      <CallButton disabled={!canSearch} onClick={onSearch}>
        Bắt đầu tìm kiếm <ArrowRight size={20} />
      </CallButton>
      <p className="vc-under-button">
        <ShieldCheck size={13} /> Bạn có thể kết thúc cuộc gọi bất cứ lúc nào
      </p>
    </aside>
  );
}
