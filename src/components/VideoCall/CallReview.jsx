import { useState } from "react";
import { ArrowRight, Check, Sparkles, Star, Flag, Ban } from "lucide-react";
import ParticipantAvatar from "./ParticipantAvatar";
import CallButton from "./CallButton";
import { formatTime } from "../../utils/videoCall/formatTime";
import {
  feedbackHighlights as highlights,
  ratingLabels,
  demoRewards,
} from "../../mockdata/videoCall/review";
import { toggleSelection } from "../../utils/videoCall/selection";

export default function CallReview({
  partner,
  selected,
  duration,
  isBlocked,
  onSafetyAction,
  onSubmit,
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [note, setNote] = useState("");
  const toggleTag = (tag) =>
    setTags((current) => toggleSelection(current, tag));
  return (
    <section className="vc-centered vc-review vc-enter">
      <span className="vc-success-pill">
        <Check size={14} /> Cuộc gọi kết thúc · {formatTime(duration)}
      </span>
      <h1>
        Mỗi lời góp ý,
        <br />
        một bước tiến bộ.
      </h1>
      <p>
        Chia sẻ cảm nhận để những cuộc trò chuyện
        <br />
        tiếp theo ngày càng tốt hơn.
      </p>
      <div className="vc-panel vc-review-person">
        <ParticipantAvatar person={partner} />
        <div>
          <strong>{partner.name}</strong>
          <small>Người nghe · NNKH cơ bản</small>
          <span>{selected[0]}</span>
        </div>
        <div className="vc-review-duration">
          <strong>{formatTime(duration)}</strong>
          <small>thời lượng</small>
        </div>
      </div>
      <div className="vc-panel vc-rating">
        <h2>Bạn cảm thấy buổi trò chuyện này thế nào?</h2>
        <div className="vc-stars" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              aria-label={`Đánh giá ${n} sao`}
              aria-pressed={rating === n}
              onMouseEnter={() => setHoverRating(n)}
              onFocus={() => setHoverRating(n)}
              onBlur={() => setHoverRating(0)}
              onClick={() => setRating(n)}
              style={{ "--i": n }}
            >
              <Star
                size={36}
                fill={(hoverRating || rating) >= n ? "currentColor" : "none"}
                className={(hoverRating || rating) >= n ? "filled" : ""}
              />
            </button>
          ))}
        </div>
        <p aria-live="polite">{ratingLabels[hoverRating || rating]}</p>
      </div>
      {rating > 0 && (
        <div className="vc-review-extra vc-enter">
          <div className="vc-panel">
            <h3>Điều gì nổi bật nhất?</h3>
            <div className="vc-feedback-tags">
              {highlights.map((t) => (
                <button
                  key={t}
                  aria-pressed={tags.includes(t)}
                  className={tags.includes(t) ? "selected" : ""}
                  onClick={() => toggleTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="vc-xp-strip">
            <Sparkles size={16} /> XP bạn sẽ nhận{" "}
            <strong>+{demoRewards.personalXp}</strong>
          </div>
          <label className="vc-panel vc-notes">
            Ghi chú thêm <small>(tùy chọn)</small>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Một điều bạn thích, hoặc một góp ý nhỏ…"
              maxLength={1000}
            />
          </label>
        </div>
      )}
      <div className="vc-safety-actions">
        <button onClick={() => onSafetyAction("block")}>
          <Ban size={14} />
          {isBlocked ? "Đã chặn" : "Chặn"}
        </button>
        <button onClick={() => onSafetyAction("report")}>
          <Flag size={14} />
          Báo cáo
        </button>
      </div>
      <CallButton
        disabled={!rating}
        onClick={() => onSubmit({ rating, tags, note })}
      >
        Gửi đánh giá <ArrowRight size={18} />
      </CallButton>
      <small className="vc-local-note">
        Đánh giá demo được lưu trong phiên trình duyệt này.
      </small>
    </section>
  );
}
