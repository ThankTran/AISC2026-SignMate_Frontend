# Chạy SignMate trên Windows

Mở hai terminal PowerShell riêng. Nếu cả backend và frontend đang chạy, tải lại trang trước;
lỗi `Trang gặp sự cố` do hồ sơ chưa đăng nhập đã được sửa trong `CurrentUserProvider`.

## 1. Backend PostgreSQL

```powershell
cd D:\AISC2026\DEMO\AISC2026-SignMate_Backend
.\run-postgres.ps1 -Offline
```

Nhập mật khẩu của tài khoản database **signmate** khi script hỏi. Đây không phải mật khẩu
Firebase hay mật khẩu quản trị postgres. Script lấy Firebase project ID từ `.env`/`.env.local`
của frontend, dùng profile `postgres,dev`, mở API tại `http://localhost:8080`.
`-Offline` dùng dependencies đã tải trong `.tools/m2`; nếu báo thiếu dependency, bỏ `-Offline`
để Maven tải qua mạng. Script dùng Maven đã tải sẵn nếu Windows Maven Wrapper gặp lỗi bootstrap.

Nếu PostgreSQL chưa được tạo, chạy `./setup-postgres.ps1` một lần trước đó.
Chỉ khi muốn thêm người dùng/dữ liệu minh họa: dừng backend, chạy `./run-postgres.ps1 -SeedMockData -Offline`,
chờ script hoàn thành rồi chạy lại backend bình thường. Không cần seed lại mỗi lần mở app.

Kiểm tra trong terminal khác:

```powershell
(Invoke-RestMethod http://localhost:8080/actuator/health).status
```

Kết quả phải là `UP`. Không mở thêm backend thứ hai trên cùng port.

## 2. Frontend

Giữ các biến Firebase đang có trong `.env.local` hoặc `.env`. Kiểm tra hai dòng:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=false
```

```powershell
cd D:\AISC2026\DEMO\AISC2026-SignMate_Frontend
npm run dev -- --host localhost --port 5173 --strictPort
```

Nếu npm shim trên Windows bị lỗi, dùng trực tiếp Vite đã cài:

```powershell
node node_modules/vite/bin/vite.js --host localhost --port 5173 --strictPort
```

Mở `http://localhost:5173`, đăng nhập bằng Firebase, xác minh email rồi chọn cấp độ.
Sau khi đổi `.env`, dừng và chạy lại Vite. Dùng đúng port 5173 để khớp CORS mặc định.

## Phân biệt lỗi

- **“Trang gặp sự cố” ngay cả ở Welcome/Login:** lỗi render JavaScript. Mở F12 → Console,
  lấy tên lỗi và tên component (không gửi token/mật khẩu). Đây không phải yêu cầu xóa database.
- **Không kết nối được máy chủ:** kiểm tra health `UP`, `VITE_API_BASE_URL` và port/CORS.
- **401:** đăng nhập lại; Firebase project ID của frontend và backend phải giống nhau.
- **EMAIL_NOT_VERIFIED:** mở email xác minh, quay lại chọn “Tôi đã xác minh”.
- **Flyway migration error:** giữ nguyên database, đọc tên migration lỗi; không xóa database
  hoặc chạy repair tùy tiện. Profile `postgres,dev` tải cả lịch sử seed V2 của local.

Camera trên điện thoại cần HTTPS hoặc localhost. Địa chỉ LAN dạng `http://192.168...` không đủ;
dùng tunnel HTTPS hoặc cấu hình chứng chỉ HTTPS cho Vite. UUID fallback không thay đổi yêu cầu này.
