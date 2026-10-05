import "./AuthLayout.css";
import HandScene from "../../components/HandScene/HandScene";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-illustration">
        <div className="auth-logo">
          <img className="auth-logo-icon" src="/logo-signmate.png" alt="SignMate" />
          <span className="auth-logo-text">SignMate</span>
        </div>
        <p className="auth-tagline">Học ngôn ngữ ký hiệu cùng AI - dành cho tất cả mọi người.</p>
        <HandScene />
      </div>

      <div className="auth-panel">
        <div className="auth-mobile-brand">
          <img src="/logo-signmate.png" alt="SignMate" width="64" height="64" />
          <p>Học ngôn ngữ ký hiệu cùng AI — dành cho tất cả mọi người.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
