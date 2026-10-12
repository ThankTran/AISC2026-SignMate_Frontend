import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Tôi chưa từng học ngôn ngữ ký hiệu bao giờ, SignMate có phù hợp không?",
    a: "Rất phù hợp. Lộ trình của SignMate được thiết kế từ con số 0 với cấp độ A1 Khởi đầu: bắt đầu từ bảng chữ cái ngón tay (Fingerspelling), số đếm và các ký hiệu chào hỏi cơ bản nhất. Mỗi bài học đều có video mẫu chuyển động chậm và giải thích giải phẫu vị trí ngón tay rõ ràng.",
  },
  {
    q: "AI chấm điểm dáng tay như thế nào? Tôi có cần camera hay găng tay cảm biến đắt tiền không?",
    a: "Hoàn toàn không cần thiết bị đắt tiền. SignMate sử dụng mô hình MediaPipe Hands và thuật toán DTW (Dynamic Time Warping) để phân tích 21 điểm mốc khớp ngón tay trực tiếp qua webcam thông thường của máy tính hoặc điện thoại thông minh. Chỉ cần đủ ánh sáng và đặt bàn tay trong khung hình là AI có thể nhận diện và chấm điểm tức thì.",
  },
  {
    q: "SignMate sử dụng hệ thống ngôn ngữ ký hiệu nào?",
    a: "SignMate tập trung hoàn toàn vào Ngôn ngữ Ký hiệu Việt Nam (VSL - Vietnamese Sign Language), được chuẩn hóa theo tài liệu và thực hành của cộng đồng người khiếm thính tại Việt Nam. Chúng tôi tham vấn cấu trúc ngữ pháp và cử chỉ thực tế để đảm bảo tính ứng dụng cao nhất.",
  },
  {
    q: "Tính năng gọi video 1-1 SignConnect hoạt động ra sao và có an toàn không?",
    a: "SignConnect sử dụng giao thức WebRTC mã hóa P2P (Peer-to-Peer) truyền tải trực tiếp giữa hai trình duyệt với độ trễ siêu thấp. Bạn có thể chọn ghép cặp ngẫu nhiên với bạn học cùng trình độ hoặc đặt lịch cùng người bạn yêu thích. Mọi tài khoản đều được quản lý nhằm đảm bảo môi trường giao tiếp văn minh, an toàn.",
  },
  {
    q: "Video từ camera của tôi có bị tải lên máy chủ hoặc lưu trữ lại không?",
    a: "Không. Quyền riêng tư là nguyên tắc hàng đầu của SignMate. Module AI trích xuất tọa độ 21 điểm mốc khớp tay hoàn toàn cục bộ trên trình duyệt của bạn (client-side processing). Hình ảnh video không bao giờ được ghi lại hay gửi lên máy chủ của chúng tôi.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="faq-section scroll-reveal" id="faq">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="section-eyebrow">
            <span className="eyebrow-pill eyebrow-pill--coral">
              Giải đáp thắc mắc
            </span>
          </div>
          <h2 className="section-title">
            Câu hỏi thường gặp
            <br className="title-break" />
            <span className="text-gradient-coral">về SignMate & Công nghệ AI</span>
          </h2>
          <p className="section-description">
            Những thông tin cần thiết giúp bạn an tâm bắt đầu hành trình học tập và kết nối.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="faq-accordion-list" role="region" aria-label="Danh sách câu hỏi thường gặp">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                className={`faq-item ${isOpen ? "faq-item--open" : ""}`}
                key={item.q}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                >
                  <div className="faq-question-content">
                    <span className="faq-icon" aria-hidden="true">
                      <HelpCircle size={18} />
                    </span>
                    <span className="faq-question-text">{item.q}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`faq-chevron ${isOpen ? "faq-chevron--rotated" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div
                    className="faq-answer-pane"
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                  >
                    <p className="faq-answer-text">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
