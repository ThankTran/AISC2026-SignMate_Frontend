import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./MainLayout.css";

// Dữ liệu mẫu - sau này thay bằng data thật từ API/context
const mockNotifications = [
  { id: 1, title: "Bạn có lời mời gọi video mới", time: "5 phút trước", read: false },
  { id: 2, title: "Kết quả luyện tập AI đã sẵn sàng", time: "1 giờ trước", read: false },
  { id: 3, title: "Bạn đã lên hạng #12 tuần này", time: "Hôm qua", read: true },
];

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`main-layout ${
        collapsed ? "main-layout--collapsed" : ""
      }`}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      <div className="main-layout__content">
        <Header notifications={mockNotifications} />

        <main className="main-layout__body">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
