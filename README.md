# SignMate — Hướng dẫn chạy web

SignMate là ứng dụng học và luyện tập ngôn ngữ ký hiệu Việt Nam. Frontend dùng React và Vite; tài khoản và dữ liệu học tập được quản lý bởi backend Java.

Hướng dẫn dưới đây dùng **Windows + PowerShell**. Chạy web cơ bản trước, sau đó cài thêm hai dịch vụ AI nếu cần luyện tập và dịch ký hiệu.

## 1. Các repo và phần mềm cần có

| Repo | Vai trò | Cổng mặc định |
| --- | --- | --- |
| [Frontend](https://github.com/ThankTran/AISC2026-SignMate_Frontend) | Giao diện web | 5173 |
| [Backend](https://github.com/ThankTran/AISC2026-SignMate_Backend) | Tài khoản, bài học, tiến độ | 8080 |
| [HandSign](https://github.com/quan14333/HandSign) | Chấm động tác từ camera | 8001 |
| [fast-api-trans-vsl](https://github.com/tapu25z/fast-api-trans-vsl) | Dịch văn bản/giọng nói/video ký hiệu | 8000 |

Cài trước:

- **Git** để tải mã nguồn.
- **Node.js 22.13+ trong nhánh 22.x hoặc Node.js 24+**, kèm npm, để chạy frontend.
- **JDK 17**, đặt `JAVA_HOME` trỏ vào thư mục JDK, để chạy backend. Repo có Maven Wrapper nên không cần cài Maven riêng.
- **Python 3.11 bản 64-bit** nếu dùng hai dịch vụ AI. Thêm Python vào PATH khi cài.

Kiểm tra trong PowerShell mới:

```powershell
git --version
node --version
npm --version
java -version
javac -version
# Chỉ cần khi dùng AI
python --version
```

Cách chạy nhanh bên dưới dùng **H2**, database được lưu vào file trên máy nên không cần cài PostgreSQL. Nếu cần PostgreSQL hoặc Docker, xem mục 6.

## 2. Tải mã nguồn

Mở PowerShell tại thư mục muốn lưu dự án, chạy:

```powershell
git clone https://github.com/ThankTran/AISC2026-SignMate_Frontend.git
git clone https://github.com/ThankTran/AISC2026-SignMate_Backend.git
# Hai repo sau chỉ cần cho các tính năng AI
git clone https://github.com/quan14333/HandSign.git
git clone https://github.com/tapu25z/fast-api-trans-vsl.git
```

Nếu đã có repo trên máy, dùng thư mục đó, không clone lại. Các bước sau giả sử bốn repo nằm cạnh nhau:

```text
thu-muc-du-an/
  AISC2026-SignMate_Frontend/
  AISC2026-SignMate_Backend/
  HandSign/
  fast-api-trans-vsl/
```

## 3. Chạy web cơ bản

### Bước 1 — Chạy backend (terminal 1)

Mở terminal tại thư mục `AISC2026-SignMate_Backend`:

```powershell
powershell -ExecutionPolicy Bypass -File .\run-local.ps1
```

Lần đầu cần Internet để tải thư viện. Giữ terminal này mở. Script chạy API ở cổng **8080**, tạo database H2 tại `data/signmate.mv.db` và nạp giáo trình local.

Mở [kiểm tra backend](http://localhost:8080/actuator/health). Khi thấy `"status":"UP"`, tiếp tục bước sau.

### Bước 2 — Cài frontend (terminal 2)

Mở terminal khác tại thư mục `AISC2026-SignMate_Frontend`:

```powershell
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Đặt các giá trị sau trong `.env`, lưu rồi đóng Notepad:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=false
VITE_DEMO=false
VITE_HANDSIGN_API_URL=
VITE_VSL_API_URL=
```

Hai URL AI để trống là đúng: Vite tự chuyển `/handsign` tới cổng **8001** và `/vsl` tới cổng **8000**. Các biến TURN có thể để trống khi chạy local; chúng phục vụ kết nối cuộc gọi qua những mạng cần relay.

Nếu đã có `.env.local`, kiểm tra cả file đó vì giá trị trong `.env.local` được ưu tiên hơn `.env`. Không đưa mật khẩu hoặc API key vào biến `VITE_*` vì trình duyệt có thể đọc được.

### Bước 3 — Mở web

Trong terminal frontend:

```powershell
npm run dev -- --port 5173 --strictPort
```

Mở **[http://localhost:5173](http://localhost:5173)**, chọn đăng ký tài khoản bằng email/mật khẩu rồi đăng nhập. **Không cần Firebase hoặc tài khoản demo có sẵn.**

Đến đây web và backend đã chạy. Chấm động tác AI cần HandSign; chức năng dịch cần fast-api-trans-vsl ở mục tiếp theo. Sau khi sửa `.env`, dừng frontend bằng `Ctrl+C` và chạy lại.

## 4. Bật các tính năng AI

Mỗi dịch vụ chạy trong một terminal riêng. Lần đầu cài thư viện, tải model và dữ liệu có thể mất nhiều thời gian; cần kết nối Internet.

### A. HandSign — luyện tập với camera (terminal 3)

Mở terminal tại thư mục `HandSign`. Chạy các lệnh cài đặt **một lần**:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
.\.venv-handsign\Scripts\python.exe scripts/download_model.py
```

Script tạo môi trường Python riêng `.venv-handsign`. Không sao chép môi trường Python từ máy khác. Dùng Python 3.11 để phù hợp với cả hai repo AI.

Sau đó chạy API và giữ terminal mở:

```powershell
powershell -ExecutionPolicy Bypass -File .\run-api.ps1
```

Mở [danh sách bài tập HandSign](http://127.0.0.1:8001/lessons) để kiểm tra API trả dữ liệu. Quay lại web, mở luyện tập AI và cho phép dùng camera.

Repo đã có dữ liệu tham chiếu và video mẫu; không cần tự chạy lại bước calibration. `run.ps1` là ứng dụng camera desktop; để kết nối web, dùng **`run-api.ps1`** như trên.

### B. fast-api-trans-vsl — dịch ký hiệu (terminal 4)

Mở terminal tại thư mục `fast-api-trans-vsl`. Cài đặt **một lần**:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-ml.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Tạo key tại [Ollama Cloud](https://ollama.com/settings/keys), điền vào `.env` của **fast-api-trans-vsl**:

```dotenv
OLLAMA_API_KEY=thay_bang_key_cua_ban
OLLAMA_HOST=https://ollama.com
OLLAMA_MODEL=gpt-oss:120b
```

Dịch vụ gọi Ollama Cloud trực tiếp nên không cần cài Ollama local. Giữ API key trong repo dịch, không đưa vào frontend hoặc commit `.env`.

Tải video dùng để ghép kết quả dịch:

```powershell
.\.venv\Scripts\python.exe scripts/download_kaggle_dataset.py
```

Dữ liệu cần nằm ở `data/kaggle_metadata/labels.csv` và `data/kaggle_dataset/videos/*.mp4`. Nếu tải bị ngắt, chạy lại lệnh để tiếp tục. Xem [README dịch vụ dịch](https://github.com/tapu25z/fast-api-trans-vsl#readme) nếu cần tải thủ công từ Kaggle.

Chạy API:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Mở [kiểm tra dịch vụ dịch](http://127.0.0.1:8000/health) hoặc [tài liệu API](http://127.0.0.1:8000/docs). Model nhận diện/giọng nói có thể cần tải ở lần dùng đầu tiên. API chạy được chưa có nghĩa model, key và video đã sẵn sàng; hãy thử một lượt dịch trên web.

Model nhận diện video hiện hỗ trợ 100 nhãn, nên không phải mọi ký hiệu đều dịch được chính xác.

## 5. Những lần chạy sau

Không cần clone, tạo môi trường, tải dữ liệu hay cài thư viện lại mỗi lần mở máy. Chạy các lệnh sau trong **terminal riêng, tại đúng repo**:

| Thư mục | Lệnh |
| --- | --- |
| `AISC2026-SignMate_Backend` | `powershell -ExecutionPolicy Bypass -File .\run-local.ps1` |
| `AISC2026-SignMate_Frontend` | `npm run dev -- --port 5173 --strictPort` |
| `HandSign` (nếu dùng) | `powershell -ExecutionPolicy Bypass -File .\run-api.ps1` |
| `fast-api-trans-vsl` (nếu dùng) | `.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000` |

Sau đó mở [localhost:5173](http://localhost:5173). Dừng từng dịch vụ bằng `Ctrl+C` tại terminal tương ứng. Dữ liệu H2 vẫn được giữ cho lần sau; không xóa thư mục `data` nếu muốn giữ tài khoản và tiến độ.

Khi cập nhật mã nguồn, dừng dịch vụ rồi chạy `git pull` trong từng repo. Chạy lại `npm ci` hoặc lệnh cài requirements nếu dependencies thay đổi.

## 6. Nếu muốn dùng PostgreSQL hoặc Docker

Đây là lựa chọn thay thế H2 ở mục 3; chỉ chạy **một backend** tại một thời điểm.

**PostgreSQL trên Windows:** cài PostgreSQL, giữ mật khẩu quản trị `postgres`, rồi chạy tại thư mục backend:

```powershell
.\setup-postgres.ps1
.\run-postgres.ps1
```

Setup hỏi mật khẩu quản trị `postgres`, rồi tạo role/database `signmate` nếu chưa có. Khi chạy backend, nhập mật khẩu của **role `signmate`**. Script mặc định tìm PostgreSQL 18; nếu cài nơi khác, xem [hướng dẫn backend](https://github.com/ThankTran/AISC2026-SignMate_Backend#readme).

**Docker:** mở Docker Desktop ở chế độ Linux containers, tạo `.env` từ `.env.example` trong backend và đặt `DATABASE_PASSWORD` thành mật khẩu riêng. Sau đó chạy:

```powershell
docker compose up --build -d
```

Compose chỉ chạy backend + PostgreSQL; frontend và AI vẫn chạy riêng. Profile `prod` của Compose không tự nạp giáo trình mẫu. Xem README backend để biết cách cấu hình và quản lý dữ liệu. Dùng `docker compose down` để dừng; không thêm `-v` nếu cần giữ database.

Tài khoản/dữ liệu của H2, PostgreSQL local và Docker là các database riêng, không tự chuyển sang nhau. Backend chạy bằng script không tự đọc `.env`; Docker Compose mới dùng file này.

## 7. Build và xem thử bản build

Chạy tại thư mục **frontend**:

```powershell
npm run build
npm run preview -- --port 5173 --strictPort
```

Dừng `npm run dev` trước để giải phóng cổng 5173. Mở URL được terminal in ra để xem thử. Dùng lại cổng 5173 giúp khớp cấu hình CORS mặc định của backend.

- `npm run build` tạo thư mục **`dist/`** để triển khai giao diện.
- `npm run preview` chỉ dùng xem thử bản build trên máy.
- Build frontend không đóng gói hoặc khởi động backend, database hay hai dịch vụ AI; các dịch vụ này vẫn cần chạy riêng.
- Có thể kiểm tra mã nguồn bằng `npm run lint`.

Khi đưa web lên server:

1. Cấu hình các biến `VITE_*` **trước khi build**; đổi chúng thì cần build lại.
2. Phục vụ `dist/` qua HTTPS và chuyển các đường dẫn giao diện về `index.html` để tải lại trang không bị 404.
3. Đặt `VITE_API_BASE_URL` tới backend mà trình duyệt người dùng truy cập được; cấu hình `CORS_ALLOWED_ORIGINS` của backend khớp địa chỉ frontend.
4. Cấu hình reverse proxy `/handsign` → HandSign và `/vsl` → dịch vụ dịch, bỏ tiền tố tương ứng khi chuyển tiếp, bao gồm cả đường dẫn media. Proxy trong Vite không tự đi theo thư mục `dist/`.
5. Nếu dùng URL AI riêng thay cho proxy, đặt `VITE_HANDSIGN_API_URL` và `VITE_VSL_API_URL`, đồng thời cấu hình CORS tại dịch vụ tương ứng. HandSign cần gateway xác thực và giới hạn request khi đưa ra Internet; xem README HandSign.

## 8. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Không tìm thấy `node`, `npm`, `java` hoặc `python` | Cài đúng phiên bản, kiểm tra PATH rồi mở terminal mới. Với Java, kiểm tra cả `javac` và `JAVA_HOME`. |
| PowerShell chặn script | Với repo tin cậy, chạy `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` trong terminal hiện tại rồi thử lại. |
| Không đăng ký/đăng nhập được | Kiểm tra backend trả `UP`, `VITE_API_BASE_URL` đúng cổng 8080, rồi khởi động lại frontend. |
| API trả 401/403 | Đăng nhập lại; không dùng tài khoản Firebase cũ hoặc coi dữ liệu mẫu là tài khoản có mật khẩu. |
| Lỗi CORS | Dùng `http://localhost:5173`; nếu đổi địa chỉ/cổng, cập nhật `CORS_ALLOWED_ORIGINS` ở backend và khởi động lại. |
| Cổng đã được sử dụng | Dừng phiên chạy cũ bằng `Ctrl+C`; không mở thêm bản dịch vụ trên cùng cổng. |
| H2 báo database đang được dùng | Dừng backend cũ hoặc ngắt kết nối công cụ xem database; không xóa file database. |
| Không tải được bài AI hoặc proxy `/handsign` lỗi | Kiểm tra HandSign đang chạy ở 8001 và mở thử `/lessons`. |
| Không dịch được hoặc proxy `/vsl` lỗi | Kiểm tra dịch vụ 8000, Ollama key, kết nối mạng, model và video dataset; xem lỗi ở terminal dịch vụ. |
| `pip install` lỗi build `fastdtw` trên Windows | Kiểm tra Python 3.11 64-bit; nếu log yêu cầu trình biên dịch C++, cài Microsoft C++ Build Tools rồi cài lại requirements. |
| Camera/microphone không mở | Cho phép trình duyệt sử dụng thiết bị; dùng localhost hoặc HTTPS. Truy cập bằng IP mạng LAN qua HTTP trên điện thoại không đủ điều kiện dùng camera. |
| Sửa `.env` nhưng web vẫn dùng giá trị cũ | Kiểm tra `.env.local`, khởi động lại Vite; nếu đang xem bản build thì build lại. |

## Thành viên

- [Trần Thị Hồng Thanh](https://github.com/ThankTran)
- [Nguyễn Ngọc Lan Anh](https://github.com/ngnlananh)
- [Đào Thị Mai Chi](https://github.com/maichidao)

## Giấy phép

Theo [MIT License](LICENSE).
