import {
  CheckCheck,
  Sparkles,
  Video,
  Star,
  RotateCcw,
  MapPin,
} from "lucide-react";
import ParticipantAvatar from "./ParticipantAvatar";
import CallButton from "./CallButton";

export default function PartnerMatch({
  partner,
  selected,
  prompt,
  onStartCall,
  onFindAnother,
  onEditTopics,
}) {
  return (
    <section className="vc-centered vc-enter">
      <span className="vc-success-pill">
        <CheckCheck size={15} /> Ghép cặp thành công!
      </span>
      <h1>
        Người bạn tiếp theo
        <br />
        trên hành trình của bạn.
      </h1>
      <p>Một lời chào nhỏ, mở ra một kết nối lớn.</p>
      <div className="vc-panel vc-partner">
        <div className="vc-compatibility">
          <Sparkles size={22} />
          <div>
            <small>ĐỘ PHÙ HỢP</small>
            <strong>{partner.score}%</strong>
          </div>
          <span>
            Cùng sở thích.
            <br />
            Cùng tiến bộ.
          </span>
        </div>
        <div className="vc-partner-main">
          <div className="vc-partner-avatar">
            <ParticipantAvatar person={partner} />
            <span>
              <i /> Hồ sơ demo
            </span>
          </div>
          <div>
            <h2>{partner.name}</h2>
            <p className="vc-location">
              <MapPin size={13} />
              {partner.city} · Người nghe
            </p>
            <p>{partner.bio}</p>
          </div>
        </div>
        <div className="vc-stats">
          <div>
            <strong>{partner.sessions}</strong>
            <small>Buổi học</small>
          </div>
          <div>
            <strong>
              {partner.rating} <Star size={15} />
            </strong>
            <small>Đánh giá</small>
          </div>
          <div>
            <strong>{partner.friends}</strong>
            <small>Bạn bè</small>
          </div>
        </div>
        <small className="vc-label">CHỦ ĐỀ CHUNG</small>
        <div className="vc-tags">
          {selected.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="vc-prompt">
          <small>
            <Sparkles size={13} /> CHỦ ĐỀ GỢI Ý HÔM NAY
          </small>
          <strong>“{prompt}”</strong>
        </div>
      </div>
      <div className="vc-actions">
        <CallButton onClick={onStartCall}>
          <Video size={18} /> Bắt đầu Video Call
        </CallButton>
        <CallButton secondary onClick={onFindAnother}>
          <RotateCcw size={16} /> Tìm người khác
        </CallButton>
      </div>
      <button className="vc-text-button" onClick={onEditTopics}>
        Chỉnh sửa chủ đề
      </button>
    </section>
  );
}
