export const sidebarItems = [
  // =========================
  // TRANG CHỦ
  // =========================
  {
    label: "Trang chủ",
    icon: "home",
    path: "/",
    end: true,
  },

  // =========================
  // MODULE
  // =========================
  {
    section: "MODULE",
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
        path: "/friends",
      },
    ],
  },

  // =========================
  // CÀI ĐẶT
  // =========================
  {
    section: "CÀI ĐẶT",
    children: [
      {
        label: "Tài khoản",
        icon: "user",
        path: "/account",
      },
    ],
  },
];