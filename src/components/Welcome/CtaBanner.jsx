import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function CtaBanner() {
  const navigate = useNavigate();

  return (
    <section className="cta-banner-section scroll-reveal" aria-label="Bắt đầu học ngay">
      <div className="section-container">
        <div className="cta-banner-card">
          {/* Ambient Decorative Glows */}
          <div className="cta-ambient-glow cta-ambient-glow--1" aria-hidden="true" />
          <div className="cta-ambient-glow cta-ambient-glow--2" aria-hidden="true" />

          <div className="cta-content">
            <div className="cta-eyebrow">
              <span className="cta-pill">
                <Sparkles size={13} aria-hidden="true" /> Bắt đầu ngay hôm nay
              </span>
            </div>

            <h2 className="cta-title">
              Sẵn sàng xóa nhòa khoảng cách
              <br />
              <span className="cta-title-highlight">và giao tiếp bằng cả trái tim?</span>
            </h2>

            <p className="cta-description">
              Chỉ mất 30 giây để tạo tài khoản và học ký hiệu đầu tiên cùng AI.
              Tham gia cộng đồng học ngôn ngữ ký hiệu văn minh và hòa nhập nhất tại Việt Nam.
            </p>

            <div className="cta-actions">
              <button
                type="button"
                className="btn-cta-primary"
                onClick={() => navigate("/register")}
              >
                <span>Tạo tài khoản miễn phí</span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn-cta-secondary"
                onClick={() => navigate("/login")}
              >
                Đăng nhập nếu đã có tài khoản
              </button>
            </div>

            <div className="cta-guarantees">
              <div className="guarantee-item">
                <CheckCircle2 size={15} className="text-teal-bright" />
                <span>Hoàn toàn miễn phí khởi đầu</span>
              </div>
              <div className="guarantee-item">
                <CheckCircle2 size={15} className="text-teal-bright" />
                <span>Không cần thẻ tín dụng</span>
              </div>
              <div className="guarantee-item">
                <CheckCircle2 size={15} className="text-teal-bright" />
                <span>Chạy mượt trên mọi trình duyệt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
