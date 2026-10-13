import { VIDEO_DEMO } from "../../services/videoCall/config";
import { CheckCheck, Sparkles, Video, Star, RotateCcw, MapPin, MessageSquareQuote } from "lucide-react";
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
    <section className="vc-centered vc-enter vc-partner-stage" aria-label="Kết quả ghép cặp">
      <span className="vc-success-pill">
        <CheckCheck size={16} /> Ghép cặp thành công!
      </span>

      <h1 className="text-h1 vc-partner-headline">
        Đã tìm thấy bạn học phù hợp!
      </h1>
      <p className="vc-partner-sub">
        Khám phá hồ sơ bạn học và sẵn sàng cho buổi thực hành ngôn ngữ ký hiệu.
      </p>

      <div className="vc-panel vc-partner">
        <div className="vc-compatibility">
          <div className="vc-compatibility-left">
            <span className="vc-compat-icon">
              <Sparkles size={20} />
            </span>
            <div>
              <small>ĐỘ PHÙ HỢP</small>
              <strong>{VIDEO_DEMO ? `${partner.score}%` : `${selected.length} chủ đề chung`}</strong>
            </div>
          </div>
          <span className="vc-compatibility-note">
            Cùng sở thích.
            <br />
            Cùng tiến bộ.
          </span>
        </div>

        <div className="vc-partner-main">
          <div className="vc-partner-avatar-wrapper">
            <ParticipantAvatar person={partner} className="vc-partner-big-avatar" />
            <span className="vc-partner-status-tag">
              <i /> {VIDEO_DEMO ? "Hồ sơ demo" : "Sẵn sàng"}
            </span>
          </div>
          <div className="vc-partner-info">
            <h2 className="text-h2 vc-partner-name">{partner.name}</h2>
            <p className="vc-location">
              <MapPin size={14} />
              <span>{partner.curriculumLevel || partner.city || "Bạn học SignMate"}</span>
            </p>
            <p className="vc-partner-bio">{partner.bio}</p>
          </div>
        </div>

        {VIDEO_DEMO && (
          <div className="vc-stats">
            <div className="vc-stat-box">
              <strong>{partner.sessions}</strong>
              <small>Buổi luyện tập</small>
            </div>
            <div className="vc-stat-box">
              <strong>
                {partner.rating} <Star size={14} className="vc-star-icon" />
              </strong>
              <small>Đánh giá</small>
            </div>
            <div className="vc-stat-box">
              <strong>{partner.friends}</strong>
              <small>Bạn bè kết nối</small>
            </div>
          </div>
        )}

        <div className="vc-partner-section">
          <small className="vc-label">CHỦ ĐỀ CHUNG</small>
          <div className="vc-tags">
            {selected.map((t) => (
              <span key={t} className="vc-topic-tag">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="vc-prompt">
          <small className="vc-prompt-label">
            <MessageSquareQuote size={15} /> CHỦ ĐỀ GỢI Ý MỞ ĐẦU
          </small>
          <strong className="vc-prompt-quote">“{prompt}”</strong>
        </div>
      </div>

      <div className="vc-actions">
        <CallButton onClick={onStartCall} aria-label="Tiếp tục kiểm tra thiết bị và vào phòng">
          <Video size={18} /> Tiếp tục: Kiểm tra thiết bị
        </CallButton>
        <CallButton secondary onClick={onFindAnother} aria-label="Tìm người bạn khác">
          <RotateCcw size={16} /> Tìm người khác
        </CallButton>
      </div>

      <button
        type="button"
        className="vc-text-button vc-edit-topics-btn"
        onClick={onEditTopics}
        aria-label="Quay lại thay đổi danh sách chủ đề"
      >
        Thay đổi chủ đề
      </button>
    </section>
  );
}
