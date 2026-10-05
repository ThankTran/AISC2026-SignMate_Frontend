import { Link } from "react-router-dom";
import "./Footer.css";
export default function Footer() {
  return (
    <footer className="app-footer">
      <Link className="touch-target" to="/dashboard">
        <img src="/logo-signmate.png" alt="SignMate" width="32" height="32" />
      </Link>
      <span>© 2026 SignMate</span>
      <Link to="/terms">Điều khoản</Link>
      <Link to="/privacy">Chính sách bảo mật</Link>
      <Link to="/contact">Hỗ trợ</Link>
      <a href="mailto:support@signmate.app">support@signmate.app</a>
    </footer>
  );
}
