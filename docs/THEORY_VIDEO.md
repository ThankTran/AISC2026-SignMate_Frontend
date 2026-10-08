# Video bài học

## Chạy local

1. Trong `fast-api-trans-vsl`, chạy `.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000`.
2. Trong frontend, chạy `npm run dev`. Khởi động lại Vite nếu đã chạy trước khi thêm proxy.
3. Vào trang bài học. Bảng chọn dùng `src/data/theoryVocabulary.json`, trích từ `Danh_sach_tu_vung_SignMate.xlsx` (650 mục, giữ thứ tự và dấu tiếng Việt).

Frontend mặc định gửi `POST /vsl/api/v1/translate/text-to-vsl-video` với `{ "text": "Ă", "exact": true }`. Vite chuyển `/vsl` tới `http://127.0.0.1:8000`. API trả `model: dataset-exact`, một nhãn và `video_url`; frontend tải MP4 qua cùng proxy.

## Hành vi

- Mỗi mục có video riêng. Chọn một mốc phân đoạn chuyển sang video mục đó, bắt đầu từ giây 0; không giả định độ dài 5 giây hay tự chia đều timestamp.
- Chữ cái/số/từ vựng phải khớp nhãn dataset. Chỉ có ánh xạ tường minh `0` → `0 (số không)`. Không dùng AI để thay thế từ gần giống. Chế độ dịch câu cũ vẫn hoạt động khi không gửi `exact: true`.
- Tải theo mục đang chọn, trì hoãn 120ms khi bấm nhanh, hủy yêu cầu cũ và cache video tải thành công trong bộ nhớ. Không gửi token đăng nhập frontend sang dịch vụ dịch.
- Xem hết video hoặc chủ động đánh dấu đã thuộc sẽ tăng tiến độ. Chỉ chọn mục/tải video không làm tăng tiến độ. Lỗi tải/thiếu video không tự hoàn thành.
- Tiến độ lý thuyết lưu trong sessionStorage theo tài khoản và bài học, được giữ qua tải lại trang trong cùng tab. Chưa đồng bộ tiến độ lý thuyết qua backend/tài khoản trên thiết bị khác; XP và kết quả kiểm tra vẫn do backend hiện có quản lý.
- Có đủ 29 chữ cái và 0–12 trong dataset hiện tại. Các số 13–20 chưa có nhãn khớp chính xác. Một số từ/cụm từ khác cũng còn thiếu; UI hiển thị rõ tình trạng này, không sinh video thay thế.

## Production

Reverse proxy cần chuyển cả `/vsl/api/...` và `/vsl/static/generated/...` tới FastAPI, bỏ tiền tố `/vsl`. Cho phép request tạo video chạy tối đa 200 giây và hỗ trợ media range requests. Không cấu hình `/vsl` thành fallback SPA.

`VITE_VSL_API_URL` có thể trỏ tới một đường dẫn proxy khác trên cùng origin. Nếu dùng domain khác, cần cấu hình HTTPS và CORS tại gateway; FastAPI hiện không tự mở CORS.

Không đưa API key Ollama vào frontend. Chế độ bài học exact không cần key hoặc tải model ML, chỉ cần dataset và imageio-ffmpeg theo requirements hiện có.

## Kiểm tra

- Frontend: `node --test tests/theoryVideoApi.test.js tests/learningProgress.test.js`, `npm run lint`, `npm run build`.
- FastAPI: `.venv/Scripts/python.exe -m pytest tests/test_api.py tests/test_learning_video.py -q`.
- Giao diện với API thật: mở `/tests/theory-video.html` trên Vite. Fixture có tài khoản và bài học riêng, không ghi XP lên server. Kiểm tra chọn A → Ă, phát lại, tốc độ 0.5x, số 13 thiếu video, đánh dấu/bỏ đánh dấu và tải lại trang để kiểm tra tiến độ.
