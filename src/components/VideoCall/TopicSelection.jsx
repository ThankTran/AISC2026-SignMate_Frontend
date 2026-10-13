import { useState, useMemo } from "react";
import {
  ArrowRight,
  Check,
  MessageCircle,
  Plus,
  X,
  Heart,
  Briefcase,
  Globe,
  Coffee,
  Palette,
  Cpu,
  GraduationCap,
  Smile,
  Sparkles,
  RefreshCw,
  Video,
  Lightbulb,
  Award,
} from "lucide-react";
import { topicOptions, practiceSteps } from "../../mockdata/videoCall/topics";
import SmartMatchCard from "./SmartMatchCard";

const topicIcons = {
  heart: Heart,
  briefcase: Briefcase,
  globe: Globe,
  coffee: Coffee,
  palette: Palette,
  cpu: Cpu,
  graduation: GraduationCap,
};

const TOPIC_SUGGESTIONS = {
  "Gia đình": "Kể về một kỷ niệm đáng nhớ cùng người thân hoặc chia sẻ về thành viên bạn yêu quý nhất.",
  "Công việc": "Giới thiệu công việc hiện tại hoặc định hướng nghề nghiệp bạn đang theo đuổi bằng ký hiệu.",
  "Du lịch": "Chia sẻ về một địa điểm du lịch bạn từng ghé thăm hoặc nơi bạn luôn mơ ước đặt chân đến.",
  "Sở thích cá nhân": "Bạn thích nghe nhạc, đọc sách, nấu ăn hay làm gì vào ngày cuối tuần thảnh thơi?",
  "Văn hóa & Nghệ thuật": "Bộ phim, cuốn sách hay nét văn hóa truyền thống nào khiến bạn ấn tượng sâu sắc nhất?",
  "Công nghệ": "Ứng dụng hoặc thiết bị công nghệ nào hỗ trợ bạn nhiều nhất trong học tập và cuộc sống?",
  "Giáo dục": "Bạn đã bén duyên với ngôn ngữ ký hiệu như thế nào và muốn đạt mục tiêu gì trong năm nay?",
};

const EXTRA_PROMPTS = [
  "Chia sẻ một điều khiến bạn cảm thấy vui vẻ và tràn đầy năng lượng ngày hôm nay.",
  "Món ăn yêu thích nhất của bạn là gì và bạn thích tự nấu hay đi ăn cùng bạn bè?",
  "Nếu có thể học thêm một kỹ năng mới trong 24 giờ tới, bạn sẽ chọn kỹ năng nào?",
  "Kể về một người bạn truyền cảm hứng sống tích cực cho bạn nhiều nhất.",
];

