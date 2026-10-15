export const sidebarItems = [
  // =========================
  // TRANG CHỦ
  // =========================
  {
    label: "Trang chủ",
    icon: "home",
    path: "/dashboard",
    end: true,
  },

  // =========================
  // MODULE
  // =========================
  {
    section: "Học & kết nối",
    children: [
      {
        label: "Học",
        icon: "book",
        defaultOpen: true,
        children: [
          {
            label: "Lộ trình học",
            path: "/learning-path",
          },
          {
            label: "Luyện tập với AI",
            path: "/practice-ai",
          },
          {
            label: "Dịch ký hiệu VSL",
            path: "/translate",
          },
          {
            label: "Xếp hạng",
            path: "/ranking",
          },
        ],
      },

      {
        label: "Gọi video",
        icon: "video",
        path: "/video",
      },

      {
        label: "Bạn bè",
        icon: "users",
        children: [
          {
            label: "Danh sách bạn bè",
            path: "/friends/list",
          },
          {
            label: "Lời mời kết bạn",
            path: "/friends/friend-requests",
          },
          {
            label: "Lời mời & lịch hẹn",
            path: "/friends/video-call-invites",
          },
        ],
      },
    ],
  },
];
