import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Menu, X, Sparkles } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = (e) => {
      const scrollEl = e.target;
      const top = scrollEl.scrollTop || window.scrollY || 0;
      const scrollHeight =
        (scrollEl.scrollHeight || document.documentElement.scrollHeight) -
        (scrollEl.clientHeight || window.innerHeight);
      const progress = scrollHeight > 0 ? Math.min(100, Math.max(0, (top / scrollHeight) * 100)) : 0;
      setScrollProgress(progress);
      setScrolled(top > 24);
    };

    // The welcome-page container has overflow-y: auto
    const pageEl = document.querySelector(".welcome-page");
    if (pageEl) {
      pageEl.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (pageEl) pageEl.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className={`welcome-nav-header ${scrolled ? "welcome-nav-header--scrolled" : ""}`}>
      <div className="welcome-nav-container">
        {/* Brand Logo */}
        <div
          className="welcome-brand"
          onClick={() => scrollTo("hero")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && scrollTo("hero")}
          aria-label="Về đầu trang SignMate"
        >
          <img
            className="welcome-brand-logo"
            src="/logo-signmate.png"
            alt="SignMate Logo"
            width={40}
            height={40}
          />
          <div className="welcome-brand-info">
            <img
              className="welcome-brand-text-img"
              src="/signmate_text.png"
              alt="SignMate"
              height={12}
            />
            <span className="welcome-brand-pill">
              <Sparkles size={11} aria-hidden="true" /> VSL • AI
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="welcome-nav-links" aria-label="Điều hướng chính">
          <button type="button" className="nav-link-btn" onClick={() => scrollTo("challenges")}>
            Thực trạng
          </button>
          <button type="button" className="nav-link-btn" onClick={() => scrollTo("journey")}>
            Lộ trình học
          </button>
          <button type="button" className="nav-link-btn" onClick={() => scrollTo("ai-tech")}>
            Công nghệ AI
          </button>
          <button type="button" className="nav-link-btn" onClick={() => scrollTo("connect")}>
            SignConnect
          </button>
          <button type="button" className="nav-link-btn" onClick={() => scrollTo("faq")}>
            Hỏi đáp
          </button>
        </nav>

        {/* CTA Actions */}
        <div className="welcome-nav-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => navigate("/login")}
            aria-label="Đăng nhập tài khoản"
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className="btn-primary-nav"
            onClick={() => navigate("/register")}
            aria-label="Đăng ký tài khoản miễn phí"
          >
            <span>Bắt đầu học</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className="btn-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Đóng thanh menu" : "Mở thanh menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu di động"
        >
          <nav className="mobile-menu-nav">
            <button
              type="button"
              className="mobile-nav-link"
              onClick={() => scrollTo("challenges")}
            >
              Thực trạng & Rào cản
            </button>
            <button type="button" className="mobile-nav-link" onClick={() => scrollTo("journey")}>
              Lộ trình 4 bước (Discover → Connect)
            </button>
            <button type="button" className="mobile-nav-link" onClick={() => scrollTo("ai-tech")}>
              Công nghệ AI 21 Khớp tay
            </button>
            <button type="button" className="mobile-nav-link" onClick={() => scrollTo("connect")}>
              SignConnect Video 1-1
            </button>
            <button type="button" className="mobile-nav-link" onClick={() => scrollTo("faq")}>
              Câu hỏi thường gặp
            </button>
          </nav>
          <div className="mobile-menu-actions">
            <button
              type="button"
              className="btn-mobile-login"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/login");
              }}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className="btn-mobile-register"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/register");
              }}
            >
              Bắt đầu học miễn phí →
            </button>
          </div>
        </div>
      )}

      {/* Luminous Scroll Progress Indicator */}
      <div className="nav-scroll-indicator" aria-hidden="true">
        <div className="nav-scroll-bar" style={{ width: `${scrollProgress}%` }} />
      </div>
    </header>
  );
}