export default function TopicSelection({
  selected,
  onToggleTopic,
  onAddTopic,
  onSearch,
}) {
  const [custom, setCustom] = useState("");
  const [promptOffset, setPromptOffset] = useState(0);

  function addTopic(event) {
    event.preventDefault();

    const value = custom.trim();

    if (value) {
      onAddTopic(value);
    }

    setCustom("");
  }

  // Determine current icebreaker prompt based on selected topic or shuffled pool
  const currentPrompt = useMemo(() => {
    const matchingTopics = selected.filter((s) => TOPIC_SUGGESTIONS[s]);
    if (matchingTopics.length > 0) {
      const idx = promptOffset % matchingTopics.length;
      const topicName = matchingTopics[idx];
      return {
        topic: topicName,
        text: TOPIC_SUGGESTIONS[topicName],
      };
    }

    if (selected.length > 0) {
      return {
        topic: selected[0],
        text: `Cùng trao đổi về góc nhìn và trải nghiệm của bạn xoay quanh chủ đề "${selected[0]}".`,
      };
    }

    const idx = promptOffset % EXTRA_PROMPTS.length;
    return {
      topic: "Khởi động",
      text: EXTRA_PROMPTS[idx],
    };
  }, [selected, promptOffset]);

  const handleNextPrompt = () => {
    setPromptOffset((prev) => prev + 1);
  };

  return (
    <div className="vc-enter">
      <header className="vc-heading">
        <span className="vc-eyebrow">SIGNCONNECT · LUYỆN TẬP GIAO TIẾP 1-ON-1</span>
        <h1 className="text-h1">Tìm bạn cùng luyện tập</h1>
        <p>
          Chọn những chủ đề bạn muốn thực hành hôm nay. Hệ thống sẽ kết nối bạn với bạn học có cùng sở thích để cùng trao đổi và tiến bộ.
        </p>
      </header>

      <div className="vc-setup-grid">
        <section className="vc-panel vc-topic-panel">
          <div className="vc-section-title">
            <span className="vc-icon-tile">
              <MessageCircle size={20} />
            </span>
            <div className="vc-section-title-text">
              <h2 className="text-h2">Chủ đề bạn muốn thảo luận</h2>
              <p>Chọn một hoặc nhiều chủ đề khiến bạn thoải mái chia sẻ</p>
            </div>
            <span className="vc-count-pill">{selected.length} đã chọn</span>
          </div>

          <div className="vc-topics" role="group" aria-label="Danh sách chủ đề luyện tập">
            {topicOptions.map(({ label, icon }, index) => {
              const Icon = topicIcons[icon] || MessageCircle;
              const isSelected = selected.includes(label);

              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={isSelected}
                  className={`vc-topic ${isSelected ? "is-selected" : ""}`}
                  style={{ animationDelay: `${index * 55}ms` }}
                  onClick={() => onToggleTopic(label)}
                >
                  <Icon size={17} className="vc-topic-icon" />
                  <span className="vc-topic-text">{label}</span>
                  {isSelected && <Check size={14} className="vc-topic-check" />}
                </button>
              );
            })}

            {selected
              .filter((s) => !topicOptions.some((topic) => topic.label === s))
              .map((t, customIndex) => (
                <button
                  type="button"
                  className="vc-topic is-selected is-custom"
                  style={{ animationDelay: `${(topicOptions.length + customIndex) * 55}ms` }}
                  key={t}
                  onClick={() => onToggleTopic(t)}
                  title="Nhấn để bỏ chọn chủ đề này"
                >
                  <span className="vc-topic-text">{t}</span>
                  <X size={14} className="vc-topic-remove" />
                </button>
              ))}
          </div>

          <div className="vc-custom-wrapper">
            <label className="vc-custom-label" htmlFor="call-custom-topic">
              Hoặc thêm chủ đề bạn muốn:
            </label>
            <form className="vc-custom" onSubmit={addTopic}>
              <Plus size={16} className="vc-custom-icon" />
              <input
                id="call-custom-topic"
                placeholder="Ví dụ: Du lịch cuối tuần, ẩm thực miền Trung..."
                value={custom}
                maxLength={60}
                onChange={(e) => setCustom(e.target.value)}
              />
              <button
                type="submit"
                disabled={!custom.trim()}
                aria-label="Thêm chủ đề tùy chọn"
                className="vc-custom-submit"
              >
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Gợi ý mở đầu hội thoại - Khử khoảng trống & tạo cảm hứng */}
          <div className="vc-icebreaker-card">
            <div className="vc-icebreaker-top">
              <span className="vc-icebreaker-badge">
                <Sparkles size={13} className="vc-sparkle-amber" />
                <span>Gợi ý mở đầu · {currentPrompt.topic}</span>
              </span>
              <button
                type="button"
                className="vc-icebreaker-refresh"
                onClick={handleNextPrompt}
                title="Đổi gợi ý khác"
                aria-label="Đổi gợi ý khác"
              >
                <RefreshCw size={12} />
                <span>Đổi gợi ý</span>
              </button>
            </div>
            <p className="vc-icebreaker-quote">
              &ldquo;{currentPrompt.text}&rdquo;
            </p>
          </div>

          {/* Mẹo luyện tập tương tác */}
          <div className="vc-tips-row">
            <div className="vc-tip-item">
              <span className="vc-tip-icon">
                <Video size={14} />
              </span>
              <div className="vc-tip-content">
                <strong>Khung hình chuẩn</strong>
                <small>Giữ tay & mặt trong góc nhìn camera</small>
              </div>
            </div>

            <div className="vc-tip-item">
              <span className="vc-tip-icon">
                <Lightbulb size={14} />
              </span>
              <div className="vc-tip-content">
                <strong>Nhịp độ tự nhiên</strong>
                <small>Ra dấu từ tốn, cử chỉ rõ ràng</small>
              </div>
            </div>

            <div className="vc-tip-item">
              <span className="vc-tip-icon">
                <Smile size={14} />
              </span>
              <div className="vc-tip-content">
                <strong>Cởi mở & kiên nhẫn</strong>
                <small>Nụ cười giúp kết nối thoải mái hơn</small>
              </div>
            </div>
          </div>

          {/* Ghi chú tích cực & XP Bonus */}
          <div className="vc-soft-note">
            <div className="vc-soft-note-left">
              <Smile size={16} />
              <span>Không cần hoàn hảo. Mỗi cuộc trò chuyện là một cơ hội tiến bộ.</span>
            </div>
            <span className="vc-xp-tag">
              <Award size={13} /> +50 XP
            </span>
          </div>
        </section>

        <SmartMatchCard canSearch={selected.length > 0} onSearch={onSearch} />
      </div>

      <div className="vc-bottom-steps">
        {practiceSteps.map((t, i) => (
          <span key={t} className="vc-step-chip">
            <b>0{i + 1}</b>
            <span>{t}</span>
            {i < practiceSteps.length - 1 && <ArrowRight size={14} className="vc-step-arrow" />}
          </span>
        ))}
      </div>
    </div>
  );
}
