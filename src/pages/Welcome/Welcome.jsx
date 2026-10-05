import { useNavigate } from "react-router-dom";
import { Plus, User, VideoOff, Lightbulb, BookOpen, GraduationCap, Users } from "lucide-react";
import "./Welcome.css";
import Footer from "../../components/Footer/Footer";

const CHALLENGES = [
  {
    icon: Plus,
    tone: "coral",
    title: "Khoảng trống hạ tầng số",
    desc: "Khoảng 2,5 triệu người Việt Nam sống với tình trạng khiếm thính (60% trong độ tuổi đi làm). Các ứng dụng gọi video phổ biến (Zoom, Meet, Zalo) tối ưu hóa cho âm thanh, không hỗ trợ giao tiếp ký hiệu.",
  },
  {
    icon: User,
    tone: "purple",
    title: "Thiếu môi trường thực hành phản xạ",
    desc: "Phong trào học ngôn ngữ ký hiệu trong giới trẻ gia tăng mạnh, nhưng phương pháp hiện tại chủ yếu là học thụ động qua hình ảnh tĩnh hoặc video một chiều, thiếu hoàn toàn môi trường thực hành phản xạ hai chiều với người thật.",
  },
  {
    icon: VideoOff,
    tone: "teal",
    title: "Hạn chế của nền tảng Video Call",
    desc: "Zoom, Google Meet, Zalo tối ưu hóa cho giọng nói - chất lượng hình ảnh dễ bị mờ nhoè khi tay cử động nhanh, bố cục góc quay không tối ưu và không có cơ chế ghép cặp tìm bạn cùng luyện tập.",
  },
  {
    icon: Lightbulb,
    tone: "dark",
    title: "Thiếu phản hồi AI tức thời",
    desc: "Các ứng dụng hiện tại không có AI chấm điểm đúng/sai dáng tay. Người học không biết mình thực hiện ký hiệu sai ở đâu, dẫn đến luyện tập sai lặp đi lặp lại.",
  },
];

const EXPLORE = [
  {
    icon: BookOpen,
    title: "Thư viện Ký hiệu có cấu trúc",
    desc: "Cơ sở dữ liệu đa phương tiện phân loại theo cấu trúc phân cấp - từ bảng chữ cái ngón tay đến từ vựng và cụm từ giao tiếp thường dùng theo chủ đề.",
    bullets: [
      "Video ký hiệu theo chủ đề & cấp độ",
      "Bảng chữ cái ngón tay (Fingerspelling)",
      "Cơ sở dữ liệu mở rộng cho AI",
    ],
  },
  {
    icon: GraduationCap,
    title: "Học theo lộ trình & AI đánh giá",
    desc: "Nội dung học thiết kế theo chương, cấp độ và chủ đề. Module AI trích xuất 21 điểm mốc khớp bàn tay, đo lệch góc chuyển động và đưa ra phản hồi chỉnh tư thế ngay lập tức.",
    bullets: [
      "AI đánh giá tư thế tay theo thời gian thực",
      "Theo dõi tiến độ, điểm thưởng & huy hiệu",
      "Bài tập tương tác & kiểm tra cuối chương",
    ],
  },
  {
    icon: Users,
    title: "Giao tiếp video thực tế",
    desc: "Gọi video tối ưu cho ngôn ngữ ký hiệu - khung hình quan sát rõ khuôn mặt & bàn tay, WebRTC độ trễ thấp. Ghép cặp thông minh theo sở thích để thực hành giao tiếp hai chiều.",
    bullets: [
      "Video call tối ưu góc quay bàn tay - nét mặt",
      "Ghép cặp theo sở thích & chủ đề giao tiếp",
      "Chat văn bản song song trong cuộc gọi",
    ],
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const scrollToExplore = () => {
    document.getElementById("explore-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="welcome-page">
      <header className="welcome-nav">
        <div className="welcome-logo">
          <img className="welcome-logo-icon" src="/logo-signmate.png" alt="SignMate" />
          <span className="welcome-logo-text">SignMate</span>
        </div>
        <button className="btn-primary-pill" onClick={() => navigate("/login")}>
          Đăng Nhập
        </button>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-image">
            <img src="/BG_Welcome.png" alt="Người dùng luyện tập ký hiệu" />
          </div>

          <div className="hero-content">
            <h1 className="text-display">
              SignMate - Kết nối qua
              <br />
              <span className="highlight">ngôn ngữ ký hiệu</span>
            </h1>
            <p className="hero-desc">
              Lộ trình học cá nhân hóa và luyện tập video 1-1 với người thật - được hỗ trợ bởi AI
              đánh giá tư thế và phản hồi thời gian thực.
            </p>

            <div className="feature-tags">
              <span className="tag">Lộ trình học chi tiết</span>
              <span className="tag">Luyện tập video 1-1</span>
              <span className="tag">AI đánh giá tư thế</span>
            </div>

            <div className="hero-actions">
              <button className="btn-primary hero-cta" onClick={() => navigate("/register")}>
                Bắt đầu ngay →
              </button>
              <button className="btn-outline" onClick={scrollToExplore}>
                Khám phá SignMate
              </button>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      <section className="challenges">
        <h2 className="text-h2">Thách thức hiện tại</h2>
        <p className="section-subtitle">Tại sao việc học ngôn ngữ ký hiệu lại khó khăn?</p>

        <div className="challenges-grid">
          {CHALLENGES.map(({ icon: Icon, tone, title, desc }) => (
            <div className={`challenge-card challenge-card--${tone}`} key={title}>
              <div className={`challenge-icon challenge-icon--${tone}`}>
                <Icon size={18} />
              </div>
              <h3 className="text-h3">{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="explore" id="explore-section">
        <h2 className="text-h2">Khám phá SignMate</h2>

        <div className="explore-grid">
          {EXPLORE.map(({ icon: Icon, title, desc, bullets }) => (
            <div className="explore-col" key={title}>
              <div className="explore-icon">
                <Icon size={26} />
              </div>
              <h3 className="text-h3">{title}</h3>
              <p>{desc}</p>
              <ul>
                {bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
