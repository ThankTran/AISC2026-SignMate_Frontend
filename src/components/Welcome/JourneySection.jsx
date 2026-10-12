import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  BookOpen,
  Camera,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Play,
  Award,
} from "lucide-react";
import { ScrollRevealGrid, ScrollRevealCard } from "./ScrollRevealGrid";

const JOURNEY_STEPS = [
  {
    id: "discover",
    stepNumber: "01",
    tag: "Khám phá (Discover)",
    title: "Thư viện Ký hiệu VSL có cấu trúc",
    icon: Compass,
    tone: "teal",
    headline: "Tiếp cận kho dữ liệu ký hiệu chuẩn hóa từ chữ cái đến cụm từ",
    desc: "Bắt đầu bằng việc làm quen với bảng chữ cái ngón tay (Fingerspelling), số đếm và hệ thống từ vựng giao tiếp thực tế. Mỗi ký hiệu đều có video chuẩn do người khiếm thính thực hiện ở nhiều góc quay.",
    bullets: [
      "Bảng chữ cái ngón tay đầy đủ từ A đến Y chuẩn VSL",
      "Video mẫu trực quan, góc nhìn ngang tầm mắt và góc nhìn người thực hiện",
      "Phân loại theo chủ đề: Gia đình, Chào hỏi, Số đếm, Cảm xúc, Y tế",
      "Tra cứu nhanh chóng, có phiên âm cử chỉ chi tiết",
    ],
    previewType: "library",
    ctaText: "Xem thư viện bài học",
    ctaLink: "/learning-path",
  },
  {
    id: "learn",
    stepNumber: "02",
    tag: "Học tập (Learn)",
    title: "Lộ trình tương tác theo cấp độ A1 - B2",
    icon: BookOpen,
    tone: "purple",
    headline: "Học có hệ thống theo chương, không còn tự bơi giữa tài liệu rời rạc",
    desc: "Lộ trình học cá nhân hóa được thiết kế theo phương pháp micro-learning (5-10 phút mỗi ngày). Bạn nắm vững lý thuyết vị trí lòng bàn tay, hướng chuyển động và sắc thái biểu cảm khuôn mặt.",
    bullets: [
      "Thiết kế theo chuẩn Khung năng lực VSL (A1 Khởi đầu → B2 Tự tin)",
      "Giải thích chi tiết giải phẫu bàn tay và lưu ý sai sót phổ biến",
      "Quiz trắc nghiệm nhận diện ký hiệu ngay sau mỗi bài học",
      "Hệ thống lưu trữ tiến độ, mở khóa bài học theo từng mốc",
    ],
    previewType: "curriculum",
    ctaText: "Khám phá lộ trình học",
    ctaLink: "/learning-path",
  },
  {
    id: "practice",
    stepNumber: "03",
    tag: "Luyện tập (Practice)",
    title: "AI phân tích 21 điểm mốc bàn tay",
    icon: Camera,
    tone: "coral",
    headline: "Camera cá nhân biến thành trợ lý chấm điểm tư thế theo thời gian thực",
    desc: "Module AI ứng dụng MediaPipe trích xuất 21 điểm mốc khớp bàn tay trong không gian 3D, kết hợp thuật toán so khớp chuỗi thời gian DTW để đối chiếu với video chuẩn và đưa ra lời khuyên sửa sai ngay lập tức.",
    bullets: [
      "Trích xuất 21 điểm mốc khớp tay thời gian thực với độ trễ < 50ms",
      "So sánh quỹ đạo chuyển động bằng thuật toán Dynamic Time Warping",
      "Chỉ rõ ngón tay nào chưa mở đủ góc hoặc sai hướng lòng bàn tay",
      "Bảo mật quyền riêng tư: Xử lý trực tiếp trên trình duyệt, không lưu video",
    ],
    previewType: "ai-hud",
    ctaText: "Trải nghiệm AI Practice",
    ctaLink: "/practice-ai",
  },
  {
    id: "connect",
    stepNumber: "04",
    tag: "Kết nối (Connect)",
    title: "SignConnect: Gọi Video 1-1 với bạn học",
    icon: Users,
    tone: "teal",
    headline: "Bước ra khỏi màn hình học một mình để trò chuyện với người thật",
    desc: "Đỉnh cao của việc học ngôn ngữ là giao tiếp hai chiều. SignConnect giúp bạn ghép cặp luyện tập P2P với bạn học cùng trình độ hoặc kết nối cùng người khiếm thính trong môi trường an toàn và hòa nhập.",
    bullets: [
      "Video call WebRTC P2P tối ưu đặc biệt cho cử chỉ tay và biểu cảm",
      "Thuật toán ghép cặp thông minh theo chủ đề quan tâm và khung giờ rảnh",
      "Khung chat văn bản song song hỗ trợ giải thích nghĩa khi cần",
      "Cộng đồng hỗ trợ tích cực, cùng thi đua bảng xếp hạng hàng tuần",
    ],
    previewType: "video-p2p",
    ctaText: "Tham gia SignConnect",
    ctaLink: "/video",
  },
];

