import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { auth } from "../../lib/firebase";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout";
import "./Login.css";

const googleProvider = new GoogleAuthProvider();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Tạm thời: đăng nhập xong vào thẳng Dashboard, chưa kiểm tra emailVerified / hasSetLevel
  function routeAfterLogin() {
    navigate("/dashboard");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      routeAfterLogin();
    } catch (err) {
      setError("Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      routeAfterLogin();
    } catch (err) {
      setError("Đăng nhập Google thất bại.");
    }
  }

  return (
    <AuthLayout>
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Đăng nhập</h1>
        <p className="login-subtitle">Đăng nhập để tiếp tục hành trình học tập của bạn.</p>

        <div className="login-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="login-field">
          <div className="login-field-header">
            <label>Mật khẩu</label>
            <Link to="/forgot-password" className="login-forgot-link">Quên mật khẩu?</Link>
          </div>
          <div className="login-input-wrap">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="login-toggle-visibility" onClick={() => setShowPw(!showPw)} aria-label="Ẩn/hiện mật khẩu">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="login-error">{error}</p>}

        <button className="login-submit-btn" type="submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="login-divider">hoặc tiếp tục với</p>
        <button type="button" className="login-google-btn" onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 16 3 9.1 7.6 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 45c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.4 35.6 26.8 36.5 24 36.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9 40.4 15.9 45 24 45z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.3 5.3C40.9 36.4 45 30.8 45 24c0-1.4-.1-2.7-.4-3.5z"/>
          </svg>
          Tiếp tục với Google
        </button>

        <p className="login-footnote">
          Chưa có tài khoản? <Link to="/register">Đăng ký miễn phí</Link>
        </p>
      </form>
    </AuthLayout>
  );
}