import { Link } from "react-router-dom";
import { Sparkles, Heart, Mail } from "lucide-react";

export default function WelcomeFooter() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="welcome-footer" role="contentinfo" aria-label="Chân trang SignMate">
      <div className="section-container">
        <div className="footer-top-grid">
          {/* Brand Info Column */}
          <div className="footer-col footer-col--brand">
            <div className="footer-brand-logo">
              <img
                src="/logo-signmate.png"
                alt="SignMate Logo"
                width={42}
                height={42}
              />
              <img
                src="/signmate_text.png"
                alt="SignMate"
                className="footer-brand-text-img"
                height={26}
              />
            </div>
            <p className="footer-mission-text">
              Nền tảng hỗ trợ học Ngôn ngữ Ký hiệu Việt Nam (VSL) ứng dụng công nghệ
              thị giác máy tính AI và mạng lưới kết nối bạn học video call 1-1.
            </p>
            <div className="footer-badge-pill">
              <Sparkles size={13} aria-hidden="true" />
              <span>Dự án vì cộng đồng khiếm thính Việt Nam</span>
            </div>
          </div>

          {/* Navigation Column: Tính năng */}
          <div className="footer-col">
            <h4 className="footer-col-title">Sản phẩm & Tính năng</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/learning-path">Lộ trình học theo cấp độ (A1 - B2)</Link>
              </li>
              <li>
                <Link to="/practice-ai">AI Chấm điểm cử chỉ tay</Link>
              </li>
              <li>
                <Link to="/video">SignConnect Video Call 1-1</Link>
              </li>
              <li>
                <Link to="/ranking">Bảng xếp hạng & Thi đua tuần</Link>
              </li>
              <li>
                <Link to="/dashboard">Bảng điều khiển học tập</Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column: Khám phá nhanh */}
          <div className="footer-col">
            <h4 className="footer-col-title">Khám phá Landing</h4>
            <ul className="footer-nav-list">
              <li>
                <button
                  type="button"
                  className="footer-nav-btn"
                  onClick={() => scrollTo("challenges")}
                >
                  Thực trạng & Rào cản
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-nav-btn"
                  onClick={() => scrollTo("journey")}
                >
                  Hành trình 4 bước (Discover → Connect)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-nav-btn"
                  onClick={() => scrollTo("ai-tech")}
                >
                  Công nghệ AI 21 Điểm mốc
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-nav-btn"
                  onClick={() => scrollTo("connect")}
                >
                  SignConnect P2P
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-nav-btn"
                  onClick={() => scrollTo("faq")}
                >
                  Hỏi đáp thường gặp
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Support Column */}
          <div className="footer-col">
            <h4 className="footer-col-title">Hỗ trợ & Pháp lý</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/faq">Trung tâm hỏi đáp (FAQ)</Link>
              </li>
              <li>
                <Link to="/terms">Điều khoản dịch vụ</Link>
              </li>
              <li>
                <Link to="/privacy">Chính sách bảo mật dữ liệu</Link>
              </li>
              <li>
                <Link to="/contact">Liên hệ đóng góp ý kiến</Link>
              </li>
              <li>
                <a
                  href="mailto:support@signmate.app"
                  className="footer-mail-link"
                >
                  <Mail size={14} aria-hidden="true" />
                  <span>support@signmate.app</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            <span>© 2026 SignMate. Bản quyền thuộc về Đội ngũ phát triển SignMate.</span>
          </div>

          <div className="footer-a11y-note">
            <Heart size={14} className="text-coral" aria-hidden="true" />
            <span>Xây dựng theo định hướng tiếp cận bình đẳng & Chuẩn WCAG 2.2 AA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
