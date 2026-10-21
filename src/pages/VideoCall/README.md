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

`useServerVideoCallFlow` quản lý lời mời và ghép cặp qua API. `useLocalMedia` quản lý camera/micro, `useWebRTCCall` và `callPeer` trao đổi offer/answer/ICE để truyền media thật. Chat dùng API của cuộc gọi. Demo chỉ bật khi được cấu hình rõ ràng.

## Kiểm tra

```sh
node --test src/utils/videoCall/videoCall.test.mjs src/services/videoCall/demoSessionStorage.test.mjs
node node_modules/eslint/bin/eslint.js .
node node_modules/vite/bin/vite.js build
```

Kiểm tra UI tại `/video`: chọn/thêm chủ đề → tìm/hủy tìm → tìm người khác → bắt đầu gọi → gửi tin nhắn, đóng/mở chat → kết thúc → chọn sao/tag, ghi chú → gửi đánh giá → tiếp tục. Kiểm tra thêm dialog chặn/báo cáo với Tab và Escape.


## Interactive call demo

Real calls are the default in development and production. Set `VITE_VIDEO_CALL_MODE=demo` only for the explicit offline demo; use `real` to override any mock flags. Restart Vite after changing environment settings.

`DemoCallPage.jsx` renders the view. `useDemoCallController` subscribes to the small
external-store controller in `services/videoCall/demoController.js`. Its snapshot
contains status, participants, elapsed seconds, camera/mic state, local media,
messages, panel, layout and pinned participant. Actions handle join, leave,
rejoin, media, chat, panels, layout, pin and deterministic recovery. A future call
adapter can expose this same view contract. Sample identities, messages, delays
and scenario definitions live in `demoContent.js`, outside presentation code.

Join transitions through joining (900 ms), waiting (1400 ms), then connected.
Elapsed time counts connected time only; interruption freezes it. Leave and
unmount cancel scheduled work and stop acquired tracks, including permission
results that arrive late. Rejoin clears the draft and restores initial messages,
media controls, timer and layout. Chat is memory-only and never delivered remotely.
The partner is an explicitly labeled sample profile with an avatar, not live or
prerecorded video. Camera/mic controls initially simulate state. Actual devices
are requested only through explicit settings actions; permission denial leaves
simulation usable. Local video is muted and never sent to another participant.
There is no recording, screen sharing or fabricated device inventory.

Development-only `Tình huống xem trước` exposes all ten scenarios. Transient
fixtures remain still until `Tiếp tục đến kết nối` is selected. Normal Join uses
the timed sequence. Interruption only happens by explicit selection/button.
Use `/video?scenario=chat`, `/video?scenario=interrupted`, or `/video?step=call`.
The isolated `/tests/demo-call-preview.html?scenario=chat` fixture needs no login.
Neither the selector nor query-driven scenarios is enabled in production.

Validation:

```sh
node --test tests/*.test.js tests/*.test.mjs src/utils/videoCall/videoCall.test.mjs src/services/videoCall/demoSessionStorage.test.mjs
npm run lint
npm run build
```

Controller tests cover joining/canceling, timer pause/resume, clean rejoin, chat,
panels/layout/pin, all fixtures, permission denial, actual track toggles, disposal,
and late permission results. Browser checks cover desktop/mobile layouts, sending
messages, panel focus and Escape, media simulation, pinning and ending/rejoining.
Real multi-user connectivity remains outside this demo's acceptance criteria.


## Gọi video thật

Cấu hình `VITE_VIDEO_CALL_MODE=real`, chạy backend và khởi động lại frontend.
Dùng hai tài khoản khác nhau trong hai trình duyệt/hai máy: người gọi mở hồ sơ bạn
và gửi lời mời, người nhận chấp nhận tại Cuộc gọi đến. Cả hai kiểm tra camera rồi
bấm Vào phòng luyện tập. Bật tùy chọn micro trước khi vào hoặc nút micro trong phòng.

API `/api/calls/{id}/signals` chuyển offer, answer và ICE; hình/tiếng truyền qua
WebRTC. Phía nhận gắn track vào transceiver được tạo từ offer. Khi trình duyệt
chặn autoplay, nút Phát video và âm thanh của đối tác cho phép phát bằng thao tác tay.

Trên hai máy, frontend phải dùng HTTPS (localhost chỉ phù hợp máy đang chạy) và
`VITE_API_BASE_URL` phải trỏ đến backend mà cả hai truy cập được; cấu hình CORS tương ứng.
Mạng khác nhau hoặc NAT hạn chế cần TURN qua `VITE_TURN_URL`, `VITE_TURN_USERNAME`,
`VITE_TURN_CREDENTIAL`. Không có TURN thì kết nối trực tiếp có thể thất bại tùy mạng.

Kiểm thử RTP thực bằng video canvas và audio tổng hợp: mở
`/tests/webrtc-media.html`, bấm Run synthetic camera and audio test. Test xác minh
video/audio nhận ở cả hai peer, reaction và thay track mà không gọi camera thật.
Test này xác minh WebRTC trong cùng trình duyệt; không thay thế kiểm thử hai máy
qua NAT/TURN hoặc tài khoản đăng nhập ở môi trường triển khai.
