import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";
import { auth, db } from "../../lib/firebase";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPw) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        hasSetLevel: false,
        createdAt: new Date().toISOString(),
      });
      await sendEmailVerification(user);
      navigate("/verify-email", { state: { email } });
    } catch (err) {
      setError(err.code === "auth/email-already-in-use" ? "Email đã được sử dụng." : "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form className="register-card" onSubmit={handleSubmit}>
        <h1>Tạo tài khoản</h1>
        <p className="register-subtitle">Bắt đầu hành trình của bạn!</p>

        <div className="register-field">
          <label>Họ và tên</label>
          <input placeholder="e.g. Jordan Rivera" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="register-field">
          <label>Email</label>
          <input type="email" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="register-field">
          <label>Mật khẩu</label>
          <div className="register-input-wrap">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Tối thiểu 8 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="register-toggle-visibility" onClick={() => setShowPw(!showPw)} aria-label="Ẩn/hiện mật khẩu">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="register-field">
          <label>Xác nhận mật khẩu</label>
          <div className="register-input-wrap">
            <input
              type={showConfirmPw ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
            />
            <button type="button" className="register-toggle-visibility" onClick={() => setShowConfirmPw(!showConfirmPw)} aria-label="Ẩn/hiện mật khẩu xác nhận">
              {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <p className="register-error">{error}</p>}

        <button className="register-submit-btn" type="submit" disabled={loading}>
          {loading ? "Đang tạo..." : "Tạo tài khoản"}
        </button>

        <p className="register-divider">hoặc tiếp tục với</p>
        <button type="button" className="register-google-btn">
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 16 3 9.1 7.6 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 45c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.4 35.6 26.8 36.5 24 36.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9 40.4 15.9 45 24 45z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.3 5.3C40.9 36.4 45 30.8 45 24c0-1.4-.1-2.7-.4-3.5z"/>
          </svg>
          Tiếp tục với Google
        </button>

        <p className="register-terms">
          Bằng việc đăng ký, bạn đồng ý với <a href="/terms">Điều khoản</a> và{" "}
          <a href="/privacy">Chính sách bảo mật</a> của chúng tôi.
        </p>
        <p className="register-footnote">
          Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </AuthLayout>
  );
}