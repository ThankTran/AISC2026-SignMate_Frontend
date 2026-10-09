# SignMate UI changelog

| Nhóm              | Ưu tiên    | Vấn đề trước                                                           | File                                                                                                    | Cách sửa                                                                                                                                                    |
| ----------------- | ---------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — Token         | Cao        | Màu và kích thước thiếu chuẩn chung                                    | src/index.css, docs/UI_TOKEN_GROUP_1.md                                                                 | Bổ sung spacing, radius, shadow, motion, trạng thái và teal-800.                                                                                            |
| 2 — Màu           | Cao        | Nhiều palette riêng, CTA cạnh tranh                                    | CSS các màn hình, docs/UI_COLOR_GROUP_2.md                                                              | Teal/coral cho học tập, purple/neutral cho AI; sidebar teal; active chapter trắng viền teal.                                                                |
| 3 — Chữ           | Trung bình | Cỡ chữ 10–11px, menu 16px, font cứng                                   | CSS toàn src; TheoryPreview.jsx                                                                         | Chuẩn hóa font-size theo token, nhỏ nhất 12px; menu 14px/500; line-height tối đa 1.6 và heading 1.25.                                                       |
| 4 — Trình bày     | Trung bình | Khoảng cách lẻ, trang trí nhiều, CTA rỗng chung chung                  | CSS toàn src; HandScene; Dashboard; DataState và các trang gọi                                          | Spacing theo token; hand + 3 card; bỏ backdrop blur; shadow nút mềm; CTA theo ngữ cảnh.                                                                     |
| 5 — Accessibility | Cao        | Chữ nhạt, focus và nhãn input thiếu nhất quán                          | CSS toàn src; FriendListPage, TopicSelection, CallChat, Profile                                         | Tăng độ tương phản token; nền tối cho chữ trắng; nhãn hiển thị gắn input; focus container; target mobile 44px; tab chọn có gạch chân.                       |
| 6 — UX            | Cao        | Nhãn mơ hồ, XP sai kỳ, privacy tự lưu, hai modal xóa, loader nhấp nháy | Profile, Dashboard, ConfirmDialog, SafetyDialog, FirstCallGuide, TheoryPreview, errorMessages, Skeleton | CTA cụ thể; XP tuần; lưu privacy tập trung; email + mật khẩu trong một modal; loader 100ms, skeleton từng màn sau 1s.                                       |
| 7 — Responsive    | Cao        | Topnav xuống dòng lộn xộn; lịch rộng; nhãn node cắt                    | LessonTopNav, QuizPage, SCurvePath, MonthCalendar, FriendsPage                                          | Tiêu đề ellipsis, control một hàng, tiến độ dưới; lịch cuộn riêng có gợi ý; giữ agenda mobile hiện có; nhãn node không clamp.                               |
| 8 — Motion        | Trung bình | Pulse/orbit lặp, thời gian cứng, animate thuộc tính layout             | CSS toàn src                                                                                            | Motion token + easing chung; bỏ trang trí vô hạn; chỉ transform/opacity, ngoại lệ progress; xóa keyframe không dùng; giữ spinner phản hồi và dấu recording. |

## Kiểm chứng

- Nhóm 1–8: ESLint và Vite build sau mỗi nhóm đều thành công.
- 25 route × 4 viewport (375, 768, 1024, 1280): không body overflow, chữ dưới 12px hoặc target thiếu kích thước trong các trạng thái fixture. Chi tiết: [UI_AUDIT_RESULTS.json](docs/UI_AUDIT_RESULTS.json).
- Quét contrast cho text trên nền màu đặc/composite tính được: không còn trường hợp dưới 4.5:1 trong fixture. Nền gradient, video và phần tử đang opacity không được tính tự động; đây không phải chứng nhận AA toàn ứng dụng.
- tests/ui-refinement.html: 12 kiểm tra đạt về privacy, modal xóa và mốc loading; không gửi yêu cầu xóa thật.
- tests/account-ui-smoke.html: 20 kiểm tra đạt; tests/ui-smoke.html: 16 kiểm tra đạt.
- Node tests errorMessages + learningProgress: 5 kiểm tra đạt.
- Vite còn cảnh báo bundle JavaScript trên 500 kB; chưa thay đổi cách chia bundle vì ngoài phạm vi UI.

## Phạm vi và ngoại lệ

- Giữ endpoint, route, tên prop hiện có và class được JS sử dụng. Hành vi chỉ thay đổi theo nhóm 6: lưu privacy tập trung, xác nhận xóa một modal, XP tuần và phản hồi loading.
- Màn hình AI giữ purple/neutral; sidebar vẫn teal theo quy tắc điều hướng toàn hệ thống. Nút coral có chữ trắng chuyển sang coral-700 để tăng tương phản.
- Lịch mobile giữ danh sách agenda hiện có; lịch dạng tháng ở desktop/tablet có vùng cuộn và gợi ý. Không đổi logic lọc ngày của agenda.
- Không kiểm thử gửi báo cáo/chặn/xóa tài khoản trên dữ liệu thật. Các kiểm tra tài khoản dùng API giả lập.
- Giữ spinner khi chờ và dấu recording (phản hồi trạng thái); bỏ pulse/orbit trang trí. JS HandScene đã kiểm tra reduced-motion và dừng khi tab ẩn; các timer nghiệp vụ giữ nguyên.
- Route /verify-email trong fixture tự chuyển hướng với phiên đăng nhập giả lập; không mô phỏng gửi email xác thực thật.
- Hai commit README được thêm đồng thời trong branch được giữ nguyên, không sửa lại trong đợt UI.

