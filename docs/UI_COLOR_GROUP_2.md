# Nhóm 2 — Quy tắc màu theo tài liệu

## Trước / sau

| Màn hình | Trước | Sau |
|---|---|---|
| Lộ trình | Nhiều sắc xanh, gradient cam, viền active bị rule container ghi đè | Teal + Coral + Neutral; chương active nền trắng, viền teal-600; tiến độ và SVG dùng teal; CTA “Bắt đầu bài tiếp theo” là nút Coral duy nhất; tooltip là teal-outline |
| AI Practice | Live badge gradient hồng/tím; progress pha teal; điểm trạng thái xanh/vàng/đỏ | Nội dung Purple + Neutral; live/gauge dùng Purple; trạng thái phân biệt bằng nhãn, không thêm màu chính; lỗi dùng Neutral |
| Sidebar | Các nhóm state từng pha purple/teal | Đã thống nhất teal trong Nhóm 1; rà lại Nhóm 2 không còn token Purple |
| Welcome | Nút phụ tô kín, minh họa thẻ có thêm Purple | Một Coral CTA “Bắt đầu ngay”; đăng nhập và khám phá là outline; màu thẻ thuộc teal/coral |
| Auth | Background nhiều họ màu | Nền Neutral; một nút submit Coral; nút phụ giữ neutral/teal |
| Lesson / kết quả | Primary không nhất quán theo bước | CTA chính Coral theo trạng thái; retry/retake là outline/neutral; lỗi và đúng/sai giữ ý nghĩa qua nhãn/icon |
| Quiz / kết quả | Nút next là teal; nền có sắc Coral quá rộng | Nền Neutral; nút next/submit hoặc tiếp tục học là Coral; không thay điều kiện mở khóa/nộp bài |
| VideoCall | Teal + Purple + Green + Coral | Teal + Coral + Neutral; một primary CallButton mỗi giai đoạn, secondary teal-outline; nút kết thúc cuộc gọi và badge thông báo vẫn Coral |
| Friends | Nút từ chối Coral lặp trên từng dòng | Nút phụ Neutral/Teal; trạng thái lịch vẫn có nhãn; không tạo CTA Coral giả khi màn danh sách không có hành động chính duy nhất |
| Dashboard | Teal + Purple + Coral, SVG vàng/tím | Teal + Coral + Neutral; bảng xếp hạng Neutral, icon/sao dùng teal; flame vẫn Coral |

## File cập nhật trong nhóm này

- `src/components/LearningPath/ProgressWidget.css`
- `src/components/LearningPath/SCurvePath.css`
- `src/components/LearningPath/TopBanner.css`
- `src/pages/LearningPathPage/LearningPathPage.css`
- `src/components/LearningPath/ProgressWidget.jsx`
- `src/components/AiPractice/AiAnalyticsCard.css`
- `src/components/AiPractice/AiFeedbackCard.css`
- `src/components/AiPractice/CameraViewport.css`
- `src/components/AiPractice/SessionControls.css`
- `src/components/AiPractice/SignGuideModal.css`
- `src/components/AiPractice/TipBox.css`
- `src/pages/AiPracticePage/AiPracticePage.css`
- `src/pages/Welcome/Welcome.css`
- `src/layouts/AuthLayout/AuthLayout.css`
- `src/components/LessonPage/LessonFooter.css`
- `src/components/LessonPage/LessonResultModal.css`
- `src/pages/QuizPage/QuizPage.css`
- `src/pages/QuizResultPage/QuizResultPage.css`
- `src/pages/Friends/FriendsPage.css`
- `src/components/VideoCall/styles/matching.css`
- `src/components/VideoCall/styles/partner.css`
- `src/components/VideoCall/styles/review.css`
- `src/components/VideoCall/styles/rewards.css`
- `src/components/VideoCall/styles/room.css`
- `src/components/VideoCall/styles/shared.css`
- `src/components/VideoCall/styles/topics.css`
- `src/components/ui/ui.css`
- `src/pages/LessonPage/TheoryPreview.css`
- `src/components/LessonPage/OutOfHeartsModal.css`
- `src/components/Friends/FriendListItem.css`
- `src/pages/Dashboard/Dashboard.css`

## Kiểm tra

- `node node_modules/eslint/bin/eslint.js .`: đạt.
- `node node_modules/vite/bin/vite.js build`: đạt; còn cảnh báo chunk JS >500 kB, ngoài phạm vi màu.
- Không có token màu chưa định nghĩa trong các file đã xử lý.
- Trình duyệt xác nhận chương active có background rgb(255,255,255), border rgb(22,134,99) (teal-600).
- Kiểm tra Welcome, Login, Learning Path, Quiz, Quiz Result, VideoCall và Friends bằng fixture hiện có; không tràn ngang ở viewport 1280px. Các màn có primary CTA hiển thị tối đa một nút Coral tại trạng thái kiểm tra.
- Quan sát trực tiếp tab camera của AI Practice ở trạng thái chưa bật camera: nội dung Purple + Neutral, sidebar teal. Không cần mở camera hoặc gọi API chấm điểm để xác minh màu.

## Giữ nguyên / ngoại lệ

- Không đổi API, nghiệp vụ, route, tên prop hoặc class. JSX chỉ đổi hai giá trị `stroke` của SVG tiến độ sang token.
- Logo, ảnh đại diện, ảnh/video và emoji giữ màu gốc; không áp dụng palette CSS vào nội dung media.
- Sidebar/header dùng nhận diện teal chung; badge thông báo và flame được giữ Coral theo yêu cầu. Phần nội dung AI dùng Purple + Neutral, không ép một Coral CTA vào màn này.
- Danh sách Friends không có một hành động chính cố định: giữ các nút phụ cùng cấp, không tự thêm nút hoặc đổi hành vi để đạt một nút Coral.
- Màu phản hồi lỗi/đúng-sai không được xem là CTA. Giữ nhãn và icon giúp phân biệt ý nghĩa.
- `ai-analytics__live` hiện không được component render; vẫn sửa rule gốc và bỏ override phụ thuộc thứ tự import để tránh gradient cũ quay lại.
- Nhóm 1 vẫn nằm trong working tree; không commit/push tự động.
