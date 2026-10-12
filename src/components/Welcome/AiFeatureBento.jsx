import { useState } from "react";
import { Cpu, ShieldCheck, Flame, Zap, Check, Eye } from "lucide-react";
import { ScrollRevealGrid, ScrollRevealCard } from "./ScrollRevealGrid";

const LANDMARK_GROUPS = [
  { name: "Cổ tay & Gốc bàn tay", count: "1 mốc (Điểm 0)", color: "#1D9E75" },
  { name: "Ngón tay cái (Thumb)", count: "4 mốc (Điểm 1 - 4)", color: "#5DCAA5" },
  { name: "Ngón trỏ (Index)", count: "4 mốc (Điểm 5 - 8)", color: "#7F77DD" },
  { name: "Ngón giữa (Middle)", count: "4 mốc (Điểm 9 - 12)", color: "#AFA9EC" },
  { name: "Ngón áp út (Ring)", count: "4 mốc (Điểm 13 - 16)", color: "#D85A30" },
  { name: "Ngón út (Pinky)", count: "4 mốc (Điểm 17 - 20)", color: "#F0997B" },
];

export default function AiFeatureBento() {
  const [activeGroup, setActiveGroup] = useState(0);

  return (
    <section className="bento-section scroll-reveal" id="ai-tech">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="section-eyebrow">
            <span className="eyebrow-pill eyebrow-pill--purple">
              Đột phá công nghệ Computer Vision
            </span>
          </div>
          <h2 className="section-title">
            Công nghệ thị giác máy tính
            <br className="title-break" />
            <span className="text-gradient-purple">chấm điểm cử chỉ chuẩn xác</span>
          </h2>
          <p className="section-description">
            SignMate ứng dụng mô hình MediaPipe Hands và thuật toán Dynamic Time Warping (DTW)
            để giải bài toán thẩm định độ chính xác ngôn ngữ ký hiệu ngay trên trình duyệt web.
          </p>
        </div>

        {/* Bento Grid - Animated Stagger Fade-Up */}
        <ScrollRevealGrid
          className="bento-grid"
          staggerDelay={0.14}
          viewportAmount={0.2}
        >
          {/* Bento Card 1 (Large - 2 cols): 21 Hand Landmarks & DTW Engine */}
          <ScrollRevealCard
            className="bento-card bento-card--large bento-card--ai-engine"
            yOffset={35}
            duration={0.6}
            hoverY={-4}
          >
            <div className="bento-badge">
              <Cpu size={15} aria-hidden="true" />
              <span>Cốt lõi AI MediaPipe & DTW</span>
            </div>

            <div className="bento-content-split">
              <div className="bento-text">
                <h3 className="bento-title">
                  Phân tích 21 điểm mốc khớp tay trong không gian 3D
                </h3>
                <p className="bento-desc">
                  Mỗi cử chỉ ký hiệu bao gồm tọa độ không gian (x, y, z) của 21 khớp xương bàn tay.
                  Hệ thống trích xuất vị trí các đốt ngón tay theo thời gian thực và áp dụng thuật toán
                  so khớp chuỗi thời gian DTW (Dynamic Time Warping) để đánh giá độ chính xác so với động tác mẫu của chuyên gia.
                </p>

                {/* Interactive group selector */}
                <div className="landmark-group-selector">
                  <span className="selector-label">Chi tiết cấu trúc 21 điểm mốc:</span>
                  <div className="selector-chips">
                    {LANDMARK_GROUPS.map((grp, idx) => (
                      <button
                        key={grp.name}
                        type="button"
                        className={`chip-landmark ${activeGroup === idx ? "chip-landmark--active" : ""}`}
                        onClick={() => setActiveGroup(idx)}
                      >
                        <span
                          className="chip-color-dot"
                          style={{ backgroundColor: grp.color }}
                        />
                        <span>{grp.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="group-detail-callout">
                    <strong>{LANDMARK_GROUPS[activeGroup].name}:</strong>{" "}
                    <span>{LANDMARK_GROUPS[activeGroup].count} được giám sát tọa độ liên tục.</span>
                  </div>
                </div>
              </div>

              {/* Graphic Side */}
              <div className="bento-visual">
                <div className="hud-metric-card">
                  <div className="metric-row">
                    <span className="metric-name">MediaPipe Landmarks</span>
                    <span className="metric-val text-teal">21 Điểm</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Thuật toán khớp thời gian</span>
                    <span className="metric-val text-purple">DTW Multi-dim</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Độ chính xác trung bình</span>
                    <span className="metric-val text-teal">96.8%</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Phản hồi độ trễ</span>
                    <span className="metric-val text-purple">&lt; 45ms</span>
                  </div>
                </div>

                <div className="hud-status-chip">
                  <span className="pulse-dot" />
                  <span>Xử lý luồng video 30 FPS mượt mà</span>
                </div>
              </div>
            </div>
          </ScrollRevealCard>

          {/* Bento Card 2: Client-side Privacy First */}
          <ScrollRevealCard
            className="bento-card bento-card--privacy"
            yOffset={35}
            duration={0.6}
            hoverY={-4}
          >
            <div className="bento-badge bento-badge--teal">
              <ShieldCheck size={15} aria-hidden="true" />
              <span>Quyền riêng tư tuyệt đối</span>
            </div>
            <h3 className="bento-title">Xử lý 100% trên thiết bị người dùng</h3>
            <p className="bento-desc">
              Camera chỉ được dùng để tính toán tọa độ vector khớp tay cục bộ trên trình duyệt (client-side).
              Hình ảnh video của bạn không bao giờ được ghi lại hay gửi lên máy chủ lưu trữ.
            </p>
            <div className="privacy-feature-list">
              <div className="privacy-item">
                <Check size={16} className="text-teal" />
                <span>Không lưu video camera cá nhân</span>
              </div>
              <div className="privacy-item">
                <Check size={16} className="text-teal" />
                <span>Mã hóa WebRTC P2P cuộc gọi trực tiếp</span>
              </div>
              <div className="privacy-item">
                <Check size={16} className="text-teal" />
                <span>Tuân thủ bảo vệ dữ liệu nhạy cảm</span>
              </div>
            </div>
          </ScrollRevealCard>

          {/* Bento Card 3: Gamification & Thói quen */}
          <ScrollRevealCard
            className="bento-card bento-card--streak"
            yOffset={35}
            duration={0.6}
            hoverY={-4}
          >
            <div className="bento-badge bento-badge--coral">
              <Flame size={15} aria-hidden="true" />
              <span>Động lực học tập</span>
            </div>
            <h3 className="bento-title">Duy trì Streak & Bảng xếp hạng</h3>
            <p className="bento-desc">
              Biến việc học ngôn ngữ ký hiệu thành niềm vui mỗi ngày với chuỗi ngày liên tục (Daily Streak),
              điểm tích lũy kinh nghiệm (XP) và thử thách tuần cùng cộng đồng.
            </p>
            <div className="streak-visual-mock">
              <div className="streak-flame-circle">
                <Flame size={28} className="text-coral" />
                <strong>7 Ngày</strong>
              </div>
              <div className="streak-stats-row">
                <div className="stat-sub">
                  <span>Điểm thưởng</span>
                  <strong>+350 XP</strong>
                </div>
                <div className="stat-sub">
                  <span>Huy hiệu</span>
                  <strong>Tập trung 🏆</strong>
                </div>
              </div>
            </div>
          </ScrollRevealCard>

          {/* Bento Card 4: Tối ưu phần cứng & Trình duyệt */}
          <ScrollRevealCard
            className="bento-card bento-card--performance"
            yOffset={35}
            duration={0.6}
            hoverY={-4}
          >
            <div className="bento-badge bento-badge--purple">
              <Zap size={15} aria-hidden="true" />
              <span>Hiệu năng mượt mà</span>
            </div>
            <h3 className="bento-title">Tối ưu cho mọi thiết bị thông thường</h3>
            <p className="bento-desc">
              Không cần máy tính đồ họa chuyên dụng hay camera hồng ngoại đắt đỏ.
              Chỉ cần một chiếc máy tính xách tay hoặc điện thoại với camera thông thường là đủ để bắt đầu.
            </p>
            <div className="performance-chips-row">
              <div className="perf-chip">
                <Eye size={14} className="text-purple" />
                <span>Webcam thông thường</span>
              </div>
              <div className="perf-chip">
                <Zap size={14} className="text-teal" />
                <span>Chrome, Edge, Safari</span>
              </div>
            </div>
          </ScrollRevealCard>
        </ScrollRevealGrid>
      </div>
    </section>
  );
}
