import { Video, Heart, Shield, Sparkles, MessageSquare, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollRevealGrid, ScrollRevealCard } from "./ScrollRevealGrid";

const COMPARISONS = [
  {
    feature: "Khung hình & Tỉ lệ quay",
    conventional: "Tập trung vào khuôn mặt (Headshot crop), bị khuất tay khi cử động",
    signmate: "Tối ưu góc quay bán thân (Upper-body), ôm trọn nét mặt và 2 bàn tay",
  },
  {
    feature: "Chất lượng khi chuyển động nhanh",
    conventional: "Thuật toán nén âm thanh làm mờ/nhòe vệt ngón tay chuyển động nhanh",
    signmate: "Ưu tiên độ nét khung hình và số khung hình/giây (High Frame Rate) cho tay",
  },
  {
    feature: "Tìm bạn đồng hành luyện tập",
    conventional: "Không có tính năng ghép cặp, chỉ gọi được người quen qua link phòng",
    signmate: "Ghép cặp thông minh theo cấp độ (A1, A2, B1) và sở thích chủ đề luyện tập",
  },
  {
    feature: "Công cụ hỗ trợ giao tiếp",
    conventional: "Chỉ có khung chat văn bản rời rạc, không có hỗ trợ ngôn ngữ ký hiệu",
    signmate: "Gợi ý ký hiệu theo chủ đề và phụ đề song song hỗ trợ phiên dịch trực quan",
  },
];

export default function ConnectShowcase() {
  const navigate = useNavigate();

  return (
    <section className="connect-section scroll-reveal" id="connect">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="section-eyebrow">
            <span className="eyebrow-pill eyebrow-pill--teal">
              Cộng đồng & Kết nối Người thật
            </span>
          </div>
          <h2 className="section-title">
            SignConnect — Nền tảng gọi video
            <br className="title-break" />
            <span className="text-gradient-teal">thiết kế riêng cho Ngôn ngữ Ký hiệu</span>
          </h2>
          <p className="section-description">
            Không chỉ là gọi video thông thường. SignConnect được kỹ thuật hóa để đáp ứng những đòi hỏi
            khắt khe nhất của giao tiếp thị giác: chuyển động ngón tay sắc nét, không giật lag và môi trường kết nối hòa nhập.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="comparison-wrapper">
          <div className="comparison-table-card">
            <div className="table-header-row">
              <div className="th-cell th-cell--feature">Tính năng</div>
              <div className="th-cell th-cell--conventional">
                <span>Ứng dụng thông thường</span>
                <span className="th-sub">(Zoom / Meet / Zalo)</span>
              </div>
              <div className="th-cell th-cell--signmate">
                <span className="signmate-badge">
                  <Sparkles size={12} aria-hidden="true" /> Độc quyền SignMate
                </span>
                <span className="signmate-label">SignConnect P2P</span>
              </div>
            </div>

            <div className="table-body">
              {COMPARISONS.map((row) => (
                <div className="table-body-row" key={row.feature}>
                  <div className="td-cell td-cell--feature">
                    <strong>{row.feature}</strong>
                  </div>
                  <div className="td-cell td-cell--conventional">
                    <span className="status-icon status-icon--cross">
                      <X size={14} aria-hidden="true" />
                    </span>
                    <span>{row.conventional}</span>
                  </div>
                  <div className="td-cell td-cell--signmate">
                    <span className="status-icon status-icon--check">
                      <Check size={14} aria-hidden="true" />
                    </span>
                    <strong>{row.signmate}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Community Values Cards - Animated Stagger Fade-Up */}
        <ScrollRevealGrid
          className="community-values-grid"
          staggerDelay={0.12}
          viewportAmount={0.2}
        >
          <ScrollRevealCard
            className="value-card"
            yOffset={35}
            duration={0.6}
            hoverY={-2}
          >
            <div className="value-icon-box value-icon--teal">
              <Heart size={20} aria-hidden="true" />
            </div>
            <h4 className="value-title">Môi trường hòa nhập & Tôn trọng</h4>
            <p className="value-desc">
              SignMate kết nối người nghe bình thường và cộng đồng người khiếm thính trên tinh thần bình đẳng,
              thấu hiểu và chia sẻ kiến thức ngôn ngữ tự nhiên.
            </p>
          </ScrollRevealCard>

          <ScrollRevealCard
            className="value-card"
            yOffset={35}
            duration={0.6}
            hoverY={-2}
          >
            <div className="value-icon-box value-icon--purple">
              <Shield size={20} aria-hidden="true" />
            </div>
            <h4 className="value-title">An toàn & Kiểm soát kết nối</h4>
            <p className="value-desc">
              Chỉ ghép nối với những người dùng đã xác thực, có đánh giá tích cực và cùng mục tiêu học tập.
              Dễ dàng báo cáo hành vi không phù hợp để bảo vệ cộng đồng văn minh.
            </p>
          </ScrollRevealCard>

          <ScrollRevealCard
            className="value-card"
            yOffset={35}
            duration={0.6}
            hoverY={-2}
          >
            <div className="value-icon-box value-icon--coral">
              <MessageSquare size={20} aria-hidden="true" />
            </div>
            <h4 className="value-title">Học cùng bạn đồng hành</h4>
            <p className="value-desc">
              Luyện tập phản xạ hai chiều giúp bạn nhớ lâu hơn gấp 4 lần so với xem video thụ động một mình.
              Mỗi buổi gọi là một bước tiến vượt bậc trong sự tự tin.
            </p>
          </ScrollRevealCard>
        </ScrollRevealGrid>

        {/* CTA Mini banner */}
        <div className="connect-cta-bar">
          <div className="connect-cta-text">
            <h4>Bạn muốn tìm bạn cùng luyện tập ngôn ngữ ký hiệu tối nay?</h4>
            <p>Hàng trăm bạn học và người khiếm thính đang sẵn sàng kết nối cùng bạn.</p>
          </div>
          <button
            type="button"
            className="btn-connect-action"
            onClick={() => navigate("/video")}
          >
            <Video size={16} aria-hidden="true" />
            <span>Thử SignConnect ngay</span>
          </button>
        </div>
      </div>
    </section>
  );
}
