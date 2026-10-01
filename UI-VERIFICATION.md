# Kiểm tra thay đổi UI SignMate

## Đã kiểm tra
- ESLint toàn project: không lỗi.
- Production build: thành công tại `.verification/final-build` (còn cảnh báo bundle lớn hơn 500 kB).
- 12 kiểm thử Node: tiến độ học, validation Auth, initials, scroll lock chồng nhau, tiện ích gọi video và lưu phiên.
- 36 kiểm tra trình duyệt: Modal/focus/scroll, Undo, flyout, typography, quiz chọn đáp án/điều hướng/nộp sớm/hết giờ/result, placeholder video, VSL/demo, camera bị từ chối.
- Kiểm tra trực quan mobile 375px và desktop: drawer, flyout, agenda, thứ tự widget lộ trình, không tràn ngang.
- Trang thật: ProtectedRoute chuyển tới Login; email lỗi khi blur; 404 công khai.

## Chạy lại
```sh
npm run lint
node --test tests/*.test.js src/utils/videoCall/videoCall.test.mjs src/services/videoCall/demoSessionStorage.test.mjs
npm run dev
```
Mở `/tests/ui-smoke.html`, `/tests/learning-ui-smoke.html`, `/tests/camera-ui-smoke.html`. Các trang này dùng dữ liệu kiểm thử riêng, không gửi lời mời hoặc dùng camera thật. `/tests/shell-preview.html` dùng để kiểm tra bố cục.

## Ranh giới hiện tại
- Bài học, chấm quiz và Dashboard giữ nguồn API. Chương 3–4 hiển thị locked/nội dung đang cập nhật nếu API chưa có.
- VSL đã được người dùng xác nhận. Đã bỏ hướng dẫn ASL và emoji sai nghĩa; cần nhóm nội dung cung cấp video/hướng dẫn VSL đã xác minh.
- AI vẫn là demo, có nhãn rõ ràng và không dùng landmarks giả. Chỉ số không phải đánh giá camera thật.
- Friends/lịch hẹn vẫn dùng mock state chung. Gọi video mới có camera cục bộ; ghép cặp/chat/rewards chưa phải dịch vụ WebRTC từ xa. Cờ DEV/VITE_DEMO kiểm soát nhãn demo.
- Chưa kiểm thử đăng ký/đăng nhập và ghi Firestore bằng tài khoản thật; chưa có video VSL thật trong public để kiểm tra phát nội dung chuẩn.

## Leaderboard / Profile / Stats — 2026-10-01

- Leaderboard has deterministic generated weekly mock data (explicitly labelled), optional live API data, computed ranks/XP gaps, numeric XP Level filtering with counts/empty guidance, a semantic table, shared Avatar and separate curriculum/XP terminology.
- Profile persists Firebase Auth displayName and the complete users/{uid} Firestore profile, with backend synchronization and a distinct partial-sync notice. Existing backend profile fields remain available as fallback. Camera control was removed as permitted; avatar uploads are not implemented.
- Profile uses responsive label/value grids, roving radio focus and neutral hearing terminology. Account actions support password reauthentication, Google reauthentication, password changes, typed delete confirmation and recently authenticated backend deletion. Backend data deletion is transactional and user scoped. Firebase and backend deletion are separate operations; the dialog reports partial completion and permits retry.
- Stats shares dashboard chapters, sums completed lessons, displays active percentages, uses semantic colors, and adds 7/30/90 day history, weekly XP, 84-day streak heatmap and completed-session duration. Backend splits completed sessions across local midnight. AI timeline accepts real accuracy history; no fabricated accuracy is emitted while the recognition provider is absent.