export default function JourneySection() {
  const [activeStepId, setActiveStepId] = useState("discover");
  const navigate = useNavigate();

  const currentStep = JOURNEY_STEPS.find((s) => s.id === activeStepId) || JOURNEY_STEPS[0];

  return (
    <section className="journey-section scroll-reveal" id="journey">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="section-eyebrow">
            <span className="eyebrow-pill eyebrow-pill--teal">
              Trải nghiệm người học hoàn chỉnh
            </span>
          </div>
          <h2 className="section-title">
            Hành trình 4 bước từ ký hiệu đầu tiên
            <br className="title-break" />
            <span className="text-gradient-teal">đến tự tin giao tiếp thực tế</span>
          </h2>
          <p className="section-description">
            SignMate đồng hành cùng bạn xuyên suốt từ nhận diện chữ cái, luyện tập cử chỉ cùng AI
            cho tới cuộc trò chuyện 1-1 tràn đầy cảm xúc với con người thật.
          </p>
        </div>

        {/* Step Navigation Tabs - Animated Stagger Fade-Up */}
        <ScrollRevealGrid
          className="journey-stepper"
          role="tablist"
          aria-label="Các bước trong lộ trình học"
          staggerDelay={0.1}
          viewportAmount={0.2}
        >
          {JOURNEY_STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === activeStepId;
            return (
              <ScrollRevealCard
                key={step.id}
                as="button"
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`journey-step-tab journey-step-tab--${step.tone} ${
                  isActive ? "journey-step-tab--active" : ""
                }`}
                onClick={() => setActiveStepId(step.id)}
                yOffset={35}
                duration={0.6}
                hoverY={-2}
              >
                <div className="step-number-badge">
                  <span>{step.stepNumber}</span>
                </div>
                <div className="step-tab-content">
                  <div className="step-tab-header">
                    <Icon size={16} aria-hidden="true" />
                    <span className="step-tab-title">{step.title}</span>
                  </div>
                  <span className="step-tab-tag">{step.tag}</span>
                </div>
              </ScrollRevealCard>
            );
          })}
        </ScrollRevealGrid>

        {/* Active Step Showcase Card */}
        <div className={`journey-showcase-card journey-showcase-card--${currentStep.tone}`}>
          {/* Left Column: Narrative & Bullets */}
          <div className="journey-showcase-info">
            <div className="showcase-step-tag">
              <span className={`tag-pill tag-pill--${currentStep.tone}`}>
                Bước {currentStep.stepNumber} • {currentStep.tag}
              </span>
            </div>

            <h3 className="showcase-headline">{currentStep.headline}</h3>
            <p className="showcase-desc">{currentStep.desc}</p>

            <ul className="showcase-bullets">
              {currentStep.bullets.map((bullet) => (
                <li key={bullet} className="bullet-item">
                  <CheckCircle size={18} className={`bullet-icon text-${currentStep.tone}`} />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="showcase-action">
              <button
                type="button"
                className={`btn-showcase btn-showcase--${currentStep.tone}`}
                onClick={() => navigate(currentStep.ctaLink)}
              >
                <span>{currentStep.ctaText}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Right Column: Visual Product Representation */}
          <div className="journey-showcase-visual">
            {currentStep.previewType === "library" && (
              <div className="visual-preview-box visual-preview--library">
                <div className="library-preview-header">
                  <span className="preview-label">Bảng chữ cái ngón tay (Fingerspelling)</span>
                  <span className="preview-badge">33 Ký tự chuẩn</span>
                </div>
                <div className="alphabet-chips-grid">
                  {["A", "B", "C", "D", "Đ", "E", "G", "H", "I", "K", "L", "M"].map(
                    (char, i) => (
                      <div
                        key={char}
                        className={`alphabet-chip ${i === 0 ? "alphabet-chip--highlight" : ""}`}
                      >
                        <span className="chip-char">{char}</span>
                        <span className="chip-sub">Ký hiệu {i + 1}</span>
                      </div>
                    )
                  )}
                </div>
                <div className="library-sample-card">
                  <div className="sample-card-badge">
                    <Play size={13} fill="currentColor" />
                    <span>Video thực hành: Chữ "A" (Nắm đấm, ngón cái tựa cạnh)</span>
                  </div>
                  <span className="sample-card-level">Cơ bản</span>
                </div>
              </div>
            )}

            {currentStep.previewType === "curriculum" && (
              <div className="visual-preview-box visual-preview--curriculum">
                <div className="curriculum-track-header">
                  <span className="track-title">Lộ trình: Cấp độ A1 Khởi đầu</span>
                  <span className="track-percent">3/8 Bài hoàn thành</span>
                </div>
                <div className="curriculum-timeline">
                  <div className="timeline-item timeline-item--done">
                    <span className="timeline-marker">✓</span>
                    <div className="timeline-detail">
                      <strong>Chương 1: Bảng chữ cái ngón tay</strong>
                      <span>Đã hoàn thành • 100 Điểm XP</span>
                    </div>
                  </div>
                  <div className="timeline-item timeline-item--active">
                    <span className="timeline-marker timeline-marker--pulse">▶</span>
                    <div className="timeline-detail">
                      <strong>Chương 2: Chào hỏi & Làm quen</strong>
                      <span>Đang học • Video mẫu & AI Practice</span>
                    </div>
                  </div>
                  <div className="timeline-item timeline-item--locked">
                    <span className="timeline-marker">🔒</span>
                    <div className="timeline-detail">
                      <strong>Chương 3: Số đếm & Thời gian</strong>
                      <span>Mở khóa sau khi hoàn thành Quiz 2</span>
                    </div>
                  </div>
                </div>
                <div className="curriculum-reward-pill">
                  <Award size={15} className="text-purple" />
                  <span>Huy hiệu đạt được: "Người khởi đầu chăm chỉ"</span>
                </div>
              </div>
            )}

            {currentStep.previewType === "ai-hud" && (
              <div className="visual-preview-box visual-preview--ai-hud">
                <div className="ai-hud-header">
                  <span className="hud-status">● Live Stream (Webcam)</span>
                  <span className="hud-metric">DTW Accuracy: 97.8%</span>
                </div>
                <div className="ai-hud-wireframe">
                  <div className="wireframe-hand-glow" />
                  <div className="wireframe-joint joint--wrist" />
                  <div className="wireframe-joint joint--thumb" />
                  <div className="wireframe-joint joint--index" />
                  <div className="wireframe-joint joint--middle" />
                  <div className="wireframe-joint joint--ring" />
                  <div className="wireframe-joint joint--pinky" />
                  <div className="hud-guide-box">
                    <span>VÙNG KHUNG HÌNH CHUẨN</span>
                  </div>
                </div>
                <div className="hud-feedback-toast">
                  <Sparkles size={14} className="text-teal" />
                  <span>Tư thế đạt chuẩn: Giữ yên 2 giây để xác nhận</span>
                </div>
              </div>
            )}

            {currentStep.previewType === "video-p2p" && (
              <div className="visual-preview-box visual-preview--video-p2p">
                <div className="p2p-header-bar">
                  <span className="p2p-badge">SignConnect Room #2026</span>
                  <span className="p2p-timer">12:45</span>
                </div>
                <div className="p2p-dual-view">
                  <div className="p2p-view-tile p2p-view-tile--me">
                    <span className="tile-name">Bạn (Học viên)</span>
                    <div className="tile-signal">Tín hiệu HD</div>
                  </div>
                  <div className="p2p-view-tile p2p-view-tile--partner">
                    <span className="tile-name">Minh Đức (Người khiếm thính)</span>
                    <div className="speech-caption">
                      [VSL]: "Chào bạn, hãy làm lại ký hiệu này nhé!"
                    </div>
                  </div>
                </div>
                <div className="p2p-connection-footer">
                  <span className="dot-live" />
                  <span>Kết nối P2P mã hóa đầu cuối • Độ trễ 16ms</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
