# Video call feature

## Trách nhiệm của từng thư mục

| Vị trí | Trách nhiệm |
| --- | --- |
| `src/pages/VideoCall/VideoCallPage.jsx` | Ghép các màn hình, truyền dữ liệu và callback; không chứa giao diện chi tiết hay truy cập thiết bị/storage. |
| `src/components/VideoCall/` | Giao diện từng màn: chọn chủ đề, tìm bạn, hồ sơ, phòng gọi, đánh giá, nhận thưởng. `CallChat`, `CallToolbar`, `SafetyDialog`, `ParticipantAvatar`, `CallButton` là các phần giao diện nhỏ hơn. |
| `src/hooks/videoCall/useVideoCallFlow.js` | Điều phối bước hiện tại, lựa chọn chủ đề, thời gian, hồ sơ bị chặn và gửi đánh giá/báo cáo. |
| `src/hooks/videoCall/useLocalMedia.js` | Xin quyền camera/micro, bật/tắt track, dọn thiết bị khi rời phòng; xử lý quyền được cấp sau khi component đã unmount. |
| `src/hooks/videoCall/useCallChat.js` | Tin nhắn của phiên gọi, giữ lịch sử khi đóng/mở khung chat. |
| `src/hooks/useDialogFocus.js` | Giữ focus trong dialog, hỗ trợ Escape và trả focus khi đóng. |
| `src/hooks/videoCall/useBodyScrollLock.js` | Khóa cuộn nền khi gọi hoặc mở dialog. |
| `src/mockdata/videoCall/` | Dữ liệu thuần: chủ đề, gợi ý, hồ sơ, tin nhắn mở đầu, nhãn đánh giá và XP demo. Không import React hay component icon. |
| `src/services/videoCall/demoSessionStorage.js` | Ranh giới lưu đánh giá/báo cáo demo. Trả về thất bại khi storage không khả dụng. |
| `src/utils/videoCall/` | Hàm thuần để định dạng thời gian, chọn/bỏ chọn và tìm hồ sơ chưa bị chặn. |
| `src/components/VideoCall/styles/` | CSS chia theo màn hình, phần dùng chung, animation và responsive. |

## Quy tắc state

- Chỉ state dùng qua nhiều bước mới ở `useVideoCallFlow`.
- Nội dung chủ đề đang nhập ở `TopicSelection`; tin nhắn đang soạn ở `CallChat`; sao, tag và ghi chú ở `CallReview`; lý do báo cáo ở `SafetyDialog`.
- Component nhận callback có tên rõ ý nghĩa (`onSubmit`, `onStartCall`, `onSafetyAction`), không nhận toàn bộ flow hay setter của màn hình khác.
- Hồ sơ bị chặn được xác định bằng `id`, không dùng tên hiển thị.
- Unmount `CallRoom` sẽ dọn media tracks. Hủy tìm bạn sẽ dọn timeout ghép cặp.

## CSS

`VideoCallPage.css` chỉ tập hợp stylesheet. Giữ thứ tự shared → các màn hình → animation → responsive để bảo toàn cascade. Các selector của tính năng dùng tiền tố `vc-`. Cấu hình giảm chuyển động nằm cuối `responsive.css`.

## Khi kết nối backend

Thay dữ liệu trong `mockdata/videoCall` bằng dữ liệu từ API ở hook/service; giữ component giao diện nhận props. Thay timeout demo trong `useVideoCallFlow` bằng kết quả ghép cặp. `useLocalMedia` chỉ quản lý thiết bị cục bộ, chưa thực hiện WebRTC/signaling. Thay `demoSessionStorage` bằng service API khi có endpoint.

## Kiểm tra

```sh
node --test src/utils/videoCall/videoCall.test.mjs src/services/videoCall/demoSessionStorage.test.mjs
node node_modules/eslint/bin/eslint.js .
node node_modules/vite/bin/vite.js build
```

Kiểm tra UI tại `/video`: chọn/thêm chủ đề → tìm/hủy tìm → tìm người khác → bắt đầu gọi → gửi tin nhắn, đóng/mở chat → kết thúc → chọn sao/tag, ghi chú → gửi đánh giá → tiếp tục. Kiểm tra thêm dialog chặn/báo cáo với Tab và Escape.


## Local UI simulation

Vite development now uses simulated matching by default (`VITE_VIDEO_CALL_MODE=auto`).
Production builds retain real matching. Set `VITE_VIDEO_CALL_MODE=real` to test a real
local connection, or `demo` to explicitly preview the simulator in a build. Restart
Vite after changing environment settings. This flag does not switch learning APIs
or account data to mock mode.

Open `/video` to choose topics and simulate matching (about five seconds), or use
the local preview controls to jump to match, device check, call, and review screens.
`/video?step=call` opens the call UI without requesting camera/microphone. Device
check also offers a camera-free entry button; camera and microphone can still be
enabled manually. Ending a call leads to review and the rewards preview.

Demo chat, reports, reviews and blocking stay local. They do not send call,
signaling, review or blocking mutations to the backend, and demo XP is not awarded
to the account. The partner is simulated; no remote video stream is connected.