Verification:
- ESLint passed; production build passed (`.verification/final-build`). Existing large-chunk warning remains.
- Node tests: 16 passed, including ranking/ties, XP gap, week/year boundaries and shared chapter totals.
- Backend ApiIntegrationTest: 18 passed, including 90-day user-scoped history, midnight duration split, recent-auth deletion and preservation of another user's account/curriculum.
- Browser fixture: 20 desktop assertions passed; 19 mobile assertions passed at 375px (the final additional assertion covers the small-group empty state). Shared UI regression: 16 assertions passed.
- Profile and Stats layouts inspected on mobile; Stats inspected within MainLayout. Screenshot `.verification/stats-desktop.png` uses isolated fixture data.
- No real Firebase account was modified, password changed or account deleted during verification. Live Firebase rules/network and Google popup behavior still require an authenticated integration check. Restart the backend to expose the new history fields and DELETE /api/me endpoint.

## Nguồn tiến độ chung, responsive và các lỗi bố cục — 2026-10-01 (mới nhất)

Phần này cập nhật các ghi chú nguồn dữ liệu cũ phía trên: Dashboard, Stats, widgets lộ trình, xếp hạng, thông báo và kết quả dùng ProgressContext với src/mockdata/progress, lưu tiến độ theo uid trên thiết bị. Câu hỏi/chấm bài vẫn gọi API. Friends/lịch và nhận diện AI vẫn ở mức mẫu/demo; không có dữ liệu nhận diện thật được đưa vào Stats.

### Thay đổi và kiểm tra trực tiếp
- Khoảng trắng thừa do CSS a[href] ghi đè position của skip link; đã sửa để link không chiếm chỗ trong hàng layout. Gutter desktop 20px, mobile 16px.
- Card chương tối đa 460px, bo góc 22px, nền teal nhạt/neutral; mobile tối đa 400px trong chiều rộng khả dụng.
- Cột tiến độ/nhiệm vụ cuộn riêng. Kiểm tra thực tế: scrollTop cột phải 355px trong khi main vẫn 0px. Mobile đưa nhiệm vụ trước danh sách chương.
- Sidebar parent nền trong suốt và mũi tên đóng/mở; child active teal nhạt. Mobile đo font các label đều 15px. Drawer khóa scroll, Escape đóng và trả focus về hamburger.
- Footer và khối user cùng cao 72px, cùng y=828 ở viewport 1440×900.
- AI: kiểm thử idle, camera từ chối, đang luyện, dừng chủ động, đóng modal rồi chuyển tab. Chuyển tab dừng camera nhưng không tạo tổng kết; không tự mở lại modal đã đóng. Dùng MediaStream giả trong fixture, không xin quyền camera thật.
- Ảnh giao diện: .verification/learning-path-updated.png (dữ liệu fixture riêng).
- Chưa có ảnh tham chiếu xếp hạng trong tin nhắn mới nhất; chưa thay bố cục xếp hạng theo một ảnh suy đoán.

### Kết quả kiểm thử
- ESLint: đạt. Production build: đạt; vẫn có cảnh báo bundle lớn hơn 500 kB.
- Node: 19/19 đạt (bao gồm tiến độ dùng chung, chống cộng XP lặp, rank, ngày/tuần, auth validation, video call và scroll lock).
- Browser: 90/90 assertions đạt: shared UI 16, lesson/quiz 12, account/stats 19, camera/AI 14, data-state/auth routing 29.
- 29 kiểm tra data-state/auth bao phủ loading/empty/error của Dashboard, Learning Path, Leaderboard, Stats, Friends/list/requests/calendar, Profile và 5 nhánh đăng nhập.
- Các trang auth mới, lựa chọn cấp độ thủ công, onboarding 3 bước và trang thông tin đã được dựng và kiểm tra layout. Chưa gửi email Firebase hoặc sửa tài khoản thật khi kiểm thử. Cấu hình action URL và quyền Firestore cần được kiểm tra trong môi trường triển khai.

### Ma trận responsive
Đạt = DOM audit không phát hiện tràn ngang ngoài vùng cuộn có chủ đích, chữ dưới 12px, vùng bấm dưới 44px mobile/24px desktop, thiếu h1 hoặc nhảy cấp heading trong trạng thái fixture. Đây không phải chứng nhận accessibility toàn diện hoặc phép đo tự động mọi trường hợp chồng lấn. Đã kiểm tra trực quan thêm lộ trình/Sidebar/Footer và drawer, cũng như cuộn độc lập.

