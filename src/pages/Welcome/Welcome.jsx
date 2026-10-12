import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Users, Camera, PlayCircle } from "lucide-react";
import Navbar from "../../components/Welcome/Navbar";
import HeroPreview from "../../components/Welcome/HeroPreview";
import CommunityStats from "../../components/Welcome/CommunityStats";
import ChallengesSection from "../../components/Welcome/ChallengesSection";
import JourneySection from "../../components/Welcome/JourneySection";
import AiFeatureBento from "../../components/Welcome/AiFeatureBento";
import ConnectShowcase from "../../components/Welcome/ConnectShowcase";
import FaqSection from "../../components/Welcome/FaqSection";
import CtaBanner from "../../components/Welcome/CtaBanner";
import WelcomeFooter from "../../components/Welcome/WelcomeFooter";
import "./Welcome.css";

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    const pageEl = document.querySelector(".welcome-page");
    const targets = document.querySelectorAll(".scroll-reveal");

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        root: pageEl || null,
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="welcome-page">
      {/* 1. Header & Navigation */}
      <Navbar />

      <main id="main-content">
        {/* 2. Hero Section (Highest Priority Focal Point) */}
        <section className="hero-section scroll-reveal is-visible" id="hero" aria-label="Giới thiệu SignMate">
          {/* Ambient Background Decorative Gradients */}
          <div className="hero-ambient-mesh" aria-hidden="true">
            <div className="mesh-blob mesh-blob--teal" />
            <div className="mesh-blob mesh-blob--purple" />
            <div className="mesh-blob mesh-blob--warm" />
          </div>

          <div className="section-container hero-container">
            {/* Left: Hero Editorial Pitch */}
            <div className="hero-pitch">
              {/* Eyebrow Pill */}
              <div className="hero-eyebrow">
                <span className="eyebrow-pill eyebrow-pill--hero">
                  <Sparkles size={14} className="text-teal" aria-hidden="true" />
                  <span>Nền tảng VSL thông minh đầu tiên tại Việt Nam</span>
                </span>
              </div>

              {/* Display Headline */}
              <h1 className="hero-headline">
                Kết nối yêu thương qua
                <br />
                <span className="hero-headline-highlight">Ngôn ngữ Ký hiệu</span>
                <br />
                cùng AI & Bạn đồng hành
              </h1>

              {/* Subtitle */}
              <p className="hero-lead-text">
                Tự tin giao tiếp từ ký hiệu đầu tiên với lộ trình chuẩn VSL,
                công nghệ thị giác máy tính nhận diện 21 khớp ngón tay và nền tảng
                gọi video P2P kết nối trực tiếp cùng người khiếm thính.
              </p>

              {/* Core Feature Highlights */}
              <div className="hero-feature-tags" role="list">
                <div className="hero-feature-pill" role="listitem">
                  <Camera size={14} className="text-teal" aria-hidden="true" />
                  <span>21 Điểm mốc khớp tay 3D</span>
                </div>
                <div className="hero-feature-pill" role="listitem">
                  <Users size={14} className="text-purple" aria-hidden="true" />
                  <span>Video Call 1-1 chuyên biệt</span>
                </div>
                <div className="hero-feature-pill" role="listitem">
                  <Shield size={14} className="text-coral" aria-hidden="true" />
                  <span>Chấm điểm tư thế thời gian thực</span>
                </div>
              </div>

              {/* Hero CTA Actions */}
              <div className="hero-cta-group">
                <button
                  type="button"
                  className="btn-hero-primary"
                  onClick={() => navigate("/register")}
                >
                  <span>Bắt đầu học miễn phí</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => scrollToSection("journey")}
                >
                  <PlayCircle size={17} aria-hidden="true" />
                  <span>Khám phá lộ trình 4 bước</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="hero-trust-bar">
                <div className="trust-item">
                  <span className="trust-dot" />
                  <span>Chuẩn Ngôn ngữ Ký hiệu Việt Nam (VSL)</span>
                </div>
                <div className="trust-divider" aria-hidden="true">•</div>
                <div className="trust-item">
                  <span className="trust-dot trust-dot--purple" />
                  <span>Bảo mật 100% dữ liệu camera</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Product Interface Showcase */}
            <div className="hero-visual-column">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* 3. Capability Stats */}
        <CommunityStats />

        {/* 4. Challenges & Problem Definition */}
        <ChallengesSection onExploreClick={() => scrollToSection("journey")} />

        {/* 5. Progressive Learning Journey (Discover -> Learn -> Practice -> Connect) */}
        <JourneySection />

        {/* 6. AI Computer Vision Deep-Dive (Bento Grid) */}
        <AiFeatureBento />

        {/* 7. SignConnect Video Platform & Community Values */}
        <ConnectShowcase />

        {/* 8. Frequently Asked Questions (Accordion) */}
        <FaqSection />

        {/* 9. Final Call-to-Action Banner */}
        <CtaBanner />
      </main>

      {/* 10. Comprehensive Multi-column Footer */}
      <WelcomeFooter />
    </div>
  );
}
