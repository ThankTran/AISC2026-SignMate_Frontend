# Nhóm 1 — Hệ thống token SignMate

## Phạm vi và nguồn thiết kế

Chỉ sửa CSS. Giữ nguyên JavaScript/JSX, API, route, prop và tên class được JS sử dụng.
Nguồn: `src/index.css` và `D:/AISC2026/Màu sắc, Fonts.docx` (đã đọc cả nội dung và hình bảng màu).

Tài liệu cung cấp các mốc teal 50/100/200/500/700/900 và quy tắc dùng 600 cho nút/icon, 800–900 cho chữ. `teal-600: #168663` đã tồn tại nên giữ nguyên; bổ sung `teal-800: #0c5f4c` làm bậc trung gian giữa 700 và 900, không coi đây là mã được ghi trực tiếp trong tài liệu.

## Trước / sau

| Hạng mục | Trước | Sau |
|---|---|---|
| Spacing | Số pixel lặp rải rác | `--space-1..8`: 4, 8, 12, 16, 24, 32, 48, 64px; áp dụng vào các khoảng cách tương ứng |
| Radius | Không có thang dùng chung | sm/md/lg/xl/full: 8/12/16/24/9999px |
| Shadow | Bóng riêng theo từng màn hình | sm/md/lg gồm viền mềm trước, bóng nâng sau; giữ inset và focus ring đặc thù |
| Motion | 120–320ms rải rác, nhiều easing | fast/base/slow: 120/200/320ms và ease-standard; giữ nhịp animation dài và reduced-motion |
| Trạng thái | Màu trạng thái không có alias | success → green-500, danger → coral-500, warning → coral-700 |
| Dashboard | Bộ `--db-*` riêng | Thay trực tiếp bằng token teal/coral/purple/neutral |
| Quiz / kết quả / modal | Các bộ màu riêng `--quiz-*`, `--qr-*`, `--lrm-*` | Bỏ bảng màu riêng, dùng palette chung; nút hover có bậc màu đậm hơn |
| Lộ trình / footer / VideoCall | Hex/RGB riêng, màu icon không thống nhất | Dùng token và color-mix khi cần giữ độ trong suốt |
| Welcome | neutral-990 không tồn tại; font-style: bold không hợp lệ | neutral-900; font-weight hợp lệ ở tiêu đề và highlight, body không bị bold theo |
| CSS cascade | Override nối đuôi, selector và breakpoint lặp | Gom selector trong cùng điều kiện; gom breakpoint; giữ state/pseudo-class/responsive riêng |
| Code chết | db-board__header, quiz__result*, quiz-glow và keyframe không được dùng | Xóa sau khi tìm tham chiếu trong source |

## File đã sửa

- `src/components/LearningPath/NextUpCard.css`
- `src/components/LearningPath/SCurvePath.css`
- `src/components/LearningPath/TopBanner.css`
- `src/components/LessonPage/LessonFooter.css`
- `src/components/LessonPage/LessonResultModal.css`
- `src/components/LessonPage/OutOfHeartsModal.css`
- `src/components/Sidebar/Sidebar.css`
- `src/components/VideoCall/styles/matching.css`
- `src/components/VideoCall/styles/overlays.css`
- `src/components/VideoCall/styles/partner.css`
- `src/components/VideoCall/styles/responsive.css`
- `src/components/VideoCall/styles/review.css`
- `src/components/VideoCall/styles/rewards.css`
- `src/components/VideoCall/styles/room.css`
- `src/components/VideoCall/styles/shared.css`
- `src/components/VideoCall/styles/topics.css`
- `src/index.css`
- `src/pages/Dashboard/Dashboard.css`
- `src/pages/Friends/FriendsPage.css`
- `src/pages/LearningPathPage/LearningPathPage.css`
- `src/pages/QuizPage/QuizPage.css`
- `src/pages/QuizResultPage/QuizResultPage.css`
- `src/pages/Welcome/Welcome.css`

## Kiểm tra

- `node node_modules/eslint/bin/eslint.js .`: đạt.
- `node node_modules/vite/bin/vite.js build`: đạt; Vite vẫn cảnh báo bundle JS lớn hơn 500 kB. Không thay cấu trúc tải JS trong nhóm CSS này.
- Parse CSS: không còn selector trùng trong cùng ngữ cảnh/breakpoint, không còn hex/RGB cứng trong các stylesheet component đã chuyển đổi.
- Không có color token chưa định nghĩa. `--i` trong VideoCall được JSX cấp để điều khiển thứ tự animation, được giữ nguyên.
- Fixture `tests/layout-audit.html`: 25 trang ở 1280px và 390px, không có lỗi render hay tràn ngang theo audit. Quan sát trực tiếp Dashboard desktop và lộ trình mobile.
- Audit vẫn ghi nhận chữ nhỏ ở nhãn node, hit target nhỏ ở timeline lý thuyết và heading thiếu trên một số fixture. Đây là các phần cũ ngoài nhóm token; không xem lượt kiểm tra này là chứng nhận toàn bộ accessibility.

## Giữ nguyên / chưa thực hiện

- Chỉ có Nhóm 1 được cung cấp; chưa tự triển khai các nhóm tiếp theo.
- Không đổi font family, nghiệp vụ, nội dung học, API hoặc cấu trúc component.
- Giữ các kích thước hình học, số đo đặc thù không nằm trên thang spacing; không ép tất cả số pixel thành token gây đổi bố cục.
- Giữ rule khác nhau theo breakpoint/pseudo-class và keyframe đang dùng; chúng không phải selector trùng trong cùng điều kiện.
- `VideoCall/styles/animations.css` không có màu cứng hay override cần sửa nên không có diff.
- Các stylesheet ngoài danh sách ưu tiên chưa chuyển đổi toàn bộ. Không tạo token riêng cho từng hex.