| Trang | 360 | 390 | 768 | 1024 | 1440 |
|---|---|---|---|---|---|
| /dashboard | Đạt | Đạt | Đạt | Đạt | Đạt |
| /learning-path | Đạt | Đạt | Đạt | Đạt | Đạt |
| /ranking | Đạt | Đạt | Đạt | Đạt | Đạt |
| /account/stats | Đạt | Đạt | Đạt | Đạt | Đạt |
| /account/profile | Đạt | Đạt | Đạt | Đạt | Đạt |
| /friends/list | Đạt | Đạt | Đạt | Đạt | Đạt |
| /friends/friend-requests | Đạt | Đạt | Đạt | Đạt | Đạt |
| /friends/video-call-invites | Đạt | Đạt | Đạt | Đạt | Đạt |
| /video | Đạt | Đạt | Đạt | Đạt | Đạt |
| /practice-ai | Đạt | Đạt | Đạt | Đạt | Đạt |
| /learning-path/lesson/1 | Đạt | Đạt | Đạt | Đạt | Đạt |
| /learning-path/quiz/1 | Đạt | Đạt | Đạt | Đạt | Đạt |
| /learning-path/quiz/1/result | Đạt | Đạt | Đạt | Đạt | Đạt |
| / | Đạt | Đạt | Đạt | Đạt | Đạt |
| /login | Đạt | Đạt | Đạt | Đạt | Đạt |
| /register | Đạt | Đạt | Đạt | Đạt | Đạt |
| /forgot-password | Đạt | Đạt | Đạt | Đạt | Đạt |
| /reset-password | Đạt | Đạt | Đạt | Đạt | Đạt |
| /verify-email | Đạt | Đạt | Đạt | Đạt | Đạt |
| /level | Đạt | Đạt | Đạt | Đạt | Đạt |
| /onboarding | Đạt | Đạt | Đạt | Đạt | Đạt |
| /faq | Đạt | Đạt | Đạt | Đạt | Đạt |
| /terms | Đạt | Đạt | Đạt | Đạt | Đạt |
| /privacy | Đạt | Đạt | Đạt | Đạt | Đạt |
| /contact | Đạt | Đạt | Đạt | Đạt | Đạt |

Raw reports: .verification/layout-{360,390,768,1024,1440}.json. Fixture: /tests/layout-audit.html; dùng ?page=/learning-path để xem riêng một trang. Sau thay đổi màu/độ rộng card cuối cùng đã kiểm tra lại Learning Path tại 360px và 1440px.

## Xếp hạng theo ảnh tham chiếu — 2026-10-01
- Đã nhận ảnh và thay bố cục: Top 3 (2–1–3), bảng từ hạng 4 với Level/XP tuần/tổng XP, cột cá nhân/hoạt động tuần/mục tiêu/người tăng hạng. Giữ thang chữ chung, Avatar và dữ liệu ProgressContext.
- Bộ lọc có số lượng và trạng thái thiếu người cùng Level; không lặp Top 3 trong bảng. Bảng mobile cuộn trong khung có nhãn hướng dẫn và hỗ trợ focus bàn phím.
- Thứ hạng, khoảng cách XP, hoạt động T2–CN, mục tiêu Level/streak đều tính từ nguồn dữ liệu. Đã điều chỉnh seed để tổng XP không thấp hơn XP tuần. Không sao chép số liệu cá nhân từ ảnh mẫu.
- Kiểm tra trang ranking tại 360/390/768/1024/1440: không phát hiện tràn trang, lỗi cấp heading, chữ dưới 12px hay vùng bấm thiếu kích thước. Kiểm tra trực quan desktop và mobile.
- ESLint các file thay đổi đạt; production build đạt (cảnh báo bundle lớn đã có). 7 unit tests và 20 browser assertions account/stats/filter đạt.
- Ảnh: .verification/leaderboard-reference-desktop.png. Avatar dùng initials nếu dữ liệu không có ảnh.
