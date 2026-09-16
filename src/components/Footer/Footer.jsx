import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Camera,
  CheckCircle2,
  Mail,
  MessageCircle,
  MessageCircleQuestion,
  PlayCircle,
  ShieldCheck,
  Trophy,
  Users,
  Video,
} from "lucide-react";

import {
  footerExploreLinks,
  footerSocialLinks,
  footerSupportLinks,
} from "../../mockdata";

import "./Footer.css";

const footerIconMap = {
  bookOpen: BookOpen,
  bot: Bot,
  camera: Camera,
  messageCircle: MessageCircle,
  messageCircleQuestion: MessageCircleQuestion,
  playCircle: PlayCircle,
  trophy: Trophy,
  users: Users,
  video: Video,
};

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    setIsSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="footer" aria-label="Thông tin SignMate">
      <div className="footer__cta">
        <div>
          <p className="footer__eyebrow">Học cùng SignMate</p>
          <h2 className="footer__cta-title">Sẵn sàng luyện ký hiệu hôm nay?</h2>
          <p className="footer__cta-text">
            Bắt đầu với lộ trình cá nhân hóa hoặc gọi video cùng bạn bè để luyện
            phản xạ giao tiếp.
          </p>
        </div>

        <div className="footer__cta-actions">
          <Link to="/practice-ai" className="footer__primary-action">
            <Bot size={16} strokeWidth={1.8} />
            <span>Luyện với AI</span>
            <ArrowRight size={15} strokeWidth={1.8} />
          </Link>

          <Link to="/video" className="footer__secondary-action">
            <Users size={16} strokeWidth={1.8} />
            <span>Tìm bạn luyện tập</span>
          </Link>
        </div>
      </div>

      <div className="footer__top">
        <div className="footer__brand">
          <Link to="/" className="footer__logo-link" aria-label="Về trang chủ SignMate">
            <img
              src="/logo-signmate_text.png"
              alt="SignMate"
              className="footer__logo"
            />
          </Link>

          <p className="footer__description">
            Nền tảng học và giao tiếp ngôn ngữ ký hiệu, giúp mỗi cuộc
            trò chuyện trở nên tự nhiên hơn.
          </p>

          <div className="footer__social">
            {footerSocialLinks.map(({ label, href, icon }) => {
              const Icon = footerIconMap[icon];

              return (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-btn"
                  aria-label={label}
                  title={label}
                >
                  {Icon && <Icon size={16} strokeWidth={1.8} />}
                </a>
              );
            })}
          </div>
        </div>

        <nav className="footer__col" aria-label="Khám phá">
          <div className="footer__col-header">
            <h3 className="footer__col-title">Khám phá</h3>
            <p className="footer__col-desc">Các khu vực học chính</p>
          </div>

          <ul className="footer__list">
            {footerExploreLinks.map(({ label, path, icon }) => {
              const Icon = footerIconMap[icon];

              return (
                <li key={label}>
                  <Link to={path} className="footer__list-link">
                    {Icon && <Icon size={14} strokeWidth={1.8} />}
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <nav className="footer__col" aria-label="Hỗ trợ">
          <div className="footer__col-header">
            <h3 className="footer__col-title">Hỗ trợ</h3>
            <p className="footer__col-desc">Trợ giúp và chính sách</p>
          </div>

          <ul className="footer__list">
            {footerSupportLinks.map(({ label, path, icon }) => {
              const Icon = footerIconMap[icon];

              return (
                <li key={label}>
                  <Link to={path} className="footer__list-link">
                    {Icon && <Icon size={14} strokeWidth={1.8} />}
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="footer__newsletter">
          <div className="footer__col-header">
            <h3 className="footer__col-title">Nhận tin cập nhật</h3>
            <p className="footer__col-desc">1 email ngắn mỗi tuần</p>
          </div>

          <p className="footer__newsletter-desc">
            Mẹo học ký hiệu, tính năng mới và ưu đãi gửi thẳng vào email của bạn.
          </p>

          <form
            className="footer__newsletter-form"
            onSubmit={handleNewsletterSubmit}
          >
            <label htmlFor="footer-email" className="sr-only">
              Địa chỉ email
            </label>
            <input
              id="footer-email"
              type="email"
              required
              placeholder="Email của bạn"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setIsSubscribed(false);
              }}
              className="footer__newsletter-input"
            />
            <button type="submit" className="footer__newsletter-btn">
              Đăng ký
            </button>
          </form>

          {isSubscribed && (
            <p className="footer__form-success" role="status">
              <CheckCircle2 size={14} strokeWidth={1.8} />
              <span>Cảm ơn bạn, SignMate đã ghi nhận email.</span>
            </p>
          )}

          <a className="footer__contact" href="mailto:support@signmate.app">
            <Mail size={14} strokeWidth={1.8} />
            <span>support@signmate.app</span>
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copyright">&copy; 2026 SignMate. All rights reserved.</p>

        <div className="footer__status">
          <ShieldCheck size={14} strokeWidth={1.8} />
          <span>Phiên học an toàn</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
