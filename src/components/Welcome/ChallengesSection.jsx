import { AlertCircle, EyeOff, MessageSquareOff, VideoOff, ArrowRight } from "lucide-react";
import { ScrollRevealGrid, ScrollRevealCard } from "./ScrollRevealGrid";

const CHALLENGES_DATA = [
  {
    icon: AlertCircle,
    tag: "Hạ tầng số",
    tone: "coral",
    title: "Khoảng trống công nghệ chuyên biệt",
    desc: "Khoảng 2,5 triệu người Việt Nam sống với tình trạng khiếm thính. Hầu hết các ứng dụng giao tiếp số phổ biến hiện nay chỉ tối ưu cho âm thanh và giọng nói, hoàn toàn bỏ quên trải nghiệm thị giác của người giao tiếp ký hiệu.",
    stat: "2.5M+",
    statLabel: "Người chịu ảnh hưởng tại VN",
  },
  {
    icon: MessageSquareOff,
    tag: "Phương pháp học",
    tone: "purple",
    title: "Thiếu môi trường thực hành phản xạ",
    desc: "Phương pháp học truyền thống chủ yếu là học thụ động qua hình ảnh tĩnh trong từ điển hoặc video một chiều. Người học thiếu hoàn toàn môi trường đối thoại hai chiều với người thật để xây dựng phản xạ tự nhiên.",
    stat: "85%",
    statLabel: "Bỏ cuộc vì thiếu bạn luyện tập",
  },
  {
    icon: EyeOff,
    tag: "Độ chính xác",
    tone: "teal",
    title: "Thiếu phản hồi AI tức thì",
    desc: "Cử chỉ ký hiệu đòi hỏi độ chính xác từng góc mở ngón tay và vị trí tương đối với khuôn mặt. Khi tự học một mình, người học không biết mình làm sai ở đâu, dẫn đến hình thành thói quen sai lặp lại.",
    stat: "21 Khớp",
    statLabel: "Cần giám sát chuyển động",
  },
  {
    icon: VideoOff,
    tag: "Nền tảng gọi",
    tone: "slate",
    title: "Hạn chế của Video Call thông thường",
    desc: "Zoom, Google Meet hay Zalo có thuật toán nén video khử tạp âm nhưng làm nhòe chuyển động tay nhanh. Bố cục không tối ưu góc nhìn bán thân và không có cơ chế ghép bạn đồng hành cùng trình độ.",
    stat: "< 15 FPS",
    statLabel: "Bị nhòe khi tay chuyển động",
  },
];

export default function ChallengesSection({ onExploreClick }) {
  return (
    <section className="challenges-section scroll-reveal" id="challenges">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="section-eyebrow">
            <span className="eyebrow-pill eyebrow-pill--coral">
              Thực trạng & Thách thức
            </span>
          </div>
          <h2 className="section-title">
            Tại sao việc học ngôn ngữ ký hiệu
            <br className="title-break" />
            <span className="text-gradient-coral">lại nhiều rào cản đến vậy?</span>
          </h2>
          <p className="section-description">
            Khoảng cách giữa tài liệu thụ động và nhu cầu giao tiếp thực tế với người thật
            đang là rào cản lớn nhất đối với người học ngôn ngữ ký hiệu tại Việt Nam.
          </p>
        </div>

        {/* 4 Cards Grid - Animated Stagger Fade-Up */}
        <ScrollRevealGrid
          className="challenges-grid"
          staggerDelay={0.12}
          viewportAmount={0.2}
        >
          {CHALLENGES_DATA.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollRevealCard
                className={`challenge-card challenge-card--${item.tone}`}
                key={item.title}
                tabIndex={0}
                yOffset={35}
                duration={0.6}
                hoverY={-4}
              >
                <div className="challenge-card-top">
                  <div className={`challenge-icon-box challenge-icon-box--${item.tone}`}>
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <span className={`challenge-tag challenge-tag--${item.tone}`}>
                    {item.tag}
                  </span>
                </div>

                <h3 className="challenge-card-title">{item.title}</h3>
                <p className="challenge-card-desc">{item.desc}</p>

                <div className="challenge-card-bottom">
                  <div className="challenge-stat-badge">
                    <span className="stat-number">{item.stat}</span>
                    <span className="stat-label">{item.statLabel}</span>
                  </div>
                  <span className="challenge-card-index">0{idx + 1}</span>
                </div>
              </ScrollRevealCard>
            );
          })}
        </ScrollRevealGrid>

        {/* Resolution Banner Bridge */}
        <div className="challenge-resolution-banner">
          <div className="banner-content">
            <h3 className="banner-title">
              SignMate được tạo ra để giải quyết triệt để 4 rào cản này.
            </h3>
            <p className="banner-subtitle">
              Kết hợp lộ trình bài bản, AI Computer Vision chấm điểm thời gian thực và nền tảng video call P2P hòa nhập.
            </p>
          </div>
          <button
            type="button"
            className="btn-resolution"
            onClick={onExploreClick}
            aria-label="Xem giải pháp SignMate"
          >
            <span>Khám phá giải pháp</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
