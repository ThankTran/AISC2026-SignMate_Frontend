import { Sparkles, Users, Award, BookOpen } from "lucide-react";
import { ScrollRevealGrid, ScrollRevealCard } from "./ScrollRevealGrid";

const STATS_DATA = [
  {
    number: "21",
    unit: "Điểm mốc",
    label: "Khớp xương bàn tay 3D",
    desc: "Được AI theo dõi tọa độ liên tục theo thời gian thực",
    icon: Sparkles,
  },
  {
    number: "33",
    unit: "Ký hiệu",
    label: "Bảng chữ cái Fingerspelling",
    desc: "Chuẩn hóa theo Ngôn ngữ Ký hiệu Việt Nam (VSL)",
    icon: BookOpen,
  },
  {
    number: "1-1",
    unit: "Kết nối",
    label: "Ghép cặp luyện tập P2P",
    desc: "Trò chuyện phản xạ trực tiếp qua video call bảo mật",
    icon: Users,
  },
  {
    number: "100%",
    unit: "Tiếp cận",
    label: "Mở cho cộng đồng",
    desc: "Hướng tới bình đẳng và xóa nhòa khoảng cách giao tiếp",
    icon: Award,
  },
];

export default function CommunityStats() {
  return (
    <section className="stats-section scroll-reveal" aria-label="Các thông số kỹ thuật cốt lõi">
      <div className="section-container">
        <ScrollRevealGrid
          className="stats-grid"
          staggerDelay={0.1}
          viewportAmount={0.2}
        >
          {STATS_DATA.map((item) => {
            const Icon = item.icon;
            return (
              <ScrollRevealCard
                className="stat-card"
                key={item.label}
                yOffset={30}
                duration={0.6}
                hoverY={-2}
              >
                <div className="stat-card-top">
                  <div className="stat-main-number">
                    <span className="num">{item.number}</span>
                    <span className="unit">{item.unit}</span>
                  </div>
                  <div className="stat-icon-wrapper" aria-hidden="true">
                    <Icon size={18} />
                  </div>
                </div>
                <h4 className="stat-label-title">{item.label}</h4>
                <p className="stat-sub-desc">{item.desc}</p>
              </ScrollRevealCard>
            );
          })}
        </ScrollRevealGrid>
      </div>
    </section>
  );
}
