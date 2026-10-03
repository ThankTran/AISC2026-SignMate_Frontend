# Tiến độ do server quản lý

Mặc định `VITE_USE_MOCK=false`. `ProgressProvider` tải dashboard, stats, hai scope leaderboard và notifications. `recordLesson`/`recordQuiz` chỉ làm mới resource sau khi API chấm bài thành công, không tự tăng XP hay mở khóa. Không đọc/ghi localStorage cho tiến độ; dữ liệu cũ trong trình duyệt không được nhập lên server. Đổi tài khoản hoặc đăng xuất sẽ bỏ dữ liệu của tài khoản trước.

## Những field adapter bổ sung

| Field giao diện | Nguồn / cách chuyển đổi |
| --- | --- |
| `lessons`, `lesson.chapterId` | Làm phẳng `dashboard.chapters[].lessons`, gắn ID chương chứa bài. |
| `totalLessons`, `completedLessons`, `percent` | Tổng `chapter.total` / `chapter.done`; phần trăm tính từ hai tổng này. |
| `nextLesson` | Bài đầu tiên server trả `active` hoặc `unlocked`; không tự mở khóa theo ID. |
| `stats.level` | Alias của `curriculumLevel`, khác với `xpLevel`. |
| `leaderboard.totalXp`, `xpLevel` | Đổi tên từ `xp`, `level` nếu DTO cũ chưa có tên mới. Giữ rank của server. |
| `notifications.title`, `time`, `path` | `message` thành title; định dạng `createdAt`; map loại lời mời bạn bè/cuộc gọi/AI tới route. |
| Thiếu mảng lịch sử, nhiệm vụ, thông báo | Mảng rỗng; không điền lịch sử hoặc phần thưởng mock. |
| Thiếu `previousRank` | `null`; không dựng số hạng tăng giả. |
| DTO cũ thiếu Level/XP target | Dự phòng Level = floor(XP/1000)+1, target = Level×1000, remaining = target−XP. Backend mới trả trực tiếp các field này. |
| DTO cũ thiếu `curriculumLevel` / quiz | Dự phòng “Cơ bản” / quiz locked. Backend mới trả giá trị thật. |

`dailyQuests[].xp` ở server là XP thực tế đã nhận trong ngày cho hoạt động đó, không phải một phần thưởng nhiệm vụ cộng thêm. UI hiển thị số nhiệm vụ hoàn thành và XP đã nhận.

## Backend và giới hạn dữ liệu

- Migration V4 thêm `app_users.curriculum_level`. Màn chọn cấp độ lưu qua `/api/me` trước khi đánh dấu thiết lập hoàn tất trong Firestore. Tài khoản cũ mặc định Cơ bản; chưa tự nhập lựa chọn cũ từ Firestore.
- Dashboard trả `curriculumLevel`, `xpLevel`, `xpRemaining`, `dailyQuests`. Rank tuần dùng cùng thứ tự XP tuần → tổng XP → UUID như leaderboard.
- `previousRank` tính từ XP tuần trước, với những tài khoản công khai hiện tại đã tồn tại trước đầu tuần. Đây không phải snapshot lịch sử quyền riêng tư; thiếu trong top 100 tuần trước trả null. Scope level so sánh cùng tập người có Level hiện tại.
- Leaderboard mặc định trả tối đa 50 người. Adapter không tự thêm người hoặc suy đoán người đứng ngay trên ngoài tập dữ liệu này.
- Kết quả bài kiểm tra lấy lại từ API khi không có router state, gồm câu hỏi/options/video phục vụ xem lại. API chưa lưu thời gian quiz: khi mở lại URL sẽ ẩn thời gian thay vì tự điền số giả.
- Email vẫn xác minh bằng liên kết Firebase thật, không dùng OTP giả theo hình tham khảo.

## Mock và kiểm thử

`VITE_USE_MOCK=true` giữ nguồn tiến độ mock cũ trong bộ nhớ cho phát triển; tải lại sẽ reset. `initialState` chỉ là đầu vào fixture kiểm thử. Cờ này không thay dịch vụ xác thực Firebase hay tự cung cấp video/AI thật.

Kiểm chứng ngày 2026-10-01: build Vite thành công ở `.verification/progress-dist`; ESLint không có lỗi/cảnh báo; 17 Node tests; 21 kiểm tra browser tại `tests/server-progress.html`; backend 34 tests (21 API, 3 committed flows, 8 claims, 2 seed). Browser tests dùng API fixture, không gửi email hoặc thay tài khoản thật. Kiểm tra login/register ở 360px không tràn ngang, chữ form ≥14px và nút ≥44px; desktop giữ phần minh họa và thẻ form riêng.