## Việc còn lại cần quyết định

- Teal-800 là màu nội suy giữa 700 và 900 vì bảng gốc chưa cung cấp mã riêng; cần thiết kế xác nhận.
- Giữ font display Baloo 2 cho Welcome theo yêu cầu hiện tại.
- Giữ gradient nhẹ cùng palette ở hero/khung ghép cặp; có thể chuyển hoàn toàn sang nền đặc nếu thiết kế muốn tối giản hơn.
- Hiện không bật lại animation trang trí; cần quyết định riêng nếu muốn giữ một điểm nhấn chuyển động ở Welcome.

## Danh sách file thay đổi

- [docs/UI_COLOR_GROUP_2.md](docs/UI_COLOR_GROUP_2.md)
- [docs/UI_TOKEN_GROUP_1.md](docs/UI_TOKEN_GROUP_1.md)
- [src/components/AiPractice/AiAnalyticsCard.css](src/components/AiPractice/AiAnalyticsCard.css)
- [src/components/AiPractice/AiFeedbackCard.css](src/components/AiPractice/AiFeedbackCard.css)
- [src/components/AiPractice/CameraViewport.css](src/components/AiPractice/CameraViewport.css)
- [src/components/AiPractice/SessionControls.css](src/components/AiPractice/SessionControls.css)
- [src/components/AiPractice/SignGuideModal.css](src/components/AiPractice/SignGuideModal.css)
- [src/components/AiPractice/TipBox.css](src/components/AiPractice/TipBox.css)
- [src/components/ApiState.jsx](src/components/ApiState.jsx)
- [src/components/AuthCard/AuthCard.css](src/components/AuthCard/AuthCard.css)
- [src/components/Footer/Footer.css](src/components/Footer/Footer.css)
- [src/components/Friends/FriendListItem.css](src/components/Friends/FriendListItem.css)
- [src/components/Friends/MonthCalendar.jsx](src/components/Friends/MonthCalendar.jsx)
- [src/components/Friends/RecentCallCard.css](src/components/Friends/RecentCallCard.css)
- [src/components/HandScene/HandScene.css](src/components/HandScene/HandScene.css)
- [src/components/HandScene/HandScene.jsx](src/components/HandScene/HandScene.jsx)
- [src/components/Header/Header.css](src/components/Header/Header.css)
- [src/components/LearningPath/DailyQuests.css](src/components/LearningPath/DailyQuests.css)
- [src/components/LearningPath/NextUpCard.css](src/components/LearningPath/NextUpCard.css)
- [src/components/LearningPath/ProgressWidget.css](src/components/LearningPath/ProgressWidget.css)
- [src/components/LearningPath/ProgressWidget.jsx](src/components/LearningPath/ProgressWidget.jsx)
- [src/components/LearningPath/SCurvePath.css](src/components/LearningPath/SCurvePath.css)
- [src/components/LearningPath/TopBanner.css](src/components/LearningPath/TopBanner.css)
- [src/components/LessonPage/LessonFooter.css](src/components/LessonPage/LessonFooter.css)
- [src/components/LessonPage/LessonFooter.jsx](src/components/LessonPage/LessonFooter.jsx)
- [src/components/LessonPage/LessonResultModal.css](src/components/LessonPage/LessonResultModal.css)
- [src/components/LessonPage/LessonTopNav.css](src/components/LessonPage/LessonTopNav.css)
- [src/components/LessonPage/MediaView.css](src/components/LessonPage/MediaView.css)
- [src/components/LessonPage/OutOfHeartsModal.css](src/components/LessonPage/OutOfHeartsModal.css)
- [src/components/LessonPage/QuizSection.css](src/components/LessonPage/QuizSection.css)
- [src/components/Sidebar/Sidebar.css](src/components/Sidebar/Sidebar.css)
- [src/components/VideoCall/CallChat.jsx](src/components/VideoCall/CallChat.jsx)
- [src/components/VideoCall/CallInvitations.css](src/components/VideoCall/CallInvitations.css)
- [src/components/VideoCall/FirstCallGuide.jsx](src/components/VideoCall/FirstCallGuide.jsx)
- [src/components/VideoCall/SafetyDialog.jsx](src/components/VideoCall/SafetyDialog.jsx)
- [src/components/VideoCall/TopicSelection.jsx](src/components/VideoCall/TopicSelection.jsx)
- [src/components/VideoCall/styles/animations.css](src/components/VideoCall/styles/animations.css)
- [src/components/VideoCall/styles/matching.css](src/components/VideoCall/styles/matching.css)
- [src/components/VideoCall/styles/overlays.css](src/components/VideoCall/styles/overlays.css)
- [src/components/VideoCall/styles/partner.css](src/components/VideoCall/styles/partner.css)
- [src/components/VideoCall/styles/responsive.css](src/components/VideoCall/styles/responsive.css)
- [src/components/VideoCall/styles/review.css](src/components/VideoCall/styles/review.css)
- [src/components/VideoCall/styles/rewards.css](src/components/VideoCall/styles/rewards.css)
- [src/components/VideoCall/styles/room.css](src/components/VideoCall/styles/room.css)
- [src/components/VideoCall/styles/shared.css](src/components/VideoCall/styles/shared.css)
- [src/components/VideoCall/styles/topics.css](src/components/VideoCall/styles/topics.css)
- [src/components/VideoPlayerFrame/VideoPlayerFrame.css](src/components/VideoPlayerFrame/VideoPlayerFrame.css)
- [src/components/ui/ConfirmDialog.jsx](src/components/ui/ConfirmDialog.jsx)
- [src/components/ui/DataState.jsx](src/components/ui/DataState.jsx)
- [src/components/ui/LoadingScreen.jsx](src/components/ui/LoadingScreen.jsx)
- [src/components/ui/Skeleton.jsx](src/components/ui/Skeleton.jsx)
- [src/components/ui/ui.css](src/components/ui/ui.css)
- [src/index.css](src/index.css)
- [src/layouts/AuthLayout/AuthLayout.css](src/layouts/AuthLayout/AuthLayout.css)
- [src/layouts/MainLayout/MainLayout.css](src/layouts/MainLayout/MainLayout.css)
- [src/pages/AccountSetup/AccountSetup.css](src/pages/AccountSetup/AccountSetup.css)
- [src/pages/AiPracticePage/AiPracticePage.css](src/pages/AiPracticePage/AiPracticePage.css)
- [src/pages/AiPracticePage/AiPracticePage.jsx](src/pages/AiPracticePage/AiPracticePage.jsx)
- [src/pages/Dashboard/Dashboard.css](src/pages/Dashboard/Dashboard.css)
- [src/pages/Dashboard/Dashboard.jsx](src/pages/Dashboard/Dashboard.jsx)
- [src/pages/Friends/FriendListPage.jsx](src/pages/Friends/FriendListPage.jsx)
- [src/pages/Friends/FriendsPage.css](src/pages/Friends/FriendsPage.css)
- [src/pages/Friends/VideoCallInvitesPage.jsx](src/pages/Friends/VideoCallInvitesPage.jsx)
- [src/pages/LeaderboardPage/LeaderboardPage.css](src/pages/LeaderboardPage/LeaderboardPage.css)
- [src/pages/LeaderboardPage/LeaderboardPage.jsx](src/pages/LeaderboardPage/LeaderboardPage.jsx)
- [src/pages/LearningPathPage/LearningPathPage.css](src/pages/LearningPathPage/LearningPathPage.css)
- [src/pages/LearningPathPage/LearningPathPage.jsx](src/pages/LearningPathPage/LearningPathPage.jsx)
- [src/pages/LessonPage/LessonPage.css](src/pages/LessonPage/LessonPage.css)
- [src/pages/LessonPage/TheoryPreview.css](src/pages/LessonPage/TheoryPreview.css)
- [src/pages/LessonPage/TheoryPreview.jsx](src/pages/LessonPage/TheoryPreview.jsx)
- [src/pages/Profile/Profile.css](src/pages/Profile/Profile.css)
- [src/pages/Profile/Profile.jsx](src/pages/Profile/Profile.jsx)
- [src/pages/QuizPage/QuizPage.css](src/pages/QuizPage/QuizPage.css)
- [src/pages/QuizPage/QuizPage.jsx](src/pages/QuizPage/QuizPage.jsx)
- [src/pages/QuizResultPage/QuizResultPage.css](src/pages/QuizResultPage/QuizResultPage.css)
- [src/pages/QuizResultPage/QuizResultPage.jsx](src/pages/QuizResultPage/QuizResultPage.jsx)
- [src/pages/Stats/Stats.css](src/pages/Stats/Stats.css)
- [src/pages/Stats/Stats.jsx](src/pages/Stats/Stats.jsx)
- [src/pages/VideoCall/VideoCallPage.css](src/pages/VideoCall/VideoCallPage.css)
- [src/pages/Welcome/Welcome.css](src/pages/Welcome/Welcome.css)
- [src/services/errorMessages.js](src/services/errorMessages.js)
- [tests/account-ui-smoke.jsx](tests/account-ui-smoke.jsx)
- [tests/layout-audit.jsx](tests/layout-audit.jsx)
- [tests/ui-refinement.html](tests/ui-refinement.html)
- [tests/ui-refinement.jsx](tests/ui-refinement.jsx)
- [tests/ui-smoke.jsx](tests/ui-smoke.jsx)
- [CHANGELOG-UI.md](CHANGELOG-UI.md)
- [docs/UI_AUDIT_RESULTS.json](docs/UI_AUDIT_RESULTS.json)
