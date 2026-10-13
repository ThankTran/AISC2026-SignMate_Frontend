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


## Interactive call demo

In Vite development, `/video` opens the isolated frontend demo by default.
`VITE_VIDEO_CALL_MODE=demo` also enables it in a production build; `real` keeps the
existing real-call integration. Restart Vite after changing the mode. Production
continues to use the existing integration by default. No realtime infrastructure
was added for this demo.

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
