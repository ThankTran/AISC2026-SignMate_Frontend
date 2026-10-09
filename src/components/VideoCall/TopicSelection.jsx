import { useState } from "react";
import {
  ArrowRight,
  Check,
  Sparkles,
  MessageCircle,
  Plus,
  X,
  Leaf,
  Heart,
  Briefcase,
  Globe,
  Coffee,
  Palette,
  Cpu,
  GraduationCap,
} from "lucide-react";
import { topicOptions, conversationPrompts, practiceSteps } from "../../mockdata/videoCall/topics";
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

export default function TopicSelection({
  selected,
  prompt,
  onToggleTopic,
  onAddTopic,
  onPromptChange,
  onSearch,
}) {
  const [custom, setCustom] = useState("");

  function addTopic(event) {
    event.preventDefault();

    const value = custom.trim();

    if (value) {
      onAddTopic(value);
    }

    setCustom("");
  }

  return (
    <div className="vc-enter">
      <header className="vc-heading">
        <span className="vc-eyebrow">MỖI CUỘC TRÒ CHUYỆN, MỘT KẾT NỐI MỚI</span>
        <h1 className="text-h1">
          Tìm bạn luyện tập<span className="vc-heading-dot">.</span>
        </h1>
        <p>
          Kết nối bằng đôi tay. Thấu hiểu bằng trái tim.
          <br />
          Tìm người đồng hành cùng bạn tự tin hơn với ngôn ngữ ký hiệu.
        </p>
      </header>
      <div className="vc-setup-grid">
        <section className="vc-panel vc-topic-panel">
          <div className="vc-section-title">
            <span className="vc-icon-tile">
              <MessageCircle size={21} />
            </span>
            <div>
              <h2 className="text-h2">Hôm nay, bạn muốn nói về…</h2>
              <p>Chọn những chủ đề khiến bạn hứng thú</p>
            </div>
            <span className="vc-count">{selected.length} đã chọn</span>
          </div>
          <div className="vc-topics">
            {topicOptions.map(({ label, icon }) => {
              const Icon = topicIcons[icon];

              return (
                <button
                  key={label}
                  aria-pressed={selected.includes(label)}
                  className={`vc-topic ${selected.includes(label) ? "is-selected" : ""}`}
                  onClick={() => onToggleTopic(label)}
                >
                  <Icon size={18} />
                  {label}
                  {selected.includes(label) && <Check size={15} />}
                </button>
              );
            })}
            {selected
              .filter((s) => !topicOptions.some((topic) => topic.label === s))
              .map((t) => (
                <button className="vc-topic is-selected" key={t} onClick={() => onToggleTopic(t)}>
                  {t}
                  <X size={14} />
                </button>
              ))}
          </div>
          <label className="ui-input-label" htmlFor="call-custom-topic">Chủ đề khác</label>
          <form className="vc-custom" onSubmit={addTopic}>
            <Plus size={17} />
            <input
              id="call-custom-topic"
              placeholder="Ví dụ: Du lịch cuối tuần"
              value={custom}
              maxLength={60}
              onChange={(e) => setCustom(e.target.value)}
            />
            <button disabled={!custom.trim()} aria-label="Thêm chủ đề">
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="vc-suggestions">
            <h3 className="text-h3">
              <Sparkles size={16} /> Một chút cảm hứng để bắt đầu
            </h3>
            {conversationPrompts.map((t) => (
              <button
                key={t}
                className={prompt === t ? "is-picked" : ""}
                onClick={() => onPromptChange(t)}
              >
                <span>“{t}”</span>
                {prompt === t ? <Check size={18} /> : <Plus size={18} />}
              </button>
            ))}
          </div>
          <div className="vc-soft-note">
            <Leaf size={15} /> Không cần hoàn hảo. Chỉ cần sẵn sàng chia sẻ.
          </div>
        </section>
        <SmartMatchCard canSearch={selected.length > 0} onSearch={onSearch} />
      </div>
      <div className="vc-bottom-steps">
        {practiceSteps.map((t, i) => (
          <span key={t}>
            <b>0{i + 1}</b>
            {t}
            {i < 2 && <ArrowRight size={15} />}
          </span>
        ))}
      </div>
    </div>
  );
}
