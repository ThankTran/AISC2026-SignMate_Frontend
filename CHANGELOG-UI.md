# SignMate UI changelog

| Nhóm | Ưu tiên | Vấn đề trước | File | Cách sửa |
| --- | --- | --- | --- | --- |
| 1 — Token | Cao | Màu và kích thước thiếu chuẩn chung | src/index.css, docs/UI_TOKEN_GROUP_1.md | Bổ sung spacing, radius, shadow, motion, trạng thái và teal-800. |
| 2 — Màu | Cao | Nhiều palette riêng, CTA cạnh tranh | CSS các màn hình, docs/UI_COLOR_GROUP_2.md | Teal/coral cho học tập, purple/neutral cho AI; sidebar teal; active chapter trắng viền teal. |
| 3 — Chữ | Trung bình | Cỡ chữ 10–11px, menu 16px, font cứng | CSS toàn src; TheoryPreview.jsx | Chuẩn hóa font-size theo token, nhỏ nhất 12px; menu 14px/500; line-height tối đa 1.6 và heading 1.25. |

| 4 — Trình bày | Trung bình | Khoảng cách lẻ, trang trí nhiều, CTA rỗng chung chung | CSS toàn src; HandScene; Dashboard; DataState và các trang gọi | Spacing theo token; hand + 3 card; bỏ backdrop blur; shadow nút mềm; CTA theo ngữ cảnh. |

| 5 — Accessibility | Cao | Chữ nhạt, focus và nhãn input thiếu nhất quán | CSS toàn src; FriendListPage, TopicSelection, CallChat, Profile | Tăng độ tương phản token; nền tối cho chữ trắng; nhãn hiển thị gắn input; focus container; target mobile 44px; tab chọn có gạch chân. |

## Kiểm chứng

- Nhóm 1 và 2: ESLint và Vite build thành công.
- Các nhóm sau được kiểm tra riêng trước mỗi commit.

## Việc còn lại cần quyết định

- Teal-800 là màu nội suy giữa 700 và 900 vì bảng gốc chưa cung cấp mã riêng; cần thiết kế xác nhận.
- Giữ font display Baloo 2 cho Welcome theo yêu cầu hiện tại.
