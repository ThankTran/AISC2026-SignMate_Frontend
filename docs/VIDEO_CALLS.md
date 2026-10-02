# Gọi video qua backend

Chạy backend và frontend theo `RUN_LOCAL.md`. Đặt `VITE_USE_MOCK=false`, `VITE_DEMO=false`; dev không tự bật hồ sơ demo.

## Kiểm tra bằng hai tài khoản

1. Đăng nhập hai tài khoản đã xác thực email trong hai trình duyệt khác nhau.
2. Cả hai mở `/video`, chọn ít nhất một chủ đề giống nhau và tìm bạn. API tạo cuộc gọi active khi ghép được cặp.
3. Mỗi người kiểm tra thiết bị rồi vào phòng. Cho phép camera; micro tùy chọn. Chat vẫn hoạt động qua API khi kết nối media đang thiết lập.
4. Với người đã là bạn: nút gọi gửi lời mời; đối phương chấp nhận trong trang Lời mời video call hoặc `/video`.
5. Kết thúc cuộc gọi rồi gửi đánh giá. Không hiển thị XP giả trong phiên thật.

Camera cần HTTPS hoặc localhost. Trên hai mạng khác nhau, STUN có thể không đủ: cấu hình `VITE_TURN_URL` (các URL cách nhau bằng dấu phẩy), `VITE_TURN_USERNAME`, `VITE_TURN_CREDENTIAL` rồi khởi động lại Vite. Các biến VITE được công khai trong bundle; dùng tài khoản TURN ngắn hạn, không đưa khóa quản trị TURN vào đây. Hiện chưa có endpoint cấp credential TURN ngắn hạn tự động.

## Cơ chế

- Frontend trao offer/answer/ICE bằng REST cursor mỗi giây; backend cũng có SSE `/api/calls/{id}/events` cho client muốn dùng. SSE hiện phát trong một instance; REST lưu dữ liệu là fallback khi chạy nhiều instance.
- Chat gửi/lấy qua API; reaction qua data channel. Không lưu tin nhắn giả khi tắt demo.
- Ping mỗi 20 giây; backend đóng phiên không có ping quá 60 giây. Client kết thúc nếu kết nối media mất quá 15 giây.
- Ghép cặp luôn cần một chủ đề chung. Trước 30 giây ưu tiên nhiều chủ đề chung/cùng cấp độ; sau đó ưu tiên thời gian chờ. Chưa triển khai hồ sơ mục tiêu/thời gian hoạt động hoặc học trọng số từ đánh giá.
- Lịch hẹn theo ngày/giờ vẫn là tính năng riêng chưa nối backend; danh sách lời mời gọi trực tiếp đã nối API.

## Xác minh

- `node --test tests/*.test.js`: kiểm tra giao thức offer/answer, ICE đến sớm, thay track, reaction và timeout.
- `/tests/call-flow.html` trên Vite: 10 kiểm tra hook/router dùng API giả lập, gồm StrictMode và lời mời trực tiếp.
- Backend có test ghép cặp đồng thời và dọn phiên hết hạn.
- Chưa xác minh camera/micro giữa hai tài khoản thật hoặc TURN ngoài mạng bằng các test trên; cần bước kiểm tra thiết bị thực tế ở trên.
